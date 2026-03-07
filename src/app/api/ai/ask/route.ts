import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';
import connectDB from '@/lib/mongodb';
import { Notebook } from '@/lib/models/notebook';
import { Page } from '@/lib/models/page';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, notebookId } = await req.json();
    if (!question?.trim()) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

    await connectDB();

    // Gather context: either from a specific notebook or all notebooks
    let pages: any[] = [];
    if (notebookId) {
      pages = await Page.find({ notebookId }).lean();
    } else {
      const notebooks = await Notebook.find({ userId, isTrashed: false }).lean();
      const notebookIds = notebooks.map((n) => n._id);
      pages = await Page.find({ notebookId: { $in: notebookIds } })
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();
    }

    if (pages.length === 0) {
      return NextResponse.json({
        answer: "You don't have any notes yet. Create some notebooks and add content first!",
        sources: [],
      });
    }

    // Build context from pages (truncate to fit tokens)
    const context = pages
      .map((p: any) => {
        const text = (p.contentPlainText || '').trim();
        if (!text) return null;
        return `[Page: "${p.title || 'Untitled'}"]\n${text.slice(0, 400)}`;
      })
      .filter(Boolean)
      .join('\n\n---\n\n')
      .slice(0, 12000);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `You are a smart assistant that answers questions based strictly on the user's notes.
If the answer is not in the notes, say so clearly. Be concise and cite the specific page title when referencing content.
Format your answer in plain readable text.`,
        },
        {
          role: 'user',
          content: `My notes:\n\n${context}\n\n---\n\nQuestion: ${question}`,
        },
      ],
    });

    const answer = response.choices[0].message.content || 'No answer found.';

    // Extract source page titles mentioned in the context
    const mentionedTitles = pages
      .filter((p: any) => {
        const title = p.title || '';
        return title && answer.toLowerCase().includes(title.toLowerCase());
      })
      .map((p: any) => ({ title: p.title, notebookId: p.notebookId?.toString(), pageNumber: p.pageNumber }))
      .slice(0, 5);

    return NextResponse.json({ success: true, answer, sources: mentionedTitles });
  } catch (error: any) {
    console.error('Error in AI ask:', error);
    return NextResponse.json({ error: error.message || 'Failed to answer question' }, { status: 500 });
  }
}
