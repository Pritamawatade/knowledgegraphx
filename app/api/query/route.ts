import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { supabaseServer } from '@/lib/supabaseServer';
import OpenAI from 'openai';

const client  = new OpenAI();
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { question } = await req.json();
    if (!question) return NextResponse.json({ error: 'Question required' }, { status: 400 });

    // 1️⃣ Create embedding for user’s question
    const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: process.env.QDRANT_URL || 'http://localhost:6333',
      collectionName: userId,
    });

    // 2️⃣ Search for top relevant chunks
    const results = await vectorStore.similaritySearch(question, 5);
    const context = results.map(r => r.pageContent).join('\n\n');

    // 3️⃣ Build prompt for the model
    const systemPrompt = `You are a helpful assistant that answers strictly based on the provided context. If the answer is not in the context, say "I don't know." Include brief source citations when possible.`;

    const chatResult = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context:\n${context || '(no context retrieved)'}\n\nQuestion:\n${question}` },
      ],
    });

    const answer = chatResult.choices?.[0]?.message?.content || '';

    // 4️⃣ Store query history in Supabase
    const { error } = await supabaseServer
      .from('query_history')
      .insert({
        user_id: userId,
        question,
        answer,
      });

    if (error) console.error('Error saving query history:', error);

    return NextResponse.json({
      answer,
      sources: results.map((r) => ({
        file: r.metadata?.fileName || r.metadata?.source || 'Unknown',
        page: r.metadata?.pageNumber || r.metadata?.page || null,
      })),
    });

  } catch (err: any) {
    console.error('Query route error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
