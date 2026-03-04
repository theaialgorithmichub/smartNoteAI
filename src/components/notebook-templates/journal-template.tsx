"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import { 
  BookOpen,
  Plus,
  Loader2,
  Tag,
  X,
  Search,
  Filter,
  Clock,
  Trash2,
  Info,
  Star,
  Download,
  Smile,
  Meh,
  Frown,
  Heart,
  TrendingUp,
  FileText,
  Calendar
} from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  mood: 'happy' | 'neutral' | 'sad' | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JournalTemplateProps {
  title?: string;
  notebookId?: string;
}

export function JournalTemplate({ title = "My Journal", notebookId }: JournalTemplateProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`journal-${notebookId}`, JSON.stringify({ entries }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`journal-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setEntries(data.entries || []);
        if (data.entries?.length > 0) {
          setSelectedEntryId(data.entries[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [entries]);

  const selectedEntry = entries.find(e => e.id === selectedEntryId);

  const createEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: 'Untitled Entry',
      content: '',
      tags: [],
      category: 'Personal',
      mood: null,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEntries([newEntry, ...entries]);
    setSelectedEntryId(newEntry.id);
  };

  const updateEntry = (updates: Partial<JournalEntry>) => {
    if (!selectedEntryId) return;
    setEntries(entries.map(e => 
      e.id === selectedEntryId 
        ? { ...e, ...updates, updatedAt: new Date().toISOString() } 
        : e
    ));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    if (selectedEntryId === id) {
      setSelectedEntryId(entries.find(e => e.id !== id)?.id || null);
    }
  };

  const addTag = () => {
    if (!newTag.trim() || !selectedEntry) return;
    if (!selectedEntry.tags.includes(newTag.trim())) {
      updateEntry({ tags: [...selectedEntry.tags, newTag.trim()] });
    }
    setNewTag("");
    setIsAddingTag(false);
  };

  const removeTag = (tag: string) => {
    if (!selectedEntry) return;
    updateEntry({ tags: selectedEntry.tags.filter(t => t !== tag) });
  };

  // Get all unique tags and categories
  const allTags = [...new Set(entries.flatMap(e => e.tags))];
  const allCategories = [...new Set(entries.map(e => e.category).filter(Boolean))];
  
  // Calculate statistics
  const totalWords = entries.reduce((sum, e) => sum + e.content.split(/\s+/).filter(w => w.length > 0).length, 0);
  const totalEntries = entries.length;
  const favoriteCount = entries.filter(e => e.isFavorite).length;
  const currentWordCount = selectedEntry ? selectedEntry.content.split(/\s+/).filter(w => w.length > 0).length : 0;
  
  const moodIcons = {
    happy: <Smile className="w-4 h-4 text-green-500" />,
    neutral: <Meh className="w-4 h-4 text-yellow-500" />,
    sad: <Frown className="w-4 h-4 text-blue-500" />
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === "" || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === null || entry.tags.includes(filterTag);
    const matchesCategory = filterCategory === null || entry.category === filterCategory;
    const matchesFavorite = !showFavoritesOnly || entry.isFavorite;
    return matchesSearch && matchesTag && matchesCategory && matchesFavorite;
  });
  
  const exportToMarkdown = () => {
    const markdown = entries.map(entry => {
      const tags = entry.tags.map(t => `#${t}`).join(' ');
      return `# ${entry.title}\n\n**Created:** ${formatDate(entry.createdAt)}\n**Category:** ${entry.category}\n**Tags:** ${tags}\n**Mood:** ${entry.mood || 'N/A'}\n\n${entry.content}\n\n---\n\n`;
    }).join('');
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-export-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const toggleFavorite = () => {
    if (!selectedEntry) return;
    updateEntry({ isFavorite: !selectedEntry.isFavorite });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex flex-col">
      <TemplateHeader title={title} />
      <div className="flex-1 flex overflow-hidden">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Entries Sidebar */}
      <div className="w-80 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-lg"
                title="Statistics"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                onClick={exportToMarkdown}
                className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-lg"
                title="Export to Markdown"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-400 rounded-lg"
                title="Documentation"
              >
                <Info className="w-4 h-4" />
              </button>
              <button
                onClick={createEntry}
                className="p-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm outline-none"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            {/* Favorites & Category Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                  showFavoritesOnly
                    ? 'bg-amber-500 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Star className="w-3 h-3" />
                Favorites
              </button>
              {allCategories.length > 0 && (
                <select
                  value={filterCategory || ''}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                  className="flex-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs outline-none"
                >
                  <option value="">All Categories</option>
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setFilterTag(null)}
                  className={`px-2 py-1 rounded text-xs ${
                    filterTag === null
                      ? 'bg-stone-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  All Tags
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-2 py-1 rounded text-xs ${
                      filterTag === tag
                        ? 'bg-stone-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-stone-50 dark:bg-stone-900/30">
            <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-500 mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-2">
                <p className="text-xs text-neutral-500">Total Entries</p>
                <p className="text-lg font-bold text-stone-600 dark:text-stone-400">{totalEntries}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-2">
                <p className="text-xs text-neutral-500">Total Words</p>
                <p className="text-lg font-bold text-stone-600 dark:text-stone-400">{totalWords.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-2">
                <p className="text-xs text-neutral-500">Favorites</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{favoriteCount}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-2">
                <p className="text-xs text-neutral-500">Avg Words</p>
                <p className="text-lg font-bold text-stone-600 dark:text-stone-400">{totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="flex-1 overflow-auto">
          {filteredEntries.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-neutral-400 text-sm">
                {entries.length === 0 ? "No entries yet. Click + to create one." : "No matching entries."}
              </p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer group ${
                  entry.id === selectedEntryId
                    ? 'bg-stone-100 dark:bg-stone-900/30'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
                onClick={() => setSelectedEntryId(entry.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                      {entry.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate mt-1">
                      {entry.content.slice(0, 60) || 'No content...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.updatedAt)}
                      </span>
                      {entry.mood && moodIcons[entry.mood]}
                      {entry.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      {entry.tags.length > 0 && (
                        <span className="text-xs text-stone-500">
                          #{entry.tags[0]}{entry.tags.length > 1 && ` +${entry.tags.length - 1}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                    className="p-1 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {selectedEntry ? (
          <>
            {/* Entry Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  value={selectedEntry.title}
                  onChange={(e) => updateEntry({ title: e.target.value })}
                  placeholder="Entry title..."
                  className="flex-1 text-2xl font-bold text-neutral-900 dark:text-white bg-transparent border-none outline-none placeholder-neutral-300"
                />
                <button
                  onClick={toggleFavorite}
                  className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title={selectedEntry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-5 h-5 ${selectedEntry.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-neutral-400'}`} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500 flex-wrap">
                <span>Created {formatDate(selectedEntry.createdAt)} at {formatTime(selectedEntry.createdAt)}</span>
                <span>•</span>
                <span>Updated {formatDate(selectedEntry.updatedAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {currentWordCount} words
                </span>
              </div>

              {/* Category & Mood */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-500">Category:</label>
                  <select
                    value={selectedEntry.category}
                    onChange={(e) => updateEntry({ category: e.target.value })}
                    className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs outline-none"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Ideas">Ideas</option>
                    <option value="Goals">Goals</option>
                    <option value="Learning">Learning</option>
                    <option value="Travel">Travel</option>
                    <option value="Health">Health</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-neutral-500">Mood:</label>
                  <div className="flex gap-1">
                    {(['happy', 'neutral', 'sad'] as const).map(mood => (
                      <button
                        key={mood}
                        onClick={() => updateEntry({ mood: selectedEntry.mood === mood ? null : mood })}
                        className={`p-1.5 rounded ${
                          selectedEntry.mood === mood
                            ? 'bg-stone-200 dark:bg-stone-700'
                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        {moodIcons[mood]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <Tag className="w-4 h-4 text-neutral-400" />
                {selectedEntry.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded text-xs flex items-center gap-1 group"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      placeholder="tag name"
                      className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs outline-none w-20"
                      autoFocus
                    />
                    <button onClick={addTag} className="text-stone-500 text-xs">Add</button>
                    <button onClick={() => { setIsAddingTag(false); setNewTag(""); }} className="text-neutral-400 text-xs">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="px-2 py-1 border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-400 rounded text-xs hover:border-stone-400 hover:text-stone-500"
                  >
                    + Add tag
                  </button>
                )}
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-6 overflow-auto bg-stone-50 dark:bg-neutral-950">
              <div className="max-w-3xl mx-auto">
                <textarea
                  value={selectedEntry.content}
                  onChange={(e) => updateEntry({ content: e.target.value })}
                  placeholder="Start writing your thoughts...

Let your mind flow freely. This is your private space to reflect, explore ideas, and document your journey."
                  className="w-full min-h-[500px] bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 outline-none resize-none leading-relaxed placeholder-neutral-400"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
              <p className="text-neutral-400">Select an entry or create a new one</p>
              <button
                onClick={createEntry}
                className="mt-4 px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                New Entry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Documentation Modal */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-gradient-to-r from-stone-600 to-stone-700 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Journal Template Guide</h2>
                    <p className="text-stone-100 text-sm">Organize your thoughts and ideas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📝 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    The Journal Template is a streamlined writing space for capturing your thoughts, ideas, and reflections. With powerful search, tag organization, and a clean interface, it's perfect for daily journaling, note-taking, and idea management.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-800 rounded-lg p-4">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-400 mb-1">📚 Entry Management</h4>
                      <p className="text-sm text-stone-800 dark:text-stone-300">Create unlimited journal entries with titles and rich text content. Each entry is automatically timestamped.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🔍 Powerful Search</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Instantly search through all your entries by title or content. Find what you need in seconds.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🏷️ Tag Organization</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Add multiple tags to each entry for easy categorization. Filter entries by tag with one click.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">⏱️ Automatic Timestamps</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Track when entries were created and last updated. Never lose track of your timeline.</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">💾 Auto-Save</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Your work is automatically saved as you type. Never worry about losing your thoughts.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-900 dark:text-rose-400 mb-1">🗑️ Easy Deletion</h4>
                      <p className="text-sm text-rose-800 dark:text-rose-300">Remove entries you no longer need with a simple click. Keep your journal clean and organized.</p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a New Entry</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click the + button in the sidebar header to create a new journal entry.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add a Title</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Give your entry a descriptive title at the top of the editor. This helps you find it later.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Write Your Content</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use the large text area to write your thoughts, ideas, or reflections. The editor auto-saves as you type.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Tags</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "+ Add tag" to categorize your entry. Add multiple tags like #personal, #work, #ideas, etc.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Search & Filter</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use the search bar to find entries by title or content. Click tag buttons to filter by category.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-stone-600 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Manage Entries</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click any entry in the sidebar to view and edit it. Hover over entries to reveal the delete button.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interface Layout */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🖥️ Interface Layout</h3>
                  <div className="space-y-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-stone-600" />
                        Left Sidebar
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        Your entry list with search and filtering:
                      </p>
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-4">
                        <li>• Search bar for quick entry lookup</li>
                        <li>• Tag filter buttons (All, #tag1, #tag2...)</li>
                        <li>• List of all entries with previews</li>
                        <li>• Entry timestamps and tag counts</li>
                        <li>• Delete button (appears on hover)</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-stone-600" />
                        Main Editor
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        The writing space where you create and edit entries. Includes title input, timestamp display, tag management, and a large text area for your content.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags System */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🏷️ Using Tags Effectively</h3>
                  <div className="bg-gradient-to-r from-stone-50 to-neutral-50 dark:from-stone-900/20 dark:to-neutral-900/20 border border-stone-200 dark:border-stone-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Categories:</strong> Use tags like #work, #personal, #ideas to separate different types of entries</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Projects:</strong> Tag entries by project name like #project-alpha, #website-redesign</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Topics:</strong> Add topic tags like #productivity, #health, #learning for thematic organization</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Status:</strong> Track progress with tags like #todo, #in-progress, #completed</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300"><strong>Multiple Tags:</strong> Add as many tags as needed - entries can have multiple categories</p>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-stone-50 to-amber-50 dark:from-stone-900/20 dark:to-amber-900/20 border border-stone-200 dark:border-stone-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use descriptive titles</strong> - Makes searching and browsing much easier</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Tag consistently</strong> - Stick to a naming convention for your tags</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Write freely</strong> - Don't worry about perfection, just capture your thoughts</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review regularly</strong> - Use search to revisit old entries and track your progress</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Combine with search</strong> - Use tags to narrow down, then search within filtered results</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Date in titles</strong> - Consider adding dates to titles for time-based entries</p>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💼 Common Use Cases</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📔 Daily Journaling</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Capture daily thoughts, reflections, and experiences</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">💡 Idea Collection</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Store and organize creative ideas and inspirations</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📝 Meeting Notes</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Document meetings, decisions, and action items</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🎯 Goal Tracking</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Track progress on personal and professional goals</p>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📚 Learning Log</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Document what you learn and key takeaways</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🔬 Research Notes</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Organize research findings and references</p>
                    </div>
                  </div>
                </div>

                {/* Data Storage */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your journal entries are automatically saved locally.</strong> All entries, titles, content, tags, and timestamps are stored in your browser's local storage. Changes are saved automatically as you type, so you never lose your work. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-stone-600 to-stone-700 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      <TemplateFooter />
    </div>
  );
}
