import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import connectDB from '@/lib/db/mongodb';
import CustomTemplate from '@/lib/models/CustomTemplate';

// Publish/Unpublish template (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const { isPublished } = await request.json();

    const template = await CustomTemplate.findByIdAndUpdate(
      params.id,
      { 
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (err) {
    console.error('Publish template error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
