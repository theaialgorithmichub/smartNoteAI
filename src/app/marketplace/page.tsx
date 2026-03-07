"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star,
  Download,
  TrendingUp,
  Clock,
  Award,
  Grid,
  List,
  Plus,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CATEGORIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'creative', label: 'Creative' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'rating', label: 'Highest Rated', icon: Star },
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'trending', label: 'Trending', icon: Award },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchTemplates();
  }, [category, sort, page]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        category,
        sort,
        page: page.toString(),
        limit: '12',
      });

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/marketplace/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTemplates();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-purple-950 dark:to-pink-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Template Marketplace
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Discover and download community-created templates
              </p>
            </div>
            <Button
              onClick={() => router.push('/marketplace/submit')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit Template
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Templates Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <Card className="p-12 text-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
            <Filter className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              No templates found. Try adjusting your filters.
            </p>
          </Card>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'
              : 'space-y-4 mb-8'
            }>
              {templates.map((template, index) => (
                <motion.div
                  key={template._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
                    onClick={() => router.push(`/marketplace/${template._id}`)}
                  >
                    {/* Preview Image */}
                    {template.preview?.images?.[0] && (
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                        <Image
                          src={template.preview.images[0]}
                          alt={template.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Title and Author */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                          {template.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                          {template.description}
                        </p>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-2 mb-4">
                        {template.authorAvatar && (
                          <Image
                            src={template.authorAvatar}
                            alt={template.authorName}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          by {template.authorName}
                        </span>
                        {template.verified && (
                          <Award className="w-4 h-4 text-blue-500" />
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            {template.stats.rating.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {template.stats.downloads}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {template.stats.views}
                          </span>
                        </div>

                        {/* Price */}
                        {template.pricing.type === 'free' ? (
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            Free
                          </span>
                        ) : (
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            {template.pricing.credits} credits
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {template.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-slate-600 dark:text-slate-300">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
