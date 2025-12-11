import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section, topic, context } = await req.json();

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const sectionPrompts: Record<string, string> = {
      introduction: 'Write a compelling academic introduction that provides background, states the problem, and outlines objectives.',
      methodology: 'Write a detailed methodology section explaining the research design, data collection, and analysis methods.',
      results: 'Write a results section presenting key findings with clear structure and academic tone.',
      discussion: 'Write a discussion section interpreting results, comparing with existing research, and highlighting implications.',
      conclusion: 'Write a conclusion summarizing key findings, contributions, limitations, and future research directions.',
      abstract: 'Write a concise abstract covering background, methods, results, and conclusions (200-250 words).',
    };

    const prompt = sectionPrompts[section] || sectionPrompts.introduction;
    const contextText = context ? `\n\nAdditional context:\n${context}` : '';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert academic writer. Write clear, well-structured research paper sections.
          Use formal academic language, proper citations (use [Author, Year] format as placeholders), 
          and maintain scholarly tone throughout.`,
        },
        {
          role: 'user',
          content: `${prompt}

Topic: "${topic}"${contextText}

Write a complete, publishable-quality ${section} section.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const draft = completion.choices[0].message.content;

    return NextResponse.json({ draft, section, topic });
  } catch (error) {
    console.error('Draft writing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
