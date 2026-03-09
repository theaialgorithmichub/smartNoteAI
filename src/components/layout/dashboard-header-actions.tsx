"use client";

import { useState } from "react";
import { Sparkles, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIToolbar } from "@/components/ai/AIToolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * AI, Share, and Chat as buttons for the dashboard/main header.
 * They open panels or info modals instead of navigating.
 */
export function DashboardHeaderActions() {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [shareInfoOpen, setShareInfoOpen] = useState(false);
  const [chatInfoOpen, setChatInfoOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsAIOpen(true)}
          className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          title="AI Assistant"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setShareInfoOpen(true)}
          title="Share notebook"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setChatInfoOpen(true)}
          title="Chat"
          aria-label="Chat"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>

      {/* AI Assistant — works without a notebook (general writing help) */}
      {isAIOpen && (
        <AIToolbar
          selectedText=""
          notebookId={undefined}
          notebookTitle={undefined}
          onApply={() => setIsAIOpen(false)}
          onClose={() => setIsAIOpen(false)}
        />
      )}

      <Dialog open={shareInfoOpen} onOpenChange={setShareInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share a notebook</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Open a notebook from your dashboard, then use the Share icon in the
            notebook header to create and manage share links.
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={chatInfoOpen} onOpenChange={setChatInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat about your notebook</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Open a notebook from your dashboard, then use the Chat icon in the
            notebook header to ask questions and get summaries about that
            notebook.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
