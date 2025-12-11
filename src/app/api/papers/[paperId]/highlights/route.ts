import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all highlights for a paper
export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const highlights = await prisma.highlight.findMany({
      where: {
        paperId: params.paperId,
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(highlights);
  } catch (error) {
    console.error('Get highlights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

// POST create a new highlight
export async function POST(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, color, pageNumber, position } = await req.json();

    if (!text || !pageNumber || !position) {
      return NextResponse.json(
        { error: 'Text, page number, and position are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: {
        id: params.paperId,
        userId: user.id,
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const highlight = await prisma.highlight.create({
      data: {
        userId: user.id,
        paperId: params.paperId,
        text,
        color: color || '#fbbf24',
        pageNumber,
        position,
      },
    });

    return NextResponse.json(highlight, { status: 201 });
  } catch (error) {
    console.error('Create highlight error:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}
