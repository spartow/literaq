import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { paperId } = params;
    const { searchParams } = new URL(request.url);
    const chatSessionId = searchParams.get('chatSessionId');

    if (!chatSessionId) {
      return NextResponse.json(
        { error: 'chatSessionId is required' },
        { status: 400 }
      );
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatSessionId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
