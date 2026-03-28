'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { customerStatusLabel } from '@/components/contact/contact-feedback-form';

type Row = {
  id: string;
  type: string;
  description: string;
  imageUrl?: string;
  status: string;
  priority: string;
  resolutionSummary?: string;
  createdAt: string;
  updatedAt: string;
};

export function UserFeedbackStatus({ reloadSignal = 0 }: { reloadSignal?: number }) {
  const { isSignedIn, isLoaded } = useUser();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setRows(data.reports || []);
      }
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) load();
    else setLoading(false);
  }, [isLoaded, isSignedIn, load, reloadSignal]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <Card className="p-6 md:p-8 bg-neutral-50/90 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Your submissions</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-7 w-7 animate-spin text-rose-500" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">No submissions yet.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200">
                  {r.type}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  {customerStatusLabel(r.status)}
                </span>
                {r.priority && r.priority !== 'none' && (
                  <span className="text-xs text-neutral-500">Priority: {r.priority}</span>
                )}
              </div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap line-clamp-4">
                {r.description}
              </p>
              {r.resolutionSummary && (
                <p className="mt-2 text-sm text-green-700 dark:text-green-400 border-l-2 border-green-500 pl-3">
                  <strong>Update:</strong> {r.resolutionSummary}
                </p>
              )}
              {r.imageUrl && (
                <a
                  href={r.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-rose-600 dark:text-rose-400 underline"
                >
                  View attachment
                </a>
              )}
              <p className="text-xs text-neutral-500 mt-2">
                Submitted {new Date(r.createdAt).toLocaleString()}
                {r.updatedAt !== r.createdAt && ` · Updated ${new Date(r.updatedAt).toLocaleString()}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
