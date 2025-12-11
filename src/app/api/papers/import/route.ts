import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { downloadArxivPDF } from '@/lib/paper-search';
import { extractTextFromPDF } from '@/lib/pdf-processor';
import { chunkText } from '@/lib/chunking';
import { generateEmbedding } from '@/lib/openai';
import { prisma } from '@/lib/db';
import { checkSubscription, incrementPaperCount } from '@/lib/subscription';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { arxivId, title, authors, abstract, publicationDate, doi } = await req.json();

    if (!arxivId) {
      return NextResponse.json({ error: 'arXiv ID is required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check subscription limits
    const subscription = await checkSubscription(user.id);
    if (!subscription.canUpload) {
      return NextResponse.json(
        {
          error: 'Upload limit reached',
          message: `You have reached your upload limit of ${subscription.paperLimit} papers`,
          currentCount: subscription.currentPaperCount,
          limit: subscription.paperLimit,
        },
        { status: 403 }
      );
    }

    // Check if already imported
    const existing = await prisma.paper.findFirst({
      where: {
        arxivId,
        userId: user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Paper already imported', paper: existing },
        { status: 400 }
      );
    }

    // Download PDF from arXiv
    console.log(`Downloading PDF for arXiv:${arxivId}...`);
    const pdfBuffer = await downloadArxivPDF(arxivId);

    // Extract text
    console.log('Extracting text from PDF...');
    const text = await extractTextFromPDF(pdfBuffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Create paper record
    const paper = await prisma.paper.create({
      data: {
        userId: user.id,
        title: title || `arXiv:${arxivId}`,
        authors,
        abstract,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        doi,
        arxivId,
        originalFilename: `${arxivId}.pdf`,
        fileUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
        status: 'processing',
      },
    });

    // Process in background (chunk + embed)
    processImportedPaper(paper.id, text).catch((err) => {
      console.error('Background processing error:', err);
    });

    // Increment paper count
    await incrementPaperCount(user.id);

    return NextResponse.json({
      paper,
      message: 'Paper import started. Processing in background...',
    }, { status: 201 });
  } catch (error) {
    console.error('Import paper error:', error);
    return NextResponse.json(
      { error: 'Failed to import paper' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processImportedPaper(paperId: string, text: string) {
  try {
    // Chunk the text
    const chunks = chunkText(text);
    console.log(`Created ${chunks.length} chunks for paper ${paperId}`);

    // Generate embeddings in batches
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      const embeddingPromises = batch.map(async (chunkContent, idx) => {
        const chunkIndex = i + idx;
        const embedding = await generateEmbedding(chunkContent);
        const embeddingArray = `[${embedding.join(',')}]`;
        
        return prisma.$executeRaw`
          INSERT INTO paper_chunks (id, paper_id, chunk_index, content, embedding)
          VALUES (
            gen_random_uuid(),
            ${paperId}::uuid,
            ${chunkIndex},
            ${chunkContent},
            ${embeddingArray}::vector
          )
        `;
      });

      await Promise.all(embeddingPromises);
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
    }

    // Update paper status
    await prisma.paper.update({
      where: { id: paperId },
      data: { status: 'ready' },
    });

    console.log(`Paper ${paperId} processing complete!`);
  } catch (error) {
    console.error('Process imported paper error:', error);
    await prisma.paper.update({
      where: { id: paperId },
      data: { status: 'failed' },
    });
  }
}
