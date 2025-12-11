import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use GPT to understand the data extraction request
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a data extraction expert. Based on the user's query, provide example structured data 
          that would be extracted from research papers. Return as JSON with sample results.`,
        },
        {
          role: 'user',
          content: `Data extraction request: ${query}
          
          Provide 3-5 example results showing what data would be extracted.`,
        },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"results":[]}');

    return NextResponse.json({ 
      results: result.results || [],
      query,
    });
  } catch (error) {
    console.error('Data extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract data' },
      { status: 500 }
    );
  }
}
