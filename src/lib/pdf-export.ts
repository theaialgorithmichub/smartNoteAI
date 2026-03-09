import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  title: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePageNumbers?: boolean;
  watermark?: string;
  orientation?: 'portrait' | 'landscape';
  fontSize?: number;
  fontFamily?: 'helvetica' | 'times' | 'courier';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerColor?: string;
  footerColor?: string;
}

const DEFAULT_OPTIONS: PDFExportOptions = {
  title: 'SmartNote Export',
  includeHeader: true,
  includeFooter: true,
  includePageNumbers: true,
  orientation: 'portrait',
  fontSize: 12,
  fontFamily: 'helvetica',
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
  headerColor: '#3B82F6',
  footerColor: '#6B7280',
};

export class PDFExporter {
  private options: PDFExportOptions;
  private pdf: jsPDF;
  private currentY: number = 0;
  private pageHeight: number = 0;

  constructor(options: Partial<PDFExportOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.pdf = new jsPDF({
      orientation: this.options.orientation,
      unit: 'mm',
      format: 'a4',
    });
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.currentY = this.options.margins!.top;
  }

  // Add header to each page
  private addHeader(pageNumber: number) {
    if (!this.options.includeHeader) return;

    const { margins, headerColor, title } = this.options;
    
    // Header background
    this.pdf.setFillColor(headerColor!);
    this.pdf.rect(0, 0, this.pdf.internal.pageSize.getWidth(), 15, 'F');
    
    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont(this.options.fontFamily!, 'bold');
    this.pdf.text(title, margins!.left, 10);
    
    // Date
    const date = new Date().toLocaleDateString();
    this.pdf.setFontSize(10);
    this.pdf.text(date, this.pdf.internal.pageSize.getWidth() - margins!.right - 30, 10);
  }

  // Add footer to each page
  private addFooter(pageNumber: number, totalPages: number) {
    if (!this.options.includeFooter) return;

    const { margins, footerColor, author } = this.options;
    const pageHeight = this.pdf.internal.pageSize.getHeight();
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    
    // Footer line
    this.pdf.setDrawColor(footerColor!);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(margins!.left, pageHeight - 15, pageWidth - margins!.right, pageHeight - 15);
    
    // Page numbers
    if (this.options.includePageNumbers) {
      this.pdf.setTextColor(footerColor!);
      this.pdf.setFontSize(10);
      this.pdf.setFont(this.options.fontFamily!, 'normal');
      const pageText = `Page ${pageNumber} of ${totalPages}`;
      const textWidth = this.pdf.getTextWidth(pageText);
      this.pdf.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 10);
    }
    
    // Author
    if (author) {
      this.pdf.setFontSize(9);
      this.pdf.text(author, margins!.left, pageHeight - 10);
    }
    
