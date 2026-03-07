"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Languages,
  Zap,
  CheckCircle,
  Loader2,
  X,
  ChevronRight,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AIAssistantPanelProps {
  selectedText: string;
  onApplySuggestion: (text: string) => void;
  onClose: () => void;
}

export function AIAssistantPanel({ selectedText, onApplySuggestion, onClose }: AIAssistantPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = [
    {
      id: 'improve',
      label: 'Improve Writing',
      icon: Wand2,
      description: 'Enhance clarity and quality',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'summarize',
      label: 'Summarize',
      icon: FileText,
      description: 'Create concise summary',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'expand',
      label: 'Expand',
      icon: Zap,
      description: 'Add more details',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'grammar',
      label: 'Check Grammar',
      icon: CheckCircle,
      description: 'Find and fix errors',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'translate',
      label: 'Translate',
      icon: Languages,
      description: 'Translate to another language',
      color: 'text-amber-600 dark:text-amber-400',
    },
  ];

  const handleAction = async (actionId: string, options?: any) => {
    setLoading(true);
    setActiveAction(actionId);
    setResult('');

    try {
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          action: actionId,
          options,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (actionId === 'grammar') {
          setResult(JSON.stringify(data.errors, null, 2));
        } else {
          setResult(data.result);
        }
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-neutral-900 shadow-2xl border-l border-neutral-200 dark:border-neutral-800 z-50 overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedText.length} characters selected
              </p>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected Text Preview */}
        <Card className="p-4 mb-6 bg-slate-50 dark:bg-neutral-800">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
            Selected Text
          </p>
          <p className="text-sm text-slate-900 dark:text-white line-clamp-4">
            {selectedText}
          </p>
        </Card>

        {/* Actions */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Quick Actions
          </p>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={loading}
                className="w-full p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className={`${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-6 text-center bg-purple-50 dark:bg-purple-900/20">
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-purple-900 dark:text-purple-100 font-medium">
              AI is processing...
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              This may take a few seconds
            </p>
          </Card>
        )}

        {/* Result */}
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Result
              </p>
              <Button
                onClick={() => setResult('')}
                variant="ghost"
                size="sm"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
              <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">
                {result}
              </p>
            </Card>

            <div className="flex gap-2">
              <Button
                onClick={() => onApplySuggestion(result)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply
              </Button>
              <Button
                onClick={() => setResult('')}
                variant="outline"
              >
                Discard
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        {!loading && !result && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Pro Tip
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Select any text in your notebook and use AI to improve, summarize, or translate it instantly.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
