import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiAssistant } from '@/lib/ai-assistant';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, sections } = await req.json();
    if (!topic?.trim()) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

    const outline = await aiAssistant.generateOutline(topic, sections || 5);
    return NextResponse.json({ success: true, outline });
  } catch (error: any) {
    console.error('Error generating outline:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate outline' }, { status: 500 });
  }
}