    // Watermark
    if (this.options.watermark) {
      this.pdf.setTextColor(200, 200, 200);
      this.pdf.setFontSize(8);
      this.pdf.text(this.options.watermark, pageWidth - margins!.right - 40, pageHeight - 10);
    }
  }

  // Check if we need a new page
  private checkPageBreak(requiredSpace: number = 10): boolean {
    const { margins } = this.options;
    if (this.currentY + requiredSpace > this.pageHeight - margins!.bottom - 20) {
      this.pdf.addPage();
      this.currentY = margins!.top + 20; // Account for header
      return true;
    }
    return false;
  }

  // Add text with automatic word wrapping
  addText(text: string, options: { fontSize?: number; bold?: boolean; color?: string } = {}) {
    const { margins, fontFamily } = this.options;
    const fontSize = options.fontSize || this.options.fontSize!;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margins!.left - margins!.right;
    
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont(fontFamily!, options.bold ? 'bold' : 'normal');
    
    if (options.color) {
      const rgb = this.hexToRgb(options.color);
      this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
    } else {
      this.pdf.setTextColor(0, 0, 0);
    }
    
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      this.checkPageBreak();
      this.pdf.text(line, margins!.left, this.currentY);
      this.currentY += fontSize * 0.5;
    });
    
    this.currentY += 5; // Add spacing after paragraph
  }

  // Add heading
  addHeading(text: string, level: 1 | 2 | 3 = 1) {
    const fontSizes = { 1: 20, 2: 16, 3: 14 };
    const colors = { 1: '#1F2937', 2: '#374151', 3: '#4B5563' };
    
    this.checkPageBreak(15);
    this.addText(text, {
      fontSize: fontSizes[level],
      bold: true,
      color: colors[level],
    });
  }

  // Add list
  addList(items: string[], ordered: boolean = false) {
    items.forEach((item, index) => {
      const bullet = ordered ? `${index + 1}.` : '•';
      this.checkPageBreak();
      this.addText(`${bullet} ${item}`);
    });
  }

  // Add table
  addTable(headers: string[], rows: string[][]) {
    const { margins } = this.options;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margins!.left - margins!.right;
    const colWidth = tableWidth / headers.length;
    
    this.checkPageBreak(20);
    
    // Headers
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont(this.options.fontFamily!, 'bold');
    
    headers.forEach((header, i) => {
      this.pdf.rect(margins!.left + (i * colWidth), this.currentY, colWidth, 10, 'F');
      this.pdf.text(header, margins!.left + (i * colWidth) + 2, this.currentY + 7);
    });
    
    this.currentY += 10;
    
    // Rows
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont(this.options.fontFamily!, 'normal');
    
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(10);
      
      if (rowIndex % 2 === 0) {
        this.pdf.setFillColor(249, 250, 251);
        this.pdf.rect(margins!.left, this.currentY, tableWidth, 10, 'F');
      }
      
      row.forEach((cell, i) => {
        this.pdf.text(cell, margins!.left + (i * colWidth) + 2, this.currentY + 7);
      });
      
      this.currentY += 10;
    });
    
    this.currentY += 5;
  }

  // Add image from URL or data URL
  async addImage(imageUrl: string, width?: number, height?: number) {
    this.checkPageBreak(height || 50);
    
    const { margins } = this.options;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margins!.left - margins!.right;
    
    const imgWidth = width || maxWidth;
    const imgHeight = height || 50;
    
    try {
      this.pdf.addImage(imageUrl, 'PNG', margins!.left, this.currentY, imgWidth, imgHeight);
      this.currentY += imgHeight + 5;
    } catch (error) {
      console.error('Error adding image to PDF:', error);
    }
  }

  // Add horizontal line
  addHorizontalLine() {
    const { margins } = this.options;
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    
    this.checkPageBreak(5);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(margins!.left, this.currentY, pageWidth - margins!.right, this.currentY);
    this.currentY += 5;
  }

  // Add spacing
  addSpacing(space: number = 10) {
    this.currentY += space;
  }

  // Convert HTML element to PDF
  async addHTMLElement(element: HTMLElement) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pdf.internal.pageSize.getWidth() - this.options.margins!.left - this.options.margins!.right;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      await this.addImage(imgData, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error converting HTML to PDF:', error);
    }
  }

  // Finalize and add headers/footers to all pages
  private finalize() {
    const totalPages = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.addHeader(i);
      this.addFooter(i, totalPages);
    }
  }

  // Save PDF
  save(filename?: string) {
    this.finalize();
    const name = filename || `${this.options.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    this.pdf.save(name);
  }

  // Get PDF as blob
  getBlob(): Blob {
    this.finalize();
    return this.pdf.output('blob');
  }

  // Get PDF as data URL
  getDataURL(): string {
    this.finalize();
    return this.pdf.output('dataurlstring');
  }

  // Helper: Convert hex to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }
}

// Utility function to export notebook to PDF
export async function exportNotebookToPDF(
  notebookTitle: string,
  content: any,
  options: Partial<PDFExportOptions> = {}
) {
  const exporter = new PDFExporter({
    title: notebookTitle,
    author: 'smartDigitalNotes',
    ...options,
  });

  // Add title page
  exporter.addHeading(notebookTitle, 1);
  exporter.addSpacing(10);
  
  // Add export date
  exporter.addText(`Exported on: ${new Date().toLocaleString()}`, {
    fontSize: 10,
    color: '#6B7280',
  });
  
  exporter.addHorizontalLine();
  exporter.addSpacing(10);

  // Add content based on type
  if (typeof content === 'string') {
    exporter.addText(content);
  } else if (Array.isArray(content)) {
    content.forEach((item) => {
      if (item.type === 'heading') {
        exporter.addHeading(item.text, item.level || 2);
      } else if (item.type === 'text') {
        exporter.addText(item.text);
      } else if (item.type === 'list') {
        exporter.addList(item.items, item.ordered);
      } else if (item.type === 'table') {
        exporter.addTable(item.headers, item.rows);
      } else if (item.type === 'image') {
        exporter.addImage(item.url, item.width, item.height);
      }
    });
  }

  exporter.save();
}
