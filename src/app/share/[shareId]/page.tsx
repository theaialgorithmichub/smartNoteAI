"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  Download, 
  Printer, 
  AlertCircle,
  Clock,
  Shield,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SharedTemplateRenderer } from '@/components/sharing/SharedTemplateRenderer';
import { isJsonTemplate } from '@/lib/shared-template-config';

export default function SharedNotebookPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shareData, setShareData] = useState<any>(null);
  const [notebookData, setNotebookData] = useState<any>(null);
  const [pagesData, setPagesData] = useState<any[]>([]);

  useEffect(() => {
    checkShare();
  }, [shareId]);

  const checkShare = async (pwd?: string) => {
    try {
      setLoading(true);
      setError('');

      const url = new URL(`/api/share/${shareId}`, window.location.origin);
      if (pwd) {
        url.searchParams.set('password', pwd);
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (response.status === 401 && data.requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Failed to access shared notebook');
        setLoading(false);
        return;
      }

      setShareData(data.share);
      if (pwd) setPassword(pwd);
      
      // Fetch notebook + pages via share API (no auth required)
      await fetchSharedNotebook(pwd);
      
      setLoading(false);
    } catch (err) {
      console.error('Error checking share:', err);
      setError('Failed to load shared notebook');
      setLoading(false);
    }
  };

  const fetchSharedNotebook = async (pwd?: string) => {
    try {
      const url = new URL(`/api/share/${shareId}/notebook`, window.location.origin);
      if (pwd) url.searchParams.set('password', pwd);
      const response = await fetch(url.toString());
      const data = await response.json();
      if (response.ok && data?.notebook) {
        setNotebookData(data.notebook);
        setPagesData(Array.isArray(data.pages) ? data.pages : []);
      } else {
        if (response.status === 401 && data?.requiresPassword) {
          setRequiresPassword(true);
        }
      }
    } catch (err) {
      console.error('Error fetching shared notebook:', err);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkShare(password);
  };

  const handleDownload = () => {
    if (!shareData?.allowDownload) return;
    // Implement download logic
    console.log('Download notebook');
  };

  const handlePrint = () => {
    if (!shareData?.allowPrint) return;
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Loading shared notebook...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Password Protected
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                This shared notebook requires a password to view
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Enter Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!password}>
                <Shield className="w-4 h-4 mr-2" />
                Access Notebook
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950 p-4">
        <Card className="p-8 text-center max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Unable to Access
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {notebookData?.title || 'Shared Notebook'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Shared via smartDigitalNotes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {shareData?.allowDownload && (
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
              {shareData?.allowPrint && (
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Share Info Banner */}
        <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                You're viewing a shared notebook
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {shareData?.accessType === 'view' ? 'View Only' : shareData?.accessType}
                </span>
                {shareData?.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Expires: {new Date(shareData.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {shareData?.maxViews && (
                  <span>
                    Views: {shareData.currentViews}/{shareData.maxViews}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Notebook Content */}
        <Card className="p-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm overflow-hidden">
          {shareData?.watermark && (
            <div className="text-center text-slate-400 dark:text-slate-600 text-sm mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              {shareData.watermark}
            </div>
          )}

          {notebookData?.template && isJsonTemplate(notebookData.template) ? (
            <SharedTemplateRenderer
              templateId={notebookData.template}
              notebookTitle={notebookData.title || 'Shared Notebook'}
              pagesData={pagesData}
            />
          ) : (
          <div className="prose dark:prose-invert max-w-none">
            {notebookData && typeof notebookData === 'object' && 'title' in notebookData ? (
              <div>
                {Array.isArray(pagesData) && pagesData.length > 0 ? (
                  pagesData.map((page: { _id: string; title?: string; content?: string; pageNumber?: number }) => (
                    <div key={page._id} className="mb-10 last:mb-0">
                      <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                        {page.title || `Page ${page.pageNumber ?? 1}`}
                      </h2>
                      <div
                        className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: typeof page.content === 'string' ? page.content : '<p class="text-slate-500 italic">No content</p>' }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <p className="mb-2">This notebook does not have page-based content yet.</p>
                    <p className="text-sm">
                      Template: <span className="font-medium">{String(notebookData.template || 'simple')}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : !shareData ? null : (
              <p className="text-center text-slate-500">Loading notebook content...</p>
            )}
          </div>
          )}
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            Powered by <span className="font-semibold">smartDigitalNotes</span>
          </p>
          <p className="mt-1">
            <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Create your own notebooks
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
