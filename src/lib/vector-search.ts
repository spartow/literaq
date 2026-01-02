import { prisma } from './db';
import { generateEmbedding } from './openai';

export interface SearchResult {
  id: string;
  paperId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

/**
 * Perform similarity search on paper chunks using pgvector
 */
export async function searchSimilarChunks(
  paperId: string,
  query: string,
  topK: number = 6
): Promise<SearchResult[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Format embedding as PostgreSQL vector string
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    // Perform similarity search using raw SQL with pgvector
    // Using cosine distance (1 - cosine similarity)
    const results = await prisma.$queryRaw<SearchResult[]>`
      SELECT 
        id,
        paper_id as "paperId",
        chunk_index as "chunkIndex",
        content,
        1 - (embedding <=> ${embeddingString}::vector) as similarity
      FROM paper_chunks
      WHERE paper_id = ${paperId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${embeddingString}::vector
      LIMIT ${topK}
    `;
    
    return results;
  } catch (error) {
    console.error('Error searching similar chunks:', error);
    throw new Error('Failed to search similar chunks');
  }
}
