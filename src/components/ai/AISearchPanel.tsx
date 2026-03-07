"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, Send, BookOpen, FileText,
  X, Loader2, ArrowRight, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SearchResult {
  _id: string;
  notebookId: string;
  notebookTitle: string;
  pageNumber: number;
  title: string;
  snippet: string;
}

interface AskResult {
  answer: string;
  sources: { title: string; notebookId: string; pageNumber: number }[];
}

export function AISearchPanel() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"search" | "ask">("search");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setSearchResults([]);
    setAskResult(null);

    try {
      if (mode === "search") {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } else {
        const res = await fetch("/api/ai/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: query }),
        });
        if (res.ok) {
          const data = await res.json();
          setAskResult({ answer: data.answer, sources: data.sources || [] });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery("");
    setSearchResults([]);
    setAskResult(null);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Mode toggle + input */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-fit">
          <button
            onClick={() => { setMode("search"); clear(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === "search"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
          <button
            onClick={() => { setMode("ask"); clear(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              mode === "ask"
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Ask AI
          </button>
        </div>

        <div className="relative flex items-center">
          {mode === "search"
            ? <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
            : <MessageSquare className="absolute left-3 w-4 h-4 text-purple-500 pointer-events-none" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={
              mode === "search"
                ? "Search across all notebooks…"
                : "Ask a question about your notes…"
            }
            className="w-full pl-10 pr-20 py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query && (
              <button onClick={clear} className="p-1.5 text-neutral-400 hover:text-neutral-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white px-3"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3 py-8 mt-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl"
          >
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {mode === "ask" ? "AI is reading your notes…" : "Searching…"}
            </span>
          </motion.div>
        )}

        {/* Keyword search results */}
        {!loading && mode === "search" && hasSearched && (
          <motion.div
            key="search-results"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 space-y-2"
          >
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No results found for "{query}"</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                </p>
                {searchResults.map(result => (
                  <button
                    key={result._id}
                    onClick={() => router.push(`/dashboard/notebook/${result.notebookId}?page=${result.pageNumber}`)}
                    className="w-full text-left p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-600 bg-white dark:bg-neutral-800 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 truncate">
                            {result.notebookTitle}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs text-neutral-400">p.{result.pageNumber}</span>
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{result.title || "Untitled"}</p>
                        {result.snippet && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">…{result.snippet}…</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* AI ask result */}
        {!loading && mode === "ask" && askResult && (
          <motion.div
            key="ask-result"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 space-y-3"
          >
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">AI Answer</span>
              </div>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                {askResult.answer}
              </p>
            </div>

            {askResult.sources.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Sources</p>
                <div className="space-y-1.5">
                  {askResult.sources.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => router.push(`/dashboard/notebook/${s.notebookId}?page=${s.pageNumber}`)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-amber-300 bg-white dark:bg-neutral-800 text-left transition-all group"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate flex-1">{s.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
