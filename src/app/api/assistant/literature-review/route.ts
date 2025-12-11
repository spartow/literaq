import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic, papers } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const papersContext = papers && papers.length > 0 
      ? `\n\nKey papers to reference:\n${papers.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}`
      : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert academic writer specializing in literature reviews. 
          Write comprehensive, well-structured literature reviews with proper academic tone.
          Include: introduction, key themes, critical analysis, gaps in research, and conclusion.
          Use formal academic language and cite conceptual references where appropriate.`,
        },
        {
          role: 'user',
          content: `Write a comprehensive literature review on: "${topic}"${papersContext}
          
          Structure the review with:
          1. Introduction and background
          2. Key themes and findings
          3. Critical analysis and synthesis
          4. Research gaps and future directions
          5. Conclusion
          
          Make it detailed and academic.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const review = completion.choices[0].message.content;

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Literature review error:', error);
    return NextResponse.json(
      { error: 'Failed to generate literature review' },
      { status: 500 }
    );
  }
}
