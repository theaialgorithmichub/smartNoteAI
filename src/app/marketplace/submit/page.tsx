"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Upload, ArrowLeft, CheckCircle, AlertCircle,
  Sparkles, Tag, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/home/footer';
import { useUser } from '@clerk/nextjs';

const TEMPLATE_TYPES = [
  'simple','meeting-notes','document','dashboard','code-notebook','planner',
  'ai-research','diary','journal','todo','whiteboard','flashcard','recipe',
  'expense','trip','habit-tracker','workout-log','budget-planner','mind-map',
  'goal-tracker','ai-prompt-studio','project-pipeline','research-builder',
  'studybook','class-notes','prompt-diary','other',
];

const CATEGORIES = [
  { value: 'productivity', label: 'Productivity' },
  { value: 'creative', label: 'Creative' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
];

export default function SubmitTemplatePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const [form, setForm] = useState({
    title: '',
    description: '',
    templateType: 'simple',
    category: 'productivity',
    pricingType: 'free' as 'free' | 'premium',
    credits: 10,
    previewDescription: '',
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (isLoaded && !user) {
    router.push('/sign-in');
    return null;
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags(prev => [...prev, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = async () => {
    if (!form.title || !form.description) {
      setError('Title and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          templateType: form.templateType,
          category: form.category,
          tags,
          content: { templateType: form.templateType },
          preview: { images: [], description: form.previewDescription },
          pricing: form.pricingType === 'free'
            ? { type: 'free' }
            : { type: 'premium', credits: form.credits },
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Submission failed'); return; }
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-purple-950 dark:to-pink-950">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-24">

        <button
          onClick={() => router.push('/marketplace')}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-500" /> Submit a Template
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">
              Share your template with the community. Submissions are reviewed before publishing.
            </p>
          </div>

          {success ? (
            <Card className="p-10 text-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Template Submitted!</h2>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                Your template is under review and will be published once approved. Thank you!
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push('/marketplace')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Browse Marketplace
                </Button>
                <Button variant="outline" onClick={() => { setSuccess(false); setForm({ title:'', description:'', templateType:'simple', category:'productivity', pricingType:'free', credits:10, previewDescription:'' }); setTags([]); }}>
                  Submit Another
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full p-3 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="e.g. Weekly Planner Pro"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full p-3 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={4}
                  placeholder="Describe what makes your template useful and unique…"
                />
              </div>

              {/* Template Type + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Template Type</label>
                  <select
                    value={form.templateType}
                    onChange={e => setForm(f => ({ ...f, templateType: e.target.value }))}
                    className="w-full p-3 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-400 capitalize"
                  >
                    {TEMPLATE_TYPES.map(t => (
                      <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full p-3 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Tags <span className="text-neutral-400 font-normal">(up to 8)</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                    className="flex-1 p-2.5 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Add a tag and press Enter"
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3 hover:text-red-500" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Pricing</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['free', 'premium'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setForm(f => ({ ...f, pricingType: type }))}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        form.pricingType === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-neutral-900 dark:text-white capitalize">{type}</div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {type === 'free' ? 'Anyone can clone for free' : 'Requires credits to clone'}
                      </div>
                    </button>
                  ))}
                </div>
                {form.pricingType === 'premium' && (
                  <div className="mt-3 flex items-center gap-3">
                    <label className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-nowrap">Credits required:</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={form.credits}
                      onChange={e => setForm(f => ({ ...f, credits: parseInt(e.target.value) || 10 }))}
                      className="w-24 p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                )}
              </div>

              {/* Preview description */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-1">
                  Preview Description <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.previewDescription}
                  onChange={e => setForm(f => ({ ...f, previewDescription: e.target.value }))}
                  className="w-full p-3 border rounded-xl dark:bg-neutral-800 dark:border-neutral-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                  rows={2}
                  placeholder="Short description shown in preview cards…"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !form.title || !form.description}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Submitting…</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Submit for Review</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => router.push('/marketplace')}>Cancel</Button>
              </div>

              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
                Templates are reviewed by our team before being published to the marketplace.
              </p>
            </Card>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
