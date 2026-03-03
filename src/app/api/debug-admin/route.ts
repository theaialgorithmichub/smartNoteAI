import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { getOrCreateUser } from '@/lib/utils/syncUser';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    
    // Method 1: Direct lookup
    const directUser = await User.findOne({ clerkId: userId });
    
    // Method 2: Using getOrCreateUser
    const getOrCreateResult = await getOrCreateUser(userId);
    
    return NextResponse.json({
      clerkUserId: userId,
      directLookup: directUser ? {
        _id: directUser._id.toString(),
        email: directUser.email,
        isAdmin: directUser.isAdmin,
        isAdminType: typeof directUser.isAdmin,
        isAdminValue: directUser.isAdmin === true,
        rawIsAdmin: JSON.stringify(directUser.isAdmin)
      } : null,
      getOrCreateLookup: getOrCreateResult ? {
        _id: getOrCreateResult._id.toString(),
        email: getOrCreateResult.email,
        isAdmin: getOrCreateResult.isAdmin,
        isAdminType: typeof getOrCreateResult.isAdmin,
        isAdminValue: getOrCreateResult.isAdmin === true,
        rawIsAdmin: JSON.stringify(getOrCreateResult.isAdmin)
      } : null,
      comparison: {
        sameUser: directUser?._id.toString() === getOrCreateResult?._id.toString(),
        bothAdmin: directUser?.isAdmin === true && getOrCreateResult?.isAdmin === true
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
