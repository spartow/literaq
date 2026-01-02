import { NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export async function GET() {
  try {
    console.log('🧪 Testing OpenAI connection...');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 7));
    
    // Try a simple embedding test
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'test',
    });
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI connection successful',
      embeddingDimension: response.data[0].embedding.length,
    });
  } catch (error) {
    console.error('❌ OpenAI test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
