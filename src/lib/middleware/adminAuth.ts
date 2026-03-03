import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { getOrCreateUser } from '@/lib/utils/syncUser';

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return { error: 'Unauthorized', status: 401 };
  }

  await connectDB();
  const user = await getOrCreateUser(userId);

  if (!user || !user.isAdmin) {
    return { error: 'Admin access required', status: 403 };
  }

  return { user, error: null };
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    await connectDB();
    // Use getOrCreateUser to ensure user exists in MongoDB
    const user = await getOrCreateUser(userId);
    console.log('[ADMIN CHECK] User:', user?.email, 'isAdmin:', user?.isAdmin);
    return user?.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
