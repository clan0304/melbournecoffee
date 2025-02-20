import { getEmbedding } from '@/lib/openai';
import { notesIndex } from '@/lib/pinecone';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Define types for clarity
type SearchHistory = {
  sessionId: string;
  query: string;
  lastOffset: number;
  embedding: number[];
  timestamp: Date;
};

// Helper function to calculate string similarity (Levenshtein distance)
function getLevenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) track[0][i] = i;
  for (let j = 0; j <= str2.length; j++) track[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }
  return track[str2.length][str1.length];
}

// Calculate name similarity score (0 to 1, where 1 is exact match)
function getNameSimilarityScore(cafeName: string, searchQuery: string): number {
  const normalizedCafeName = cafeName.toLowerCase();
  const normalizedQuery = searchQuery.toLowerCase();

  // Check for exact substring match first
  if (
    normalizedCafeName.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedCafeName)
  ) {
    return 1;
  }

  // Calculate Levenshtein distance
  const distance = getLevenshteinDistance(normalizedCafeName, normalizedQuery);
  const maxLength = Math.max(cafeName.length, searchQuery.length);

  // Convert distance to similarity score (1 - normalized distance)
  return 1 - distance / maxLength;
}

// In-memory cache for recent searches
const searchCache = new Map<string, SearchHistory>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;
    const userId = body.userId;
    const sessionId = body.sessionId;

    const searchQuery = messages[messages.length - 1].content;

    const isFollowUpRequest =
      searchQuery?.toLowerCase().includes('other') ||
      searchQuery?.toLowerCase().includes('more') ||
      searchQuery?.toLowerCase().includes('then');

    let embedding: number[];
    let offset = 0;

    const searchKey = userId || sessionId;

    if (isFollowUpRequest && searchKey && searchCache.has(searchKey)) {
      const previousSearch = searchCache.get(searchKey)!;
      embedding = previousSearch.embedding;
      offset = previousSearch.lastOffset + 6;
    } else {
      embedding = await getEmbedding(searchQuery!);
      offset = 0;
    }

    const match = searchQuery?.match(/\b(\d+)\b/);
    let numberOfResults = match ? parseInt(match[1], 10) : 6;
    numberOfResults = Math.min(numberOfResults, 10);

    // Get more results initially to allow for reranking
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: offset + numberOfResults * 2, // Get more results for better reranking
    });

    const paginatedMatches = vectorQueryResponse.matches.slice(
      offset,
      offset + numberOfResults * 2
    );

    // Fetch matching cafes from database
    const relevantCafes = await prisma.cafe.findMany({
      where: {
        id: {
          in: paginatedMatches.map((match) => match.id),
        },
      },
    });

    // Calculate combined scores with name similarity
    const cafeResults = relevantCafes.map((cafe) => {
      const vectorMatch = paginatedMatches.find(
        (match) => match.id === cafe.id
      );
      const vectorScore = vectorMatch?.score || 0;

      // Calculate name similarity score
      const nameSimilarityScore = getNameSimilarityScore(
        cafe.name!,
        searchQuery!
      );

      // Combined score: 70% name similarity, 30% vector similarity
      const combinedScore = nameSimilarityScore * 0.7 + vectorScore * 0.3;

      return {
        listId: cafe.listId,
        name: cafe.name,
        instagram: cafe.instagram,
        relevanceScore: combinedScore,
        nameSimilarity: nameSimilarityScore,
        vectorSimilarity: vectorScore,
        keywords: cafe.keywords,
        address: cafe.address,
      };
    });

    if (searchKey) {
      searchCache.set(searchKey, {
        sessionId: sessionId,
        query: searchQuery!,
        lastOffset: offset,
        embedding,
        timestamp: new Date(),
      });

      cleanupOldSearches();
    }

    if (cafeResults.length === 0) {
      return NextResponse.json([], { status: 204 });
    }

    // Sort by combined score
    cafeResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Take only the requested number of results after reranking
    const finalResults = cafeResults.slice(0, numberOfResults);

    return NextResponse.json(
      {
        results: finalResults,
        hasMore: vectorQueryResponse.matches.length > offset + numberOfResults,
        offset,
        sessionId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function cleanupOldSearches() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = new Date();

  for (const [key, search] of searchCache.entries()) {
    if (now.getTime() - search.timestamp.getTime() > ONE_HOUR) {
      searchCache.delete(key);
    }
  }
}
