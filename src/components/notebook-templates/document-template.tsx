"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExtension from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextStyle from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import {
  Plus, X, Loader2, Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Link, Unlink, Image, Heading1, Heading2,
  Heading3, Quote, Code, Undo, Redo, Palette, Highlighter,
  Minus, Download, Printer, Type, ChevronDown, FileText,
  Pencil, Trash2, FolderOpen, PanelLeft, Info, Check, Wand2, Sparkles,
} from "lucide-react";

const FONT_FAMILIES = [
  { name: "Default", value: "" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Courier New", value: "Courier New, monospace" },
  { name: "Comic Sans", value: "Comic Sans MS, cursive" },
  { name: "Impact", value: "Impact, sans-serif" },
  { name: "Trebuchet", value: "Trebuchet MS, sans-serif" },
  { name: "Palatino", value: "Palatino Linotype, serif" },
];

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Dark Gray", value: "#434343" },
  { name: "Gray", value: "#666666" },
  { name: "Light Gray", value: "#999999" },
  { name: "Silver", value: "#cccccc" },
  { name: "White", value: "#ffffff" },
  { name: "Dark Red", value: "#980000" },
  { name: "Red", value: "#ff0000" },
  { name: "Orange", value: "#ff9900" },
  { name: "Yellow", value: "#ffff00" },
  { name: "Green", value: "#00ff00" },
  { name: "Cyan", value: "#00ffff" },
  { name: "Blue", value: "#4a86e8" },
  { name: "Dark Blue", value: "#0000ff" },
  { name: "Purple", value: "#9900ff" },
  { name: "Magenta", value: "#ff00ff" },
];

interface Tab { id: string; name: string; content: string; }
interface Doc { id: string; title: string; subtitle: string; tabs: Tab[]; createdAt: string; updatedAt: string; }
interface DocumentTemplateProps { title: string; notebookId?: string; }

