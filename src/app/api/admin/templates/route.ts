import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import connectDB from '@/lib/db/mongodb';
import CustomTemplate from '@/lib/models/CustomTemplate';

// Get all templates (admin only)
export async function GET() {
  const { error, user } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const templates = await CustomTemplate.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(templates);
  } catch (err) {
    console.error('Get templates error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new template (admin only)
export async function POST(request: NextRequest) {
  const { error, user } = await requireAdmin();
  if (error || !user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const data = await request.json();

    const template = await CustomTemplate.create({
      ...data,
      createdBy: user._id,
    });

    return NextResponse.json(template);
  } catch (err) {
    console.error('Create template error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
