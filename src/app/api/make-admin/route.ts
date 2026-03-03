import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { getOrCreateUser } from '@/lib/utils/syncUser';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    // Get or create the user
    const user = await getOrCreateUser(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'Failed to get/create user' }, { status: 500 });
    }

    // Set isAdmin to true
    user.isAdmin = true;
    user.updatedAt = new Date();
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'You are now an admin!',
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        clerkId: user.clerkId,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error making user admin',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
