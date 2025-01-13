import { getEmbedding } from '@/lib/openai';
import { notesIndex } from '@/lib/pinecone';
import { ChatCompletionMessage } from 'openai/resources/index.mjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    // Get the last user message as search query
    const searchQuery = messages[messages.length - 1].content;

    // Generate embedding for the search query
    const embedding = await getEmbedding(searchQuery!);

    // Query vector database
    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
    });

    // Fetch matching cafes from database
    const relevantCafes = await prisma.cafe.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    // Map the results with relevance scores from vector search
    const cafeResults = relevantCafes.map((cafe) => {
      const vectorMatch = vectorQueryResponse.matches.find(
        (match) => match.id === cafe.id
      );

      return {
        listId: cafe.listId,
        name: cafe.name,
        description: cafe.description,
        relevanceScore: vectorMatch?.score || 0,
      };
    });

    // Sort by relevance score
    cafeResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Return structured JSON response instead of streaming
    return NextResponse.json(cafeResults, { status: 201 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}
