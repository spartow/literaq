import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET a specific collection
export async function GET(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await prisma.collection.findFirst({
      where: {
        id: params.collectionId,
        user: {
          clerkId: userId,
        },
      },
      include: {
        papers: {
          include: {
            paper: {
              select: {
                id: true,
                title: true,
                authors: true,
                abstract: true,
                createdAt: true,
                originalFilename: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Get collection error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PATCH update a collection
export async function PATCH(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color } = await req.json();

    // Verify ownership
    const existingCollection = await prisma.collection.findFirst({
      where: {
        id: params.collectionId,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!existingCollection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const collection = await prisma.collection.update({
      where: { id: params.collectionId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
      },
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Update collection error:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE a collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
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

    await prisma.collection.delete({
      where: { id: params.collectionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
