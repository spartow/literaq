import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all bookmarks for a paper
export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { paperId: params.paperId },
      orderBy: { pageNumber: 'asc' },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// POST create a new bookmark
export async function POST(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, pageNumber } = await req.json();

    if (!title || !pageNumber) {
      return NextResponse.json(
        { error: 'Title and page number are required' },
        { status: 400 }
      );
    }

    // Verify paper ownership
    const paper = await prisma.paper.findFirst({
      where: {
        id: params.paperId,
        user: {
          clerkId: userId,
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        paperId: params.paperId,
        title,
        pageNumber,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Create bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}

// DELETE a bookmark
export async function DELETE(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookmarkId = searchParams.get('bookmarkId');

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Bookmark ID is required' }, { status: 400 });
    }

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
