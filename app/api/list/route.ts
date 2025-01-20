import { getEmbedding } from '@/lib/openai';
import { notesIndex } from '@/lib/pinecone';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const cafeLists = await prisma.cafe.findMany();

  return NextResponse.json(cafeLists, { status: 200 });
};

export const POST = async (req: Request) => {
  const body = await req.json();

  const { listId, name, address, img } = body;
  try {
    const newList = await prisma.cafe.create({
      data: {
        listId,
        name,
        address,
        img,

        instagram: '',
        mycomment: '',
        description: '',
      },
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  const { id } = await req.json();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.cafe.delete({
        where: {
          id: id,
        },
      });
      await notesIndex.deleteOne(id);
    });

    return NextResponse.json(
      { message: 'List has been deleted successfully!' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
};

export const PUT = async (req: Request) => {
  const body = await req.json();
  const { listId, description, mycomment, instagram, address, keywords } = body;

  if (!listId) {
    return NextResponse.json({ error: 'Id is undefined' }, { status: 400 });
  }

  try {
    // First get the embedding
    const embedding = await getEmbeddingForList(
      mycomment,
      description,
      address,
      keywords
    );

    // Update MongoDB first
    const updatedList = await prisma.cafe.update({
      where: {
        listId: listId,
      },
      data: {
        description,
        mycomment,
        instagram,
        keywords,
      },
    });

    // If MongoDB update succeeds, update Pinecone
    if (updatedList) {
      try {
        await notesIndex.upsert([
          {
            id: updatedList.id,
            values: embedding,
          },
        ]);
      } catch (pineconeError) {
        // Log Pinecone error but don't fail the request
        console.error('Pinecone update failed:', pineconeError);
        // Optionally, you could implement a retry mechanism here
      }
    }

    return NextResponse.json(updatedList, { status: 200 });
  } catch (error) {
    console.error('Database update failed:', error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  }
};

async function getEmbeddingForList(
  mycomment: string,
  description: string | undefined,
  address: string,
  keywords: string
) {
  return getEmbedding(
    mycomment +
      '\n\n' +
      address +
      `\n\n` +
      keywords +
      '\n\n' +
      (description ?? '')
  );
}
