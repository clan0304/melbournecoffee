import { getEmbedding } from '@/lib/openai';
import { notesIndex } from '@/lib/pinecone';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Define types
type SearchHistory = {
  sessionId: string;
  query: string;
  lastOffset: number;
  embedding: number[];
  timestamp: Date;
};

type CafeResult = {
  listId: string;
  name: string; // Non-nullable
  instagram: string | null;
  relevanceScore: number;
  nameSimilarity: number;
  vectorSimilarity: number;
  keywords: string[];
  address: string; // Non-nullable
};

// Helper functions (unchanged)
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

function getNameSimilarityScore(cafeName: string, searchQuery: string): number {
  const normalizedCafeName = cafeName.toLowerCase();
  const normalizedQuery = searchQuery.toLowerCase();
  if (
    normalizedCafeName.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedCafeName)
  ) {
    return 1;
  }
  const distance = getLevenshteinDistance(normalizedCafeName, normalizedQuery);
  const maxLength = Math.max(cafeName.length, searchQuery.length);
  return 1 - distance / maxLength;
}

// In-memory cache
const searchCache = new Map<string, SearchHistory>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;
    const userId = body.userId as string | undefined;
    const sessionId = body.sessionId as string;

    const searchQuery = messages[messages.length - 1].content;
    if (!searchQuery) {
      return NextResponse.json(
        { error: 'No search query provided' },
        { status: 400 }
      );
    }

    const isFollowUpRequest =
      searchQuery.toLowerCase().includes('other') ||
      searchQuery.toLowerCase().includes('more') ||
      searchQuery.toLowerCase().includes('then');

    let embedding: number[];
    let offset = 0;
    const searchKey = userId || sessionId;

    if (isFollowUpRequest && searchKey && searchCache.has(searchKey)) {
      const previousSearch = searchCache.get(searchKey)!;
      embedding = previousSearch.embedding;
      offset = previousSearch.lastOffset + 6;
    } else {
      embedding = await getEmbedding(searchQuery);
      offset = 0;
    }

    const targetResults = 6;

    // Fetch top 8 from Pinecone
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: offset + 6,
    });

    const paginatedMatches = vectorQueryResponse.matches.slice(
      offset,
      offset + 6
    );

    // Deduplicate
    const uniqueCafeIds = new Set<string>();
    const uniqueMatches = paginatedMatches.filter((match) => {
      if (uniqueCafeIds.has(match.id)) return false;
      uniqueCafeIds.add(match.id);
      return true;
    });

    // Fetch cafes from Prisma
    const relevantCafes = await prisma.cafe.findMany({
      where: {
        id: { in: uniqueMatches.map((match) => match.id) },
      },
    });

    // Map to results with combined scores, ensuring non-nullable fields
    const cafeResults: CafeResult[] = relevantCafes.map((cafe) => {
      const vectorMatch = uniqueMatches.find((match) => match.id === cafe.id);
      const vectorScore = vectorMatch?.score || 0;
      const nameSimilarityScore = getNameSimilarityScore(
        cafe.name || '',
        searchQuery
      ); // Default to empty string if null
      const combinedScore = nameSimilarityScore * 0.05 + vectorScore * 0.95;

      return {
        listId: cafe.listId,
        name: cafe.name || 'Unknown Cafe', // Fallback for null
        instagram: cafe.instagram,
        relevanceScore: combinedScore,
        nameSimilarity: nameSimilarityScore,
        vectorSimilarity: vectorScore,
        keywords: cafe.keywords || [], // Fallback to empty array
        address: cafe.address || 'Unknown Address', // Fallback for null
      };
    });

    if (searchKey) {
      searchCache.set(searchKey, {
        sessionId,
        query: searchQuery,
        lastOffset: offset,
        embedding,
        timestamp: new Date(),
      });
      cleanupOldSearches();
    }

    if (cafeResults.length === 0) {
      return NextResponse.json([], { status: 204 });
    }

    // Randomize and limit to 6 or fewer
    const shuffledResults = cafeResults.sort(() => 0.5 - Math.random());
    const finalResults = shuffledResults.slice(
      0,
      Math.min(targetResults, cafeResults.length)
    );

    return NextResponse.json(
      {
        results: finalResults,
        hasMore: vectorQueryResponse.matches.length > offset + targetResults,
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
