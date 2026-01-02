import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all annotations for a paper
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

    const annotations = await prisma.annotation.findMany({
      where: {
        paperId: params.paperId,
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(annotations);
  } catch (error) {
    console.error('Get annotations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

// POST create a new annotation
export async function POST(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, pageNumber, position } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
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

    const annotation = await prisma.annotation.create({
      data: {
        userId: user.id,
        paperId: params.paperId,
        content,
        pageNumber,
        position,
      },
    });

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    console.error('Create annotation error:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
