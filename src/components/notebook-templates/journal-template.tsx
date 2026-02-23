"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen,
  Plus,
  Loader2,
  Tag,
  X,
  Search,
  Filter,
  Clock,
  Trash2
} from "lucide-react";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
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

  // Get all unique tags
  const allTags = [...new Set(entries.flatMap(e => e.tags))];

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === "" || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === null || entry.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950 flex">
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
            <button
              onClick={createEntry}
              className="p-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
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
                All
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
              <input
                type="text"
                value={selectedEntry.title}
                onChange={(e) => updateEntry({ title: e.target.value })}
                placeholder="Entry title..."
                className="w-full text-2xl font-bold text-neutral-900 dark:text-white bg-transparent border-none outline-none placeholder-neutral-300"
              />
              <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
                <span>Created {formatDate(selectedEntry.createdAt)} at {formatTime(selectedEntry.createdAt)}</span>
                <span>•</span>
                <span>Updated {formatDate(selectedEntry.updatedAt)}</span>
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
    </div>
  );
}
