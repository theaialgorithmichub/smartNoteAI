'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link, Plus, Youtube, Instagram, Video, ExternalLink, Trash2, Search, Info, X, Check, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';

interface ImportantUrlsTemplateProps {
  title: string;
  notebookId?: string;
}

interface SavedUrl {
  id: number;
  title: string;
  url: string;
  platform: 'YouTube' | 'Instagram' | 'Udemy' | 'Vimeo' | 'TikTok' | 'Other';
  thumbnail?: string;
  type: string;
  date: string;
}

export function ImportantUrlsTemplate({ title, notebookId }: ImportantUrlsTemplateProps) {
  const [urls, setUrls] = useState<SavedUrl[]>([]);
  const [newUrl, setNewUrl] = useState({ title: '', url: '', platform: 'YouTube', type: 'Entertainment' });
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; urlId: number | null; urlTitle: string }>({ show: false, urlId: null, urlTitle: '' });
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const urlsPerPage = 10;

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`important-urls-${notebookId}`, JSON.stringify({ urls }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`important-urls-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setUrls(data.urls || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [urls]);

  const platforms = ['YouTube', 'Instagram', 'Udemy', 'Vimeo', 'TikTok', 'Other'];
  const types = ['Entertainment', 'Study', 'Workout', 'Sports', 'Funny', 'Trailers', 'Gaming', 'Tutorial', 'Music', 'News'];

  // Extract video ID and generate thumbnail
  const getVideoThumbnail = (url: string, platform: string): string => {
    try {
      if (platform === 'YouTube') {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
        }
      } else if (platform === 'Instagram') {
        return 'https://via.placeholder.com/320x180/E4405F/ffffff?text=Instagram';
      } else if (platform === 'Udemy') {
        return 'https://via.placeholder.com/320x180/A435F0/ffffff?text=Udemy';
      } else if (platform === 'Vimeo') {
        return 'https://via.placeholder.com/320x180/1AB7EA/ffffff?text=Vimeo';
      } else if (platform === 'TikTok') {
        return 'https://via.placeholder.com/320x180/000000/ffffff?text=TikTok';
      }
    } catch (e) {
      console.error('Error generating thumbnail:', e);
    }
    return 'https://via.placeholder.com/320x180/6B7280/ffffff?text=Video';
  };

  const detectPlatform = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('udemy.com')) return 'Udemy';
    if (url.includes('vimeo.com')) return 'Vimeo';
    if (url.includes('tiktok.com')) return 'TikTok';
    return 'Other';
  };

  const handleSaveUrl = () => {
    if (!newUrl.title || !newUrl.url) return;
    
    const detectedPlatform = detectPlatform(newUrl.url);
    const url: SavedUrl = {
      id: Date.now(),
      title: newUrl.title,
      url: newUrl.url,
      platform: detectedPlatform as any,
      thumbnail: getVideoThumbnail(newUrl.url, detectedPlatform),
      type: newUrl.type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    
    setUrls([url, ...urls]);
    setNewUrl({ title: '', url: '', platform: 'YouTube', type: 'Entertainment' });
  };

  const deleteUrl = (id: number, urlTitle: string) => {
    setDeleteConfirm({ show: true, urlId: id, urlTitle });
  };

  const confirmDelete = () => {
    if (deleteConfirm.urlId) {
      setUrls(urls.filter(u => u.id !== deleteConfirm.urlId));
    }
    setDeleteConfirm({ show: false, urlId: null, urlTitle: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, urlId: null, urlTitle: '' });
  };

  const filteredUrls = urls.filter(url => {
    const matchesPlatform = selectedPlatform === 'All' || url.platform === selectedPlatform;
    const matchesType = selectedType === 'All' || url.type === selectedType;
    const matchesSearch = url.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         url.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesType && matchesSearch;
  });

  const totalPages = Math.ceil(filteredUrls.length / urlsPerPage);
  const startIndex = (currentPage - 1) * urlsPerPage;
  const endIndex = startIndex + urlsPerPage;
  const paginatedUrls = filteredUrls.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  const handleFilterChange = (filterType: 'platform' | 'type' | 'search', value: string) => {
    setCurrentPage(1);
    if (filterType === 'platform') setSelectedPlatform(value);
    if (filterType === 'type') setSelectedType(value);
    if (filterType === 'search') setSearchQuery(value);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube': return <Youtube className="h-5 w-5" />;
      case 'Instagram': return <Instagram className="h-5 w-5" />;
      case 'Udemy': return <BookOpen className="h-5 w-5" />;
      case 'Vimeo': return <Video className="h-5 w-5" />;
      case 'TikTok': return <Video className="h-5 w-5" />;
      default: return <Link className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'YouTube': return 'red';
      case 'Instagram': return 'pink';
      case 'Udemy': return 'purple';
      case 'Vimeo': return 'blue';
      case 'TikTok': return 'neutral';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Know More"
              >
                <Info className="h-5 w-5" />
              </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Save your favorite video content</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-red-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">Total URLs</p>
            <p className="text-3xl font-bold">{urls.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <p className="text-sm opacity-90 mb-1">Platforms</p>
            <p className="text-3xl font-bold">{new Set(urls.map(u => u.platform)).size}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <p className="text-sm opacity-90 mb-1">Categories</p>
            <p className="text-3xl font-bold">{new Set(urls.map(u => u.type)).size}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-white dark:bg-neutral-800">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap py-2">Platform:</span>
                {['All', ...platforms].map(platform => (
                  <button
                    key={platform}
                    onClick={() => handleFilterChange('platform', platform)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedPlatform === platform
                        ? 'bg-red-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap py-2">Type:</span>
                {['All', ...types].map(type => (
                  <button
                    key={type}
                    onClick={() => handleFilterChange('type', type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedType === type
                        ? 'bg-pink-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-neutral-800">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Add New URL</h3>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title..."
                value={newUrl.title}
                onChange={(e) => setNewUrl({ ...newUrl, title: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select
                value={newUrl.type}
                onChange={(e) => setNewUrl({ ...newUrl, type: e.target.value })}
                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {types.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="url"
                placeholder="Paste video URL..."
                value={newUrl.url}
                onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
                className="md:col-span-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button 
                onClick={handleSaveUrl}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Save URL
              </Button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Platform will be auto-detected from URL (YouTube, Instagram, Udemy, Vimeo, TikTok)
            </p>
          </div>
        </Card>

        {paginatedUrls.length === 0 ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <Video className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {urls.length === 0 ? 'No URLs Saved Yet' : 'No Results Found'}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {urls.length === 0 ? 'Save your first video URL to get started' : 'Try adjusting your search or filters'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUrls.map(url => {
            const color = getPlatformColor(url.platform);
            return (
              <Card key={url.id} className="bg-white dark:bg-neutral-800 hover:shadow-lg transition-shadow overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-40 bg-neutral-200 dark:bg-neutral-700">
                  {url.thumbnail ? (
                    <img 
                      src={url.thumbnail} 
                      alt={url.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/320x180/6B7280/ffffff?text=Video';
                      }}
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br from-${color}-400 to-${color}-600 flex items-center justify-center`}>
                      {getPlatformIcon(url.platform)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => deleteUrl(url.id, url.title)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2">{url.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 bg-${color}-100 dark:bg-${color}-900/30 text-${color}-700 dark:text-${color}-400 rounded text-xs font-medium flex items-center gap-1`}>
                      {getPlatformIcon(url.platform)}
                      {url.platform}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                      {url.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{url.date}</span>
                    <a
                      href={url.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Watch <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </Card>
            );
          })}
          </div>
        )}

        {/* Pagination */}
        {filteredUrls.length > urlsPerPage && (
          <Card className="p-4 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredUrls.length)} of {filteredUrls.length} URLs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-red-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Video className="h-6 w-6 text-red-600" />
                    Important URLs - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button onClick={() => setShowDocumentation(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Important URLs is your personal video bookmark manager. Save and organize videos from YouTube, Instagram, Udemy, and more with automatic thumbnail previews and smart categorization.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Auto Thumbnails</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Automatically generates video thumbnails from YouTube URLs</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Platform Detection</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Automatically detects platform from URL (YouTube, Instagram, Udemy, etc.)</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Type Categories</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Organize by Entertainment, Study, Workout, Sports, Gaming, and more</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Smart Filters</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Filter by platform and type, search by title or URL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Saving a URL</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Enter a title, select a type (Entertainment, Study, etc.), paste the video URL, and click "Save URL". The platform will be detected automatically.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Filtering Content</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Use the Platform and Type filters to narrow down your saved videos. Click "All" to see everything.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Searching</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Use the search bar to find videos by title or URL. Works in combination with filters.</p>
                    </div>
                  </div>
                </section>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button onClick={() => setShowDocumentation(false)} className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90">Got It!</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white dark:bg-neutral-800 p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Delete URL?</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-2">Are you sure you want to delete:</p>
                <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">"{deleteConfirm.urlTitle}"</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <Button onClick={cancelDelete} className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600">Cancel</Button>
                  <Button onClick={confirmDelete} className="flex-1 bg-red-600 text-white hover:bg-red-700"><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
