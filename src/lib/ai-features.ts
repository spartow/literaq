import { openai } from './openai';

/**
 * Explain selected text from a paper
 */
export async function explainText(
  text: string,
  context?: string
): Promise<string> {
  const systemPrompt = `You are an AI research assistant specialized in explaining academic text.
Your goal is to make complex research papers accessible and easy to understand.
Provide clear, concise explanations suitable for researchers and students.`;

  const userPrompt = context
    ? `Context from the paper:\n${context}\n\nExplain this text:\n"${text}"`
    : `Explain this text from a research paper:\n"${text}"`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return completion.choices[0].message.content || 'Unable to generate explanation.';
}

/**
 * Generate a TL;DR summary of a paper
 */
export async function generateTLDR(fullText: string): Promise<string> {
  const systemPrompt = `You are an AI research assistant. Generate a concise TL;DR (Too Long; Didn't Read) summary of research papers.
The summary should be 2-3 sentences maximum and capture the core contribution and findings.`;

  const userPrompt = `Generate a TL;DR summary for this research paper:\n\n${fullText.slice(0, 8000)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 200,
  });

  return completion.choices[0].message.content || 'Unable to generate summary.';
}

/**
 * Extract key findings from a paper
 */
export async function extractKeyFindings(fullText: string): Promise<string[]> {
  const systemPrompt = `You are an AI research assistant. Extract the 3-5 most important findings from research papers.
Return only the findings as a JSON array of strings. Be specific and factual.`;

  const userPrompt = `Extract the key findings from this research paper:\n\n${fullText.slice(0, 8000)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result.findings || [];
  } catch {
    return [];
  }
}

/**
 * Summarize methodology section
 */
export async function summarizeMethodology(fullText: string): Promise<string> {
  const systemPrompt = `You are an AI research assistant. Summarize the methodology/methods section of research papers.
Focus on the key approaches, techniques, and experimental setup.`;

  const userPrompt = `Summarize the methodology from this research paper:\n\n${fullText.slice(0, 8000)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 400,
  });

  return completion.choices[0].message.content || 'Unable to summarize methodology.';
}

/**
 * Paraphrase text for writing assistance
 */
export async function paraphraseText(text: string, style: 'academic' | 'simple' = 'academic'): Promise<string> {
  const styleInstructions = style === 'academic'
    ? 'Maintain academic tone and terminology.'
    : 'Use simple, clear language suitable for a general audience.';

  const systemPrompt = `You are a writing assistant. Paraphrase the given text while preserving its meaning.
${styleInstructions}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Paraphrase this text:\n\n${text}` },
    ],
    temperature: 0.5,
    max_tokens: text.length * 2,
  });

  return completion.choices[0].message.content || text;
}

/**
 * Generate citation suggestions based on context
 */
export async function suggestCitations(context: string, topic: string): Promise<string[]> {
  const systemPrompt = `You are an AI research assistant. Based on the context and topic, suggest relevant citations or papers that should be referenced.
Return a JSON array of suggested citation topics/areas.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${context}\n\nTopic: ${topic}\n\nSuggest citations.` },
    ],
    temperature: 0.4,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  });

  try {
    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return result.citations || [];
  } catch {
    return [];
  }
}
