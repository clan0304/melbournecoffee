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

// In-memory cache for recent searches
const searchCache = new Map<string, SearchHistory>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;
    const userId = body.userId; // Optional: for logged-in users
    const sessionId = body.sessionId; // New: for tracking anonymous sessions

    // Get the last user message as search query
    const searchQuery = messages[messages.length - 1].content;

    // Check if it's a follow-up request
    const isFollowUpRequest =
      searchQuery?.toLowerCase().includes('other') ||
      searchQuery?.toLowerCase().includes('more') ||
      searchQuery?.toLowerCase().includes('then');

    let embedding: number[];
    let offset = 0;

    // Use userId if available, otherwise use sessionId
    const searchKey = userId || sessionId;

    if (isFollowUpRequest && searchKey && searchCache.has(searchKey)) {
      // Retrieve the previous search details
      const previousSearch = searchCache.get(searchKey)!;
      embedding = previousSearch.embedding;
      offset = previousSearch.lastOffset + 6; // Move to next page
    } else {
      // New search
      embedding = await getEmbedding(searchQuery!);
      offset = 0;
    }

    // Extract number of requested results
    const match = searchQuery?.match(/\b(\d+)\b/);
    let numberOfResults = match ? parseInt(match[1], 10) : 6;
    numberOfResults = Math.min(numberOfResults, 10);

    // Query vector database with pagination
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: offset + numberOfResults,
    });

    // Apply offset to get next batch of results
    const paginatedMatches = vectorQueryResponse.matches.slice(
      offset,
      offset + numberOfResults
    );

    // Fetch matching cafes from database
    const relevantCafes = await prisma.cafe.findMany({
      where: {
        id: {
          in: paginatedMatches.map((match) => match.id),
        },
      },
    });

    // Map the results with relevance scores
    const cafeResults = relevantCafes.map((cafe) => {
      const vectorMatch = paginatedMatches.find(
        (match) => match.id === cafe.id
      );

      return {
        listId: cafe.listId,
        name: cafe.name,
        instagram: cafe.instagram,
        relevanceScore: vectorMatch?.score || 0,
        keywords: cafe.keywords,
        address: cafe.address,
      };
    });

    // Update search cache if we have a searchKey
    if (searchKey) {
      searchCache.set(searchKey, {
        sessionId: sessionId,
        query: searchQuery!,
        lastOffset: offset,
        embedding,
        timestamp: new Date(),
      });

      // Clean up old entries
      cleanupOldSearches();
    }

    if (cafeResults.length === 0) {
      return NextResponse.json([], { status: 204 });
    }

    // Sort by relevance score
    cafeResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return NextResponse.json(
      {
        results: cafeResults,
        hasMore: vectorQueryResponse.matches.length > offset + numberOfResults,
        offset,
        sessionId, // Return the sessionId for client-side storage
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

// Utility function to clean up old searches
function cleanupOldSearches() {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = new Date();

  for (const [key, search] of searchCache.entries()) {
    if (now.getTime() - search.timestamp.getTime() > ONE_HOUR) {
      searchCache.delete(key);
    }
  }
}
