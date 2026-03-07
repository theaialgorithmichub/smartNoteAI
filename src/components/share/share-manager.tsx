"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Copy, 
  Trash2, 
  Eye, 
  Lock, 
  Calendar,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ShareData {
  _id: string;
  shareId: string;
  shareUrl: string;
  notebookId: string;
  accessType: 'view' | 'edit' | 'comment';
  expiresAt?: string;
  maxViews?: number;
  currentViews: number;
  isActive: boolean;
  createdAt: string;
}

interface ShareManagerProps {
  notebookId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareManager({ notebookId, isOpen, onClose }: ShareManagerProps) {
  const [shares, setShares] = useState<ShareData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create share form state
  const [accessType, setAccessType] = useState<'view' | 'edit' | 'comment'>('view');
  const [password, setPassword] = useState('');
  const [expiresIn, setExpiresIn] = useState<number | ''>('');
  const [maxViews, setMaxViews] = useState<number | ''>('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowPrint, setAllowPrint] = useState(true);
  const [watermark, setWatermark] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShares();
    }
  }, [isOpen, notebookId]);

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/list?notebookId=${notebookId}`);
      if (response.ok) {
        const data = await response.json();
        setShares(data.shares || []);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    } finally {
      setLoading(false);
    }
  };

  const createShare = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          accessType,
          password: password || undefined,
          expiresIn: expiresIn || undefined,
          maxViews: maxViews || undefined,
          allowDownload,
          allowPrint,
          watermark: watermark || undefined,
        }),
      });

      if (response.ok) {
        await fetchShares();
        setShowCreateForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating share:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/share/${shareId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShares(prev => prev.filter(s => s.shareId !== shareId));
      }
    } catch (error) {
      console.error('Error deleting share:', error);
    }
  };

  const copyToClipboard = async (text: string, shareId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(shareId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const resetForm = () => {
    setAccessType('view');
    setPassword('');
    setExpiresIn('');
    setMaxViews('');
    setAllowDownload(true);
    setAllowPrint(true);
    setWatermark('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Share Management
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create and manage share links
                </p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Create New Share Button */}
          {!showCreateForm && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Create New Share Link
            </Button>
          )}

          {/* Create Share Form */}
          {showCreateForm && (
            <Card className="p-6 mb-6 bg-slate-50 dark:bg-neutral-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                New Share Link
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Access Type
                    </label>
                    <select
                      value={accessType}
                      onChange={(e) => setAccessType(e.target.value as any)}
                      className="w-full p-2 border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
                    >
                      <option value="view">View Only</option>
                      <option value="comment">View & Comment</option>
                      <option value="edit">View & Edit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Expires In (hours)
                    </label>
                    <input
                      type="number"
                      value={expiresIn}
                      onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full p-2 border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
                      placeholder="Never"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Password (optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
                      placeholder="No password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Max Views
                    </label>
                    <input
                      type="number"
                      value={maxViews}
                      onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : '')}
                      className="w-full p-2 border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Watermark (optional)
                  </label>
                  <input
                    type="text"
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    className="w-full p-2 border rounded-lg dark:bg-neutral-900 dark:border-neutral-700"
                    placeholder="e.g., Confidential"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allowDownload}
                      onChange={(e) => setAllowDownload(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Allow Download</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allowPrint}
                      onChange={(e) => setAllowPrint(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Allow Print</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createShare}
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? 'Creating...' : 'Create Share Link'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Existing Shares */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Active Shares ({shares.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : shares.length === 0 ? (
              <Card className="p-8 text-center bg-slate-50 dark:bg-neutral-800">
                <Share2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  No shares created yet
                </p>
              </Card>
            ) : (
              shares.map((share) => (
                <Card key={share.shareId} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {share.accessType} Access
                        </span>
                        {share.expiresAt && (
                          <span className="text-xs text-slate-500">
                            • Expires {new Date(share.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-neutral-800 rounded text-sm text-slate-700 dark:text-slate-200 truncate">
                          {share.shareUrl}
                        </code>
                        <Button
                          onClick={() => copyToClipboard(share.shareUrl, share.shareId)}
                          size="sm"
                          variant="outline"
                        >
                          {copiedId === share.shareId ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Views: {share.currentViews}{share.maxViews ? `/${share.maxViews}` : ''}</span>
                        <span>Created: {new Date(share.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        onClick={() => window.open(share.shareUrl, '_blank')}
                        size="sm"
                        variant="ghost"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteShare(share.shareId)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
