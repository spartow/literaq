import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { paraphraseText } from '@/lib/ai-features';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, style } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const paraphrased = await paraphraseText(text, style || 'academic');

    return NextResponse.json({ paraphrased });
  } catch (error) {
    console.error('Paraphrase error:', error);
    return NextResponse.json(
      { error: 'Failed to paraphrase text' },
      { status: 500 }
    );
  }
}
