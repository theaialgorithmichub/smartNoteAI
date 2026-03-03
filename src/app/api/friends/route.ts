import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).populate('friends', 'name email avatar');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Transform friends to use 'id' instead of '_id'
    const transformedFriends = user.friends.map((friend: any) => ({
      id: friend._id.toString(),
      name: friend.name,
      email: friend.email,
      avatar: friend.avatar
    }));

    return NextResponse.json(transformedFriends);
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { friendId } = await request.json();
    
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await User.findByIdAndUpdate(currentUser._id, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: currentUser._id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove friend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
