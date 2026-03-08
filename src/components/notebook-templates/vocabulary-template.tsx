'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash2,
  Info,
  X,
  Search,
  Tag,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';

interface VocabEntry {
  id: string;
  word: string;
  definition: string;
  example: string;
  tags: string[];
}

interface VocabularyTemplateProps {
  title: string;
  notebookId?: string;
}

const storageKeyFor = (notebookId: string) => `vocabulary-${notebookId}`;

export function VocabularyTemplate({ title, notebookId }: VocabularyTemplateProps) {
  const [entries, setEntries] = useState<VocabEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    word: '',
    definition: '',
    example: '',
    tagsStr: '',
  });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = notebookId ? storageKeyFor(notebookId) : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as VocabEntry[];
        setEntries(Array.isArray(parsed) ? parsed : []);
      }
    } catch (e) {
      console.error('Failed to load vocabulary:', e);
    }
  }, [storageKey]);

  const persist = (next: VocabEntry[]) => {
    setEntries(next);
    if (!storageKey) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  const allTags = Array.from(
    new Set(entries.flatMap((e) => e.tags).filter(Boolean))
  ).sort();

  const filtered = entries.filter((e) => {
    const matchSearch =
      !searchQuery ||
      e.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.example.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTag =
      !filterTag || e.tags.includes(filterTag);
    return matchSearch && matchTag;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ word: '', definition: '', example: '', tagsStr: '' });
    setShowForm(true);
  };

  const openEdit = (entry: VocabEntry) => {
    setEditingId(entry.id);
    setForm({
      word: entry.word,
      definition: entry.definition,
      example: entry.example,
      tagsStr: entry.tags.join(', '),
    });
    setShowForm(true);
  };

  const saveEntry = () => {
    const word = form.word.trim();
    if (!word) return;
    const tags = form.tagsStr
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (editingId) {
      persist(
        entries.map((e) =>
          e.id === editingId
            ? {
                ...e,
                word,
                definition: form.definition.trim(),
                example: form.example.trim(),
                tags,
              }
            : e
        )
      );
      setEditingId(null);
    } else {
      persist([
        {
          id: Date.now().toString(),
          word,
          definition: form.definition.trim(),
          example: form.example.trim(),
          tags,
        },
        ...entries,
      ]);
    }
    setForm({ word: '', definition: '', example: '', tagsStr: '' });
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    persist(entries.filter((e) => e.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setShowForm(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Build your word list with definitions and examples
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Saving...</span>
              )}
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                title="About this template"
              >
                <Info className="h-5 w-5" />
              </button>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Word
              </button>
            </div>
          </div>

          {/* Search & filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search words, definitions..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setFilterTag(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterTag === null
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterTag === tag
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Word list */}
          <Card className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {entries.length === 0
                    ? 'No words yet. Add your first word to build your vocabulary.'
                    : 'No words match your search or filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                          {entry.word}
                        </h3>
                        {entry.definition && (
                          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                            {entry.definition}
                          </p>
                        )}
                        {entry.example && (
                          <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2 italic">
                            e.g. {entry.example}
                          </p>
                        )}
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {entry.tags.map((t) => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs"
                              >
                                <Tag className="h-3 w-3" />
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(entry)}
                          className="p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
                          title="Edit"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Add/Edit modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
              >
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingId ? 'Edit Word' : 'Add Word'}
                </h3>
                <input
                  value={form.word}
                  onChange={(e) => setForm({ ...form, word: e.target.value })}
                  placeholder="Word or phrase"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <textarea
                  value={form.definition}
                  onChange={(e) => setForm({ ...form, definition: e.target.value })}
                  placeholder="Definition"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                />
                <input
                  value={form.example}
                  onChange={(e) => setForm({ ...form, example: e.target.value })}
                  placeholder="Example sentence"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <input
                  value={form.tagsStr}
                  onChange={(e) => setForm({ ...form, tagsStr: e.target.value })}
                  placeholder="Tags (comma separated)"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEntry}
                    disabled={!form.word.trim()}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium"
                  >
                    {editingId ? 'Save' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documentation modal */}
        <AnimatePresence>
          {showDocumentation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDocumentation(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Vocabulary
                  </h2>
                  <button
                    onClick={() => setShowDocumentation(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  Build your own word bank: add words with definitions, example sentences, and tags.
                  Search and filter by tag to review vocabulary. Great for language learners, students,
                  and anyone building terminology lists.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <TemplateFooter />
    </div>
  );
}
