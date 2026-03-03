'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Plus, Copy, Search, Tag, Star, ChevronLeft, ChevronRight, Info, X, Check, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PromptDiaryTemplateProps {
  title: string;
  notebookId?: string;
}

interface Prompt {
  id: number;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
  favorite: boolean;
  date: string;
}

export function PromptDiaryTemplate({ title, notebookId }: PromptDiaryTemplateProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showNewPromptForm, setShowNewPromptForm] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ title: '', prompt: '', category: 'Writing', tags: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editForm, setEditForm] = useState({ title: '', prompt: '', category: 'Writing', tags: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; promptId: number | null }>({ show: false, promptId: null });
  const promptsPerPage = 10;

  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const pageIdRef = useRef<string | null>(null);

  // Load from DB
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__prompt_diary_template__");
        console.log('[PROMPT DIARY] Loading data:', { existing, content: existing?.content });
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const parsed: Prompt[] = JSON.parse(existing.content || "[]");
            console.log('[PROMPT DIARY] Parsed data:', parsed);
            const list = Array.isArray(parsed) ? parsed : [];
            // Check if content is valid
            if (existing.content && existing.content.trim() && list.length >= 0) {
              setPrompts(list);
              setLoading(false);
              return;
            }
            // If content is empty or corrupted, delete and recreate
            console.log('[PROMPT DIARY] Empty/corrupted content detected, recreating page...');
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: "DELETE" });
          } catch (err) {
            console.error('[PROMPT DIARY] Parse error:', err);
            // Delete corrupted page
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: "DELETE" });
          }
        }
        // Create new page
        const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__prompt_diary_template__", content: "[]" }),
        });
        const created = await cr.json();
        console.log('[PROMPT DIARY] Created new page:', created);
        pageIdRef.current = created.page?._id ?? null;
      } catch (err) { console.error('[PROMPT DIARY] Load failed:', err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  // Persist to DB
  const persist = useCallback((list: Prompt[]) => {
    if (!notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current; if (!pid) return;
      setSaving(true);
      console.log('[PROMPT DIARY] Saving data:', list);
      try {
        const payload = { title: "__prompt_diary_template__", content: JSON.stringify(list) };
        console.log('[PROMPT DIARY] Save payload:', payload);
        const response = await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log('[PROMPT DIARY] Save response:', result);
        console.log('[PROMPT DIARY] Saved page content:', result.page?.content);
      } catch (err) { console.error('[PROMPT DIARY] Save failed:', err); }
      finally { setSaving(false); }
    }, 1000);
  }, [notebookId]);

  const categories = ['All', 'Writing', 'Development', 'Business', 'Creative', 'Analysis','Image','Video'];

  const handleAddPrompt = () => {
    if (!newPrompt.title || !newPrompt.prompt) return;
    
    const prompt: Prompt = {
      id: Date.now(),
      title: newPrompt.title,
      prompt: newPrompt.prompt,
      category: newPrompt.category,
      tags: newPrompt.tags.split(',').map(t => t.trim()).filter(t => t),
      favorite: false,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    
    const updated = [prompt, ...prompts];
    setPrompts(updated);
    persist(updated);
    setNewPrompt({ title: '', prompt: '', category: 'Writing', tags: '' });
    setShowNewPromptForm(false);
  };

  const toggleFavorite = (id: number) => {
    const updated = prompts.map(p => p.id === id ? { ...p, favorite: !p.favorite } : p);
    setPrompts(updated);
    persist(updated);
  };

  const deletePrompt = (id: number) => {
    setDeleteConfirm({ show: true, promptId: id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.promptId) {
      const updated = prompts.filter(p => p.id !== deleteConfirm.promptId);
      setPrompts(updated);
      persist(updated);
    }
    setDeleteConfirm({ show: false, promptId: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, promptId: null });
  };

  const startEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setEditForm({
      title: prompt.title,
      prompt: prompt.prompt,
      category: prompt.category,
      tags: prompt.tags.join(', ')
    });
  };

  const handleEditPrompt = () => {
    if (!editForm.title || !editForm.prompt || !editingPrompt) return;
    
    const updatedPrompt: Prompt = {
      ...editingPrompt,
      title: editForm.title,
      prompt: editForm.prompt,
      category: editForm.category,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t),
    };
    
    const updated = prompts.map(p => p.id === editingPrompt.id ? updatedPrompt : p);
    setPrompts(updated);
    persist(updated);
    setEditingPrompt(null);
    setEditForm({ title: '', prompt: '', category: 'Writing', tags: '' });
  };

  const cancelEdit = () => {
    setEditingPrompt(null);
    setEditForm({ title: '', prompt: '', category: 'Writing', tags: '' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesFavorites = !showFavoritesOnly || p.favorite;
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const totalPages = Math.ceil(filteredPrompts.length / promptsPerPage);
  const startIndex = (currentPage - 1) * promptsPerPage;
  const endIndex = startIndex + promptsPerPage;
  const paginatedPrompts = filteredPrompts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
    </div>
  );

  return (
    <div className="h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              title="Know More"
            >
              <Info className="h-5 w-5" />
            </button>
            {saving && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
              </div>
            )}
            {!saving && notebookId && (
              <div className="text-xs text-emerald-600 dark:text-emerald-400">Saved</div>
            )}
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Your AI prompt library</p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button 
            onClick={() => setShowNewPromptForm(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white dark:bg-neutral-800 border-indigo-200 dark:border-indigo-800 text-neutral-900 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              showFavoritesOnly
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-white dark:bg-neutral-800 border-yellow-200 dark:border-yellow-800 text-neutral-900 dark:text-white hover:bg-yellow-50 dark:hover:bg-yellow-900/30'
            }`}
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
            Favorites
          </button>
        </div>

        {editingPrompt && (
          <Card className="p-6 bg-white dark:bg-neutral-800 border-2 border-purple-300 dark:border-purple-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Edit Prompt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g., Blog Post Writer"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Prompt</label>
                <textarea
                  value={editForm.prompt}
                  onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
                  placeholder="Enter your prompt here..."
                  rows={4}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.tags}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                    placeholder="e.g., blog, content"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleEditPrompt}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  onClick={cancelEdit}
                  className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {showNewPromptForm && (
          <Card className="p-6 bg-white dark:bg-neutral-800 border-2 border-indigo-300 dark:border-indigo-700">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Add New Prompt</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newPrompt.title}
                  onChange={(e) => setNewPrompt({ ...newPrompt, title: e.target.value })}
                  placeholder="e.g., Blog Post Writer"
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Prompt</label>
                <textarea
                  value={newPrompt.prompt}
                  onChange={(e) => setNewPrompt({ ...newPrompt, prompt: e.target.value })}
                  placeholder="Enter your prompt here..."
                  rows={4}
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
                  <select
                    value={newPrompt.category}
                    onChange={(e) => setNewPrompt({ ...newPrompt, category: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newPrompt.tags}
                    onChange={(e) => setNewPrompt({ ...newPrompt, tags: e.target.value })}
                    placeholder="e.g., blog, content"
                    className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleAddPrompt}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prompt
                </Button>
                <Button
                  onClick={() => {
                    setShowNewPromptForm(false);
                    setNewPrompt({ title: '', prompt: '', category: 'Writing', tags: '' });
                  }}
                  className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {paginatedPrompts.map(prompt => (
            <Card key={prompt.id} className="p-5 bg-white dark:bg-neutral-800 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-neutral-900 dark:text-white">{prompt.title}</h3>
                    <button onClick={() => toggleFavorite(prompt.id)}>
                      <Star className={`h-4 w-4 ${prompt.favorite ? 'fill-yellow-500 text-yellow-500' : 'text-neutral-400'}`} />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{prompt.date}</p>
                </div>
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs font-medium">
                  {prompt.category}
                </span>
              </div>
              
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3 line-clamp-3">
                {prompt.prompt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-1">
                  {prompt.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => copyToClipboard(prompt.prompt)}
                    className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Copy prompt"
                  >
                    <Copy className="h-4 w-4 text-indigo-600" />
                  </button>
                  <button 
                    onClick={() => startEditPrompt(prompt)}
                    className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Edit prompt"
                  >
                    <Edit2 className="h-4 w-4 text-purple-600" />
                  </button>
                  <button 
                    onClick={() => deletePrompt(prompt.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete prompt"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <Card className="p-4 bg-white dark:bg-neutral-800">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredPrompts.length)} of {filteredPrompts.length} prompts
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Build Your Prompt Library</h3>
          <p className="text-indigo-100 mb-4">Save your best AI prompts and access them anytime</p>
          <Button 
            onClick={() => setShowNewPromptForm(true)}
            className="bg-white text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Prompt
          </Button>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white dark:bg-neutral-800 p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Delete Prompt?</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete this prompt? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={cancelDelete}
                  className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Documentation Modal */}
      {showDocumentation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
            <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-indigo-600" />
                  Prompt Diary - Template Documentation
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
              </div>
              <button
                onClick={() => setShowDocumentation(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                <p className="text-neutral-700 dark:text-neutral-300">
                  The Prompt Diary is a powerful template designed to help you organize, manage, and access your AI prompts efficiently. 
                  Whether you're a content creator, developer, or business professional, this template provides a centralized library 
                  for all your valuable prompts.
                </p>
              </section>

              {/* Key Features */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Prompt Library</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Store unlimited AI prompts with titles, descriptions, and metadata</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Category Organization</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Organize prompts into Writing, Development, Business, Creative, Analysis, Image, and Video categories</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Smart Search</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Quickly find prompts by searching titles or content</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Tag System</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Add custom tags for better organization and filtering</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Favorites</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Mark important prompts as favorites and filter to view only starred items</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">One-Click Copy</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Copy prompts to clipboard instantly for use in AI tools</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-cyan-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Pagination</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Browse through prompts with 10 items per page for better performance</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Date Tracking</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Automatically track when prompts were created</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Edit Prompts</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Modify existing prompts to refine and improve them</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Delete Prompts</h4>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">Remove outdated or unwanted prompts with confirmation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* How to Use */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Adding a New Prompt</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the "New Prompt" button, fill in the title, prompt text, select a category, and add tags (comma-separated). Click "Add Prompt" to save.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Searching Prompts</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Use the search bar to find prompts by title or content. The search works in real-time as you type.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Filtering by Category</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Click on category buttons to filter prompts. Select "All" to view all categories.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Managing Favorites</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the star icon on any prompt to mark it as favorite. Use the "Favorites" button to view only starred prompts.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Copying Prompts</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the copy icon on any prompt card to copy the prompt text to your clipboard for use in AI tools.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">6. Editing Prompts</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the edit icon (pencil) on any prompt card to modify its title, content, category, or tags. Click "Save Changes" to update or "Cancel" to discard changes.</p>
                  </div>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                    <h4 className="font-bold text-neutral-900 dark:text-white mb-2">7. Deleting Prompts</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">Click the trash icon on any prompt card to delete it. A confirmation dialog will appear to prevent accidental deletions.</p>
                  </div>
                </div>
              </section>

              {/* Use Cases */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💡 Use Cases</h3>
                <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span><strong>Content Creators:</strong> Store blog post templates, social media prompts, and content ideas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span><strong>Developers:</strong> Save code review prompts, debugging templates, and documentation generators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span><strong>Business Professionals:</strong> Organize email templates, meeting summaries, and report generators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span><strong>Designers:</strong> Keep image generation prompts and creative briefs organized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span><strong>Marketers:</strong> Maintain ad copy templates, campaign ideas, and audience analysis prompts</span>
                  </li>
                </ul>
              </section>

              {/* Tips */}
              <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span>Use descriptive titles to quickly identify prompts at a glance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span>Add multiple tags to make prompts easier to find across categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span>Star your most-used prompts for quick access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span>Use placeholders like [topic], [recipient], [subject] in your prompts for easy customization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">✓</span>
                    <span>Regularly review and update your prompt library to keep it relevant</span>
                  </li>
                </ul>
              </section>

              {/* Data Storage */}
              <section>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <strong>Your prompts are automatically saved to the database.</strong> All prompts, categories, tags, and favorites are persisted to the server. Look for the "Saved" indicator in the header to confirm successful storage. Your prompt library syncs across devices automatically.
                  </p>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
              <Button
                onClick={() => setShowDocumentation(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90"
              >
                Got It!
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
