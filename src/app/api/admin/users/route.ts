import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

// Get all users (admin only)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const users = await User.find()
      .select('name email avatar isAdmin createdAt updatedAt')
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
