import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { ImportParser, validateImportFile } from '@/lib/import-parser';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const template = formData.get('template') as string || 'document';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateImportFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Parse file
    const imported = await ImportParser.parseFile(file);
    
    // Convert to notebook format
    const notebook = ImportParser.convertToNotebook(imported, template);
    
    // Add user ID
    notebook.userId = userId;
    notebook.createdAt = new Date();
    notebook.updatedAt = new Date();

    await connectDB();

    // Save to database (you'll need to import your Notebook model)
    // const savedNotebook = await Notebook.create(notebook);

    return NextResponse.json({
      success: true,
      notebook,
      message: `Successfully imported ${file.name}`,
    });
  } catch (error: any) {
    console.error('Error importing file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import file' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
