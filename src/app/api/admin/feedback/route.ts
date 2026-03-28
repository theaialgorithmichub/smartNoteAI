import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import FeedbackReport from '@/lib/models/feedback-report';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export async function GET() {
  const admin = await requireAdmin();
  if (admin.error) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    await connectDB();
    const reports = await FeedbackReport.find({}).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({
      reports: reports.map((r) => ({
        id: String(r._id),
        clerkUserId: r.clerkUserId,
        submitterName: r.submitterName,
        submitterEmail: r.submitterEmail,
        type: r.type,
        description: r.description,
        imageUrl: r.imageUrl,
        status: r.status,
        priority: r.priority,
        acknowledgedAt: r.acknowledgedAt,
        resolutionSummary: r.resolutionSummary,
        repoUrl: r.repoUrl,
        branch: r.branch,
        lastAgentAction: r.lastAgentAction,
        lastCursorDispatchAt: r.lastCursorDispatchAt,
        cursorWebhookStatus: r.cursorWebhookStatus,
        cursorWebhookDetail: r.cursorWebhookDetail,
        adminInternalNote: r.adminInternalNote,
        lastCursorPrompt: r.lastCursorPrompt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      defaults: {
        repoUrl: process.env.NEXT_PUBLIC_FEEDBACK_DEFAULT_REPO || '',
        branch: process.env.NEXT_PUBLIC_FEEDBACK_DEFAULT_BRANCH || 'main',
      },
    });
  } catch (e) {
    console.error('[admin feedback GET]', e);
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 });
  }
}
