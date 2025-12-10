import pdf from 'pdf-parse';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export function extractTitleFromText(text: string): string | null {
  // Simple heuristic: take first non-empty line, truncated to reasonable length
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) return null;
  
  const firstLine = lines[0];
  // Limit to 200 characters
  return firstLine.length > 200 ? firstLine.substring(0, 200) + '...' : firstLine;
}
