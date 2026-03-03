'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function SyncUsersButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/sync-users', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Sync Clerk Users</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Sync all Clerk users to MongoDB database
          </p>
        </div>
      </div>

      <Button 
        onClick={handleSync} 
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Syncing Users...
          </>
        ) : (
          <>
            <Users className="h-4 w-4 mr-2" />
            Sync All Users Now
          </>
        )}
      </Button>

      {result && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">
                {result.message}
              </p>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                <p>✅ Synced: {result.synced} users</p>
                <p>⏭️ Skipped: {result.skipped} existing users</p>
                <p>📊 Total: {result.total} users in Clerk</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">Sync Failed</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
        <p>💡 This will sync all users from Clerk to MongoDB</p>
        <p>🔄 Future signups will auto-sync via webhook (when configured)</p>
        <p>🔍 Users also auto-sync when searched in Friends tab</p>
      </div>
    </div>
  );
}
