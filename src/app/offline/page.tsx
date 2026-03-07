"use client";

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950 p-4">
      <Card className="p-8 max-w-md text-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
        <div className="w-20 h-20 bg-slate-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          You're Offline
        </h1>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          It looks like you've lost your internet connection. Some features may be limited until you're back online.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
            Offline Mode
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Your recent notebooks and data are cached and available offline. Changes will sync when you're back online.
          </p>
        </div>
      </Card>
    </div>
  );
}
