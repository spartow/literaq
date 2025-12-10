import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use GPT to analyze if text appears AI-generated
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI text detector. Analyze the given text and determine if it was likely written by AI or a human. 
          Consider factors like:
          - Repetitive patterns
          - Overly formal language
          - Lack of personal touch
          - Perfect grammar and structure
          - Generic phrasing
          
          Respond with ONLY a JSON object containing:
          {
            "aiProbability": <number 0-100>,
            "isAI": <boolean>,
            "reasoning": "<brief explanation>"
          }`,
        },
        {
          role: 'user',
          content: `Analyze this text:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      aiProbability: result.aiProbability || 50,
      isAI: result.isAI || false,
      reasoning: result.reasoning || 'Unable to determine',
    });
  } catch (error) {
    console.error('AI detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    );
  }
}
