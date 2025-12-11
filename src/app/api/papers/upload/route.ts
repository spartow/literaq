import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { extractTextFromPDF, extractTitleFromText } from '@/lib/pdf-processor';
import { chunkText } from '@/lib/chunking';
import { generateEmbeddings } from '@/lib/openai';
import { checkSubscription, incrementPaperCount } from '@/lib/subscription';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large PDFs

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Upload request received');
    
    // Check authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        },
      });
    }

    // Check subscription limits
    const subscription = await checkSubscription(dbUser.id);
    if (!subscription.canUpload) {
      return NextResponse.json(
        {
          error: 'Upload limit reached',
          message: `You've reached your limit of ${subscription.paperLimit} papers. Please upgrade your plan.`,
          currentCount: subscription.currentPaperCount,
          limit: subscription.paperLimit,
        },
        { status: 403 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`📄 File received: ${file.name} (${file.size} bytes)`);

    if (file.type !== 'application/pdf') {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const paperId = uuidv4();
    const buffer = Buffer.from(await file.arrayBuffer());

    // Skip Vercel Blob for now (optional feature)
    const fileUrl = undefined;
    console.log('⏭️  Skipping Vercel Blob storage (not configured)');

    // Extract text from PDF
    console.log('📖 Extracting text from PDF...');
    const text = await extractTextFromPDF(buffer);
    console.log(`✅ Extracted ${text.length} characters`);
    
    if (!text || text.trim().length === 0) {
      console.error('❌ No text extracted from PDF');
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      );
    }

    // Extract title
    const title = extractTitleFromText(text);
    console.log(`📝 Title: ${title || file.name}`);

    // Create paper record
    console.log('💾 Creating paper record in database...');
    const paper = await prisma.paper.create({
      data: {
        id: paperId,
        userId: dbUser.id,
        title: title || file.name,
        originalFilename: file.name,
        fileUrl,
        status: 'processing',
      },
    });
    console.log(`✅ Paper created with ID: ${paper.id}`);

    // Increment paper count
    await incrementPaperCount(dbUser.id);

    // Chunk the text
    console.log('✂️  Chunking text...');
    const chunks = chunkText(text);
    console.log(`✅ Created ${chunks.length} chunks`);

    // Generate embeddings in batches to avoid rate limits
    const batchSize = 20;
    const allChunkRecords = [];

    console.log('🧠 Generating embeddings...');
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`);
      const embeddings = await generateEmbeddings(batch);

      const chunkRecords = batch.map((chunk, idx) => ({
        id: uuidv4(),
        paperId: paper.id,
        chunkIndex: i + idx,
        content: chunk,
        embedding: `[${embeddings[idx].join(',')}]`,
      }));

      allChunkRecords.push(...chunkRecords);
    }
    console.log(`✅ Generated ${allChunkRecords.length} embeddings`);

    // Store chunks with embeddings using raw SQL since Prisma doesn't support vector type well
    console.log('💾 Storing chunks in database...');
    for (const chunk of allChunkRecords) {
      await prisma.$executeRaw`
        INSERT INTO paper_chunks (id, paper_id, chunk_index, content, embedding)
        VALUES (
          ${chunk.id}::uuid,
          ${chunk.paperId}::uuid,
          ${chunk.chunkIndex},
          ${chunk.content},
          ${chunk.embedding}::vector
        )
      `;
    }
    console.log(`✅ Stored ${allChunkRecords.length} chunks`);

    // Update paper status to ready
    console.log('🎉 Updating paper status to ready...');
    await prisma.paper.update({
      where: { id: paper.id },
      data: { status: 'ready' },
    });

    console.log(`✅ Upload complete! Paper ID: ${paper.id}`);
    return NextResponse.json({
      paperId: paper.id,
      title: paper.title,
      chunksCount: chunks.length,
      status: 'ready',
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
