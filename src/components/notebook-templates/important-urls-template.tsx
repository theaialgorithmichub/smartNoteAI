'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link, Plus, Youtube, Instagram, Video, ExternalLink, Trash2, Search, Info, X, Check, BookOpen, ChevronLeft, ChevronRight, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';
import { BentoGrid } from '@/components/ui/bento-grid';
import {
  ContainerScrollContained,
  CardsContainer,
  CardTransformed,
} from '@/components/ui/animated-cards-stack';

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
  channel?: string;
  tags?: string[];
}

export function ImportantUrlsTemplate({ title, notebookId }: ImportantUrlsTemplateProps) {
  const [urls, setUrls] = useState<SavedUrl[]>([]);
  const [newUrl, setNewUrl] = useState({ title: '', url: '', platform: 'YouTube', type: 'Entertainment', channel: '', tags: '' });
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; urlId: number | null; urlTitle: string }>({ show: false, urlId: null, urlTitle: '' });
  const [saving, setSaving] = useState(false);
  const [showLatestUrlsStack, setShowLatestUrlsStack] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const latestUrls = urls.slice(0, 5);
  
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
        const loaded = (data.urls || []).map((u: SavedUrl) => ({
          ...u,
          channel: u.channel ?? undefined,
          tags: Array.isArray(u.tags) ? u.tags : undefined,
        }));
        setUrls(loaded);
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

  // Extract video ID and generate thumbnail. Only YouTube has a reliable external thumbnail; others use in-card fallback.
  const getVideoThumbnail = (url: string, platform: string): string | undefined => {
    try {
      if (platform === 'YouTube') {
        const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
          return `https://img.youtube.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
        }
      }
      // Instagram, Udemy, Vimeo, TikTok, Other: no reliable thumbnail URL; card will show icon fallback
    } catch (e) {
      console.error('Error generating thumbnail:', e);
    }
    return undefined;
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
    const tags = newUrl.tags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);
    const url: SavedUrl = {
      id: Date.now(),
      title: newUrl.title,
      url: newUrl.url,
      platform: detectedPlatform as SavedUrl['platform'],
      thumbnail: getVideoThumbnail(newUrl.url, detectedPlatform),
      type: newUrl.type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      channel: newUrl.channel.trim() || undefined,
      tags: tags.length ? tags : undefined,
    };
    
    setUrls([url, ...urls]);
    setNewUrl({ title: '', url: '', platform: 'YouTube', type: 'Entertainment', channel: '', tags: '' });
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

  const q = searchQuery.toLowerCase().trim();
  const filteredUrls = urls.filter(url => {
    const matchesPlatform = selectedPlatform === 'All' || url.platform === selectedPlatform;
    const matchesType = selectedType === 'All' || url.type === selectedType;
    const matchesSearch = !q || (
      url.title.toLowerCase().includes(q) ||
      url.url.toLowerCase().includes(q) ||
      (url.channel?.toLowerCase().includes(q)) ||
      (url.tags?.some(t => t.includes(q)))
    );
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

  const getPlatformBadgeClass = (platform: string) => {
    switch (platform) {
      case 'YouTube': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'Instagram': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400';
      case 'Udemy': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'Vimeo': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'TikTok': return 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{urls.length} URLs</span>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span>{new Set(urls.map(u => u.platform)).size} platforms</span>
          <span className="text-neutral-300 dark:text-neutral-600">·</span>
          <span>{new Set(urls.map(u => u.type)).size} categories</span>
        </div>

        {/* Latest URLs - Stack Cards (expand on click) */}
        {urls.length > 0 && (
          <Card className="overflow-hidden bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-700/80 rounded-2xl shadow-lg">
            <button
              type="button"
              onClick={() => setShowLatestUrlsStack(!showLatestUrlsStack)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors rounded-2xl"
            >
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Latest URLs</h3>
              {showLatestUrlsStack ? <ChevronUp className="h-5 w-5 text-neutral-500" /> : <ChevronDown className="h-5 w-5 text-neutral-500" />}
            </button>
            {showLatestUrlsStack && (
              <div className="border-t border-neutral-200 dark:border-neutral-700">
                <ContainerScrollContained containerHeight="420px">
                  <CardsContainer className="mx-auto h-[380px] w-[320px] max-w-full">
                      {latestUrls.map((url, index) => {
                        const thumb = url.thumbnail ?? getVideoThumbnail(url.url, url.platform);
                        return (
                          <CardTransformed
                            key={url.id}
                            arrayLength={latestUrls.length}
                            index={index + 2}
                            variant="light"
                            className="overflow-hidden !rounded-xl !p-0 cursor-pointer items-stretch justify-stretch"
                            role="button"
                            tabIndex={0}
                            onClick={() => window.open(url.url, '_blank', 'noopener,noreferrer')}
                            onKeyDown={(e) => e.key === 'Enter' && window.open(url.url, '_blank', 'noopener,noreferrer')}
                          >
                            <div className="flex flex-col w-full h-full">
                              <div className="relative h-36 bg-neutral-200 dark:bg-neutral-700 shrink-0 overflow-hidden">
                                {thumb ? (
                                  <img src={thumb} alt={url.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-white bg-gradient-to-br from-neutral-500 to-neutral-700">
                                    {getPlatformIcon(url.platform)}
                                    <span className="text-xs opacity-90">{url.platform}</span>
                                  </div>
                                )}
                                <div className="absolute top-2 right-2">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPlatformBadgeClass(url.platform)}`}>
                                    {url.platform}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col flex-1 p-4 text-left gap-1 min-h-0">
                                <h4 className="font-bold text-neutral-900 dark:text-white line-clamp-2 text-sm">{url.title}</h4>
                                {url.channel && <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">{url.channel}</p>}
                                {url.tags && url.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {url.tags.slice(0, 3).map((tag, i) => (
                                      <span key={i} className="inline-flex items-center px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-[10px]">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <span className="text-xs text-blue-600 dark:text-blue-400 mt-auto flex items-center gap-1">
                                  Open <ExternalLink className="h-3 w-3" />
                                </span>
                              </div>
                            </div>
                          </CardTransformed>
                        );
                      })}
                    </CardsContainer>
                </ContainerScrollContained>
              </div>
            )}
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-700/80 rounded-2xl shadow-lg">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by URL, tag, channel, or title..."
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 dark:focus:ring-red-500/30 transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 overflow-x-auto">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Platform</span>
                <div className="inline-flex gap-2 p-1 rounded-full bg-neutral-100 dark:bg-neutral-900/60">
                  {['All', ...platforms].map(platform => (
                    <button
                      key={platform}
                      onClick={() => handleFilterChange('platform', platform)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        selectedPlatform === platform
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Type</span>
                <div className="inline-flex gap-2 p-1 rounded-full bg-neutral-100 dark:bg-neutral-900/60">
                  {['All', ...types].map(type => (
                    <button
                      key={type}
                      onClick={() => handleFilterChange('type', type)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                        selectedType === type
                          ? 'bg-pink-500 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-700/80 rounded-2xl shadow-lg">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Add New URL</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Title..."
                value={newUrl.title}
                onChange={(e) => setNewUrl({ ...newUrl, title: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <select
                value={newUrl.type}
                onChange={(e) => setNewUrl({ ...newUrl, type: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {types.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Channel (optional)..."
                value={newUrl.channel}
                onChange={(e) => setNewUrl({ ...newUrl, channel: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <input
                type="text"
                placeholder="Tags (comma-separated, e.g. react, tutorial)"
                value={newUrl.tags}
                onChange={(e) => setNewUrl({ ...newUrl, tags: e.target.value })}
                className="px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="url"
                placeholder="Paste video URL..."
                value={newUrl.url}
                onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              <Button 
                onClick={handleSaveUrl}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90 rounded-xl px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Save URL
              </Button>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Platform auto-detected from URL (YouTube, Instagram, Udemy, Vimeo, TikTok). Search by URL, tag, or channel.
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
          <BentoGrid className="auto-rows-[minmax(300px,auto)]">
            {paginatedUrls.map(url => (
              <Card key={url.id} className="group col-span-1 flex flex-col overflow-hidden rounded-xl bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700/80 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative h-40 bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                  {url.thumbnail ? (
                    <>
                      <img
                        src={url.thumbnail}
                        alt={url.title}
                        className="w-full h-full object-cover absolute inset-0"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = 'none';
                          const fallback = el.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 w-full h-full bg-gradient-to-br from-neutral-500 to-neutral-700 flex flex-col items-center justify-center gap-1 text-white">
                        {getPlatformIcon(url.platform)}
                        <span className="text-xs opacity-90">Preview unavailable</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-500 to-neutral-700 flex flex-col items-center justify-center gap-1 text-white">
                      {getPlatformIcon(url.platform)}
                      <span className="text-xs opacity-90">{url.platform}</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => deleteUrl(url.id, url.title)}
                      className="p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg backdrop-blur-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2 line-clamp-2">{url.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${getPlatformBadgeClass(url.platform)}`}>
                      {getPlatformIcon(url.platform)}
                      {url.platform}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
                      {url.type}
                    </span>
                    {url.channel && (
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-lg text-xs truncate max-w-[120px]" title={url.channel}>
                        {url.channel}
                      </span>
                    )}
                  </div>
                  {url.tags && url.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {url.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-[10px]">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                      {url.tags.length > 4 && <span className="text-[10px] text-neutral-400">+{url.tags.length - 4}</span>}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-700">
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
            ))}
          </BentoGrid>
        )}

        {/* Pagination */}
        {filteredUrls.length > urlsPerPage && (
          <Card className="p-4 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-700/80 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredUrls.length)} of {filteredUrls.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[36px] px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-full"
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
