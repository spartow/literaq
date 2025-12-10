/**
 * Citation generation utilities
 * Supports BibTeX, RIS, APA, MLA, Chicago formats
 */

interface PaperInfo {
  title: string;
  authors?: string;
  publicationDate?: Date | null;
  doi?: string | null;
  arxivId?: string | null;
  abstract?: string | null;
}

/**
 * Generate BibTeX citation
 */
export function generateBibTeX(paper: PaperInfo, citationKey?: string): string {
  const key = citationKey || generateCitationKey(paper);
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : new Date().getFullYear();

  let bibtex = `@article{${key},\n`;
  bibtex += `  title = {${paper.title}},\n`;

  if (paper.authors) {
    bibtex += `  author = {${paper.authors}},\n`;
  }

  bibtex += `  year = {${year}},\n`;

  if (paper.doi) {
    bibtex += `  doi = {${paper.doi}},\n`;
  }

  if (paper.arxivId) {
    bibtex += `  archivePrefix = {arXiv},\n`;
    bibtex += `  eprint = {${paper.arxivId}},\n`;
  }

  bibtex += `}\n`;

  return bibtex;
}

/**
 * Generate RIS citation (Research Information Systems)
 */
export function generateRIS(paper: PaperInfo): string {
  let ris = `TY  - JOUR\n`;
  ris += `TI  - ${paper.title}\n`;

  if (paper.authors) {
    const authorList = paper.authors.split(',').map((a) => a.trim());
    authorList.forEach((author) => {
      ris += `AU  - ${author}\n`;
    });
  }

  if (paper.publicationDate) {
    const year = new Date(paper.publicationDate).getFullYear();
    ris += `PY  - ${year}\n`;
  }

  if (paper.doi) {
    ris += `DO  - ${paper.doi}\n`;
  }

  if (paper.abstract) {
    ris += `AB  - ${paper.abstract}\n`;
  }

  if (paper.arxivId) {
    ris += `UR  - https://arxiv.org/abs/${paper.arxivId}\n`;
  }

  ris += `ER  -\n`;

  return ris;
}

/**
 * Generate APA citation
 */
export function generateAPA(paper: PaperInfo): string {
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 'n.d.';

  let citation = '';

  if (paper.authors) {
    citation += formatAuthorsAPA(paper.authors) + ' ';
  }

  citation += `(${year}). `;
  citation += `${paper.title}. `;

  if (paper.arxivId) {
    citation += `arXiv preprint arXiv:${paper.arxivId}. `;
  }

  if (paper.doi) {
    citation += `https://doi.org/${paper.doi}`;
  } else if (paper.arxivId) {
    citation += `https://arxiv.org/abs/${paper.arxivId}`;
  }

  return citation;
}

/**
 * Generate MLA citation
 */
export function generateMLA(paper: PaperInfo): string {
  let citation = '';

  if (paper.authors) {
    const authors = paper.authors.split(',').map((a) => a.trim());
    if (authors.length > 0) {
      citation += `${authors[0]}`;
      if (authors.length > 1) {
        citation += ', et al';
      }
      citation += '. ';
    }
  }

  citation += `"${paper.title}." `;

  if (paper.arxivId) {
    citation += `arXiv preprint arXiv:${paper.arxivId} `;
  }

  if (paper.publicationDate) {
    const year = new Date(paper.publicationDate).getFullYear();
    citation += `(${year}). `;
  }

  if (paper.doi) {
    citation += `doi:${paper.doi}.`;
  }

  return citation;
}

/**
 * Generate Chicago citation
 */
export function generateChicago(paper: PaperInfo): string {
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 'n.d.';

  let citation = '';

  if (paper.authors) {
    citation += formatAuthorsChicago(paper.authors) + '. ';
  }

  citation += `${year}. `;
  citation += `"${paper.title}." `;

  if (paper.arxivId) {
    citation += `arXiv preprint arXiv:${paper.arxivId}. `;
  }

  if (paper.doi) {
    citation += `https://doi.org/${paper.doi}.`;
  }

  return citation;
}

/**
 * Generate citation in all formats
 */
export function generateAllCitations(paper: PaperInfo, citationKey?: string) {
  return {
    bibtex: generateBibTeX(paper, citationKey),
    ris: generateRIS(paper),
    apa: generateAPA(paper),
    mla: generateMLA(paper),
    chicago: generateChicago(paper),
  };
}

// Helper functions

function generateCitationKey(paper: PaperInfo): string {
  const year = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : 'n.d.';

  let key = '';

  if (paper.authors) {
    const firstAuthor = paper.authors.split(',')[0].trim();
    const lastName = firstAuthor.split(' ').pop() || 'unknown';
    key = `${lastName.toLowerCase()}${year}`;
  } else {
    key = `paper${year}`;
  }

  // Remove special characters
  key = key.replace(/[^a-z0-9]/g, '');

  return key;
}

function formatAuthorsAPA(authors: string): string {
  const authorList = authors.split(',').map((a) => a.trim());

  if (authorList.length === 1) {
    return formatAuthorLastFirst(authorList[0]);
  } else if (authorList.length === 2) {
    return `${formatAuthorLastFirst(authorList[0])}, & ${formatAuthorLastFirst(authorList[1])}`;
  } else {
    const formatted = authorList.slice(0, -1).map(formatAuthorLastFirst).join(', ');
    return `${formatted}, & ${formatAuthorLastFirst(authorList[authorList.length - 1])}`;
  }
}

function formatAuthorsChicago(authors: string): string {
  const authorList = authors.split(',').map((a) => a.trim());

  if (authorList.length === 1) {
    return formatAuthorLastFirst(authorList[0]);
  } else if (authorList.length === 2) {
    return `${formatAuthorLastFirst(authorList[0])}, and ${formatAuthorLastFirst(authorList[1])}`;
  } else if (authorList.length === 3) {
    return `${formatAuthorLastFirst(authorList[0])}, ${formatAuthorLastFirst(authorList[1])}, and ${formatAuthorLastFirst(authorList[2])}`;
  } else {
    return `${formatAuthorLastFirst(authorList[0])} et al.`;
  }
}

function formatAuthorLastFirst(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name;

  const lastName = parts[parts.length - 1];
  const firstNames = parts.slice(0, -1).join(' ');

  // Get initials
  const initials = firstNames
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase() + '.')
    .join(' ');

  return `${lastName}, ${initials}`;
}
