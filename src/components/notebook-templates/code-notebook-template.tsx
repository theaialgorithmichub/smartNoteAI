"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Loader2, Trash2, Pencil, Bot, ChevronDown,
  Code2, FolderOpen, PanelLeft, Copy, Check, Sparkles, AlertCircle,
  Info, Lightbulb,
} from "lucide-react";

interface CodeBlock {
  id: string;
  title: string;
  code: string;
  notes: string;
  language: string;
  review?: AIReview;
  reviewing?: boolean;
}

interface Section {
  id: string;
  title: string;
  codeBlocks: CodeBlock[];
}

interface Workspace {
  id: string;
  name: string;
  language: string;
  description: string;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

interface AIReview {
  summary: string;
  issues: { severity: "error" | "warning" | "info"; message: string }[];
  suggestions: string[];
  score: number;
}

interface CodeNotebookTemplateProps {
  title?: string;
  notebookId?: string;
}

//  Constants 

const LANG_GROUPS: { group: string; langs: string[] }[] = [
  { group: "Web Frameworks", langs: ["React","Next.js","Angular","Vue","Svelte","Nuxt.js","Remix","Astro"] },
  { group: "Mobile", langs: ["Flutter","React Native","Swift","Kotlin","Dart","Objective-C","Xamarin"] },
  { group: "Languages", langs: ["JavaScript","TypeScript","Python","Rust","Go","Java","C","C++","C#","Ruby","PHP","Scala","Elixir","Haskell","Lua","Perl","R","MATLAB","Zig","Nim"] },
  { group: "Data & Query", langs: ["SQL","PostgreSQL","MongoDB","GraphQL","Prisma","Redis"] },
  { group: "Styling", langs: ["HTML","CSS","SCSS","Tailwind CSS","Less"] },
  { group: "DevOps & Config", langs: ["Shell","Bash","PowerShell","Docker","Kubernetes","Terraform","YAML","JSON","TOML","Nginx"] },
  { group: "Other", langs: ["Markdown","LaTeX","Solidity","WebAssembly","Regex"] },
];

const LANGUAGES = LANG_GROUPS.flatMap(g => g.langs);

const LANG_COLORS: Record<string, string> = {
  JavaScript:"#f7df1e", TypeScript:"#3178c6", Python:"#3572a5", Rust:"#dea584",
  Go:"#00add8", Java:"#b07219", "C++":"#f34b7d", "C#":"#178600", Ruby:"#701516",
  PHP:"#4f5d95", Swift:"#f05138", Kotlin:"#a97bff", SQL:"#e38c00",
  HTML:"#e34c26", CSS:"#563d7c", Shell:"#89e051",
  React:"#61dafb", "Next.js":"#ffffff", Angular:"#dd0031", Vue:"#42b883",
  Svelte:"#ff3e00", "Nuxt.js":"#00dc82", Remix:"#121212", Astro:"#ff5d01",
  Flutter:"#54c5f8", "React Native":"#61dafb", Dart:"#00b4ab",
  "Objective-C":"#438eff", Xamarin:"#3498db",
  Scala:"#dc322f", Elixir:"#6e4a7e", Haskell:"#5d4f85", Lua:"#000080",
  Perl:"#0298c3", R:"#198ce7", MATLAB:"#e16737", Zig:"#f7a41d", Nim:"#ffe953",
  PostgreSQL:"#336791", MongoDB:"#47a248", GraphQL:"#e10098", Prisma:"#2d3748", Redis:"#dc382d",
  SCSS:"#c6538c", "Tailwind CSS":"#38bdf8", Less:"#1d365d",
  Bash:"#4eaa25", PowerShell:"#012456", Docker:"#2496ed", Kubernetes:"#326ce5",
  Terraform:"#7b42bc", YAML:"#cb171e", JSON:"#f5a623", TOML:"#9c4121", Nginx:"#009639",
  Markdown:"#083fa1", LaTeX:"#008080", Solidity:"#aa6746", WebAssembly:"#654ff0", Regex:"#764abc",
  default:"#6b7280",
};

const getLangColor = (lang: string) => LANG_COLORS[lang] ?? LANG_COLORS.default;

const makeWorkspace = (name = "New Workspace"): Workspace => ({
  id: Date.now().toString(), name, language: "JavaScript", description: "",
  sections: [{ id: "s1", title: "Getting Started", codeBlocks: [] }],
  createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString(),
});

const makeSection = (title = "New Section"): Section => ({
  id: Date.now().toString(), title, codeBlocks: [],
});

const makeBlock = (language: string): CodeBlock => ({
  id: Date.now().toString(), title: "Untitled", code: "", notes: "", language,
});

//  AI Review 

async function reviewCode(code: string, language: string): Promise<AIReview> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "code_review",
      message: `Review this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nRespond with JSON: { "summary": string, "issues": [{"severity":"error"|"warning"|"info","message":string}], "suggestions": [string], "score": number (0-100) }`,
      context: [],
    }),
  });
  const data = await res.json();
  try {
    const text: string = data.response ?? data.message ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return { summary: data.response ?? "Review complete.", issues: [], suggestions: [], score: 80 };
}

