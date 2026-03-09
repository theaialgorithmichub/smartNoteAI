import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { Share } from '@/lib/models/share';
import { Notebook, Page } from '@/lib/models';

/**
 * GET /api/share/[shareId]/notebook
 * Returns notebook + pages for a valid share link. No auth required.
 * Call after validating share (GET /api/share/[shareId]) - does not increment view count.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;
    const password = req.nextUrl.searchParams.get('password');

    await connectDB();

    const share = await Share.findOne({ shareId }).select('+password');

    if (!share) {
      return NextResponse.json({ error: 'Share not found' }, { status: 404 });
    }
    if (!share.isActive) {
      return NextResponse.json({ error: 'Share has been disabled' }, { status: 403 });
    }
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: 'Share has expired' }, { status: 410 });
    }
    if (share.maxViews && share.currentViews >= share.maxViews) {
      return NextResponse.json({ error: 'Maximum views reached' }, { status: 403 });
    }
    if (share.password) {
      if (!password) {
        return NextResponse.json(
          { requiresPassword: true, message: 'This share is password protected' },
          { status: 401 }
        );
      }
      const isValid = await bcrypt.compare(password, share.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    const notebook = await Notebook.findById(share.notebookId).lean();
    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    const pages = await Page.find({ notebookId: share.notebookId })
      .sort({ pageNumber: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      notebook,
      pages,
    });
  } catch (error) {
    console.error('Error fetching shared notebook:', error);
    return NextResponse.json(
      { error: 'Failed to load shared notebook' },
      { status: 500 }
    );
  }
}
