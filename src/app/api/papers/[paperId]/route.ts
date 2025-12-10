import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { paperId } = params;

    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
      include: {
        chatSessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error('Error fetching paper:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    );
  }
}