//  AI Snippet Generation 

async function generateSnippet(prompt: string, language: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "code_generation",
      message: `Generate ${language} code for: ${prompt}\n\nProvide only the code without explanations. Use proper syntax and best practices.`,
      context: [],
    }),
  });
  const data = await res.json();
  const text: string = data.response ?? data.message ?? "";
  // Extract code from markdown code blocks if present
  const codeMatch = text.match(/```[\w]*\n([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : text.trim();
}

//  Copy Button 

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors" title="Copy code">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400"/> : <Copy className="w-3.5 h-3.5"/>}
    </button>
  );
}

//  AI Review Panel 

function ReviewPanel({ review }: { review: AIReview }) {
  const scoreColor = review.score >= 80 ? "text-emerald-400" : review.score >= 60 ? "text-amber-400" : "text-red-400";
  const scoreBg = review.score >= 80 ? "from-emerald-500/20 to-emerald-500/5" : review.score >= 60 ? "from-amber-500/20 to-amber-500/5" : "from-red-500/20 to-red-500/5";
  const severityIcon = (s: string) => s === "error" ? <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0"/> : s === "warning" ? <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0"/> : <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0"/>;
  return (
    <div className="border-t border-slate-700 bg-slate-900/80 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${scoreBg} border border-slate-700`}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400"/>
          <span className="text-xs font-semibold text-slate-300">AI Score</span>
          <span className={`text-sm font-bold ${scoreColor}`}>{review.score}/100</span>
        </div>
        <p className="text-xs text-slate-400 flex-1">{review.summary}</p>
      </div>
      {review.issues.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issues</p>
          {review.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2">
              {severityIcon(issue.severity)}
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}
      {review.suggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggestions</p>
          {review.suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5"/>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//  Language Selector 

function LangSelect({ value, onChange, dark = false }: { value: string; onChange: (v: string) => void; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? "bg-slate-700 hover:bg-slate-600 text-slate-200" : "bg-slate-800 hover:bg-slate-700 text-slate-300"}`}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getLangColor(value) }}/>
        {value}
        <ChevronDown className="w-3 h-3 text-slate-400"/>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 w-52 flex flex-col" style={{maxHeight:"320px"}}>
          <div className="p-2 border-b border-slate-700 flex-shrink-0">
            <input autoFocus placeholder="Search language..." onChange={e => { const el = document.getElementById("lang-list-"+value); if (el) { const q = e.target.value.toLowerCase(); el.querySelectorAll<HTMLElement>("[data-lang]").forEach(b => { b.style.display = b.dataset.lang!.toLowerCase().includes(q) ? "" : "none"; }); el.querySelectorAll<HTMLElement>("[data-group]").forEach(g => { const visible = Array.from(g.querySelectorAll<HTMLElement>("[data-lang]")).some(b => b.style.display !== "none"); (g as HTMLElement).style.display = visible ? "" : "none"; }); } }} className="w-full px-2 py-1 text-xs bg-slate-700 rounded-lg outline-none text-slate-200 placeholder-slate-500 border border-slate-600"/>
          </div>
          <div id={"lang-list-"+value} className="overflow-y-auto flex-1">
            {LANG_GROUPS.map(g => (
              <div key={g.group} data-group>
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky top-0 bg-slate-800">{g.group}</p>
                {g.langs.map(l => (
                  <button key={l} data-lang={l} onClick={() => { onChange(l); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-700 transition-colors ${value === l ? "text-amber-400 font-semibold bg-amber-500/10" : "text-slate-300"}`}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getLangColor(l) }}/>{l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlockCard({
  block, workspaceLang, onUpdate, onRemove,
}: {
  block: CodeBlock; workspaceLang: string;
  onUpdate: (b: CodeBlock) => void; onRemove: () => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(block.title);
  const [showReview, setShowReview] = useState(!!block.review);

  const commitTitle = () => { onUpdate({ ...block, title: titleVal.trim() || block.title }); setEditingTitle(false); };

  const handleReview = async () => {
    if (!block.code.trim()) return;
    onUpdate({ ...block, reviewing: true, review: undefined });
    setShowReview(true);
    try {
      const review = await reviewCode(block.code, block.language || workspaceLang);
      onUpdate({ ...block, reviewing: false, review });
    } catch {
      onUpdate({ ...block, reviewing: false, review: { summary: "Review failed. Please try again.", issues: [], suggestions: [], score: 0 } });
    }
  };

  const lang = block.language || workspaceLang;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-xl overflow-hidden border border-slate-700 group bg-slate-900">
      {/* Block Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70"/>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"/>
        </div>
        {editingTitle ? (
          <input value={titleVal} onChange={e => setTitleVal(e.target.value)} onBlur={commitTitle}
            onKeyDown={e => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") setEditingTitle(false); }}
            autoFocus className="flex-1 text-xs bg-slate-700 border border-amber-500 rounded px-2 py-0.5 outline-none text-slate-200"/>
        ) : (
          <span onClick={() => setEditingTitle(true)} className="flex-1 text-xs text-slate-400 hover:text-slate-200 cursor-pointer transition-colors font-mono">{block.title}</span>
        )}
        <LangSelect value={lang} onChange={v => onUpdate({ ...block, language: v })} dark/>
        <CopyButton text={block.code}/>
        <button onClick={handleReview} disabled={block.reviewing || !block.code.trim()}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {block.reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Bot className="w-3.5 h-3.5"/>}
          {block.reviewing ? "Reviewing..." : "AI Review"}
        </button>
        <button onClick={onRemove} className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
          <Trash2 className="w-3.5 h-3.5"/>
        </button>
      </div>

      {/* Code Editor */}
      <textarea value={block.code} onChange={e => onUpdate({ ...block, code: e.target.value })}
        placeholder={`// Write your ${lang} code here...`}
        className="w-full bg-slate-950 p-4 font-mono text-sm text-slate-200 outline-none resize-none min-h-[140px] placeholder-slate-700 leading-relaxed"/>

      {/* Notes */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3">
        <p className="text-xs text-slate-600 mb-1.5 font-medium uppercase tracking-wide">Notes</p>
        <textarea value={block.notes} onChange={e => onUpdate({ ...block, notes: e.target.value })}
          placeholder="Add notes about this code snippet..."
          className="w-full bg-transparent text-sm text-slate-400 outline-none resize-none placeholder-slate-700" rows={2}/>
      </div>

      {/* AI Review Panel */}
      <AnimatePresence>
        {showReview && block.reviewing && (
          <div className="border-t border-slate-700 bg-slate-900/80 p-4 flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400"/>
            <span className="text-xs text-slate-400">AI is reviewing your code...</span>
          </div>
        )}
        {showReview && block.review && !block.reviewing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <ReviewPanel review={block.review}/>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CodeNotebookTemplate({ title = "Untitled Notebook", notebookId }: CodeNotebookTemplateProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWsId, setActiveWsId] = useState<string>("");
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renamingWs, setRenamingWs] = useState<string | null>(null);
  const [renameWsVal, setRenameWsVal] = useState("");
  const [renamingSection, setRenamingSection] = useState<string | null>(null);
  const [renameSectionVal, setRenameSectionVal] = useState("");
  const [creatingWs, setCreatingWs] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAISnippet, setShowAISnippet] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingSnippet, setGeneratingSnippet] = useState(false);

  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const pageIdRef = useRef<string | null>(null);

  const activeWs = workspaces.find(w => w.id === activeWsId) ?? null;
  const activeSection = activeWs?.sections.find(s => s.id === activeSectionId) ?? null;

  //  Load from DB 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const data = await res.json();
        const pages: any[] = data.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__code_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const parsed: Workspace[] = JSON.parse(existing.content || "[]");
            if (parsed.length > 0) {
              setWorkspaces(parsed);
              setActiveWsId(parsed[0].id);
              setActiveSectionId(parsed[0].sections[0]?.id ?? "");
            } else { initDefault(); }
          } catch { initDefault(); }
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__code_template__", content: "[]" }),
          });
          const created = await cr.json();
          pageIdRef.current = created.page?._id ?? null;
          initDefault();
        }
      } catch (err) {
        console.error("Failed to load:", err);
        initDefault();
      } finally { setLoading(false); }
    })();
  }, [notebookId]);

  const initDefault = () => {
    const ws = makeWorkspace("My Workspace");
    setWorkspaces([ws]);
    setActiveWsId(ws.id);
    setActiveSectionId(ws.sections[0].id);
  };

  //  Persist 
  const persist = useCallback((list: Workspace[]) => {
    if (!notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current;
      if (!pid) return;
      setSaving(true);
      try {
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__code_template__", content: JSON.stringify(list) }),
        });
      } catch (err) { console.error("Failed to save:", err); }
      finally { setSaving(false); }
    }, 1200);
  }, [notebookId]);

  const setWs = (list: Workspace[]) => { setWorkspaces(list); persist(list); };

  //  Workspace ops 
  const createWorkspace = () => {
    const ws = makeWorkspace(newWsName.trim() || "New Workspace");
    const next = [...workspaces, ws];
    setWs(next); setActiveWsId(ws.id); setActiveSectionId(ws.sections[0].id);
    setCreatingWs(false); setNewWsName("");
  };

  const deleteWorkspace = (id: string) => {
    const next = workspaces.filter(w => w.id !== id);
    setWs(next);
    if (activeWsId === id) { setActiveWsId(next[0]?.id ?? ""); setActiveSectionId(next[0]?.sections[0]?.id ?? ""); }
  };

  const updateWs = (patch: Partial<Workspace>) => {
    const next = workspaces.map(w => w.id === activeWsId ? { ...w, ...patch, updatedAt: new Date().toLocaleString() } : w);
    setWs(next);
  };

  //  Section ops 
  const addSection = () => {
    if (!activeWs) return;
    const s = makeSection(newSectionName.trim() || "New Section");
    updateWs({ sections: [...activeWs.sections, s] });
    setActiveSectionId(s.id); setAddingSection(false); setNewSectionName("");
  };

  const deleteSection = (id: string) => {
    if (!activeWs || activeWs.sections.length <= 1) return;
    const next = activeWs.sections.filter(s => s.id !== id);
    updateWs({ sections: next });
    if (activeSectionId === id) setActiveSectionId(next[0].id);
  };

  //  Block ops 
  const addBlock = () => {
    if (!activeWs || !activeSection) return;
    const b = makeBlock(activeWs.language);
    updateWs({ sections: activeWs.sections.map(s => s.id === activeSectionId ? { ...s, codeBlocks: [...s.codeBlocks, b] } : s) });
  };

  const handleGenerateSnippet = async () => {
    if (!aiPrompt.trim() || !activeWs) return;
    setGeneratingSnippet(true);
    try {
      const code = await generateSnippet(aiPrompt, activeWs.language);
      const b = makeBlock(activeWs.language);
      b.code = code;
      b.title = aiPrompt.slice(0, 50) + (aiPrompt.length > 50 ? "..." : "");
      updateWs({ sections: activeWs.sections.map(s => s.id === activeSectionId ? { ...s, codeBlocks: [...s.codeBlocks, b] } : s) });
      setShowAISnippet(false);
      setAiPrompt("");
    } catch (err) {
      console.error("Failed to generate snippet:", err);
    } finally {
      setGeneratingSnippet(false);
    }
  };

  const updateBlock = (b: CodeBlock) => {
    if (!activeWs) return;
    updateWs({ sections: activeWs.sections.map(s => s.id === activeSectionId ? { ...s, codeBlocks: s.codeBlocks.map(x => x.id === b.id ? b : x) } : s) });
  };

  const removeBlock = (id: string) => {
    if (!activeWs) return;
    updateWs({ sections: activeWs.sections.map(s => s.id === activeSectionId ? { ...s, codeBlocks: s.codeBlocks.filter(x => x.id !== id) } : s) });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px] bg-slate-950">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500"/>
    </div>
  );

  return (
    <div className="flex h-full min-h-screen bg-slate-950 overflow-hidden">

      {/*  Sidebar  */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 256, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">

            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-white"/>
                </div>
                <span className="text-sm font-bold text-white">Workspaces</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setCreatingWs(true); }} title="New Workspace" className="p-1.5 rounded-lg hover:bg-amber-500/20 text-slate-500 hover:text-amber-400 transition-colors">
                  <Plus className="w-4 h-4"/>
                </button>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors">
                  <PanelLeft className="w-4 h-4"/>
                </button>
              </div>
            </div>

            {/* Workspace List */}
            <div className="flex-1 overflow-y-auto py-2 min-h-0">
              {workspaces.map(ws => (
                <div key={ws.id} className={`group mx-2 mb-1 rounded-xl transition-all ${ws.id === activeWsId ? "bg-slate-800" : "hover:bg-slate-800/50"}`}>
                  <div className="flex items-center gap-2 px-3 py-2.5 cursor-pointer" onClick={() => { setActiveWsId(ws.id); setActiveSectionId(ws.sections[0]?.id ?? ""); }}>
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getLangColor(ws.language) }}/>
                    {renamingWs === ws.id ? (
                      <input value={renameWsVal} onChange={e => setRenameWsVal(e.target.value)}
                        onBlur={() => { setWs(workspaces.map(w => w.id === ws.id ? { ...w, name: renameWsVal.trim() || w.name } : w)); setRenamingWs(null); }}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { setWs(workspaces.map(w => w.id === ws.id ? { ...w, name: renameWsVal.trim() || w.name } : w)); setRenamingWs(null); } }}
                        autoFocus onClick={e => e.stopPropagation()}
                        className="flex-1 text-sm bg-slate-700 border border-amber-500 rounded px-1 outline-none text-white min-w-0"/>
                    ) : (
                      <span className={`flex-1 text-sm font-medium truncate ${ws.id === activeWsId ? "text-white" : "text-slate-400"}`}>{ws.name}</span>
                    )}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={e => { e.stopPropagation(); setRenamingWs(ws.id); setRenameWsVal(ws.name); }} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300"><Pencil className="w-3 h-3"/></button>
                      {workspaces.length > 1 && <button onClick={e => { e.stopPropagation(); deleteWorkspace(ws.id); }} className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3"/></button>}
                    </div>
                  </div>

                  {/* Sections under active workspace */}
                  {ws.id === activeWsId && (
                    <div className="pb-2 px-2">
                      {ws.sections.map(s => (
                        <div key={s.id} className={`group/sec flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${s.id === activeSectionId ? "bg-amber-500/10 text-amber-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"}`}
                          onClick={() => setActiveSectionId(s.id)}>
                          <Code2 className="w-3 h-3 flex-shrink-0"/>
                          {renamingSection === s.id ? (
                            <input value={renameSectionVal} onChange={e => setRenameSectionVal(e.target.value)}
                              onBlur={() => { updateWs({ sections: ws.sections.map(x => x.id === s.id ? { ...x, title: renameSectionVal.trim() || x.title } : x) }); setRenamingSection(null); }}
                              onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") { updateWs({ sections: ws.sections.map(x => x.id === s.id ? { ...x, title: renameSectionVal.trim() || x.title } : x) }); setRenamingSection(null); } }}
                              autoFocus onClick={e => e.stopPropagation()}
                              className="flex-1 text-xs bg-slate-700 border border-amber-500 rounded px-1 outline-none text-white min-w-0"/>
                          ) : (
                            <span className="flex-1 text-xs truncate">{s.title}</span>
                          )}
                          <div className="flex gap-0.5 opacity-0 group-hover/sec:opacity-100 transition-opacity flex-shrink-0">
                            <button onClick={e => { e.stopPropagation(); setRenamingSection(s.id); setRenameSectionVal(s.title); }} className="p-0.5 rounded hover:bg-slate-600 text-slate-600 hover:text-slate-300"><Pencil className="w-2.5 h-2.5"/></button>
                            {ws.sections.length > 1 && <button onClick={e => { e.stopPropagation(); deleteSection(s.id); }} className="p-0.5 rounded hover:bg-red-500/20 text-slate-600 hover:text-red-400"><X className="w-2.5 h-2.5"/></button>}
                          </div>
                        </div>
                      ))}
                      {addingSection ? (
                        <div className="mt-1 px-1 space-y-1.5">
                          <input value={newSectionName} onChange={e => setNewSectionName(e.target.value)} onKeyDown={e => e.key === "Enter" && addSection()} placeholder="Section name..." autoFocus
                            className="w-full px-2 py-1 text-xs bg-slate-800 border border-slate-600 rounded outline-none text-white placeholder-slate-600"/>
                          <div className="flex gap-1">
                            <button onClick={addSection} className="flex-1 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium">Add</button>
                            <button onClick={() => { setAddingSection(false); setNewSectionName(""); }} className="flex-1 py-1 bg-slate-700 text-slate-400 rounded text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAddingSection(true)} className="w-full mt-1 flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors">
                          <Plus className="w-3 h-3"/> Add section
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Inline create workspace - always visible inside scroll */}
              {creatingWs ? (
                <div className="mx-2 mb-2 p-3 bg-slate-800 rounded-xl border border-amber-500/30 space-y-2">
                  <p className="text-xs font-semibold text-amber-400">New Workspace</p>
                  <input value={newWsName} onChange={e => setNewWsName(e.target.value)} onKeyDown={e => e.key === "Enter" && createWorkspace()} placeholder="Workspace name..." autoFocus
                    className="w-full px-2 py-1.5 text-sm bg-slate-700 border border-slate-600 rounded-lg outline-none text-white placeholder-slate-500"/>
                  <div className="flex gap-2">
                    <button onClick={createWorkspace} className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Create</button>
                    <button onClick={() => { setCreatingWs(false); setNewWsName(""); }} className="flex-1 py-1.5 bg-slate-700 text-slate-400 rounded-lg text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setCreatingWs(true)}
                  className="mx-2 mb-2 w-[calc(100%-16px)] flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-slate-700 text-slate-600 hover:border-amber-500/50 hover:text-amber-500 transition-all text-xs font-medium">
                  <Plus className="w-3.5 h-3.5"/> New Workspace
                </button>
              )}
            </div>

          </motion.aside>
        )}
      </AnimatePresence>

      {/*  Main  */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors mr-1">
              <PanelLeft className="w-4 h-4"/>
            </button>
          )}
          {activeWs ? (
            <>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getLangColor(activeWs.language) }}/>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-white truncate">{activeWs.name}</h1>
                {activeSection && <p className="text-xs text-slate-500">{activeSection.title}  {activeSection.codeBlocks.length} block{activeSection.codeBlocks.length !== 1 ? "s" : ""}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Workspace language:</span>
                <LangSelect value={activeWs.language} onChange={v => updateWs({ language: v })}/>
              </div>
            </>
          ) : (
            <h1 className="text-base font-bold text-white flex-1">{title}</h1>
          )}
          <button
            onClick={() => setShowDocumentation(true)}
            className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            title="Documentation"
          >
            <Info className="h-4 w-4" />
          </button>
          {saving && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin"/> Saving...
            </div>
          )}
          {!saving && notebookId && (
            <div className="text-xs text-emerald-400">Saved</div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeWs ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
              <FolderOpen className="w-16 h-16 opacity-20"/>
              <p className="text-lg font-medium text-slate-400">No workspace selected</p>
              <button onClick={() => setCreatingWs(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">Create Workspace</button>
            </div>
          ) : (
            <>
              {/* Workspace description */}
              <textarea value={activeWs.description} onChange={e => updateWs({ description: e.target.value })}
                placeholder="Describe this workspace..."
                className="w-full bg-transparent text-slate-500 text-sm outline-none resize-none placeholder-slate-700 mb-6" rows={2}/>

              {/* Section heading */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-semibold text-white">{activeSection?.title ?? "Select a section"}</h2>
                <div className="flex-1 h-px bg-slate-800"/>
              </div>

              {/* Code Blocks */}
              <div className="space-y-5">
                <AnimatePresence>
                  {activeSection?.codeBlocks.length === 0 && (
                    <p className="text-slate-600 italic text-sm">Click "Add Code Block" to start coding in this section.</p>
                  )}
                  {activeSection?.codeBlocks.map(block => (
                    <CodeBlockCard key={block.id} block={block} workspaceLang={activeWs.language} onUpdate={updateBlock} onRemove={() => removeBlock(block.id)}/>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={addBlock}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-500 hover:border-amber-500/50 hover:text-amber-500 transition-all text-sm font-medium">
                  <Plus className="w-4 h-4"/> Add Code Block
                </button>
                <button onClick={() => setShowAISnippet(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 transition-opacity text-sm font-medium">
                  <Sparkles className="w-4 h-4"/> Ask AI to Write Code
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Snippet Generation Modal */}
      <AnimatePresence>
        {showAISnippet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !generatingSnippet && setShowAISnippet(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">AI Code Generator</h2>
                    <p className="text-amber-100 text-sm">Describe what you want and AI will write the code</p>
                  </div>
                  <button
                    onClick={() => !generatingSnippet && setShowAISnippet(false)}
                    disabled={generatingSnippet}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What code do you need? <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder={`Examples:\n• Create a React component with a form that has name and email fields\n• Write a Java function to find the largest number in an array\n• Generate a Python script to read CSV files\n• Build a TypeScript interface for a user profile`}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 transition-colors resize-none"
                    rows={6}
                    disabled={generatingSnippet}
                  />
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-300 mb-1">Tips for better results:</p>
                      <ul className="text-xs text-slate-400 space-y-1">
                        <li>• Be specific about what you want the code to do</li>
                        <li>• Mention the language/framework (will use workspace language: <span className="text-amber-400 font-medium">{activeWs?.language}</span>)</li>
                        <li>• Include any specific requirements or constraints</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAISnippet(false)}
                    disabled={generatingSnippet}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateSnippet}
                    disabled={!aiPrompt.trim() || generatingSnippet}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generatingSnippet ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Code2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Code Notebook Guide</h2>
                    <p className="text-amber-100 text-sm">Organize and manage your code snippets</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📚 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Code Notebook is a powerful template for organizing code snippets across multiple programming languages. Create workspaces for different projects, organize code into sections, and leverage AI to review and generate code snippets.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">🗂️ Multi-Workspace Organization</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Create separate workspaces for different projects or languages. Each workspace can have its own primary language and multiple sections.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🤖 AI Code Review</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Get instant AI-powered code reviews with quality scores, issue detection, and improvement suggestions.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">✨ AI Snippet Generation</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Describe what you need and let AI write the code for you. Perfect for boilerplate, common patterns, or learning new concepts.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">🎨 60+ Languages Supported</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">From React and Python to Rust and Solidity. Each language has syntax highlighting and color coding.</p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Workspace</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Workspace" in the sidebar. Give it a name and set the primary language.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Organize with Sections</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Add sections to categorize your code (e.g., "API Calls", "Utilities", "Components").</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Code Blocks</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Code Block" to manually add snippets, or use "Ask AI to Write Code" for AI generation.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Review & Refine</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use the "AI Review" button to get feedback on your code quality and suggestions for improvement.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Features */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🤖 AI Features</h3>
                  <div className="space-y-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        AI Code Generation
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Examples of what you can ask:</p>
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-4">
                        <li>• "Create a React component with a form that has name and email fields"</li>
                        <li>• "Write a Java function to find the largest number in an array"</li>
                        <li>• "Generate a Python script to read and parse CSV files"</li>
                        <li>• "Build a TypeScript interface for a user profile with validation"</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-500" />
                        AI Code Review
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Get instant feedback with quality scores (0-100), issue detection (errors, warnings, info), and actionable suggestions to improve your code.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use descriptive titles</strong> for code blocks to easily find them later</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Add notes</strong> to explain context, use cases, or important details</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Set workspace language</strong> to match your project for better AI suggestions</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Override language per block</strong> if you need mixed languages in one workspace</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Copy code quickly</strong> using the copy button in each block header</p>
                  </div>
                </div>

                {/* Data Storage */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your code snippets are automatically saved to the database.</strong> All workspaces, sections, and code blocks are persisted to the server and synced across devices. Look for the "Saved" indicator in the header to confirm successful storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

