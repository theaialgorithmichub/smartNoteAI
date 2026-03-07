"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Wand2, FileText, Zap, CheckCircle, Languages,
  List, Tag, X, Loader2, ChevronRight, Copy, Check, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIToolbarProps {
  selectedText: string;
  onApply: (text: string) => void;
  onClose: () => void;
  notebookId?: string;
  currentPageContent?: string;
  notebookTitle?: string;
}

type ActionId = "improve" | "summarize" | "expand" | "grammar" | "tone" | "translate" | "outline" | "auto-tag";

const ACTIONS = [
  { id: "improve",   label: "Improve Writing", icon: Wand2,        desc: "Enhance clarity & quality",       color: "text-blue-500"   },
  { id: "summarize", label: "Summarize",        icon: FileText,     desc: "Create concise summary",          color: "text-green-500"  },
  { id: "expand",    label: "Expand",           icon: Zap,          desc: "Add more detail",                 color: "text-purple-500" },
  { id: "grammar",   label: "Check Grammar",    icon: CheckCircle,  desc: "Find & fix errors",               color: "text-red-500"    },
  { id: "translate", label: "Translate",        icon: Languages,    desc: "Translate to another language",   color: "text-amber-500"  },
  { id: "outline",   label: "Generate Outline", icon: List,         desc: "Create outline from topic",       color: "text-cyan-500"   },
  { id: "auto-tag",  label: "Auto-tag",         icon: Tag,          desc: "Suggest tags & category",         color: "text-pink-500"   },
] as const;

export function AIToolbar({
  selectedText,
  onApply,
  onClose,
  notebookId,
  currentPageContent,
  notebookTitle,
}: AIToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [result, setResult] = useState<string>("");
  const [extraInput, setExtraInput] = useState("");
  const [copied, setCopied] = useState(false);

  const workingText = selectedText || currentPageContent || "";

  const runAction = async (id: ActionId) => {
    if (!workingText.trim() && id !== "outline" && id !== "auto-tag") return;
    setLoading(true);
    setActiveAction(id);
    setResult("");

    try {
      if (id === "outline") {
        const topic = extraInput.trim() || workingText.trim() || notebookTitle || "General topic";
        const res = await fetch("/api/ai/outline", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, sections: 6 }),
        });
        const data = await res.json();
        if (res.ok) setResult((data.outline as string[]).map((s, i) => `${i + 1}. ${s}`).join("\n"));
        else setResult(`Error: ${data.error}`);
        return;
      }

      if (id === "auto-tag") {
        const res = await fetch("/api/ai/auto-tag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notebookId,
            title: notebookTitle,
            content: workingText,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setResult(
            `Tags: ${data.tags.join(", ")}\nCategory: ${data.category}\n\nSummary: ${data.summary}`
          );
        } else setResult(`Error: ${data.error}`);
        return;
      }

      // All other actions go to /api/ai/improve
      const options: Record<string, any> = {};
      if (id === "translate") options.targetLanguage = extraInput || "Spanish";
      if (id === "tone") options.targetTone = extraInput || "professional";

      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: workingText, action: id, options }),
      });
      const data = await res.json();
      if (res.ok) {
        if (id === "grammar") {
          const errors = data.errors || [];
          setResult(
            errors.length === 0
              ? "No grammar issues found! Your writing looks great."
              : errors.map((e: any) => `• ${e.original} → ${e.suggestion}\n  ${e.explanation}`).join("\n\n")
          );
        } else {
          setResult(data.result || "");
        }
      } else {
        setResult(`Error: ${data.error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const needsInput = (id: ActionId) => id === "translate" || id === "outline";

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.2 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 z-50 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">AI Assistant</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {selectedText ? `${selectedText.length} chars selected` : "Full page mode"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Selected text preview */}
        {selectedText && (
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">Selected text</p>
            <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-3">{selectedText}</p>
          </div>
        )}

        {/* Actions grid */}
        <div className="space-y-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.id}>
                <button
                  onClick={() => needsInput(action.id as ActionId) ? setActiveAction(action.id as ActionId) : runAction(action.id as ActionId)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left disabled:opacity-50 ${
                    activeAction === action.id
                      ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-purple-300 bg-white dark:bg-neutral-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{action.desc}</p>
                  </div>
                  {loading && activeAction === action.id
                    ? <Loader2 className="w-4 h-4 animate-spin text-purple-500 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  }
                </button>

                {/* Inline extra input for translate / outline */}
                {activeAction === action.id && needsInput(action.id as ActionId) && !loading && !result && (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={extraInput}
                      onChange={e => setExtraInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && runAction(action.id as ActionId)}
                      placeholder={action.id === "translate" ? "Target language (e.g. French)" : "Topic to outline"}
                      className="flex-1 text-sm px-3 py-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <Button size="sm" onClick={() => runAction(action.id as ActionId)} className="bg-purple-500 hover:bg-purple-600 text-white">
                      Go
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-3 py-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">AI is thinking…</span>
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Result</p>
                <button onClick={() => { setResult(""); setActiveAction(null); }} className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
                <p className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap leading-relaxed">{result}</p>
              </div>
              <div className="flex gap-2">
                {activeAction !== "grammar" && activeAction !== "auto-tag" && (
                  <Button
                    onClick={() => onApply(result)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
                    size="sm"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Apply
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={copyResult} className="flex-1">
                  {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
