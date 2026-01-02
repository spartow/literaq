import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { searchSimilarChunks } from '@/lib/vector-search';
import { generateChatCompletion } from '@/lib/openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const { paperId } = params;
    const body = await request.json();
    const { chatSessionId, question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Verify paper exists and is ready
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    if (paper.status !== 'ready') {
      return NextResponse.json(
        { error: 'Paper is still processing' },
        { status: 400 }
      );
    }

    // Get or create chat session
    let sessionId = chatSessionId;
    if (!sessionId) {
      const newSession = await prisma.chatSession.create({
        data: {
          id: uuidv4(),
          paperId,
        },
      });
      sessionId = newSession.id;
    } else {
      // Verify session belongs to this paper
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.paperId !== paperId) {
        return NextResponse.json(
          { error: 'Invalid chat session' },
          { status: 400 }
        );
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        id: uuidv4(),
        chatSessionId: sessionId,
        role: 'user',
        content: question,
      },
    });

    // Search for similar chunks
    const similarChunks = await searchSimilarChunks(paperId, question, 6);

    if (similarChunks.length === 0) {
      const errorMessage = "I couldn't find relevant information in the paper to answer your question.";
      
      await prisma.chatMessage.create({
        data: {
          id: uuidv4(),
          chatSessionId: sessionId,
          role: 'assistant',
          content: errorMessage,
          sourceChunkIds: [],
        },
      });

      return NextResponse.json({
        chatSessionId: sessionId,
        answer: errorMessage,
        sourceChunks: [],
      });
    }

    // Build context from chunks
    const contextText = similarChunks
      .map((chunk, idx) => `[Chunk ${idx + 1}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    // Get previous messages for context
    const previousMessages = await prisma.chatMessage.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'asc' },
      take: 10, // Limit context to last 10 messages
    });

    // Build conversation history (excluding the just-added user message)
    const conversationHistory = previousMessages
      .slice(0, -1) // Remove the last message (current question)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Build messages for OpenAI
    const messages = [
      {
        role: 'system' as const,
        content: `You are an AI assistant helping users understand research papers. Your task is to answer questions based ONLY on the provided context chunks from the paper. 

Guidelines:
- Be concise and direct in your answers
- Reference specific information from the chunks when relevant
- If the context doesn't contain enough information to answer the question, say so clearly
- Do not make assumptions or add information not present in the context
- Use clear, academic language appropriate for discussing research`,
      },
      ...conversationHistory,
      {
        role: 'user' as const,
        content: `Here are relevant excerpts from the research paper:

${contextText}

---

Based on these excerpts, please answer this question: ${question}`,
      },
    ];

    // Generate response
    const answer = await generateChatCompletion(messages);

    // Save assistant message
    await prisma.chatMessage.create({
      data: {
        id: uuidv4(),
        chatSessionId: sessionId,
        role: 'assistant',
        content: answer,
        sourceChunkIds: similarChunks.map(c => c.id),
      },
    });

    // Format source chunks for response
    const sourceChunks = similarChunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content.substring(0, 200) + '...',
      chunkIndex: chunk.chunkIndex,
      similarity: chunk.similarity,
    }));

    return NextResponse.json({
      chatSessionId: sessionId,
      answer,
      sourceChunks,
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
