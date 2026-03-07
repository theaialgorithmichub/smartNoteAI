import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAssistantOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface WritingSuggestion {
  type: 'grammar' | 'style' | 'clarity' | 'tone' | 'completion';
  original: string;
  suggestion: string;
  explanation: string;
  position?: { start: number; end: number };
  confidence: number;
}

export interface ContentGenerationOptions {
  prompt: string;
  context?: string;
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  length?: 'short' | 'medium' | 'long';
}

export class AIAssistant {
  private options: AIAssistantOptions;

  constructor(options: AIAssistantOptions = {}) {
    this.options = {
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000,
      model: options.model || 'gpt-4-turbo-preview',
    };
  }

  // Get writing suggestions for text
  async getWritingSuggestions(text: string): Promise<WritingSuggestion[]> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.3, // Lower temperature for more focused suggestions
        messages: [
          {
            role: 'system',
            content: `You are an expert writing assistant. Analyze the given text and provide suggestions for:
1. Grammar and spelling errors
2. Style improvements
3. Clarity enhancements
4. Tone adjustments

Return suggestions in JSON format as an array of objects with:
- type: 'grammar' | 'style' | 'clarity' | 'tone'
- original: the text that needs improvement
- suggestion: the improved version
- explanation: why this change is recommended
- confidence: 0-1 score

Only suggest changes that significantly improve the text. Limit to 5 most important suggestions.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];
    } catch (error) {
      console.error('Error getting writing suggestions:', error);
      return [];
    }
  }

  // Auto-complete text based on context
  async autoComplete(text: string, cursorPosition: number): Promise<string> {
    try {
      const beforeCursor = text.substring(0, cursorPosition);
      const afterCursor = text.substring(cursorPosition);

      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: this.options.temperature!,
        max_tokens: 50,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful writing assistant. Complete the sentence naturally based on the context. Only return the completion text, nothing else.',
          },
          {
            role: 'user',
            content: `Complete this text naturally:\n\n${beforeCursor}`,
          },
        ],
      });

      return response.choices[0].message.content?.trim() || '';
    } catch (error) {
      console.error('Error auto-completing:', error);
      return '';
    }
  }

  // Generate content based on prompt
  async generateContent(options: ContentGenerationOptions): Promise<string> {
    try {
      const { prompt, context, tone = 'professional', length = 'medium' } = options;

      const lengthTokens = {
        short: 150,
        medium: 500,
        long: 1000,
      };

      const toneInstructions = {
        professional: 'Use professional, formal language suitable for business contexts.',
        casual: 'Use conversational, friendly language.',
        academic: 'Use scholarly, well-researched language with proper citations.',
        creative: 'Use imaginative, engaging language with vivid descriptions.',
      };

      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: this.options.temperature!,
        max_tokens: lengthTokens[length],
        messages: [
          {
            role: 'system',
            content: `You are a creative writing assistant. ${toneInstructions[tone]} Generate high-quality content based on the user's prompt.`,
          },
          {
            role: 'user',
            content: context 
              ? `Context: ${context}\n\nPrompt: ${prompt}`
              : prompt,
          },
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  // Summarize text
  async summarize(text: string, maxLength: number = 200): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.3,
        max_tokens: maxLength,
        messages: [
          {
            role: 'system',
            content: 'You are a summarization expert. Create concise, accurate summaries that capture the key points.',
          },
          {
            role: 'user',
            content: `Summarize this text:\n\n${text}`,
          },
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Error summarizing:', error);
      throw new Error('Failed to summarize text');
    }
  }

  // Improve text (rewrite for better quality)
  async improveText(text: string, focus?: string): Promise<string> {
    try {
      const focusInstruction = focus 
        ? `Focus on improving: ${focus}`
        : 'Improve overall quality, clarity, and engagement';

      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are an expert editor. ${focusInstruction}. Maintain the original meaning while enhancing the writing.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return response.choices[0].message.content || text;
    } catch (error) {
      console.error('Error improving text:', error);
      throw new Error('Failed to improve text');
    }
  }

  // Change tone of text
  async changeTone(
    text: string, 
    targetTone: 'professional' | 'casual' | 'friendly' | 'formal' | 'enthusiastic'
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are a tone adjustment expert. Rewrite the text to have a ${targetTone} tone while maintaining the original meaning and key information.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return response.choices[0].message.content || text;
    } catch (error) {
      console.error('Error changing tone:', error);
      throw new Error('Failed to change tone');
    }
  }

  // Expand text (make it longer and more detailed)
  async expandText(text: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: 'You are a content expansion expert. Take the given text and expand it with more details, examples, and explanations while maintaining accuracy.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return response.choices[0].message.content || text;
    } catch (error) {
      console.error('Error expanding text:', error);
      throw new Error('Failed to expand text');
    }
  }

  // Generate outline from topic
  async generateOutline(topic: string, sections: number = 5): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: `You are an outline generation expert. Create a well-structured outline with ${sections} main sections. Return as a JSON array of strings.`,
          },
          {
            role: 'user',
            content: `Create an outline for: ${topic}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"outline": []}');
      return result.outline || [];
    } catch (error) {
      console.error('Error generating outline:', error);
      return [];
    }
  }

  // Check grammar and spelling
  async checkGrammar(text: string): Promise<WritingSuggestion[]> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `You are a grammar and spelling checker. Identify all grammar, spelling, and punctuation errors. Return as JSON array with:
- type: 'grammar'
- original: the incorrect text
- suggestion: the corrected version
- explanation: what's wrong
- confidence: 0-1 score`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"errors": []}');
      return result.errors || [];
    } catch (error) {
      console.error('Error checking grammar:', error);
      return [];
    }
  }

  // Translate text
  async translate(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: this.options.model!,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the text to ${targetLanguage} while maintaining the original meaning, tone, and style.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      });

      return response.choices[0].message.content || text;
    } catch (error) {
      console.error('Error translating:', error);
      throw new Error('Failed to translate text');
    }
  }
}

// Singleton instance
export const aiAssistant = new AIAssistant();

// Utility functions
export async function getQuickSuggestions(text: string): Promise<WritingSuggestion[]> {
  return aiAssistant.getWritingSuggestions(text);
}

export async function completeText(text: string, position: number): Promise<string> {
  return aiAssistant.autoComplete(text, position);
}

export async function generateFromPrompt(prompt: string, options?: Partial<ContentGenerationOptions>): Promise<string> {
  return aiAssistant.generateContent({ prompt, ...options });
}
