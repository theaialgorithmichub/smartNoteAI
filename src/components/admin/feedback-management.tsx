'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bug,
  Lightbulb,
  Sparkles,
  Loader2,
  Copy,
  Wrench,
  Rocket,
  TrendingUp,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { customerStatusLabel } from '@/components/contact/contact-feedback-form';

type Report = {
  id: string;
  clerkUserId: string;
  submitterName: string;
  submitterEmail: string;
  type: string;
  description: string;
  imageUrl?: string;
  status: string;
  priority: string;
  acknowledgedAt?: string;
  resolutionSummary?: string;
  repoUrl?: string;
  branch?: string;
  lastAgentAction?: string;
  lastCursorDispatchAt?: string;
  cursorWebhookStatus?: string;
  cursorWebhookDetail?: string;
  adminInternalNote?: string;
  lastCursorPrompt?: string;
  createdAt: string;
  updatedAt: string;
};

const PRIORITIES = ['none', 'low', 'medium', 'high', 'critical'] as const;
const STATUSES = ['submitted', 'acknowledged', 'in_progress', 'completed', 'declined'] as const;

export function FeedbackManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [defaults, setDefaults] = useState({ repoUrl: '', branch: 'main' });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Report | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [adminInternal, setAdminInternal] = useState('');
  const [saving, setSaving] = useState(false);
  const [cursorBusy, setCursorBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setReports(data.reports || []);
      if (data.defaults) {
        setDefaults({ repoUrl: data.defaults.repoUrl || '', branch: data.defaults.branch || 'main' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not load feedback reports.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (selected) {
      setRepoUrl(selected.repoUrl || defaults.repoUrl);
      setBranch(selected.branch || defaults.branch);
      setResolutionSummary(selected.resolutionSummary || '');
      setAdminInternal(selected.adminInternalNote || '');
    }
  }, [selected, defaults.repoUrl, defaults.branch]);

  const patch = async (body: Record<string, unknown>) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/feedback/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Update failed');
      toast({ title: 'Saved' });
      await load();
      const list = await fetch('/api/admin/feedback', { credentials: 'include', cache: 'no-store' }).then((r) => r.json());
      const next = (list.reports || []).find((r: Report) => r.id === selected.id);
      if (next) setSelected(next);
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const dispatchCursor = async (action: 'fix' | 'implement' | 'improve') => {
    if (!selected) return;
    if (!repoUrl.trim() || !branch.trim()) {
      toast({ title: 'Repo & branch required', variant: 'destructive' });
      return;
    }
    setCursorBusy(true);
    try {
      const res = await fetch(`/api/admin/feedback/${selected.id}/cursor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, repoUrl: repoUrl.trim(), branch: branch.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cursor dispatch failed');
      const w = data.webhook;
      if (w?.skipped) {
        toast({ title: 'Prompt saved', description: w.reason || 'Webhook not configured.' });
      } else if (w?.ok) {
        toast({ title: 'Dispatched', description: 'Webhook accepted the agent payload.' });
      } else {
        toast({ title: 'Webhook error', description: String(w?.detail || 'Check server logs.'), variant: 'destructive' });
      }
      await load();
      const list = await fetch('/api/admin/feedback', { credentials: 'include', cache: 'no-store' }).then((r) => r.json());
      const next = (list.reports || []).find((r: Report) => r.id === selected.id);
      if (next) setSelected(next);
    } catch (e) {
      toast({
        title: 'Failed',
        description: e instanceof Error ? e.message : 'Error',
        variant: 'destructive',
      });
    } finally {
      setCursorBusy(false);
    }
  };

  const copyPrompt = () => {
    if (!selected?.lastCursorPrompt) return;
    void navigator.clipboard.writeText(selected.lastCursorPrompt);
    toast({ title: 'Copied prompt' });
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2 p-4 max-h-[calc(100vh-220px)] overflow-y-auto border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-neutral-900 dark:text-white">Inbox ({reports.length})</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => load()}>
            Refresh
          </Button>
        </div>
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelected(r)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selected?.id === r.id
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {r.type === 'glitch' && <Bug className="h-4 w-4 text-red-500" />}
                  {r.type === 'feature' && <Lightbulb className="h-4 w-4 text-amber-500" />}
                  {r.type === 'improvement' && <Sparkles className="h-4 w-4 text-cyan-500" />}
                  <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">{r.submitterName}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{r.submitterEmail}</p>
                <p className="text-xs mt-1 text-neutral-500">{customerStatusLabel(r.status)}</p>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="lg:col-span-3 p-6 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 min-h-[420px]">
        {!selected ? (
          <p className="text-neutral-500 dark:text-neutral-400">Select a report to review.</p>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{selected.submitterName}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{selected.submitterEmail}</p>
              <p className="text-xs text-neutral-500 mt-1">Clerk user: {selected.clerkUserId}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-neutral-200 dark:bg-neutral-800">{selected.type}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200">
                {customerStatusLabel(selected.status)}
              </span>
            </div>

            <div className="rounded-xl bg-neutral-100 dark:bg-neutral-900/80 p-4">
              <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{selected.description}</p>
              {selected.imageUrl && (
                <a
                  href={selected.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-purple-600 dark:text-purple-400 underline"
                >
                  Open attachment
                </a>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-neutral-500">Priority</label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm"
                  value={selected.priority}
                  onChange={(e) => patch({ priority: e.target.value })}
                  disabled={saving}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500">Status (customer-visible)</label>
                <select
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm"
                  value={selected.status}
                  onChange={(e) => patch({ status: e.target.value })}
                  disabled={saving}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {customerStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => patch({ acknowledge: true })}
                disabled={saving || !!selected.acknowledgedAt}
              >
                <Bell className="h-4 w-4 mr-1" />
                Acknowledge
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => patch({ status: 'completed', resolutionSummary })}
                disabled={saving}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark completed
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => patch({ status: 'declined' })}
                disabled={saving}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Decline / close
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500">Customer-facing resolution note</label>
              <textarea
                className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm min-h-[72px]"
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="Shown to the user when you mark completed…"
              />
              <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => patch({ resolutionSummary })} disabled={saving}>
                Save note
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500">Internal admin note</label>
              <textarea
                className="mt-1 w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm min-h-[56px]"
                value={adminInternal}
                onChange={(e) => setAdminInternal(e.target.value)}
              />
              <Button type="button" size="sm" variant="secondary" className="mt-2" onClick={() => patch({ adminInternalNote: adminInternal })} disabled={saving}>
                Save internal note
              </Button>
            </div>

            <div className="rounded-xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-3">
              <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Cursor agent dispatch</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Set <code className="text-purple-600">CURSOR_WEBHOOK_URL</code> (and optional{' '}
                <code className="text-purple-600">CURSOR_WEBHOOK_SECRET</code>) on the server to POST JSON to your bridge.
                Optional <code className="text-purple-600">NEXT_PUBLIC_FEEDBACK_DEFAULT_REPO</code> /{' '}
                <code className="text-purple-600">NEXT_PUBLIC_FEEDBACK_DEFAULT_BRANCH</code> prefill here.
              </p>
              <input
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm"
                placeholder="https://github.com/org/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
              />
              <input
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm"
                placeholder="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={cursorBusy}
                  onClick={() => dispatchCursor('fix')}
                  className="border-red-300 text-red-700 dark:text-red-400"
                >
                  <Wrench className="h-4 w-4 mr-1" />
                  Fix (bug)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={cursorBusy}
                  onClick={() => dispatchCursor('implement')}
                  className="border-amber-300 text-amber-800 dark:text-amber-300"
                >
                  <Rocket className="h-4 w-4 mr-1" />
                  Implement (feature)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={cursorBusy}
                  onClick={() => dispatchCursor('improve')}
                  className="border-cyan-300 text-cyan-800 dark:text-cyan-300"
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Improve
                </Button>
                {cursorBusy && <Loader2 className="h-5 w-5 animate-spin text-purple-600" />}
              </div>
              {selected.lastCursorPrompt && (
                <div>
                  <Button type="button" size="sm" variant="secondary" onClick={copyPrompt}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy last prompt
                  </Button>
                  <p className="text-xs text-neutral-500 mt-2">Webhook: {selected.cursorWebhookStatus}</p>
                  {selected.cursorWebhookDetail && (
                    <pre className="text-xs mt-1 p-2 rounded bg-neutral-100 dark:bg-neutral-900 overflow-x-auto max-h-24">
                      {selected.cursorWebhookDetail}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
