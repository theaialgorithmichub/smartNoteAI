"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateFooter } from './template-footer';
import {
  Plus, Globe, FileText, Brain, Send, X, Loader2, Trash2,
  Copy, Link, Youtube, BookOpen, Pencil, ChevronDown, ChevronRight,
  Check, StickyNote, MessageSquare, FolderOpen, PanelLeft, Sparkles,
  AlertCircle, ExternalLink, Hash, Info,
} from "lucide-react";

//  Types 

interface SourceSection { heading: string; content: string; }

interface Source {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "web" | "document" | "text";
  rawContent: string;
  summary: string;
  sections: SourceSection[];
  keyPoints: string[];
  selected: boolean;
  summarizing: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ResearchNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Research {
  id: string;
  title: string;
  description: string;
  sources: Source[];
  notes: ResearchNote[];
  chat: ChatMessage[];
  createdAt: string;
}

interface AIResearchTemplateProps { title: string; notebookId?: string; }

//  Helpers 

const makeId = () => Date.now().toString() + Math.random().toString(36).slice(2, 7);

const isYouTube = (url: string) => /youtube\.com|youtu\.be/i.test(url);
const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

const makeSource = (): Source => ({
  id: makeId(), title: "", url: "", type: "text", rawContent: "",
  summary: "", sections: [], keyPoints: [], selected: true, summarizing: false,
});

const makeNote = (): ResearchNote => ({
  id: makeId(), title: "Untitled Note", content: "", createdAt: new Date().toISOString(),
});

const makeResearch = (): Research => ({
  id: makeId(), title: "New Research", description: "", sources: [], notes: [], chat: [],
  createdAt: new Date().toISOString(),
});

const SOURCE_ICONS: Record<string, any> = { youtube: Youtube, web: Globe, document: FileText, text: FileText };
const SOURCE_COLORS: Record<string, string> = {
  youtube: "text-red-500 bg-red-50 dark:bg-red-900/20",
  web: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  document: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  text: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
};

//  Source Summary View 

function SourceSummaryView({ source }: { source: Source }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  if (!source.summary && source.sections.length === 0) return null;
  return (
    <div className="mt-3 space-y-3">
      {source.summary && (
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50 dark:bg-neutral-800/60 rounded-xl p-3">{source.summary}</p>
      )}
      {source.keyPoints.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3">
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">Key Points</p>
          <ul className="space-y-1">
            {source.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5"/>
                {kp}
              </li>
            ))}
          </ul>
        </div>
      )}
      {source.sections.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">Sections</p>
          {source.sections.map((sec, i) => (
            <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === sec.heading ? null : sec.heading)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <span>{sec.heading}</span>
                {expanded === sec.heading ? <ChevronDown className="w-3 h-3 text-neutral-400"/> : <ChevronRight className="w-3 h-3 text-neutral-400"/>}
              </button>
              <AnimatePresence>
                {expanded === sec.heading && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.15}}
                    className="px-3 pb-3 overflow-hidden">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{sec.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//  Add Source Panel 

function AddSourcePanel({ onAdd, onCancel }: { onAdd: (s: Source) => void; onCancel: () => void; }) {
  const [input, setInput] = useState("");
  const [type, setType] = useState<Source["type"]>("text");
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");

  const detect = (val: string) => {
    if (isYouTube(val)) return "youtube";
    if (isUrl(val)) return "web";
    return type;
  };

  const handleAdd = async () => {
    if (!input.trim()) return;
    setError("");
    const detectedType = detect(input.trim());
    const shouldSummarize = isUrl(input.trim()) || isYouTube(input.trim());

    if (shouldSummarize) {
      setSummarizing(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input.trim(), mode: "summarize", context: [] }),
        });
        const data = await res.json();
        const src: Source = {
          id: makeId(), title: data.title || input.trim(), url: input.trim(),
          type: data.sourceType || detectedType, rawContent: input.trim(),
          summary: data.summary || "", sections: data.sections || [],
          keyPoints: data.keyPoints || [], selected: true, summarizing: false,
        };
        onAdd(src);
      } catch {
        setError("Failed to summarize. Adding as plain source.");
        const src: Source = { id: makeId(), title: input.trim(), url: input.trim(), type: detectedType, rawContent: input.trim(), summary: "", sections: [], keyPoints: [], selected: true, summarizing: false };
        onAdd(src);
      } finally { setSummarizing(false); }
    } else {
      const src: Source = { id: makeId(), title: input.slice(0, 60) || "Text Source", url: "", type: "text", rawContent: input.trim(), summary: "", sections: [], keyPoints: [], selected: true, summarizing: false };
      onAdd(src);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-lg space-y-3">
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Add Source</p>
      <textarea value={input} onChange={e => { setInput(e.target.value); setType(detect(e.target.value)); }} autoFocus
        placeholder={"Paste a YouTube URL, web URL, or text content...\n\nhttps://youtube.com/watch?v=...\nhttps://example.com/article\nOr paste raw text"}
        className="w-full px-3 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none resize-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400" rows={4}/>
      {/* Type badges */}
      <div className="flex gap-2 flex-wrap">
        {(["youtube","web","document","text"] as Source["type"][]).map(t => {
          const Icon = SOURCE_ICONS[t];
          return (
            <button key={t} onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${type===t ? SOURCE_COLORS[t]+" ring-1 ring-current" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}>
              <Icon className="w-3 h-3"/>{t}
            </button>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={summarizing || !input.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
          {summarizing ? <><Loader2 className="w-3.5 h-3.5 animate-spin"/>Summarizing...</> : <><Sparkles className="w-3.5 h-3.5"/>Add & Summarize</>}
        </button>
        <button onClick={onCancel} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-xl text-sm">Cancel</button>
      </div>
    </div>
  );
}

//  Main Component 

export function AIResearchTemplate({ title, notebookId }: AIResearchTemplateProps) {
  const [researches, setResearches] = useState<Research[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [panel, setPanel] = useState<"sources" | "chat" | "notes">("sources");
  const [addingSource, setAddingSource] = useState(false);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [creatingResearch, setCreatingResearch] = useState(false);
  const [newResearchTitle, setNewResearchTitle] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const pageIdRef = useRef<string | null>(null);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const active = researches.find(r => r.id === activeId) ?? null;
  const activeNote = active?.notes.find(n => n.id === activeNoteId) ?? null;

  // Load
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__ai_research_template__");
        console.log('[AI RESEARCH] Loading data:', { existing, content: existing?.content });
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const parsed: Research[] = JSON.parse(existing.content || "[]");
            console.log('[AI RESEARCH] Parsed data:', parsed);
            const list = Array.isArray(parsed) ? parsed : [];
            // Check if content is valid
            if (existing.content && existing.content.trim() && list.length >= 0) {
              setResearches(list);
              if (list.length > 0) { setActiveId(list[0].id); setActiveNoteId(list[0].notes[0]?.id ?? null); }
              setLoading(false);
              return;
            }
            // If content is empty or corrupted, delete and recreate
            console.log('[AI RESEARCH] Empty/corrupted content detected, recreating page...');
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: "DELETE" });
          } catch (err) {
            console.error('[AI RESEARCH] Parse error:', err);
            // Delete corrupted page
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: "DELETE" });
          }
        }
        // Create new page
        const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__ai_research_template__", content: "[]" }),
        });
        const created = await cr.json();
        console.log('[AI RESEARCH] Created new page:', created);
        pageIdRef.current = created.page?._id ?? null;
      } catch (err) { console.error("Load failed:", err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  // Keep a ref always pointing at latest researches for the save effect
  const researchesRef = useRef<Research[]>(researches);
  useEffect(() => { researchesRef.current = researches; }, [researches]);

  // Debounced DB save — triggered by any state change via the effect below
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  useEffect(() => {
    if (saveVersion === 0 || !notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current; if (!pid) return;
      setSaving(true);
      console.log('[AI RESEARCH] Saving data:', researchesRef.current);
      try {
        const payload = { title: "__ai_research_template__", content: JSON.stringify(researchesRef.current) };
        console.log('[AI RESEARCH] Save payload:', payload);
        const response = await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log('[AI RESEARCH] Save response:', result);
        console.log('[AI RESEARCH] Saved page content:', result.page?.content);
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1200);
  }, [saveVersion, notebookId]);

  // setAndSave: update state + trigger save
  const setAndSave = useCallback((list: Research[]) => {
    setResearches(list);
    researchesRef.current = list;
    bumpSave();
  }, [bumpSave]);

  // updateActive: always uses functional updater — never stale
  const updateActive = useCallback((updater: Partial<Research> | ((r: Research) => Research)) => {
    setResearches(prev => {
      const next = prev.map(r => {
        if (r.id !== activeId) return r;
        return typeof updater === "function" ? updater(r) : { ...r, ...updater };
      });
      researchesRef.current = next;
      return next;
    });
    bumpSave();
  }, [activeId, bumpSave]);

  // Research CRUD
  const createResearch = () => {
    if (!newResearchTitle.trim()) return;
    const r = { ...makeResearch(), title: newResearchTitle.trim() };
    const next = [r, ...researches];
    setAndSave(next); setActiveId(r.id); setActiveNoteId(null);
    setCreatingResearch(false); setNewResearchTitle("");
  };
  const deleteResearch = (id: string) => {
    const next = researches.filter(r => r.id !== id);
    setAndSave(next);
    setConfirmDeleteId(null);
    if (activeId === id) { setActiveId(next[0]?.id ?? null); setActiveNoteId(null); }
  };

  // Source helpers — use functional updater to avoid stale active
  const addSource = (src: Source) => {
    updateActive(r => ({ ...r, sources: [...r.sources, src] }));
    setActiveSourceId(src.id); setAddingSource(false); setPanel("sources");
  };
  const removeSource = (id: string) => {
    updateActive(r => ({ ...r, sources: r.sources.filter(s => s.id !== id) }));
    if (activeSourceId === id) setActiveSourceId(null);
  };
  const toggleSource = (id: string) => {
    updateActive(r => ({ ...r, sources: r.sources.map(s => s.id === id ? { ...s, selected: !s.selected } : s) }));
  };

  // Note helpers — use functional updater to avoid stale active
  const addNote = () => {
    const n = makeNote();
    updateActive(r => ({ ...r, notes: [...r.notes, n] }));
    setActiveNoteId(n.id); setPanel("notes");
  };
  const updateNote = (id: string, patch: Partial<ResearchNote>) => {
    updateActive(r => ({ ...r, notes: r.notes.map(n => n.id === id ? { ...n, ...patch } : n) }));
  };
  const deleteNote = (id: string) => {
    updateActive(r => {
      const notes = r.notes.filter(n => n.id !== id);
      if (activeNoteId === id) setActiveNoteId(notes[0]?.id ?? null);
      return { ...r, notes };
    });
  };

  // Chat
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading || !active) return;
    const userMsg: ChatMessage = { id: makeId(), role: "user", content: chatInput.trim() };
    // Snapshot current active state from ref to avoid stale closure
    const currentActive = researchesRef.current.find(r => r.id === activeId);
    if (!currentActive) { setChatLoading(false); return; }
    const updatedChat = [...currentActive.chat, userMsg];
    updateActive(r => ({ ...r, chat: updatedChat }));
    setChatInput(""); setChatLoading(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const selectedSources = currentActive.sources.filter(s => s.selected);
      const context = selectedSources.map((s, i) => ({
        pageNumber: i + 1, title: s.title,
        content: [s.summary, ...s.sections.map(sec => sec.heading + ": " + sec.content), s.rawContent].join("\n"),
      }));
      const history = updatedChat.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, mode: "research_chat", context, history, notebookId }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: makeId(), role: "assistant", content: data.response || "No response." };
      updateActive(r => ({ ...r, chat: [...r.chat.filter(m => m.id !== userMsg.id), userMsg, aiMsg] }));
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      updateActive(r => ({ ...r, chat: [...r.chat, { id: makeId(), role: "assistant", content: "Sorry, something went wrong. Please try again." }] }));
    } finally { setChatLoading(false); }
  };

  const addChatToNote = (content: string) => {
    if (activeNote) {
      updateNote(activeNote.id, { content: activeNote.content + (activeNote.content ? "\n\n" : "") + content });
    } else {
      const n = { ...makeNote(), content };
      updateActive(r => ({ ...r, notes: [...r.notes, n] }));
      setActiveNoteId(n.id);
    }
    setPanel("notes");
  };

  if (loading) return (
    <div className="h-full min-h-0 flex flex-col bg-white dark:bg-neutral-950">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
      </div>
      <TemplateFooter />
    </div>
  );
  return (
    <div className="h-full min-h-0 flex flex-col bg-white dark:bg-neutral-950">
      <div className="flex-1 min-h-0 flex overflow-hidden">

      {/* Research Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside initial={{width:0,opacity:0}} animate={{width:240,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}}
            className="flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white"/>
                </div>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">Research</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCreatingResearch(true)} title="New Research"
                  className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-400 hover:text-blue-500 transition-colors">
                  <Plus className="w-4 h-4"/>
                </button>
                <button onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                  <PanelLeft className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 min-h-0">
              {creatingResearch && (
                <div className="mx-2 mb-2 p-3 bg-white dark:bg-neutral-800 rounded-xl border border-blue-200 dark:border-blue-800/50 space-y-2">
                  <p className="text-xs font-bold text-blue-500">New Research</p>
                  <input value={newResearchTitle} onChange={e => setNewResearchTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && createResearch()} placeholder="Research title..." autoFocus
                    className="w-full px-2 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg outline-none text-neutral-800 dark:text-neutral-200"/>
                  <div className="flex gap-2">
                    <button onClick={createResearch} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">Create</button>
                    <button onClick={() => { setCreatingResearch(false); setNewResearchTitle(""); }}
                      className="flex-1 py-1.5 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              )}

              {researches.length === 0 && !creatingResearch && (
                <div className="px-4 py-8 text-center">
                  <Brain className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2"/>
                  <p className="text-xs text-neutral-400">No research yet</p>
                  <button onClick={() => setCreatingResearch(true)} className="mt-2 text-xs text-blue-500 font-medium">+ Create one</button>
                </div>
              )}

              {researches.map(r => (
                <div key={r.id}
                  className={`group mx-2 mb-1 rounded-xl transition-all cursor-pointer ${r.id === activeId ? "bg-white dark:bg-neutral-800 shadow-sm" : "hover:bg-white/60 dark:hover:bg-neutral-800/50"}`}
                  onClick={() => { setActiveId(r.id); setActiveNoteId(r.notes[0]?.id ?? null); }}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Hash className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"/>
                    {renamingId === r.id ? (
                      <input value={renameVal} onChange={e => setRenameVal(e.target.value)} autoFocus
                        onClick={e => e.stopPropagation()}
                        onBlur={() => { setAndSave(researches.map(x => x.id === r.id ? { ...x, title: renameVal.trim() || x.title } : x)); setRenamingId(null); }}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setAndSave(researches.map(x => x.id === r.id ? { ...x, title: renameVal.trim() || x.title } : x)); setRenamingId(null); } }}
                        className="flex-1 text-sm bg-neutral-100 dark:bg-neutral-700 border border-blue-400 rounded px-1 outline-none text-neutral-800 dark:text-neutral-200 min-w-0"/>
                    ) : (
                      <span className={`flex-1 text-sm truncate ${r.id === activeId ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}>{r.title}</span>
                    )}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setRenamingId(r.id); setRenameVal(r.title); setConfirmDeleteId(null); }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"><Pencil className="w-3 h-3"/></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === r.id ? null : r.id); }}
                        className={`p-1 rounded transition-colors ${confirmDeleteId === r.id ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500"}`}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  {confirmDeleteId === r.id ? (
                    <AnimatePresence>
                      <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                        className="px-3 pb-3 overflow-hidden">
                        <p className="text-[11px] text-red-500 font-medium mb-2">Delete &quot;{r.title}&quot;? This cannot be undone.</p>
                        <div className="flex gap-2">
                          <button onClick={e => { e.stopPropagation(); deleteResearch(r.id); }}
                            className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors">
                            Delete
                          </button>
                          <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(null); }}
                            className="flex-1 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs transition-colors">
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : r.id === activeId && (
                    <div className="px-3 pb-2 flex items-center gap-3 text-[10px] text-neutral-400">
                      <span>{r.sources.length} sources</span>
                      <span>{r.notes.length} notes</span>
                      <span>{r.chat.length} msgs</span>
                    </div>
                  )}
                </div>
              ))}

              {!creatingResearch && (
                <button onClick={() => setCreatingResearch(true)}
                  className="mx-2 mb-2 w-[calc(100%-16px)] flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-blue-400 hover:text-blue-500 transition-all text-xs font-medium">
                  <Plus className="w-3.5 h-3.5"/> New Research
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {/* No active research */}
      {!active ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-neutral-300 dark:text-neutral-700">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="absolute top-4 left-4 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <PanelLeft className="w-5 h-5"/>
            </button>
          )}
          <Brain className="w-16 h-16"/>
          <p className="text-lg font-semibold">Select or create a research</p>
          <button onClick={() => { setSidebarOpen(true); setCreatingResearch(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            + New Research
          </button>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">

          {/* Left column: tab switcher + panels */}
          <div className="w-72 flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">

            {/* Tab bar */}
            <div className="flex items-center gap-2 px-3 py-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                  <PanelLeft className="w-4 h-4"/>
                </button>
              )}
              <div className="flex-1 flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                {(["sources","chat","notes"] as const).map(p => (
                  <button key={p} onClick={() => setPanel(p)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${panel === p ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}>
                    {p === "sources" && <Globe className="w-3 h-3"/>}
                    {p === "chat" && <MessageSquare className="w-3 h-3"/>}
                    {p === "notes" && <StickyNote className="w-3 h-3"/>}
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors flex-shrink-0"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400 flex-shrink-0"/>}
              {!saving && notebookId && <div className="text-xs text-emerald-600 dark:text-emerald-400">Saved</div>}
            </div>

            {/* SOURCES panel */}
            {panel === "sources" && (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Sources ({active.sources.length})</span>
                  <button onClick={() => setAddingSource(v => !v)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-400 hover:text-blue-500 transition-colors">
                    <Plus className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
                  <AnimatePresence>
                    {addingSource && (
                      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                        <AddSourcePanel onAdd={addSource} onCancel={() => setAddingSource(false)}/>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {active.sources.length === 0 && !addingSource && (
                    <div className="py-10 text-center">
                      <Link className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2"/>
                      <p className="text-xs text-neutral-400">No sources yet</p>
                      <button onClick={() => setAddingSource(true)} className="mt-1 text-xs text-blue-500 font-medium">+ Add source</button>
                    </div>
                  )}
                  {active.sources.map(src => {
                    const Icon = SOURCE_ICONS[src.type];
                    const isAct = src.id === activeSourceId;
                    return (
                      <div key={src.id} className={`rounded-xl border transition-all ${isAct ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10" : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"}`}>
                        <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => setActiveSourceId(isAct ? null : src.id)}>
                          <button onClick={e => { e.stopPropagation(); toggleSource(src.id); }}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${src.selected ? "bg-blue-500 border-blue-500" : "border-neutral-300 dark:border-neutral-600"}`}>
                            {src.selected && <Check className="w-2.5 h-2.5 text-white"/>}
                          </button>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${SOURCE_COLORS[src.type]}`}>
                            <Icon className="w-3 h-3"/>
                          </div>
                          <span className="flex-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{src.title || src.url || "Source"}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {src.url && (
                              <a href={src.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-0.5 text-neutral-400 hover:text-blue-500">
                                <ExternalLink className="w-3 h-3"/>
                              </a>
                            )}
                            <button onClick={e => { e.stopPropagation(); removeSource(src.id); }} className="p-0.5 text-neutral-400 hover:text-red-500">
                              <X className="w-3 h-3"/>
                            </button>
                          </div>
                        </div>
                        <AnimatePresence>
                          {isAct && (
                            <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.15}} className="overflow-hidden px-3 pb-3">
                              <SourceSummaryView source={src}/>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0 text-center">
                  <p className="text-[10px] text-neutral-400">{active.sources.filter(s => s.selected).length} of {active.sources.length} selected for Q&amp;A</p>
                </div>
              </div>
            )}

            {/* CHAT panel */}
            {panel === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Ask Questions</span>
                  {active.chat.length > 0 && (
                    <button onClick={() => updateActive({ chat: [] })} className="text-[10px] text-red-400 hover:text-red-500 flex items-center gap-1">
                      <Trash2 className="w-3 h-3"/>Clear
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                  {active.chat.length === 0 && (
                    <div className="py-10 text-center">
                      <MessageSquare className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2"/>
                      <p className="text-xs text-neutral-400 leading-relaxed">Ask anything about your selected sources</p>
                      {active.sources.filter(s => s.selected).length === 0 && (
                        <p className="text-[10px] text-amber-500 mt-2">Select at least one source first</p>
                      )}
                    </div>
                  )}
                  {active.chat.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[90%] rounded-2xl px-3 py-2.5 group relative ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"}`}>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === "assistant" && (
                          <button onClick={() => addChatToNote(msg.content)}
                            className="absolute -bottom-2.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-full text-[10px] text-blue-500 shadow-sm whitespace-nowrap">
                            <Copy className="w-2.5 h-2.5"/> Save to note
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-3 py-2.5 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500"/>
                        <span className="text-xs text-neutral-500">Thinking...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                  <div className="flex items-end gap-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2">
                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                      placeholder={active.sources.filter(s => s.selected).length === 0 ? "Select sources first..." : "Ask about your sources... (Enter to send)"}
                      disabled={chatLoading || active.sources.filter(s => s.selected).length === 0}
                      rows={2} className="flex-1 bg-transparent text-sm outline-none resize-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 disabled:opacity-50"/>
                    <button onClick={sendChat} disabled={chatLoading || !chatInput.trim() || active.sources.filter(s => s.selected).length === 0}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 flex-shrink-0">
                      {chatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Send className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTES list panel */}
            {panel === "notes" && (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Notes ({active.notes.length})</span>
                  <button onClick={addNote} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-neutral-400 hover:text-blue-500 transition-colors">
                    <Plus className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
                  {active.notes.length === 0 && (
                    <div className="py-10 text-center">
                      <StickyNote className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2"/>
                      <p className="text-xs text-neutral-400">No notes yet</p>
                      <button onClick={addNote} className="mt-1 text-xs text-blue-500 font-medium">+ Add note</button>
                    </div>
                  )}
                  {active.notes.map(n => (
                    <div key={n.id} onClick={() => setActiveNoteId(n.id)}
                      className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${n.id === activeNoteId ? "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800" : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"}`}>
                      <BookOpen className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"/>
                      <span className="flex-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">{n.title}</span>
                      <button onClick={e => { e.stopPropagation(); deleteNote(n.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 transition-opacity">
                        <X className="w-3 h-3"/>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                  <button onClick={addNote} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-blue-400 hover:text-blue-500 transition-all text-xs font-medium">
                    <Plus className="w-3.5 h-3.5"/> New Note
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Note editor / Source summary main view */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
            {/* Research title bar */}
            <div className="flex items-center gap-3 px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex-1">
                <input value={active.title} onChange={e => updateActive({ title: e.target.value })}
                  className="text-lg font-bold text-neutral-900 dark:text-white bg-transparent outline-none w-full"/>
                <input value={active.description} onChange={e => updateActive({ description: e.target.value })}
                  placeholder="Add a description..." className="text-xs text-neutral-400 bg-transparent outline-none w-full mt-0.5"/>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 flex-shrink-0">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3"/>{active.sources.length}</span>
                <span className="flex items-center gap-1"><StickyNote className="w-3 h-3"/>{active.notes.length}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3"/>{active.chat.length}</span>
              </div>
            </div>

            {/* Note editor */}
            {panel === "notes" && activeNote ? (
              <div className="flex-1 flex flex-col overflow-hidden p-6">
                <input value={activeNote.title} onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                  className="text-xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none mb-1 w-full"/>
                <p className="text-xs text-neutral-400 mb-4">{new Date(activeNote.createdAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}</p>
                <textarea value={activeNote.content} onChange={e => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder={"Write your research notes here...\n\n## Key Findings\n-\n\n## Source Summary\n-\n\n## Action Items\n-"}
                  className="flex-1 w-full bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none resize-none placeholder-neutral-300 dark:placeholder-neutral-600 leading-relaxed"/>
              </div>
            ) : panel === "notes" && !activeNote ? (
              <div className="flex-1 flex items-center justify-center flex-col gap-3 text-neutral-300 dark:text-neutral-700">
                <StickyNote className="w-12 h-12"/>
                <p className="text-sm font-medium">Select a note or create one</p>
                <button onClick={addNote} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">+ New Note</button>
              </div>
            ) : panel === "sources" && activeSourceId ? (
              <div className="flex-1 overflow-y-auto p-6">
                {(() => {
                  const src = active.sources.find(s => s.id === activeSourceId);
                  if (!src) return null;
                  const Icon = SOURCE_ICONS[src.type];
                  return (
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${SOURCE_COLORS[src.type]}`}><Icon className="w-5 h-5"/></div>
                        <div>
                          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{src.title}</h2>
                          {src.url && <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3"/>{src.url.slice(0,60)}{src.url.length>60?"...":""}</a>}
                        </div>
                      </div>
                      <SourceSummaryView source={src}/>
                      {!src.summary && src.rawContent && (
                        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                          <p className="text-xs font-semibold text-neutral-500 mb-2 uppercase tracking-wide">Raw Content</p>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">{src.rawContent}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-3 text-neutral-300 dark:text-neutral-700">
                <Sparkles className="w-12 h-12"/>
                <p className="text-sm font-medium">
                  {panel === "sources" ? "Select a source to view its summary" :
                   panel === "chat" ? "Ask a question to get started" :
                   "Select or create a note"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">AI Research Assistant Guide</h2>
                    <p className="text-blue-100 text-sm">Organize sources, chat with AI, and take notes</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🧠 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    AI Research Assistant is a powerful tool for conducting research with AI support. Add sources (YouTube videos, web articles, documents, or text), get AI-powered summaries, ask questions about your sources, and organize findings in notes.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🌐 Multi-Source Support</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Add YouTube videos, web articles, documents, or raw text. AI automatically summarizes and extracts key points.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">💬 AI Q&A Chat</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Ask questions about your selected sources. AI provides answers based on the content you've gathered.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">📝 Research Notes</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Create multiple notes per research project. Save AI responses directly to notes with one click.</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">🗂️ Multiple Research Projects</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Organize different research topics separately. Each project has its own sources, chat history, and notes.</p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Research Project</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "+ New Research" in the sidebar. Give it a descriptive title and optional description.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Sources</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Go to the "Sources" tab and click "+". Paste YouTube URLs, web links, or raw text. AI will automatically summarize.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Ask Questions</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch to "Chat" tab. Select which sources to include (checkboxes), then ask AI questions about the content.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Take Notes</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Create notes in the "Notes" tab. Click "Save to note" on AI responses to capture important insights.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Panels */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📑 Three Main Panels</h3>
                  <div className="space-y-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        Sources Panel
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        Manage your research sources:
                      </p>
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-4">
                        <li>• Add YouTube videos, web articles, documents, or text</li>
                        <li>• View AI-generated summaries and key points</li>
                        <li>• Select/deselect sources for Q&A (checkbox)</li>
                        <li>• Click a source to view full summary in main area</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Chat Panel
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Ask AI questions about your selected sources. The AI will answer based on the content you've gathered. Click "Save to note" on responses to capture them.
                      </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-blue-500" />
                        Notes Panel
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Create and organize research notes. Each note has a title and content area. Perfect for summarizing findings, action items, or key insights.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Source Types */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📚 Supported Source Types</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <Youtube className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-400 text-sm">YouTube</p>
                        <p className="text-xs text-red-700 dark:text-red-300">Video transcripts & summaries</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-400 text-sm">Web Articles</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Websites & blog posts</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <FileText className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-400 text-sm">Documents</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">PDFs & text files</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <FileText className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-400 text-sm">Raw Text</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Paste any text content</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Select relevant sources</strong> before asking questions to get focused answers</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use descriptive research titles</strong> to easily find projects later</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Save AI responses to notes</strong> using the "Save to note" button</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Click sources to expand</strong> and view full summaries and sections</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Ask follow-up questions</strong> - the AI remembers chat history</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Create multiple notes</strong> to organize different aspects of your research</p>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💼 Common Use Cases</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📖 Academic Research</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Gather sources, summarize papers, extract insights</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🔍 Market Research</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Analyze competitors, trends, and industry insights</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">💡 Learning & Study</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Collect learning materials, ask questions, take notes</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📰 Content Research</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Gather sources for articles, videos, or presentations</p>
                    </div>
                  </div>
                </div>

                {/* Data Storage */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your research data is automatically saved to the database.</strong> All research projects, sources, summaries, chat history, and notes are persisted to the server. Look for the "Saved" indicator to confirm successful storage. Your data syncs across devices automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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

