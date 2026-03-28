import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import FeedbackReport from '@/lib/models/feedback-report';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    await connectDB();
    const doc = await FeedbackReport.findById(id).lean();
    if (!doc || doc.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
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
    console.error('[feedback id GET]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
