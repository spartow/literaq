import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH update an annotation
export async function PATCH(
  req: NextRequest,
  { params }: { params: { annotationId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await req.json();

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

    // Verify ownership
    const existingAnnotation = await prisma.annotation.findFirst({
      where: {
        id: params.annotationId,
        userId: user.id,
      },
    });

    if (!existingAnnotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    const annotation = await prisma.annotation.update({
      where: { id: params.annotationId },
      data: { content },
    });

    return NextResponse.json(annotation);
  } catch (error) {
    console.error('Update annotation error:', error);
    return NextResponse.json(
      { error: 'Failed to update annotation' },
      { status: 500 }
    );
  }
}

// DELETE an annotation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { annotationId: string } }
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
    const annotation = await prisma.annotation.findFirst({
      where: {
        id: params.annotationId,
        userId: user.id,
      },
    });

    if (!annotation) {
      return NextResponse.json({ error: 'Annotation not found' }, { status: 404 });
    }

    await prisma.annotation.delete({
      where: { id: params.annotationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete annotation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete annotation' },
      { status: 500 }
    );
  }
}
