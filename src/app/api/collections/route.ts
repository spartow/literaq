import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all collections for the current user
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await prisma.collection.findMany({
      where: {
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
                createdAt: true,
              },
            },
          },
        },
        _count: {
          select: { papers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Get collections error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST create a new collection
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, color } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get user from clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        name,
        description,
        color: color || '#6366f1',
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
