import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { searchPapers } from '@/lib/paper-search';

export async function GET(req: NextRequest) {
  try {
    // Allow public access to search
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const sources = searchParams.get('sources')?.split(',') as ('arxiv' | 'pubmed')[] || ['arxiv'];
    const maxResults = parseInt(searchParams.get('max') || '10', 10);
    const sortBy = (searchParams.get('sort') || 'relevance') as 'relevance' | 'date';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const results = await searchPapers(query, sources, maxResults, sortBy);

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
