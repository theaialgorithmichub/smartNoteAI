import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiAssistant } from '@/lib/ai-assistant';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, cursorPosition } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const completion = await aiAssistant.autoComplete(text, cursorPosition || text.length);

    return NextResponse.json({ success: true, completion });
  } catch (error: any) {
    console.error('Error auto-completing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to auto-complete' },
      { status: 500 }
    );
  }
}
