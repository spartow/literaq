/**
 * Simple token estimator (roughly 4 chars per token for English text)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Chunk text into overlapping segments
 * @param text - The full text to chunk
 * @param maxTokens - Maximum tokens per chunk (default: 1000)
 * @param overlapTokens - Number of overlapping tokens between chunks (default: 150)
 */
export function chunkText(
  text: string,
  maxTokens: number = 1000,
  overlapTokens: number = 150
): string[] {
  const chunks: string[] = [];
  
  // Split by paragraphs first (double newlines)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);
    
    // If a single paragraph is too large, split it by sentences
    if (paragraphTokens > maxTokens) {
      // Save current chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }
      
      // Split large paragraph into sentences
      const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
      
      for (const sentence of sentences) {
        const sentenceTokens = estimateTokens(sentence);
        
        if (currentTokens + sentenceTokens > maxTokens && currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
          
          // Keep overlap from previous chunk
          const words = currentChunk.split(/\s+/);
          const overlapWords = Math.floor(words.length * (overlapTokens / maxTokens));
          currentChunk = words.slice(-overlapWords).join(' ') + ' ';
          currentTokens = estimateTokens(currentChunk);
        }
        
        currentChunk += sentence + ' ';
        currentTokens += sentenceTokens;
      }
    } else {
      // Check if adding this paragraph exceeds limit
      if (currentTokens + paragraphTokens > maxTokens && currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        
        // Keep overlap from previous chunk
        const words = currentChunk.split(/\s+/);
        const overlapWords = Math.floor(words.length * (overlapTokens / maxTokens));
        currentChunk = words.slice(-overlapWords).join(' ') + '\n\n';
        currentTokens = estimateTokens(currentChunk);
      }
      
      currentChunk += paragraph + '\n\n';
      currentTokens += paragraphTokens;
    }
  }
  
  // Add remaining chunk
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}
