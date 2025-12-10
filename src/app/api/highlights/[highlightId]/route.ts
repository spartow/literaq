import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH update a highlight (mainly color)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { highlightId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { color } = await req.json();

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify ownership
    const existingHighlight = await prisma.highlight.findFirst({
      where: {
        id: params.highlightId,
        userId: user.id,
      },
    });

    if (!existingHighlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    const highlight = await prisma.highlight.update({
      where: { id: params.highlightId },
      data: {
        ...(color && { color }),
      },
    });

    return NextResponse.json(highlight);
  } catch (error) {
    console.error('Update highlight error:', error);
    return NextResponse.json(
      { error: 'Failed to update highlight' },
      { status: 500 }
    );
  }
}

// DELETE a highlight
export async function DELETE(
  req: NextRequest,
  { params }: { params: { highlightId: string } }
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

    // Verify ownership
    const highlight = await prisma.highlight.findFirst({
      where: {
        id: params.highlightId,
        userId: user.id,
      },
    });

    if (!highlight) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    await prisma.highlight.delete({
      where: { id: params.highlightId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete highlight error:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
