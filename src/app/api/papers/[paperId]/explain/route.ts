import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { explainText } from '@/lib/ai-features';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, context } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Verify user owns this paper
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

    // Generate explanation
    const explanation = await explainText(text, context);

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Explain text error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
