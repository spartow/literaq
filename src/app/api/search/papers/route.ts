import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { searchPapers } from '@/lib/paper-search';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const sources = searchParams.get('sources')?.split(',') as ('arxiv' | 'pubmed')[] || ['arxiv'];
    const maxResults = parseInt(searchParams.get('max') || '10', 10);

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const results = await searchPapers(query, sources, maxResults);

    return NextResponse.json({
      query,
      sources,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search papers error:', error);
    return NextResponse.json(
      { error: 'Failed to search papers' },
      { status: 500 }
    );
  }
}
