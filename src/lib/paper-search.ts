/**
 * arXiv API integration for paper search
 * Documentation: https://arxiv.org/help/api/
 */

export interface SearchResult {
  id: string;
  arxivId: string;
  title: string;
  authors: string;
  abstract: string;
  publicationDate: string;
  doi?: string;
  pdfUrl: string;
  source: 'arxiv' | 'pubmed';
}

/**
 * Search papers on arXiv
 */
export async function searchArxiv(
  query: string,
  maxResults: number = 10,
  sortBy: 'relevance' | 'date' = 'relevance'
): Promise<SearchResult[]> {
  try {
    const searchQuery = encodeURIComponent(query);
    const sortParam = sortBy === 'date' ? 'submittedDate' : 'relevance';
    const url = `http://export.arxiv.org/api/query?search_query=all:${searchQuery}&start=0&max_results=${maxResults}&sortBy=${sortParam}&sortOrder=descending`;

    const response = await fetch(url);
    const xmlText = await response.text();

    // Parse XML (basic parsing - could be improved with a library)
    const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];

    const results: SearchResult[] = entries.map((entry) => {
      // Extract fields using regex
      const idMatch = entry.match(/<id>(.*?)<\/id>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>(.*?)<\/summary>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      const doiMatch = entry.match(/<arxiv:doi>(.*?)<\/arxiv:doi>/);
      
      // Extract authors
      const authorMatches = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g) || [];
      const authors = authorMatches
        .map((author) => {
          const nameMatch = author.match(/<name>(.*?)<\/name>/);
          return nameMatch ? nameMatch[1].trim() : '';
        })
        .filter(Boolean)
        .join(', ');

      // Extract arXiv ID from URL
      const arxivUrl = idMatch ? idMatch[1] : '';
      const arxivId = arxivUrl.split('/abs/')[1] || '';

      return {
        id: arxivId,
        arxivId,
        title: titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '',
        authors: authors || 'Unknown',
        abstract: summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : '',
        publicationDate: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
        doi: doiMatch ? doiMatch[1] : undefined,
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
        source: 'arxiv' as const,
      };
    });

    return results.filter((r) => r.title && r.arxivId);
  } catch (error) {
    console.error('arXiv search error:', error);
    return [];
  }
}

/**
 * Search papers on PubMed (requires NCBI API key for production)
 * This is a simplified version - full implementation would use E-utilities API
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 10
): Promise<SearchResult[]> {
  // TODO: Implement PubMed search using E-utilities API
  // https://www.ncbi.nlm.nih.gov/books/NBK25501/
  // Requires: NCBI_API_KEY environment variable for production use
  
  console.log('PubMed search not yet implemented:', query, maxResults);
  return [];
}

/**
 * Search across multiple sources
 */
export async function searchPapers(
  query: string,
  sources: ('arxiv' | 'pubmed')[] = ['arxiv'],
  maxResults: number = 10,
  sortBy: 'relevance' | 'date' = 'relevance'
): Promise<SearchResult[]> {
  const promises: Promise<SearchResult[]>[] = [];

  if (sources.includes('arxiv')) {
    promises.push(searchArxiv(query, maxResults, sortBy));
  }

  if (sources.includes('pubmed')) {
    promises.push(searchPubMed(query, maxResults));
  }

  const results = await Promise.all(promises);
  return results.flat().slice(0, maxResults);
}

/**
 * Download paper PDF from arXiv
 */
export async function downloadArxivPDF(arxivId: string): Promise<Buffer> {
  const url = `https://arxiv.org/pdf/${arxivId}.pdf`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
