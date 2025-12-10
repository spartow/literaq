import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all tags for a paper
export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const paperTags = await prisma.paperTag.findMany({
      where: { paperId: params.paperId },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(paperTags.map((pt: { tag: unknown }) => pt.tag));
  } catch (error) {
    console.error('Get paper tags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

// POST add a tag to a paper
export async function POST(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tagId } = await req.json();

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
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

    // Verify tag ownership
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: user.id,
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Check if already tagged
    const existing = await prisma.paperTag.findUnique({
      where: {
        paperId_tagId: {
          paperId: params.paperId,
          tagId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Paper already has this tag' }, { status: 400 });
    }

    const paperTag = await prisma.paperTag.create({
      data: {
        paperId: params.paperId,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(paperTag.tag, { status: 201 });
  } catch (error) {
    console.error('Add tag to paper error:', error);
    return NextResponse.json(
      { error: 'Failed to add tag to paper' },
      { status: 500 }
    );
  }
}

// DELETE remove a tag from a paper
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
    const tagId = searchParams.get('tagId');

    if (!tagId) {
      return NextResponse.json({ error: 'Tag ID is required' }, { status: 400 });
    }

    await prisma.paperTag.delete({
      where: {
        paperId_tagId: {
          paperId: params.paperId,
          tagId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove tag from paper error:', error);
    return NextResponse.json(
      { error: 'Failed to remove tag from paper' },
      { status: 500 }
    );
  }
}
