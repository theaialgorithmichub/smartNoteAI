import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import FeedbackReport from '@/lib/models/feedback-report';
import { requireAdmin } from '@/lib/middleware/adminAuth';

type Params = { params: Promise<{ id: string }> };

const STATUSES = ['submitted', 'acknowledged', 'in_progress', 'completed', 'declined'] as const;
const PRIORITIES = ['none', 'low', 'medium', 'high', 'critical'] as const;

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (admin.error) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const doc = await FeedbackReport.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (typeof body.priority === 'string' && PRIORITIES.includes(body.priority as (typeof PRIORITIES)[number])) {
      doc.priority = body.priority;
    }
    if (typeof body.status === 'string' && STATUSES.includes(body.status as (typeof STATUSES)[number])) {
      doc.status = body.status;
    }
    if (body.acknowledge === true && !doc.acknowledgedAt) {
      doc.acknowledgedAt = new Date();
      if (doc.status === 'submitted') doc.status = 'acknowledged';
    }
    if (typeof body.repoUrl === 'string') doc.repoUrl = body.repoUrl.trim() || undefined;
    if (typeof body.branch === 'string') doc.branch = body.branch.trim() || undefined;
    if (typeof body.adminInternalNote === 'string') doc.adminInternalNote = body.adminInternalNote.slice(0, 8000);
    if (typeof body.resolutionSummary === 'string') doc.resolutionSummary = body.resolutionSummary.slice(0, 4000);

    await doc.save();
    return NextResponse.json({ ok: true, id: String(doc._id), status: doc.status, priority: doc.priority });
  } catch (e) {
    console.error('[admin feedback PATCH]', e);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
