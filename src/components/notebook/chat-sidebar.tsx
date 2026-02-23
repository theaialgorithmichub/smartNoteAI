"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  X, Send, Bot, User, Loader2, Sparkles, Globe,
  Search, PenLine, SpellCheck, BookOpen, FileText,
  Wand2, Copy, Check, ArrowRight, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Mode = "chat" | "write" | "search" | "correct"

interface Source {
  pageNumber: number
  title: string
  snippet: string
}

interface WrittenPage {
  pageNumber: number
  title: string
  content: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
  writtenPages?: WrittenPage[]
  corrected?: string
  navigateTo?: number
}

interface Page {
  _id: string
  pageNumber: number
  title: string
  content: string
}

interface ChatSidebarProps {
  open: boolean
  onClose: () => void
  notebookId: string
  pages: Page[]
  onNavigateToPage?: (pageNumber: number) => void
  onWriteToPage?: (pageNumber: number, content: string, title?: string) => void
}

const MODES: { id: Mode; icon: any; label: string; color: string; placeholder: string; desc: string }[] = [
  { id: "chat",    icon: Sparkles,   label: "Chat",    color: "amber",  placeholder: "Ask anything about your notebook...",          desc: "Ask questions, get summaries, explore your notes" },
  { id: "write",   icon: PenLine,    label: "Write",   color: "violet", placeholder: "Write a story about a rabbit and tortoise...", desc: "Generate content and write it into notebook pages" },
  { id: "search",  icon: Search,     label: "Search",  color: "blue",   placeholder: "Find where I wrote about...",                  desc: "Find any text and navigate to the right page" },
  { id: "correct", icon: SpellCheck, label: "Correct", color: "green",  placeholder: "Fix grammar on page 2, or paste text here...", desc: "Fix grammar and spelling in your notes" },
]

const QUICK_PROMPTS: { icon: any; label: string; prompt: string; mode: Mode }[] = [
  { icon: PenLine,    label: "Write a story",      prompt: "Write a short story about ",                mode: "write"   },
  { icon: Search,     label: "Find in notebook",   prompt: "Find where I wrote about ",                mode: "search"  },
  { icon: SpellCheck, label: "Fix grammar",        prompt: "Correct the grammar and spelling on page ", mode: "correct" },
  { icon: Sparkles,   label: "Summarize notebook", prompt: "Summarize the content of this notebook",    mode: "chat"    },
]

export function ChatSidebar({ open, onClose, notebookId, pages, onNavigateToPage, onWriteToPage }: ChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>("chat")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          message: text,
          mode,
          context: pages.map((p) => ({ pageNumber: p.pageNumber, title: p.title, content: p.content })),
        }),
      })
      const data = await res.json()
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that.",
        sources: data.sources,
        writtenPages: data.writtenPages,
        corrected: data.corrected,
        navigateTo: data.navigateTo,
      }
      setMessages((prev) => [...prev, assistantMsg])
      if (data.navigateTo && onNavigateToPage) onNavigateToPage(data.navigateTo)
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const currentMode = MODES.find((m) => m.id === mode)!

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="w-full h-full flex flex-col bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl"
    >
      {/* Gradient Header */}
      <div className="flex-shrink-0 px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base leading-tight">AI Assistant</h2>
            <p className="text-white/70 text-xs">{pages.length} pages in notebook</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="flex-shrink-0 p-3 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="grid grid-cols-4 gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
          {MODES.map((m) => {
            const Icon = m.icon
            const active = mode === m.id
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[11px] font-medium transition-all overflow-hidden ${
                  active
                    ? "bg-white dark:bg-neutral-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-2">{currentMode.desc}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-4 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-3 shadow-inner">
              <Wand2 className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              {currentMode.label === "Chat" && "Ask about your notebook"}
              {currentMode.label === "Write" && "Generate content for pages"}
              {currentMode.label === "Search" && "Search notebook content"}
              {currentMode.label === "Correct" && "Fix grammar & spelling"}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mb-5 max-w-[260px]">{currentMode.desc}</p>
            <div className="w-full space-y-2">
              {QUICK_PROMPTS.map((qp) => {
                const Icon = qp.icon
                return (
                  <button
                    key={qp.label}
                    onClick={() => { setMode(qp.mode); setInput(qp.prompt); textareaRef.current?.focus() }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-neutral-200 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-200 transition-colors">
                      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="flex-1 text-sm text-neutral-600 dark:text-neutral-300 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">{qp.label}</span>
                    <ChevronRight className="h-4 w-4 text-neutral-300 dark:text-neutral-600 group-hover:text-amber-400 transition-colors" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              {/* Main bubble */}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-tr-sm shadow-md"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-sm"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Search source cards */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="w-full space-y-1.5">
                  <p className="text-xs font-medium text-neutral-400 px-1">Found in notebook:</p>
                  {msg.sources.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigateToPage?.(src.pageNumber)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-200 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Page {src.pageNumber}{src.title ? ` · ${src.title}` : ""}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 truncate mt-0.5">{src.snippet}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}

              {/* Written pages cards */}
              {msg.writtenPages && msg.writtenPages.length > 0 && (
                <div className="w-full space-y-2">
                  <p className="text-xs font-medium text-neutral-400 px-1">Generated content:</p>
                  {msg.writtenPages.map((wp, i) => (
                    <div key={i} className="rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-violet-100 dark:bg-violet-900/30 border-b border-violet-200 dark:border-violet-800">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                          <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Page {wp.pageNumber}{wp.title ? ` · ${wp.title}` : ""}</span>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => copyText(wp.content, `wp-${i}`)} className="p-1 rounded-md hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors" title="Copy">
                            {copiedId === `wp-${i}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-violet-500" />}
                          </button>
                          {onWriteToPage && (
                            <button onClick={() => onWriteToPage(wp.pageNumber, wp.content, wp.title)} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-xs transition-colors">
                              <PenLine className="h-3 w-3" /> Write to page
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="px-3 py-2 text-xs text-violet-700 dark:text-violet-300 line-clamp-4 whitespace-pre-wrap">{wp.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Corrected text card */}
              {msg.corrected && (
                <div className="w-full rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <SpellCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">Corrected text</span>
                    </div>
                    <button onClick={() => copyText(msg.corrected!, "corrected")} className="p-1 rounded-md hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                      {copiedId === "corrected" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-green-500" />}
                    </button>
                  </div>
                  <p className="px-3 py-2 text-xs text-green-700 dark:text-green-300 whitespace-pre-wrap">{msg.corrected}</p>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Loader2 className="h-4 w-4 text-white animate-spin" />
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex gap-2 items-end bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 focus-within:border-amber-400 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-100 dark:focus-within:ring-amber-900/30 transition-all px-4 py-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentMode.placeholder}
            rows={2}
            className="flex-1 resize-none bg-transparent text-sm text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none leading-relaxed"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-all shadow-sm hover:shadow-md"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </motion.div>
  )
}
