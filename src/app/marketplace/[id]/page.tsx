"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Star, Download, Eye, ArrowLeft, Award, Tag, Clock,
  Copy, CheckCircle, AlertCircle, User, ThumbsUp, Sparkles,
  BookOpen, Send, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/home/footer';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

const CATEGORY_COLORS: Record<string, string> = {
  productivity: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  creative: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  business: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  education: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  personal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  other: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();

  const [template, setTemplate] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [cloned, setCloned] = useState(false);
  const [cloneError, setCloneError] = useState('');

  // Review form
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (id) fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/marketplace/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data.template);
        setReviews(data.reviews || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async () => {
    if (!user) { router.push('/sign-in'); return; }
    setCloning(true);
    setCloneError('');
    try {
      // Download/claim the template
      const dlRes = await fetch(`/api/marketplace/${id}/download`, { method: 'POST' });
      const dlData = await dlRes.json();
      if (!dlRes.ok) { setCloneError(dlData.error || 'Failed to clone'); return; }

      // Create a new notebook from the template
      const nbRes = await fetch('/api/notebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${template.title} (Clone)`,
          template: template.templateType,
          category: template.category,
          tags: template.tags,
        }),
      });
      const nbData = await nbRes.json();
      if (!nbRes.ok) { setCloneError(nbData.error || 'Failed to create notebook'); return; }

      setCloned(true);
      setTimeout(() => router.push(`/dashboard/notebook/${nbData._id}`), 1200);
    } finally {
      setCloning(false);
    }
  };

  const submitReview = async () => {
    if (!user) { router.push('/sign-in'); return; }
    if (!myRating || !myComment.trim()) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await fetch(`/api/marketplace/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.error || 'Failed to submit review'); return; }
      setReviewSuccess(true);
      setMyRating(0); setMyComment('');
      fetchTemplate();
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-purple-950 dark:to-pink-950">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-purple-950 dark:to-pink-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <AlertCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-300">Template not found</h2>
          <Button className="mt-6" onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const displayRating = hoverRating || myRating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-purple-950 dark:to-pink-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">

        {/* Back */}
        <button
          onClick={() => router.push('/marketplace')}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: main info */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                {/* Preview image */}
                {template.preview?.images?.[0] && (
                  <div className="relative h-56 rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
                    <Image src={template.preview.images[0]} alt={template.title} fill className="object-cover" />
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {template.featured && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      )}
                      {template.verified && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                          <Award className="w-3 h-3" /> Verified
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${CATEGORY_COLORS[template.category] || CATEGORY_COLORS.other}`}>
                        {template.category}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{template.title}</h1>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {template.pricing.type === 'free' ? (
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">Free</span>
                    ) : (
                      <div>
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{template.pricing.credits}</span>
                        <span className="text-sm text-neutral-500 ml-1">credits</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-neutral-600 dark:text-neutral-300 mb-4">{template.description}</p>

                {/* Author */}
                <div className="flex items-center gap-2 mb-4">
                  {template.authorAvatar ? (
                    <Image src={template.authorAvatar} alt={template.authorName} width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    </div>
                  )}
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">by <strong>{template.authorName}</strong></span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <strong className="text-neutral-700 dark:text-neutral-200">{(template.stats.rating || 0).toFixed(1)}</strong>
                    <span>({template.stats.ratingCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-4 h-4" /> {template.stats.downloads} downloads
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {template.stats.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {new Date(template.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Tags */}
                {template.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {template.tags.map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                        <Tag className="w-3 h-3" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Reviews Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-5 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" /> Reviews ({reviews.length})
                </h2>

                {reviews.length === 0 ? (
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm py-4 text-center">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {reviews.map((r: any) => (
                      <div key={r._id} className="flex gap-3 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center flex-shrink-0">
                          {r.userAvatar
                            ? <Image src={r.userAvatar} alt={r.userName} width={32} height={32} className="rounded-full" />
                            : <User className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                          }
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">{r.userName}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`} />
                              ))}
                            </div>
                            <span className="text-xs text-neutral-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Write a review */}
                {user && (
                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-5">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Write a Review</h3>
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(s => (
                        <button
                          key={s}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setMyRating(s)}
                        >
                          <Star className={`w-6 h-6 transition-colors ${s <= displayRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600 hover:text-amber-300'}`} />
                        </button>
                      ))}
                      {myRating > 0 && <span className="text-sm text-neutral-500 ml-2">{['','Poor','Fair','Good','Great','Excellent'][myRating]}</span>}
                    </div>
                    <textarea
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      className="w-full p-3 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                      rows={3}
                      placeholder="Share your experience with this template (min 10 characters)…"
                    />
                    {reviewError && <p className="text-sm text-red-500 mt-1">{reviewError}</p>}
                    {reviewSuccess && <p className="text-sm text-green-600 mt-1 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Review submitted!</p>}
                    <Button
                      onClick={submitReview}
                      disabled={!myRating || myComment.length < 10 || submittingReview}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Right: Clone CTA sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm sticky top-24">
                <div className="text-center mb-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">{template.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 capitalize">{template.templateType?.replace(/-/g,' ')} template</p>
                </div>

                {cloneError && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-600 dark:text-red-400">
                    {cloneError}
                  </div>
                )}

                {cloned ? (
                  <div className="flex items-center gap-2 justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-700 dark:text-green-300 text-sm font-medium">
                    <CheckCircle className="w-5 h-5" /> Cloned! Opening notebook…
                  </div>
                ) : (
                  <Button
                    onClick={handleClone}
                    disabled={cloning}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
                  >
                    {cloning ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Cloning…</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" />Clone Template</>
                    )}
                  </Button>
                )}

                <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-3">
                  {template.pricing.type === 'free'
                    ? 'Free to clone — creates a new notebook in your dashboard'
                    : `Costs ${template.pricing.credits} credits`}
                </p>

                <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-neutral-900 dark:text-white">{(template.stats.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Downloads</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{template.stats.downloads}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Category</span>
                    <span className="font-semibold text-neutral-900 dark:text-white capitalize">{template.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Type</span>
                    <span className="font-semibold text-neutral-900 dark:text-white capitalize">{template.templateType?.replace(/-/g,' ')}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
