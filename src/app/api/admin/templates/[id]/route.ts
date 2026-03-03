import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import connectDB from '@/lib/db/mongodb';
import CustomTemplate from '@/lib/models/CustomTemplate';

// Update template (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const data = await request.json();

    const template = await CustomTemplate.findByIdAndUpdate(
      params.id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (err) {
    console.error('Update template error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete template (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const template = await CustomTemplate.findByIdAndDelete(params.id);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete template error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
