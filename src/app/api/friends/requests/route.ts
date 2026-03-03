import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const incoming = await FriendRequest.find({
      to: currentUser._id,
      status: 'pending'
    }).populate('from', 'name email avatar');

    const sent = await FriendRequest.find({
      from: currentUser._id,
      status: 'pending'
    }).populate('to', 'name email avatar');

    // Transform _id to id for frontend
    const transformedIncoming = incoming.map(req => ({
      id: req._id.toString(),
      from: {
        id: req.from._id.toString(),
        name: req.from.name,
        email: req.from.email,
        avatar: req.from.avatar
      },
      status: req.status,
      timestamp: req.createdAt
    }));

    const transformedSent = sent.map(req => ({
      id: req._id.toString(),
      from: {
        id: req.to._id.toString(),
        name: req.to.name,
        email: req.to.email,
        avatar: req.to.avatar
      },
      status: req.status,
      timestamp: req.createdAt
    }));

    return NextResponse.json({ 
      incoming: transformedIncoming, 
      sent: transformedSent 
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
