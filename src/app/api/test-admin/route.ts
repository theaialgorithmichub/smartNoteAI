import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    
    return NextResponse.json({
      found: !!user,
      clerkId: userId,
      user: user ? {
        _id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      } : null
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error checking admin status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
