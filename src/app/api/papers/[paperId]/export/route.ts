import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateAllCitations, generateBibTeX, generateRIS, generateAPA, generateMLA, generateChicago } from '@/lib/citation';

export async function GET(
  req: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'all'; // all, bibtex, ris, apa, mla, chicago

    // Get paper
    const paper = await prisma.paper.findFirst({
      where: {
        id: params.paperId,
        user: {
          clerkId: userId,
        },
      },
      select: {
        title: true,
        authors: true,
        publicationDate: true,
        doi: true,
        arxivId: true,
        abstract: true,
      },
    });

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Generate citations based on format
    switch (format.toLowerCase()) {
      case 'bibtex':
        const bibtex = generateBibTeX({
          title: paper.title || 'Untitled',
          authors: paper.authors || undefined,
          publicationDate: paper.publicationDate,
          doi: paper.doi,
          arxivId: paper.arxivId,
          abstract: paper.abstract,
        });
        return new Response(bibtex, {
          headers: {
            'Content-Type': 'text/plain',
            'Content-Disposition': `attachment; filename="${params.paperId}.bib"`,
          },
        });

      case 'ris':
        const ris = generateRIS({
          title: paper.title || 'Untitled',
          authors: paper.authors || undefined,
          publicationDate: paper.publicationDate,
          doi: paper.doi,
          arxivId: paper.arxivId,
          abstract: paper.abstract,
        });
        return new Response(ris, {
          headers: {
            'Content-Type': 'application/x-research-info-systems',
            'Content-Disposition': `attachment; filename="${params.paperId}.ris"`,
          },
        });

      case 'apa':
        const apa = generateAPA({
          title: paper.title || 'Untitled',
          authors: paper.authors || undefined,
          publicationDate: paper.publicationDate,
          doi: paper.doi,
          arxivId: paper.arxivId,
        });
        return new Response(apa, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });

      case 'mla':
        const mla = generateMLA({
          title: paper.title || 'Untitled',
          authors: paper.authors || undefined,
          publicationDate: paper.publicationDate,
          doi: paper.doi,
          arxivId: paper.arxivId,
        });
        return new Response(mla, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });

      case 'chicago':
        const chicago = generateChicago({
          title: paper.title || 'Untitled',
          authors: paper.authors || undefined,
          publicationDate: paper.publicationDate,
          doi: paper.doi,
          arxivId: paper.arxivId,
        });
        return new Response(chicago, {
          headers: {
            'Content-Type': 'text/plain',
          },
        });

      case 'all':
      default:
        const allCitations = generateAllCitations({
          title: paper.title || 'Untitled',
          authors: paper.authors || undefined,
          publicationDate: paper.publicationDate,
          doi: paper.doi,
          arxivId: paper.arxivId,
          abstract: paper.abstract,
        });
        return NextResponse.json(allCitations);
    }
  } catch (error) {
    console.error('Export citation error:', error);
    return NextResponse.json(
      { error: 'Failed to export citation' },
      { status: 500 }
    );
  }
}
