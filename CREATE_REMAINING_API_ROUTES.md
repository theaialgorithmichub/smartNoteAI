# Quick Implementation Guide - Remaining API Routes

## Fix Clerk Auth Import First

In all API route files, change:
```typescript
import { auth } from '@clerk/nextjs';
```

To:
```typescript
import { auth } from '@clerk/nextjs/server';
```

---

## Create These API Route Files

### 1. Accept Friend Request
**File:** `src/app/api/friends/accept/[requestId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';
import Notification from '@/lib/models/Notification';

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const friendRequest = await FriendRequest.findById(params.requestId);
    if (!friendRequest || friendRequest.to.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    await User.findByIdAndUpdate(friendRequest.from, { $addToSet: { friends: friendRequest.to } });
    await User.findByIdAndUpdate(friendRequest.to, { $addToSet: { friends: friendRequest.from } });

    await Notification.create({
      recipient: friendRequest.from,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${currentUser.name} accepted your friend request`,
      actionData: { userId: currentUser._id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. Reject Friend Request
**File:** `src/app/api/friends/reject/[requestId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';

export async function POST(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const friendRequest = await FriendRequest.findById(params.requestId);
    if (!friendRequest || friendRequest.to.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. Get Friends & Requests
**File:** `src/app/api/friends/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).populate('friends', 'name email avatar');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(user.friends);
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/friends/requests/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import FriendRequest from '@/lib/models/FriendRequest';

export async function GET() {
  try {
    const { userId } = auth();
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

    return NextResponse.json({ incoming, sent });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 4. Share Notebook
**File:** `src/app/api/notebooks/[id]/share/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/Notebook';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { isPublic, sharedWith } = await request.json();

    const notebook = await Notebook.findOne({ _id: params.id, userId });
    if (!notebook) return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });

    if (sharedWith && sharedWith.length > 0) {
      const validFriends = sharedWith.every((id: string) =>
        currentUser.friends.some((friendId: any) => friendId.toString() === id)
      );
      if (!validFriends) {
        return NextResponse.json({ error: 'Can only share with friends' }, { status: 400 });
      }
    }

    notebook.isPublic = isPublic;
    notebook.sharedWith = sharedWith || [];
    await notebook.save();

    if (sharedWith && sharedWith.length > 0) {
      const notifications = sharedWith.map((userId: string) => ({
        recipient: userId,
        type: 'notebook_shared',
        title: 'Notebook Shared',
        message: `${currentUser.name} shared "${notebook.title}" with you`,
        actionData: { notebookId: notebook._id, userId: currentUser._id }
      }));
      await Notification.insertMany(notifications);
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Share notebook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 5. Get Public/Shared Notebooks
**File:** `src/app/api/notebooks/public/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/Notebook';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const notebooks = await Notebook.find({
      isPublic: true,
      userId: { $ne: userId },
      isTrashed: false
    })
    .populate('userId', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

    return NextResponse.json(notebooks);
  } catch (error) {
    console.error('Get public notebooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/notebooks/shared/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import { Notebook } from '@/lib/models/Notebook';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const notebooks = await Notebook.find({
      sharedWith: currentUser._id,
      isTrashed: false
    })
    .populate('userId', 'name email avatar')
    .sort({ updatedAt: -1 })
    .lean();

    return NextResponse.json(notebooks);
  } catch (error) {
    console.error('Get shared notebooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 6. Notifications
**File:** `src/app/api/notifications/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const notifications = await Notification.find({ recipient: currentUser._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/notifications/[id]/read/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, recipient: currentUser._id },
      { read: true },
      { new: true }
    );

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/notifications/read-all/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export async function PATCH() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await Notification.updateMany(
      { recipient: currentUser._id, read: false },
      { read: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## Summary

**Total Files to Create:** 9 API route files
**Estimated Time:** 30-45 minutes to copy/paste and test

All code is ready to use - just create the files and paste the code!
