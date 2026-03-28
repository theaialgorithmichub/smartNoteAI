import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import FeedbackReport from '@/lib/models/feedback-report';
import { requireAdmin } from '@/lib/middleware/adminAuth';
import { buildCursorAgentPrompt, postCursorAgentWebhook } from '@/lib/cursor-feedback-prompt';
import type { AgentAction } from '@/lib/models/feedback-report';

type Params = { params: Promise<{ id: string }> };

const ACTIONS: AgentAction[] = ['fix', 'implement', 'improve'];

export async function POST(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (admin.error) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const action = body.action as AgentAction;
    const repoUrl = String(body.repoUrl || '').trim();
    const branch = String(body.branch || '').trim();

    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid action (fix | implement | improve)' }, { status: 400 });
    }
    if (!repoUrl || !branch) {
      return NextResponse.json({ error: 'repository URL and branch are required' }, { status: 400 });
    }

    await connectDB();
    const doc = await FeedbackReport.findById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    doc.repoUrl = repoUrl;
    doc.branch = branch;

    const prompt = buildCursorAgentPrompt({
      action,
      type: doc.type,
      description: doc.description,
      submitterName: doc.submitterName,
      submitterEmail: doc.submitterEmail,
      repoUrl,
      branch,
      reportId: String(doc._id),
    });

    doc.lastAgentAction = action;
    doc.lastCursorPrompt = prompt;
    doc.lastCursorDispatchAt = new Date();
    if (doc.status === 'submitted' || doc.status === 'acknowledged') {
      doc.status = 'in_progress';
    }

    const webhookPayload = {
      source: 'smartnote-ai',
      reportId: String(doc._id),
      action,
      type: doc.type,
      repositoryUrl: repoUrl,
      branch,
      prompt,
      reporter: { name: doc.submitterName, email: doc.submitterEmail },
      timestamp: new Date().toISOString(),
    };

    const result = await postCursorAgentWebhook(webhookPayload);

    if ('skipped' in result && result.skipped) {
      doc.cursorWebhookStatus = 'skipped';
      doc.cursorWebhookDetail = result.reason;
    } else if (result.ok) {
      doc.cursorWebhookStatus = `ok:${result.status}`;
      doc.cursorWebhookDetail = result.detail;
    } else {
      doc.cursorWebhookStatus = result.status != null ? `err:${result.status}` : 'err';
      doc.cursorWebhookDetail = result.detail;
    }

    await doc.save();

    return NextResponse.json({
      ok: true,
      prompt,
      webhook: result,
      report: { id: String(doc._id), status: doc.status, lastAgentAction: doc.lastAgentAction },
    });
  } catch (e) {
    console.error('[admin feedback cursor]', e);
    return NextResponse.json({ error: 'Cursor dispatch failed' }, { status: 500 });
  }
}