const FontFamilyExtension = Extension.create({
  name: "fontFamily",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontFamily: {
          default: null,
          parseHTML: (el) => (el as HTMLElement).style.fontFamily?.replace(/["']/g, "") || null,
          renderHTML: (attrs) => {
            if (!attrs.fontFamily) return {};
            return { style: `font-family: ${attrs.fontFamily}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontFamily: (fontFamily: string) => ({ chain }: any) =>
        chain().setMark("textStyle", { fontFamily }).run(),
      unsetFontFamily: () => ({ chain }: any) =>
        chain().setMark("textStyle", { fontFamily: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const makeDoc = (t = "Untitled Document"): Doc => ({
  id: Date.now().toString(), title: t, subtitle: "",
  tabs: [{ id: "1", name: "Overview", content: "" }],
  createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString(),
});

function TB({ onClick, active, title, disabled, children }: {
  onClick: () => void; active?: boolean; title: string; disabled?: boolean; children: React.ReactNode;
}) {
  return (
    <button onMouseDown={(e) => { e.preventDefault(); onClick(); }} disabled={disabled} title={title}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 hover:bg-neutral-200 dark:hover:bg-neutral-700 ${active ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" : "text-neutral-700 dark:text-neutral-300"}`}>
      {children}
    </button>
  );
}
const TDiv = () => <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-0.5 flex-shrink-0" />;

function DocumentEditor({ doc, onUpdate, notebookId }: {
  doc: Doc; onUpdate: (p: Partial<Doc>) => void; notebookId?: string;
}) {
  const [activeTabId, setActiveTabId] = useState(doc.tabs[0]?.id ?? "1");
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showFontDD, setShowFontDD] = useState(false);
  const [showLinkDlg, setShowLinkDlg] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeTabIdRef = useRef(activeTabId);
  const docTabsRef = useRef(doc.tabs);
  useEffect(() => { activeTabIdRef.current = activeTabId; }, [activeTabId]);
  useEffect(() => { docTabsRef.current = doc.tabs; }, [doc.tabs]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExtension,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: "Start writing your document here..." }),
      TextStyle,
      FontFamilyExtension,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: doc.tabs.find((t) => t.id === activeTabId)?.content ?? "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const tabId = activeTabIdRef.current;
      const newTabs = docTabsRef.current.map((t) => t.id === tabId ? { ...t, content: html } : t);
      onUpdate({ tabs: newTabs, updatedAt: new Date().toLocaleString() });
    },
    editorProps: { attributes: { class: "outline-none min-h-[480px] p-6" } },
  });

  const prevTabIdRef = useRef(activeTabId);
  useEffect(() => {
    if (!editor || prevTabIdRef.current === activeTabId) return;
    prevTabIdRef.current = activeTabId;
    const tab = doc.tabs.find((t) => t.id === activeTabId);
    editor.commands.setContent(tab?.content ?? "", false);
  }, [activeTabId, editor, doc.tabs]);

  const addTab = () => {
    if (!newTabName.trim()) return;
    const t: Tab = { id: Date.now().toString(), name: newTabName, content: "" };
    onUpdate({ tabs: [...doc.tabs, t] });
    setActiveTabId(t.id); setNewTabName(""); setIsAddingTab(false);
  };
  const removeTab = (id: string) => {
    if (doc.tabs.length <= 1) return;
    const next = doc.tabs.filter((t) => t.id !== id);
    onUpdate({ tabs: next });
    if (activeTabId === id) setActiveTabId(next[0].id);
  };
  const insertLink = () => {
    if (linkUrl && editor) editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    setLinkUrl(""); setShowLinkDlg(false);
  };
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { alert("Image must be under 10 MB"); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "attachment");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch { alert("Image upload failed. Please try again."); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };
  const printDoc = () => {
    const w = window.open("", "_blank"); if (!w) return;
    w.document.write(`<html><head><title>${doc.title}</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto}h1{font-size:2em;font-weight:700}h2{font-size:1.5em;font-weight:700}h3{font-size:1.2em;font-weight:700}strong{font-weight:700}em{font-style:italic}ul{list-style:disc;padding-left:1.5em}ol{list-style:decimal;padding-left:1.5em}blockquote{border-left:3px solid #ccc;padding-left:1em;margin-left:0}pre{background:#f4f4f4;padding:12px;border-radius:4px}img{max-width:100%}</style></head><body><h1>${doc.title}</h1><p style="color:#666">${doc.subtitle}</p><hr/>${editor?.getHTML() ?? ""}</body></html>`);
    w.document.close(); w.print();
  };
  const exportHtml = () => {
    const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${doc.title}</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px}h1{font-size:2em;font-weight:700}h2{font-size:1.5em;font-weight:700}strong{font-weight:700}em{font-style:italic}img{max-width:100%}</style></head><body><h1>${doc.title}</h1><p>${doc.subtitle}</p><hr/>${editor?.getHTML() ?? ""}</body></html>`], { type: "text/html" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${doc.title || "document"}.html` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const handleAIAction = async (action: 'grammar' | 'beautify') => {
    if (!editor) return;
    const content = editor.getText();
    if (!content.trim()) {
      alert('Please add some content first');
      return;
    }

    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          mode: 'chat',
          message: action === 'grammar'
            ? `Please correct all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text without any explanations:\n\n${content}`
            : `Please beautify and improve the following text by making it more eloquent, professional, and well-structured. Maintain the original meaning. Return ONLY the improved text without any explanations:\n\n${content}`,
          context: [],
        }),
      });

      if (!res.ok) {
        throw new Error('AI request failed');
      }

      const data = await res.json();
      if (data.response) {
        setAiResult(data.response);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('AI action failed:', error);
      alert('AI feature failed. Please check your OpenAI API key and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIResult = () => {
    if (aiResult && editor) {
      editor.commands.setContent(aiResult);
      setShowAIPanel(false);
      setAiResult('');
    }
  };

  if (!editor) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>;

  return (
    <div className="flex flex-col h-full">
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
      <div className="px-6 pt-5 pb-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <input value={doc.title} onChange={(e) => onUpdate({ title: e.target.value, updatedAt: new Date().toLocaleString() })} placeholder="Document title..." className="w-full text-2xl font-bold bg-transparent outline-none text-neutral-900 dark:text-white placeholder-neutral-300 dark:placeholder-neutral-600 mb-1" />
        <input value={doc.subtitle} onChange={(e) => onUpdate({ subtitle: e.target.value, updatedAt: new Date().toLocaleString() })} placeholder="Add a subtitle or description..." className="w-full text-sm bg-transparent outline-none text-neutral-500 dark:text-neutral-400 placeholder-neutral-400" />
      </div>
      <div className="flex items-center gap-1 px-4 pt-2 pb-0 overflow-x-auto flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        {doc.tabs.map((tab) => (
          <div key={tab.id} className="relative group flex-shrink-0">
            <button onMouseDown={(e) => { e.preventDefault(); setActiveTabId(tab.id); }} className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${activeTabId === tab.id ? "border-amber-500 text-amber-700 dark:text-amber-300 bg-white dark:bg-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"}`}>{tab.name}</button>
            {doc.tabs.length > 1 && <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeTab(tab.id); }} className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>}
          </div>
        ))}
        {isAddingTab ? (
          <div className="flex items-center gap-1.5 px-2">
            <input value={newTabName} onChange={(e) => setNewTabName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTab()} placeholder="Tab name..." autoFocus className="px-2 py-1 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded outline-none w-24" />
            <button onClick={addTab} className="text-xs text-emerald-600 font-medium">Add</button>
            <button onClick={() => { setIsAddingTab(false); setNewTabName(""); }} className="text-xs text-neutral-400">x</button>
          </div>
        ) : (
          <button onMouseDown={(e) => { e.preventDefault(); setIsAddingTab(true); }} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 flex-shrink-0"><Plus className="w-3.5 h-3.5 text-neutral-500" /></button>
        )}
      </div>
      <div className="flex-shrink-0 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 px-3 py-1.5 flex flex-wrap items-center gap-0.5">
        <TB onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="w-4 h-4" /></TB>
        <TDiv />
        <div className="relative">
          <button onMouseDown={(e) => { e.preventDefault(); setShowFontDD((v) => !v); setShowTextColor(false); setShowHighlight(false); }} className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
            <Type className="w-3.5 h-3.5" /> Font <ChevronDown className="w-3 h-3" />
          </button>
          {showFontDD && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 min-w-[170px] max-h-56 overflow-auto">
              {FONT_FAMILIES.map((f) => (
                <button key={f.name} style={{ fontFamily: f.value || "inherit" }} onMouseDown={(e) => { e.preventDefault(); f.value ? (editor.chain().focus() as any).setFontFamily(f.value).run() : (editor.chain().focus() as any).unsetFontFamily().run(); setShowFontDD(false); }} className="block w-full text-left px-3 py-1.5 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 text-neutral-800 dark:text-neutral-200">{f.name}</button>
              ))}
            </div>
          )}
        </div>
        <TDiv />
        <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><Underline className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><Strikethrough className="w-4 h-4" /></TB>
        <TDiv />
        <div className="relative">
          <button onMouseDown={(e) => { e.preventDefault(); setShowTextColor((v) => !v); setShowHighlight(false); setShowFontDD(false); }} className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300" title="Text color"><Palette className="w-4 h-4" /></button>
          {showTextColor && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 w-64">
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Text Color</p>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c.value).run(); setShowTextColor(false); }}
                    className="flex flex-col items-center gap-1 p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    title={c.name}
                  >
                    <div className="w-8 h-8 rounded border-2 border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: c.value }} />
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 text-center leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onMouseDown={(e) => { e.preventDefault(); setShowHighlight((v) => !v); setShowTextColor(false); setShowFontDD(false); }} className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300" title="Highlight"><Highlighter className="w-4 h-4" /></button>
          {showHighlight && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 w-64">
              <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">Highlight Color</p>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: c.value }).run(); setShowHighlight(false); }}
                    className="flex flex-col items-center gap-1 p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    title={c.name}
                  >
                    <div className="w-8 h-8 rounded border-2 border-neutral-300 dark:border-neutral-600" style={{ backgroundColor: c.value }} />
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 text-center leading-tight">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <TDiv />
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1"><Heading1 className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 className="w-4 h-4" /></TB>
        <TDiv />
        <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered className="w-4 h-4" /></TB>
        <TDiv />
        <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote"><Quote className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block"><Code className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider"><Minus className="w-4 h-4" /></TB>
        <TDiv />
        <TB onClick={() => setShowLinkDlg(true)} active={editor.isActive("link")} title="Insert link"><Link className="w-4 h-4" /></TB>
        <TB onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive("link")} title="Remove link"><Unlink className="w-4 h-4" /></TB>
        <TB onClick={() => fileInputRef.current?.click()} title="Upload image" disabled={isUploading}>{isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}</TB>
        <TDiv />
        <TB onClick={printDoc} title="Print"><Printer className="w-4 h-4" /></TB>
        <TB onClick={exportHtml} title="Export HTML"><Download className="w-4 h-4" /></TB>
        <TDiv />
        <TB onClick={() => setShowAIPanel(true)} title="AI Tools" active={showAIPanel}><Wand2 className="w-4 h-4" /></TB>
      </div>
      <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-900"><EditorContent editor={editor} /></div>
      
      {/* AI Panel */}
      {showAIPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                AI Writing Assistant
              </h3>
              <button onClick={() => { setShowAIPanel(false); setAiResult(''); }} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <button
                  onClick={() => handleAIAction('grammar')}
                  disabled={aiLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Correct Grammar
                </button>
                <button
                  onClick={() => handleAIAction('beautify')}
                  disabled={aiLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Beautify Content
                </button>
              </div>
              
              {aiLoading && (
                <div className="flex items-center justify-center py-8 text-neutral-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Processing with AI...
                </div>
              )}
              
              {aiResult && (
                <div className="space-y-3">
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 max-h-96 overflow-y-auto">
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">AI Result:</p>
                    <div className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{aiResult}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={applyAIResult}
                      className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Apply to Document
                    </button>
                    <button
                      onClick={() => setAiResult('')}
                      className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              )}
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> The AI will analyze your entire document content and provide improved versions. Review the results before applying.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showLinkDlg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-base font-semibold mb-3 text-neutral-900 dark:text-white">Insert Link</h3>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && insertLink()} placeholder="https://example.com" autoFocus className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg mb-4 bg-transparent outline-none text-sm text-neutral-900 dark:text-white" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLinkDlg(false)} className="px-4 py-2 text-sm text-neutral-500">Cancel</button>
              <button onClick={insertLink} className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DocumentTemplate({ title, notebookId }: DocumentTemplateProps) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const pageIdRef = useRef<string | null>(null);
  useEffect(() => { pageIdRef.current = pageId; }, [pageId]);

  const activeDoc = docs.find((d) => d.id === activeDocId) ?? docs[0] ?? null;

  useEffect(() => {
    if (!notebookId) {
      const initial = makeDoc("Untitled Document");
      setDocs([initial]); setActiveDocId(initial.id); setLoading(false); return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const data = await res.json();
        const pages: any[] = data.pages || [];
        const templatePage = pages.find((p: any) => p.title === "__doc_template__");
        console.log('[DOC TEMPLATE] Loading data:', { templatePage, content: templatePage?.content });
        if (templatePage) {
          setPageId(templatePage._id);
          pageIdRef.current = templatePage._id;
          try {
            const parsed: Doc[] = JSON.parse(templatePage.content || "[]");
            console.log('[DOC TEMPLATE] Parsed documents:', parsed);
            if (parsed.length) { setDocs(parsed); setActiveDocId(parsed[0].id); setLoading(false); return; }
            // If content is empty, delete corrupted page and recreate
            console.log('[DOC TEMPLATE] Empty content detected, recreating page...');
            await fetch(`/api/notebooks/${notebookId}/pages/${templatePage._id}`, { method: "DELETE" });
          } catch (err) {
            console.error('[DOC TEMPLATE] Parse error:', err);
          }
        }
        const createRes = await fetch(`/api/notebooks/${notebookId}/pages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__doc_template__", content: "[]" }),
        });
        const created = await createRes.json();
        setPageId(created.page._id);
        pageIdRef.current = created.page._id;
        const initial = makeDoc("Untitled Document");
        setDocs([initial]); setActiveDocId(initial.id);
      } catch (err) {
        console.error("Failed to load document template:", err);
        const initial = makeDoc("Untitled Document");
        setDocs([initial]); setActiveDocId(initial.id);
      } finally { setLoading(false); }
    };
    load();
  }, [notebookId]);

  const persist = useCallback((list: Doc[]) => {
    if (!notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current;
      if (!pid) return;
      setSaving(true);
      console.log('[DOC TEMPLATE] Saving documents:', list);
      try {
        const payload = { title: "__doc_template__", content: JSON.stringify(list) };
        console.log('[DOC TEMPLATE] Save payload:', payload);
        const response = await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log('[DOC TEMPLATE] Save response:', result);
        console.log('[DOC TEMPLATE] Saved page content:', result.page?.content);
      } catch (err) { console.error("[DOC TEMPLATE] Failed to save:", err); }
      finally { setSaving(false); }
    }, 1000);
  }, [notebookId]);

  const updateDoc = (id: string, patch: Partial<Doc>) => {
    setDocs((prev) => {
      const next = prev.map((d) => d.id === id ? { ...d, ...patch } : d);
      persist(next);
      return next;
    });
  };

  const createDoc = () => {
    const d = makeDoc("Untitled Document");
    setDocs((prev) => { const next = [...prev, d]; persist(next); return next; });
    setActiveDocId(d.id);
  };

  const deleteDoc = (id: string) => {
    setDocs((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (!next.length) {
        const d = makeDoc("Untitled Document");
        persist([d]); setActiveDocId(d.id); return [d];
      }
      persist(next);
      if (activeDocId === id) setActiveDocId(next[0].id);
      return next;
    });
  };

  const startRename = (d: Doc) => { setRenamingId(d.id); setRenameVal(d.title); };
  const commitRename = () => {
    if (renamingId && renameVal.trim()) updateDoc(renamingId, { title: renameVal.trim() });
    setRenamingId(null);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <TemplateHeader title={title} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
      <TemplateFooter />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <TemplateHeader title={title} />
      <div className="flex-1 flex overflow-hidden">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Documents</span>
              </div>
              <button onClick={createDoc} title="New document" className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setActiveDocId(d.id)}
                  className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${activeDocId === d.id ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                >
                  <FileText className={`w-4 h-4 flex-shrink-0 ${activeDocId === d.id ? "text-amber-500" : "text-neutral-400"}`} />
                  <div className="flex-1 min-w-0">
                    {renamingId === d.id ? (
                      <input
                        value={renameVal}
                        onChange={(e) => setRenameVal(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingId(null); }}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full text-sm bg-white dark:bg-neutral-700 border border-amber-400 rounded px-1 outline-none text-neutral-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-sm font-medium truncate text-neutral-800 dark:text-neutral-200">{d.title}</p>
                    )}
                    <p className="text-xs text-neutral-400 truncate">{d.updatedAt}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); startRename(d); }} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500" title="Rename">
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteDoc(d.id); }} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" title="Delete">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
          <button onClick={() => setSidebarOpen((v) => !v)} className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500" title="Toggle sidebar">
            <PanelLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 truncate flex-1">{activeDoc?.title || "No document selected"}</span>
          {/* Documentation Info Button */}
          <button
            onClick={() => setShowDocumentation(true)}
            className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            title="Know More"
          >
            <Info className="h-4 w-4" />
          </button>
          {saving && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </div>
          )}
          {!saving && notebookId && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400">Saved</div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeDoc ? (
            <DocumentEditor
              key={activeDoc.id}
              doc={activeDoc}
              onUpdate={(patch) => updateDoc(activeDoc.id, patch)}
              notebookId={notebookId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-400">
              <FileText className="w-16 h-16 opacity-20" />
              <p className="text-lg font-medium">No document selected</p>
              <button onClick={createDoc} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                Create Document
              </button>
            </div>
          )}
        </div>

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700"
            >
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Document Template Guide</h2>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-600" />
                    Overview
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    A professional document editor with rich text formatting, multi-tab support, and cloud storage. 
                    Create, organize, and edit multiple documents with a powerful WYSIWYG editor and comprehensive formatting tools.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Rich Text Editor
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Full WYSIWYG editor with bold, italic, underline, headings, lists, quotes, code blocks, and more
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Advanced Formatting
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Custom fonts, text colors, highlights, links, images, and horizontal dividers
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Multi-Tab Support
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Organize content with multiple tabs per document (Overview, Details, Notes, etc.)
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Export & Print
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Export documents as HTML files or print directly from the editor
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">How to Use</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Create Documents</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Click the + button in the sidebar to create a new document. Each document starts with a default "Overview" tab.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Format Content</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Use the toolbar to apply formatting: bold, italic, underline, headings, lists, quotes, colors, highlights, links, and images.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Organize with Tabs</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Click + next to tabs to add sections. Remove tabs by hovering and clicking X (minimum 1 tab required).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">Pro Tips</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        <strong>Auto-save:</strong> All changes are automatically saved to the database after 1 second of inactivity
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        <strong>Keyboard Shortcuts:</strong> Use Ctrl+B (bold), Ctrl+I (italic), Ctrl+Z (undo)
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        <strong>Image Uploads:</strong> Images are uploaded to cloud storage (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Data Storage
                  </h3>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    Your documents are automatically saved to the <strong>database</strong> via API calls. All changes are persisted 
                    to the server and synced across devices. The "Saved" indicator confirms successful database storage.
                  </p>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
