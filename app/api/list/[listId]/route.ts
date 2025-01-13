import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const GET = async (
  req: NextRequest,
  { params }: { params: { listId: string } }
) => {
  const { listId } = params;

  const list = await prisma.cafe.findUnique({
    where: {
      listId: listId,
    },
  });

  if (!list) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(list, { status: 200 });
};
