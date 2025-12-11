import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperId } = await req.json();

    if (!paperId) {
      return NextResponse.json({ error: 'Paper ID is required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get paper and its chunks
    const paper = await prisma.paper.findFirst({
      where: {
        id: paperId,
        userId: user.id,
      },
      include: {
        chunks: {
          take: 50, // Limit to avoid token limits
        },
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Combine chunks to analyze
    const content = paper.chunks.map((c: any) => c.content).join('\n\n');

    // Use GPT to identify and extract tables
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a table extraction expert. Identify and extract all tables from the given text.
          For each table, provide:
          1. Table number/identifier
          2. Caption or title
          3. Structured data (rows and columns)
          4. Page or section reference
          
          Return as JSON array of table objects.`,
        },
        {
          role: 'user',
          content: `Extract all tables from this paper:\n\n${content.substring(0, 6000)}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"tables":[]}');

    return NextResponse.json({ 
      tables: result.tables || [],
      count: result.tables?.length || 0,
    });
  } catch (error) {
    console.error('Table extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract tables' },
      { status: 500 }
    );
  }
}
