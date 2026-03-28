import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import FeedbackReport from '@/lib/models/feedback-report';
import { getOrCreateUser } from '@/lib/utils/syncUser';

const TYPES = ['glitch', 'feature', 'improvement'] as const;

/** List current user's submissions */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const list = await FeedbackReport.find({ clerkUserId: userId }).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({
      reports: list.map((r) => ({
        id: String(r._id),
        type: r.type,
        description: r.description,
        imageUrl: r.imageUrl,
        status: r.status,
        priority: r.priority,
        resolutionSummary: r.resolutionSummary,
        acknowledgedAt: r.acknowledgedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    });
  } catch (e) {
    console.error('[feedback GET]', e);
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 });
  }
}

/** Submit glitch / feature / improvement */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Sign in required to submit feedback' }, { status: 401 });
    }

    const body = await req.json();
    const type = body.type as string;
    const description = String(body.description || '').trim();
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : undefined;

    if (!TYPES.includes(type as (typeof TYPES)[number])) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (description.length < 10) {
      return NextResponse.json({ error: 'Please provide a longer description (at least 10 characters).' }, { status: 400 });
    }

    await connectDB();
    const user = await getOrCreateUser(userId);
    if (!user) {
      return NextResponse.json({ error: 'User record missing' }, { status: 500 });
    }

    const doc = await FeedbackReport.create({
      clerkUserId: userId,
      submitterName: user.name,
      submitterEmail: user.email,
      type,
      description,
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json({
      report: {
        id: String(doc._id),
        type: doc.type,
        description: doc.description,
        imageUrl: doc.imageUrl,
        status: doc.status,
        priority: doc.priority,
        resolutionSummary: doc.resolutionSummary,
        acknowledgedAt: doc.acknowledgedAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (e) {
    console.error('[feedback POST]', e);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
