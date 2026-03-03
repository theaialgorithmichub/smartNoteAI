'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Users, BookOpen, User, Calendar, Eye, Share2, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SharedNotebook {
  id: string;
  title: string;
  template: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  sharedAt: string;
  isPublic: boolean;
  pageCount: number;
  lastModified: string;
}

interface SharedByMeNotebook {
  _id: string;
  title: string;
  template: string;
  appearance: any;
  updatedAt: string;
  sharedWith: Array<{
    id: string;
    email: string;
    name: string;
  }>;
}

interface SharedNotebooksViewProps {
  publicNotebooks: SharedNotebook[];
  sharedWithMe: SharedNotebook[];
  onOpenNotebook: (notebookId: string) => void;
}

export function SharedNotebooksView({
  publicNotebooks,
  sharedWithMe,
  onOpenNotebook
}: SharedNotebooksViewProps) {
  const [activeTab, setActiveTab] = useState<'shared' | 'sharedByMe' | 'public'>('shared');
  const [sharedByMe, setSharedByMe] = useState<SharedByMeNotebook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'sharedByMe') {
      fetchSharedByMe();
    }
  }, [activeTab]);

  const fetchSharedByMe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notebooks/shared-by-me');
      if (response.ok) {
        const data = await response.json();
        setSharedByMe(data.notebooks || []);
      }
    } catch (error) {
      console.error('Failed to fetch shared by me notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeShare = async (notebookId: string, userId: string) => {
    try {
      const response = await fetch(`/api/notebooks/${notebookId}/unshare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendIds: [userId] })
      });
      
      if (response.ok) {
        // Refresh the list
        fetchSharedByMe();
      }
    } catch (error) {
      console.error('Failed to revoke share:', error);
    }
  };

  const tabs = [
    { id: 'shared', label: 'Shared with Me', count: sharedWithMe.length, icon: Users },
    { id: 'sharedByMe', label: 'Shared by Me', count: sharedByMe.length, icon: Share2 },
    { id: 'public', label: 'Public Notebooks', count: publicNotebooks.length, icon: Globe }
  ];

  const currentNotebooks = activeTab === 'shared' ? sharedWithMe : activeTab === 'public' ? publicNotebooks : [];

  const getTemplateColor = (template: string) => {
    const colors: Record<string, string> = {
      'grocery-list': 'from-green-500 to-emerald-500',
      'workout-log': 'from-orange-500 to-red-500',
      'budget-planner': 'from-blue-500 to-cyan-500',
      'habit-tracker': 'from-purple-500 to-pink-500',
      'class-notes': 'from-indigo-500 to-purple-500',
      'research-builder': 'from-violet-500 to-purple-500',
      'expense-sharer': 'from-teal-500 to-cyan-500',
      'project-pipeline': 'from-cyan-500 to-blue-500',
      'meals-planner': 'from-orange-500 to-amber-500',
      'save-the-date': 'from-rose-500 to-pink-500',
      'important-urls': 'from-red-500 to-pink-500',
      'prompt-diary': 'from-fuchsia-500 to-pink-500'
    };
    return colors[template] || 'from-neutral-500 to-neutral-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Shared Notebooks</h2>
        <p className="text-neutral-600 dark:text-neutral-400">Notebooks shared with you by friends and the community</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Notebooks Grid */}
      {activeTab === 'sharedByMe' ? (
        // Shared by Me Tab
        loading ? (
          <Card className="p-12 bg-neutral-50 dark:bg-neutral-800 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
          </Card>
        ) : sharedByMe.length === 0 ? (
          <Card className="p-12 bg-neutral-50 dark:bg-neutral-800 text-center">
            <Share2 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Shared Notebooks</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Notebooks you share with friends will appear here
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedByMe.map(notebook => (
              <Card
                key={notebook._id}
                className="group relative overflow-hidden bg-white dark:bg-neutral-800 hover:shadow-xl transition-all"
              >
                {/* Gradient Header */}
                <div className={`h-32 bg-gradient-to-br ${getTemplateColor(notebook.template)} relative cursor-pointer`}
                  onClick={() => onOpenNotebook(notebook._id)}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 rounded-full flex items-center gap-1">
                      <Share2 className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Shared</span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <BookOpen className="h-8 w-8 text-white opacity-80" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-3 line-clamp-1 cursor-pointer"
                    onClick={() => onOpenNotebook(notebook._id)}
                  >
                    {notebook.title}
                  </h3>

                  {/* Shared With List */}
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">
                      Shared with {notebook.sharedWith.length} {notebook.sharedWith.length === 1 ? 'friend' : 'friends'}
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {notebook.sharedWith.map(friend => (
                        <div
                          key={friend.id}
                          className="flex items-center justify-between gap-2 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {friend.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                                {friend.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                {friend.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRevokeShare(notebook._id, friend.id);
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors flex-shrink-0"
                            title="Revoke access"
                          >
                            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Button */}
                  <Button 
                    onClick={() => onOpenNotebook(notebook._id)}
                    className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 group-hover:scale-105 transition-transform"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Notebook
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : currentNotebooks.length === 0 ? (
        <Card className="p-12 bg-neutral-50 dark:bg-neutral-800 text-center">
          {activeTab === 'shared' ? (
            <>
              <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Shared Notebooks</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                When friends share notebooks with you, they'll appear here
              </p>
            </>
          ) : (
            <>
              <Globe className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Public Notebooks</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                No public notebooks available at the moment
              </p>
            </>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentNotebooks.map(notebook => (
            <Card
              key={notebook.id}
              className="group relative overflow-hidden bg-white dark:bg-neutral-800 hover:shadow-xl transition-all cursor-pointer"
              onClick={() => onOpenNotebook(notebook.id)}
            >
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-br ${getTemplateColor(notebook.template)} relative`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-3 right-3">
                  {notebook.isPublic ? (
                    <div className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 rounded-full flex items-center gap-1">
                      <Globe className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Public</span>
                    </div>
                  ) : (
                    <div className="px-2 py-1 bg-white/90 dark:bg-neutral-900/90 rounded-full flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">Private</span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <BookOpen className="h-8 w-8 text-white opacity-80" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-2 line-clamp-1">
                  {notebook.title}
                </h3>

                {/* Owner Info */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {notebook.owner.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {notebook.owner.name}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3" />
                    <span>{notebook.pageCount} page{notebook.pageCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>Shared {formatDate(notebook.sharedAt)}</span>
                  </div>
                </div>

                {/* View Button */}
                <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 group-hover:scale-105 transition-transform">
                  <Eye className="h-4 w-4 mr-2" />
                  View Notebook
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
