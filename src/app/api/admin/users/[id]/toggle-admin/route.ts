import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

// Toggle admin status (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 401 });

  try {
    await connectDB();
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isAdmin = !user.isAdmin;
    user.updatedAt = new Date();
    await user.save();

    return NextResponse.json(user);
  } catch (err) {
    console.error('Toggle admin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
