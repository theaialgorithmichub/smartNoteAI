"use client";

import { useState, useRef, useCallback } from "react";
import { useStorage, useMutation, useSelf, useOthers } from "@/liveblocks.config";
import { MessageSquare, Send, Trash2, X, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Comment } from "@/liveblocks.config";

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
}

function renderTextWithMentions(text: string) {
  const parts = text.split(/(@\w[\w\s]*)/g);
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className="text-amber-500 font-semibold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export function CommentsPanel({ isOpen, onClose, currentPage, notebookId }: CommentsPanelProps & { notebookId?: string }) {
  const [text, setText] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const self = useSelf();
  const others = useOthers();
  const comments = useStorage((root) => root.comments);

  const presentUsers = others.map(o => ({ id: o.id, name: o.info?.name || 'Unknown', color: o.info?.color || '#6B7280' }));
  const mentionSuggestions = mentionQuery !== null
    ? presentUsers.filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : [];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    const cursor = e.target.selectionStart;
    const before = val.slice(0, cursor);
    const match = before.match(/@([\w\s]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[0].length);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (name: string) => {
    const before = text.slice(0, mentionStart);
    const after = text.slice(textareaRef.current?.selectionStart ?? mentionStart + (mentionQuery?.length ?? 0) + 1);
    const newText = before + `@${name} ` + after;
    setText(newText);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const addComment = useMutation(({ storage }) => {
    if (!text.trim() || !self) return;
    const trimmed = text.trim();
    const comment: Comment = {
      id: Date.now().toString(),
      userId: self.id,
      userName: self.info?.name || "Anonymous",
      userColor: self.info?.color || "#6B7280",
      text: trimmed,
      pageNumber: currentPage,
      createdAt: new Date().toISOString(),
    };
    storage.get("comments").push(comment);
    setText("");
    setMentionQuery(null);
    // Fire notifications for any @mentioned users (non-blocking)
    const mentioned = [...trimmed.matchAll(/@(\w[\w\s]*)/g)].map(m => m[1].trim());
    if (mentioned.length > 0 && notebookId) {
      fetch('/api/collaboration/mention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentionedNames: mentioned, notebookId, commentText: trimmed }),
      }).catch(() => {});
    }
  }, [text, currentPage, self, notebookId]);

  const deleteComment = useMutation(({ storage }, id: string) => {
    const list = storage.get("comments");
    const index = list.findIndex((c) => c.id === id);
    if (index !== -1) list.delete(index);
  }, []);

  const pageComments = comments
    ? Array.from(comments).filter((c) => c.pageNumber === currentPage)
    : [];

  if (!isOpen) return null;

  return (
    <div className="w-80 flex-shrink-0 h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-700 flex flex-col z-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
            Comments — Page {currentPage}
          </h3>
        </div>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pageComments.length === 0 ? (
          <div className="text-center py-10">
            <MessageSquare className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No comments on this page yet
            </p>
          </div>
        ) : (
          pageComments.map((comment) => (
            <div key={comment.id} className="group flex gap-2">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: comment.userColor }}
              >
                {comment.userName[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {comment.userName}
                    {self?.id === comment.userId && (
                      <span className="ml-1 text-neutral-400 font-normal">(you)</span>
                    )}
                  </span>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">
                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 break-words">
                  {renderTextWithMentions(comment.text)}
                </p>
              </div>
              {self?.id === comment.userId && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500 flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
        {/* @mention suggestions dropdown */}
        {mentionSuggestions.length > 0 && (
          <div className="mb-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
            {mentionSuggestions.map(u => (
              <button
                key={u.id}
                onMouseDown={(e) => { e.preventDefault(); insertMention(u.name); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: u.color }}>
                  {u.name[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-neutral-900 dark:text-white">{u.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setMentionQuery(null); return; }
              if (mentionSuggestions.length > 0 && (e.key === "Enter" || e.key === "Tab")) {
                e.preventDefault();
                insertMention(mentionSuggestions[0].name);
                return;
              }
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addComment();
              }
            }}
            placeholder="Add a comment… type @ to mention"
            className="flex-1 resize-none text-sm p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            rows={2}
          />
          <Button
            onClick={addComment}
            disabled={!text.trim()}
            size="sm"
            className="self-end bg-amber-500 hover:bg-amber-600 text-white px-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">Enter to send, Shift+Enter for newline</p>
      </div>
    </div>
  );
}
