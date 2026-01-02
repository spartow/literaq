import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST add a paper to a collection
export async function POST(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperId } = await req.json();

    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 });
    }

    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: {
        id: params.collectionId,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: {
        id: paperId,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Check if already in collection
    const existing = await prisma.collectionPaper.findUnique({
      where: {
        collectionId_paperId: {
          collectionId: params.collectionId,
          paperId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Paper already in collection' },
        { status: 400 }
      );
    }

    // Add paper to collection
    const collectionPaper = await prisma.collectionPaper.create({
      data: {
        collectionId: params.collectionId,
        paperId,
      },
      include: {
        paper: true,
      },
    });

    return NextResponse.json(collectionPaper, { status: 201 });
  } catch (error) {
    console.error('Add paper to collection error:', error);
    return NextResponse.json(
      { error: 'Failed to add paper to collection' },
      { status: 500 }
    );
  }
}

// DELETE remove a paper from a collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paperId = searchParams.get('paperId');

    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 });
    }

    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: {
        id: params.collectionId,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Remove paper from collection
    await prisma.collectionPaper.delete({
      where: {
        collectionId_paperId: {
          collectionId: params.collectionId,
          paperId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove paper from collection error:', error);
    return NextResponse.json(
      { error: 'Failed to remove paper from collection' },
      { status: 500 }
    );
  }
}
