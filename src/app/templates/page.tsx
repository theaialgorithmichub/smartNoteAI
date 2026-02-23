"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowLeft,
  Eye
} from "lucide-react";
import { TemplateSelector } from "@/components/notebook-templates";
import { MeetingNotesTemplate } from "@/components/notebook-templates/meeting-notes-template";
import { DocumentTemplate } from "@/components/notebook-templates/document-template";
import { DashboardTemplate } from "@/components/notebook-templates/dashboard-template";
import { CodeNotebookTemplate } from "@/components/notebook-templates/code-notebook-template";
import { PlannerTemplate } from "@/components/notebook-templates/planner-template";
import { AIResearchTemplate } from "@/components/notebook-templates/ai-research-template";
import { NotebookTemplateType } from "@/types/notebook-templates";

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<NotebookTemplateType | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NotebookTemplateType | null>(null);

  const handleSelectTemplate = (templateId: NotebookTemplateType) => {
    setSelectedTemplate(templateId);
  };

  const renderTemplatePreview = (templateId: NotebookTemplateType) => {
    switch (templateId) {
      case 'meeting-notes':
        return <MeetingNotesTemplate title="Product Team Meeting" />;
      case 'document':
        return <DocumentTemplate title="Sales and Growth Review / Q1 2024" />;
      case 'dashboard':
        return <DashboardTemplate />;
      case 'code-notebook':
        return <CodeNotebookTemplate title="Untitled Notebook" />;
      case 'planner':
        return <PlannerTemplate title="Interview: AI Use Cases In Design 🎨" />;
      case 'ai-research':
        return <AIResearchTemplate />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Simple Notebook
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400">
                Classic flip-style notebook with pages you can turn
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-amber-500" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                Notebook Templates
              </span>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {!previewTemplate ? (
          <>
            <TemplateSelector 
              onSelect={handleSelectTemplate} 
              selectedTemplate={selectedTemplate || undefined}
            />

            {/* Preview Button */}
            {selectedTemplate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4"
              >
                <button
                  onClick={() => setPreviewTemplate(selectedTemplate)}
                  className="px-6 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg text-neutral-900 dark:text-white font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview Template
                </button>
                <Link
                  href={`/dashboard?template=${selectedTemplate}`}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Create Notebook
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          <>
            {/* Preview Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Templates</span>
                </button>
                <Link
                  href={`/dashboard?template=${previewTemplate}`}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Use This Template
                </Link>
              </div>
            </div>

            {/* Template Preview */}
            <div className="border-t border-neutral-200 dark:border-neutral-800">
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewTemplate}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[calc(100vh-200px)]"
                >
                  {renderTemplatePreview(previewTemplate)}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
