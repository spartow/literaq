import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { generateTLDR, extractKeyFindings, summarizeMethodology } from '@/lib/ai-features';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if summary already exists
    const existingSummary = await prisma.paperSummary.findUnique({
      where: { paperId: params.paperId },
    });

    if (existingSummary) {
      return NextResponse.json(existingSummary);
    }

    // Verify user owns this paper
    const paper = await prisma.paper.findFirst({
      where: {
        id: params.paperId,
        user: {
          clerkId: userId,
        },
      },
      include: {
        chunks: {
          orderBy: { chunkIndex: 'asc' },
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Get full text from chunks
    const fullText = paper.chunks.map((chunk: { content: string }) => chunk.content).join('\n\n');

    // Generate all summary components in parallel
    const [tldr, keyFindings, methodology] = await Promise.all([
      generateTLDR(fullText),
      extractKeyFindings(fullText),
      summarizeMethodology(fullText),
    ]);

    // Save summary to database
    const summary = await prisma.paperSummary.create({
      data: {
        paperId: params.paperId,
        tldr,
        keyFindings,
        methodology,
      },
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Generate summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
