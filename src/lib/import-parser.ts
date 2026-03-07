import mammoth from 'mammoth';
import { marked } from 'marked';

export interface ImportedContent {
  title: string;
  content: string;
  metadata?: {
    author?: string;
    createdDate?: string;
    modifiedDate?: string;
    wordCount?: number;
  };
  sections?: {
    heading: string;
    content: string;
    level: number;
  }[];
}

export class ImportParser {
  // Parse Markdown file
  static async parseMarkdown(file: File): Promise<ImportedContent> {
    try {
      const text = await file.text();
      
      // Extract title (first # heading or filename)
      const titleMatch = text.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.name.replace(/\.md$/, '');
      
      // Parse markdown to HTML
      const html = await marked.parse(text);
      
      // Extract sections
      const sections = this.extractSections(text);
      
      // Calculate word count
      const wordCount = text.split(/\s+/).length;
      
      return {
        title,
        content: text,
        metadata: {
          wordCount,
          createdDate: new Date(file.lastModified).toISOString(),
        },
        sections,
      };
    } catch (error) {
      console.error('Error parsing Markdown:', error);
      throw new Error('Failed to parse Markdown file');
    }
  }

  // Parse Word document (.docx)
  static async parseWord(file: File): Promise<ImportedContent> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Convert Word to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      
      // Convert HTML to plain text for content
      const text = this.htmlToText(html);
      
      // Extract title (first heading or filename)
      const titleMatch = html.match(/<h1[^>]*>(.+?)<\/h1>/i);
      const title = titleMatch 
        ? this.stripHtml(titleMatch[1]) 
        : file.name.replace(/\.docx?$/, '');
      
      // Extract sections from HTML
      const sections = this.extractSectionsFromHtml(html);
      
      // Calculate word count
      const wordCount = text.split(/\s+/).length;
      
      return {
        title,
        content: text,
        metadata: {
          wordCount,
          createdDate: new Date(file.lastModified).toISOString(),
        },
        sections,
      };
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document');
    }
  }

  // Parse plain text file
  static async parseText(file: File): Promise<ImportedContent> {
    try {
      const text = await file.text();
      
      const title = file.name.replace(/\.txt$/, '');
      const wordCount = text.split(/\s+/).length;
      
      return {
        title,
        content: text,
        metadata: {
          wordCount,
          createdDate: new Date(file.lastModified).toISOString(),
        },
      };
    } catch (error) {
      console.error('Error parsing text file:', error);
      throw new Error('Failed to parse text file');
    }
  }

  // Extract sections from Markdown
  private static extractSections(markdown: string): ImportedContent['sections'] {
    const sections: ImportedContent['sections'] = [];
    const lines = markdown.split('\n');
    
    let currentSection: { heading: string; content: string; level: number } | null = null;
    
    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          heading: headingMatch[2],
          content: '',
          level: headingMatch[1].length,
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  // Extract sections from HTML
  private static extractSectionsFromHtml(html: string): ImportedContent['sections'] {
    const sections: ImportedContent['sections'] = [];
    
    // Match heading tags
    const headingRegex = /<h([1-6])[^>]*>(.+?)<\/h\1>/gi;
    let match;
    let lastIndex = 0;
    let currentSection: { heading: string; content: string; level: number } | null = null;
    
    while ((match = headingRegex.exec(html)) !== null) {
      if (currentSection) {
        // Extract content between headings
        const content = html.substring(lastIndex, match.index);
        currentSection.content = this.htmlToText(content);
        sections.push(currentSection);
      }
      
      currentSection = {
        heading: this.stripHtml(match[2]),
        content: '',
        level: parseInt(match[1]),
      };
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add last section
    if (currentSection) {
      const content = html.substring(lastIndex);
      currentSection.content = this.htmlToText(content);
      sections.push(currentSection);
    }
    
    return sections;
  }

  // Convert HTML to plain text
  private static htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  // Strip HTML tags
  private static stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, '').trim();
  }

  // Auto-detect file type and parse
  static async parseFile(file: File): Promise<ImportedContent> {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'md':
      case 'markdown':
        return this.parseMarkdown(file);
      
      case 'docx':
      case 'doc':
        return this.parseWord(file);
      
      case 'txt':
        return this.parseText(file);
      
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }

  // Convert imported content to notebook format
  static convertToNotebook(
    imported: ImportedContent,
    template: string = 'document'
  ): any {
    return {
      title: imported.title,
      template,
      content: imported.content,
      metadata: {
        ...imported.metadata,
        importedFrom: 'file',
        importedAt: new Date().toISOString(),
      },
      sections: imported.sections,
    };
  }
}

// Utility function to validate file
export function validateImportFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/markdown',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];
  
  const allowedExtensions = ['md', 'markdown', 'txt', 'docx', 'doc'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: 'Only .md, .txt, and .docx files are supported' 
    };
  }
  
  return { valid: true };
}
