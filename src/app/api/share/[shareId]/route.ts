import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { Share } from '@/lib/models/share';

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;
    const password = req.nextUrl.searchParams.get('password');

    await connectDB();

    // Find share
    const share = await Share.findOne({ shareId }).select('+password');

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }

    // Check if share is active
    if (!share.isActive) {
      return NextResponse.json({ error: 'Share has been disabled' }, { status: 403 });
    }

    // Check expiration
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: 'Share has expired' }, { status: 410 });
    }

    // Check max views
    if (share.maxViews && share.currentViews >= share.maxViews) {
      return NextResponse.json({ error: 'Maximum views reached' }, { status: 403 });
    }

    // Check password
    if (share.password) {
      if (!password) {
        return NextResponse.json({ 
          requiresPassword: true,
          message: 'This share is password protected'
        }, { status: 401 });
      }

      const isValid = await bcrypt.compare(password, share.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // Log access
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await Share.findByIdAndUpdate(share._id, {
      $inc: { currentViews: 1 },
      $set: { lastAccessedAt: new Date() },
      $push: {
        accessLog: {
          timestamp: new Date(),
          ipAddress,
          userAgent,
        },
      },
    });

    // Return share details (without password)
    return NextResponse.json({
      success: true,
      share: {
        notebookId: share.notebookId,
        accessType: share.accessType,
        allowDownload: share.allowDownload,
        allowPrint: share.allowPrint,
        watermark: share.watermark,
        expiresAt: share.expiresAt,
        currentViews: share.currentViews + 1,
        maxViews: share.maxViews,
      },
    });
  } catch (error) {
    console.error('Error accessing share:', error);
    return NextResponse.json({ error: 'Failed to access share' }, { status: 500 });
  }
}

// Delete/revoke share
export async function DELETE(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { userId } = await (await import('@clerk/nextjs/server')).auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareId } = params;

    await connectDB();

    // Find and delete share (only if user owns it)
    const share = await Share.findOneAndDelete({ shareId, userId });

    if (!share) {
      return NextResponse.json({ error: 'Share not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Share revoked' });
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
  }
}

// Update share settings
export async function PATCH(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { userId } = await (await import('@clerk/nextjs/server')).auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareId } = params;
    const updates = await req.json();

    await connectDB();

    // Update share (only if user owns it)
    const share = await Share.findOneAndUpdate(
      { shareId, userId },
      { $set: updates },
      { new: true }
    );

    if (!share) {
      return NextResponse.json({ error: 'Share not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, share });
  } catch (error) {
    console.error('Error updating share:', error);
    return NextResponse.json({ error: 'Failed to update share' }, { status: 500 });
  }
}
