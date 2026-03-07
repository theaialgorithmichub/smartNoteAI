import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import { APIKey } from '@/lib/models/api-key';
import crypto from 'crypto';

// List API keys
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const keys = await APIKey.find({ userId })
      .select('-key -keyHash')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, keys });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create API key
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, permissions, rateLimit, expiresIn } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();

    // Generate key
    const key = 'sk_' + crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    let expiresAt;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }

    const apiKey = await APIKey.create({
      userId,
      name,
      key,
      keyHash,
      permissions: permissions || ['notebooks.read', 'notebooks.write'],
      rateLimit: rateLimit || {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
      },
      expiresAt,
      usage: {
        totalRequests: 0,
        requestsToday: 0,
        lastResetDate: new Date(),
      },
    });

    // Return key only once
    return NextResponse.json({
      success: true,
      key, // Only shown once!
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt,
      },
      warning: 'Save this key securely. It will not be shown again.',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete API key
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyId = req.nextUrl.searchParams.get('id');
    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    await connectDB();

    const result = await APIKey.findOneAndDelete({ _id: keyId, userId });

    if (!result) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'API key deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
