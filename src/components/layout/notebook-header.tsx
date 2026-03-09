"use client";

import Link from "next/link";
import { BookOpen, Sparkles, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserButton } from "@clerk/nextjs";

interface NotebookHeaderProps {
  /** Called when AI (sparkle) is clicked — open AI Assistant panel */
  onAIClick: () => void;
  /** Called when Share is clicked — open Share modal */
  onShareClick: () => void;
  /** Called when Chat is clicked — open Chat sidebar */
  onChatClick: () => void;
  isAIActive?: boolean;
  isChatActive?: boolean;
  /** Optional notebook title to show next to logo (e.g. in book view) */
  title?: string;
  /** Optional extra actions between Chat and theme (e.g. Add page, Comments, Theme) */
  extraActions?: React.ReactNode;
}

export function NotebookHeader({
  onAIClick,
  onShareClick,
  onChatClick,
  isAIActive = false,
  isChatActive = false,
  title,
  extraActions,
}: NotebookHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex-shrink-0 w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 shrink-0"
              aria-label="Back to dashboard"
            >
              <BookOpen className="h-7 w-7 text-amber-500 sm:h-8 sm:w-8" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                SmartNotes
              </span>
            </Link>
            {title && (
              <>
                <span className="text-neutral-300 dark:text-neutral-600">|</span>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">
                  {title}
                </h1>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAIClick}
              className={isAIActive ? "bg-purple-100 dark:bg-purple-900/30" : ""}
              title="AI Assistant"
              aria-label="Open AI Assistant"
            >
              <Sparkles className="h-5 w-5 text-purple-500" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onShareClick}
              title="Share notebook"
              aria-label="Share notebook"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onChatClick}
              className={isChatActive ? "bg-amber-100 dark:bg-amber-900/30" : ""}
              title="Chat"
              aria-label="Open chat"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            {extraActions}
            <div className="hidden sm:block w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
            <ThemeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
}
