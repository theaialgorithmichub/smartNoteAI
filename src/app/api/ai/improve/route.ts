import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiAssistant } from '@/lib/ai-assistant';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, action, options } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    let result: string;

    switch (action) {
      case 'improve':
        result = await aiAssistant.improveText(text, options?.focus);
        break;
      case 'summarize':
        result = await aiAssistant.summarize(text, options?.maxLength);
        break;
      case 'expand':
        result = await aiAssistant.expandText(text);
        break;
      case 'tone':
        result = await aiAssistant.changeTone(text, options?.targetTone);
        break;
      case 'translate':
        result = await aiAssistant.translate(text, options?.targetLanguage);
        break;
      case 'grammar':
        const errors = await aiAssistant.checkGrammar(text);
        return NextResponse.json({ success: true, errors });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error improving text:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process text' },
      { status: 500 }
    );
  }
}
