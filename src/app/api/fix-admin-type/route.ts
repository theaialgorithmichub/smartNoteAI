import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    // Find user and fix the isAdmin type
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Convert string "true" to boolean true
    const wasString = typeof user.isAdmin === 'string';
    user.isAdmin = Boolean(user.isAdmin);
    user.updatedAt = new Date();
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'Admin type fixed!',
      wasString,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        clerkId: user.clerkId,
        isAdmin: user.isAdmin,
        isAdminType: typeof user.isAdmin
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Error fixing admin type',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
