import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import { Share } from '@/lib/models/share';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      notebookId,
      accessType = 'view',
      password,
      expiresIn, // in hours
      maxViews,
      allowDownload = true,
      allowPrint = true,
      watermark,
    } = body;

    if (!notebookId) {
      return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });
    }

    await connectDB();

    // Generate unique share ID
    const shareId = nanoid(12);

    // Calculate expiration date
    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresIn);
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create share
    const share = await Share.create({
      notebookId,
      userId,
      shareId,
      accessType,
      password: hashedPassword,
      expiresAt,
      maxViews,
      allowDownload,
      allowPrint,
      watermark,
      isActive: true,
      currentViews: 0,
      accessLog: [],
    });

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareId}`;

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      expiresAt,
      accessType,
    });
  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
  }
}
