import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
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

    // Get all papers for this user
    const papers = await prisma.paper.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        authors: true,
        abstract: true,
        publicationDate: true,
        arxivId: true,
        doi: true,
        status: true,
        originalFilename: true,
        createdAt: true,
      },
    });

    return NextResponse.json(papers);
  } catch (error) {
    console.error('Get papers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}
