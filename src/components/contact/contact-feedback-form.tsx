'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Bug, Lightbulb, Sparkles, ImagePlus, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const TYPES = [
  { id: 'glitch', label: 'Report a glitch', icon: Bug, desc: 'Something broke or behaves badly' },
  { id: 'feature', label: 'Suggest a feature', icon: Lightbulb, desc: 'A new capability you want' },
  { id: 'improvement', label: 'Suggest an improvement', icon: Sparkles, desc: 'Polish, UX, or performance' },
] as const;

export function customerStatusLabel(status: string) {
  const m: Record<string, string> = {
    submitted: 'Received',
    acknowledged: 'Acknowledged',
    in_progress: 'In progress',
    completed: 'Completed',
    declined: 'Closed',
  };
  return m[status] || status;
}

export function ContactFeedbackForm({
  onSubmitted,
}: {
  onSubmitted?: () => void;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const [type, setType] = useState<(typeof TYPES)[number]['id']>('glitch');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast({ title: 'Sign in required', description: 'Please sign in to submit feedback.', variant: 'destructive' });
      return;
    }
    if (description.trim().length < 10) {
      toast({ title: 'Add more detail', description: 'Please write at least 10 characters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', 'feedback');
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!up.ok) {
          throw new Error('Image upload failed');
        }
        const uj = await up.json();
        imageUrl = uj.url;
      }
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description: description.trim(), imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submit failed');
      }
      toast({ title: 'Thanks!', description: 'We received your submission. You can track status below.' });
      setDescription('');
      setFile(null);
      onSubmitted?.();
    } catch (err) {
      toast({
        title: 'Could not submit',
        description: err instanceof Error ? err.message : 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <Card className="p-6 md:p-8 bg-white/90 dark:bg-neutral-900/90 border border-rose-200/60 dark:border-rose-900/40 shadow-xl shadow-rose-500/10">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Send us feedback</h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
        Report bugs, request features, or suggest improvements. Signed-in users can attach a screenshot.
      </p>

      {!isSignedIn ? (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-900 dark:text-amber-200">
          <Link href="/sign-in" className="font-semibold underline underline-offset-2">
            Sign in
          </Link>{' '}
          to submit feedback so we can link your report to your account and show you status updates.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-3">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    active
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 shadow-md'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-800'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-2 ${active ? 'text-rose-600' : 'text-neutral-500'}`} />
                  <div className="font-semibold text-neutral-900 dark:text-white text-sm">{t.label}</div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{t.desc}</div>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[160px] px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="Steps to reproduce, expected vs actual, ideas, links…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Attachment (optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-neutral-400 dark:border-neutral-600 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/80">
                <ImagePlus className="h-4 w-4" />
                <span className="text-sm">{file ? file.name : 'Choose image'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              {file && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                  Remove
                </Button>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:opacity-95"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Submit
          </Button>
        </form>
      )}
    </Card>
  );
}
