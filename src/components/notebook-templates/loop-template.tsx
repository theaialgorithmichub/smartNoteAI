"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, Plus, Loader2, Type, CheckSquare, Table, Vote,
  ChevronDown, MessageSquare, Hash, Trash2, GripVertical, X,
  Image, Code, Quote, List, ListOrdered, Minus, Link2,
  Upload, ChevronLeft, ChevronRight, Pencil, Copy, Check,
  AlignLeft, Heading1, Heading2, Heading3, Info,
} from "lucide-react";

//  Types 

type BlockType =
  | "text" | "h1" | "h2" | "h3"
  | "bullet" | "numbered"
  | "checklist" | "quote" | "callout" | "divider" | "toggle"
  | "image" | "code" | "table" | "voting" | "embed";

interface ChecklistItem { id: string; text: string; checked: boolean; }
interface VotingOption  { id: string; text: string; votes: number; }
interface TableData     { headers: string[]; rows: string[][]; }

interface Block {
  id: string;
  type: BlockType;
  content: string;
  // checklist
  items?: ChecklistItem[];
  // voting
  votingOptions?: VotingOption[];
  // table
  tableData?: TableData;
  // toggle
  isExpanded?: boolean;
  // callout
  calloutType?: "info" | "warning" | "success" | "error";
  // image
  imageUrl?: string;
  imageCaption?: string;
  // code
  language?: string;
  // bullet / numbered  content is the text, children handled via indentLevel
  indentLevel?: number;
}

interface Workspace {
  id: string;
  name: string;
  icon: string;
  headerImage: string | null;   // base64 or URL
  headerColor: string;          // fallback gradient
  pageTitle: string;
  blocks: Block[];
  createdAt: string;
}

interface LoopTemplateProps { title?: string; notebookId?: string; }

//  Constants 

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const HEADER_COLORS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-600",
  "from-yellow-400 to-orange-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-600",
];

const WORKSPACE_ICONS = ["","","","","","","","","","","",""];

const CODE_LANGUAGES = ["javascript","typescript","python","rust","go","java","cpp","css","html","bash","json","sql","yaml","markdown"];

const BLOCK_MENU_ITEMS: { type: BlockType; icon: React.ElementType; label: string; description: string; group: string }[] = [
  { type: "text",      icon: AlignLeft,    label: "Text",          description: "Plain paragraph",         group: "Basic" },
  { type: "h1",        icon: Heading1,     label: "Heading 1",     description: "Large section title",     group: "Basic" },
  { type: "h2",        icon: Heading2,     label: "Heading 2",     description: "Medium section title",    group: "Basic" },
  { type: "h3",        icon: Heading3,     label: "Heading 3",     description: "Small section title",     group: "Basic" },
  { type: "bullet",    icon: List,         label: "Bullet List",   description: "Unordered list",          group: "Lists" },
  { type: "numbered",  icon: ListOrdered,  label: "Numbered List", description: "Ordered list",            group: "Lists" },
  { type: "checklist", icon: CheckSquare,  label: "Checklist",     description: "Task list with checkboxes",group: "Lists" },
  { type: "quote",     icon: Quote,        label: "Quote",         description: "Blockquote",              group: "Content" },
  { type: "callout",   icon: MessageSquare,label: "Callout",       description: "Highlighted note",        group: "Content" },
  { type: "toggle",    icon: ChevronDown,  label: "Toggle",        description: "Collapsible section",     group: "Content" },
  { type: "image",     icon: Image,        label: "Image",         description: "Upload or paste image",   group: "Media" },
  { type: "code",      icon: Code,         label: "Code Block",    description: "Syntax-highlighted code", group: "Media" },
  { type: "embed",     icon: Link2,        label: "Embed",         description: "Embed a URL",             group: "Media" },
  { type: "table",     icon: Table,        label: "Table",         description: "Editable data table",     group: "Advanced" },
  { type: "voting",    icon: Vote,         label: "Poll",          description: "Voting / poll block",     group: "Advanced" },
  { type: "divider",   icon: Minus,        label: "Divider",       description: "Horizontal rule",         group: "Advanced" },
];

const blankWorkspace = (name = "Untitled Workspace"): Workspace => ({
  id: makeId(), name, icon: "",
  headerImage: null, headerColor: HEADER_COLORS[Math.floor(Math.random() * HEADER_COLORS.length)],
  pageTitle: "", blocks: [], createdAt: new Date().toISOString(),
});

const makeBlock = (type: BlockType): Block => ({
  id: makeId(), type, content: "",
  items:         type === "checklist" ? [] : undefined,
  votingOptions: type === "voting"    ? [{ id: makeId(), text: "", votes: 0 }] : undefined,
  tableData:     type === "table"     ? { headers: ["Column 1","Column 2","Column 3"], rows: [["","",""]] } : undefined,
  isExpanded:    type === "toggle"    ? true : undefined,
  calloutType:   type === "callout"   ? "info" : undefined,
  language:      type === "code"      ? "javascript" : undefined,
  indentLevel:   (type === "bullet" || type === "numbered") ? 0 : undefined,
});

const CALLOUT_STYLES = {
  info:    "bg-blue-50   dark:bg-blue-900/20   border-blue-300   dark:border-blue-700   text-blue-800   dark:text-blue-200",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
  success: "bg-green-50  dark:bg-green-900/20  border-green-300  dark:border-green-700  text-green-800  dark:text-green-200",
  error:   "bg-red-50    dark:bg-red-900/20    border-red-300    dark:border-red-700    text-red-800    dark:text-red-200",
};
const CALLOUT_ICONS = { info: "?", warning: "", success: "", error: "" };


//  BlockMenu 

function BlockMenu({ onSelect, onClose }: { onSelect: (t: BlockType) => void; onClose: () => void }) {
  const groups = Array.from(new Set(BLOCK_MENU_ITEMS.map(b => b.group)));
  return (
    <div className="absolute left-0 top-8 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-3 z-30 w-72">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide px-2 mb-2">Add Block</p>
      {groups.map(group => (
        <div key={group} className="mb-2">
          <p className="text-[10px] font-semibold text-neutral-300 dark:text-neutral-600 uppercase tracking-wide px-2 mb-1">{group}</p>
          {BLOCK_MENU_ITEMS.filter(b => b.group === group).map(item => (
            <button key={item.type} onClick={() => { onSelect(item.type); onClose(); }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group">
              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                <item.icon className="w-4 h-4 text-neutral-500 group-hover:text-purple-600"/>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.label}</p>
                <p className="text-[10px] text-neutral-400">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

//  BlockRenderer 

interface BlockRendererProps {
  block: Block;
  index: number;
  totalBlocks: number;
  showMenu: boolean;
  onUpdate: (patch: Partial<Block>) => void;
  onDelete: () => void;
  onAddAfter: (type: BlockType) => void;
  onShowMenu: () => void;
  onHideMenu: () => void;
  onMove: (from: number, to: number) => void;
  draggedId: string | null;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function BlockRenderer({ block, index, showMenu, onUpdate, onDelete, onAddAfter, onShowMenu, onHideMenu, onMove, draggedId, onDragStart, onDragOver, onDragEnd }: BlockRendererProps) {
  const [copied, setCopied] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (files: FileList | null) => {
    if (!files?.[0]) return;
    const reader = new FileReader();
    reader.onload = e => onUpdate({ imageUrl: e.target?.result as string });
    reader.readAsDataURL(files[0]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const addChecklistItem = () => onUpdate({ items: [...(block.items || []), { id: makeId(), text: "", checked: false }] });
  const updateItem = (id: string, patch: Partial<ChecklistItem>) => onUpdate({ items: block.items?.map(i => i.id === id ? { ...i, ...patch } : i) });
  const deleteItem = (id: string) => onUpdate({ items: block.items?.filter(i => i.id !== id) });

  const addVoteOption = () => onUpdate({ votingOptions: [...(block.votingOptions || []), { id: makeId(), text: "", votes: 0 }] });
  const vote = (id: string) => onUpdate({ votingOptions: block.votingOptions?.map(o => o.id === id ? { ...o, votes: o.votes + 1 } : o) });

  const addTableRow = () => { if (!block.tableData) return; onUpdate({ tableData: { ...block.tableData, rows: [...block.tableData.rows, new Array(block.tableData.headers.length).fill("")] } }); };
  const updateCell = (r: number, c: number, v: string) => { if (!block.tableData) return; const rows = block.tableData.rows.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? v : cell) : row); onUpdate({ tableData: { ...block.tableData, rows } }); };
  const updateHeader = (c: number, v: string) => { if (!block.tableData) return; const headers = block.tableData.headers.map((h, i) => i === c ? v : h); onUpdate({ tableData: { ...block.tableData, headers } }); };

  const totalVotes = block.votingOptions?.reduce((s, o) => s + o.votes, 0) ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`group relative ${draggedId === block.id ? "opacity-40" : ""}`}
      draggable onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>

      {/* Left controls */}
      <div className="absolute -left-10 top-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5"/>
        </button>
        <div className="relative">
          <button onClick={showMenu ? onHideMenu : onShowMenu}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-purple-500">
            <Plus className="w-3.5 h-3.5"/>
          </button>
          {showMenu && <BlockMenu onSelect={t => onAddAfter(t)} onClose={onHideMenu}/>}
        </div>
      </div>

      {/* Delete */}
      <button onClick={onDelete}
        className="absolute -right-8 top-1 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 className="w-3.5 h-3.5"/>
      </button>

      {/* Block content */}
      <div className="min-h-[28px]">

        {block.type === "text" && (
          <textarea value={block.content} onChange={e => onUpdate({ content: e.target.value })}
            placeholder="Type something..." rows={1}
            className="w-full bg-transparent text-neutral-800 dark:text-neutral-200 outline-none resize-none text-base leading-relaxed"
            onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
        )}

        {block.type === "h1" && (
          <input value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Heading 1"
            className="w-full text-4xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none"/>
        )}
        {block.type === "h2" && (
          <input value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Heading 2"
            className="w-full text-2xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none"/>
        )}
        {block.type === "h3" && (
          <input value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Heading 3"
            className="w-full text-xl font-semibold text-neutral-900 dark:text-white bg-transparent outline-none"/>
        )}

        {block.type === "bullet" && (
          <div className="flex items-start gap-2" style={{ paddingLeft: `${(block.indentLevel || 0) * 20}px` }}>
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-500 flex-shrink-0"/>
            <textarea value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="List item..." rows={1}
              className="flex-1 bg-transparent text-neutral-800 dark:text-neutral-200 outline-none resize-none leading-relaxed"
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
          </div>
        )}

        {block.type === "numbered" && (
          <div className="flex items-start gap-2" style={{ paddingLeft: `${(block.indentLevel || 0) * 20}px` }}>
            <span className="mt-0.5 text-sm font-semibold text-neutral-500 flex-shrink-0 w-5 text-right">{index + 1}.</span>
            <textarea value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="List item..." rows={1}
              className="flex-1 bg-transparent text-neutral-800 dark:text-neutral-200 outline-none resize-none leading-relaxed"
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
          </div>
        )}

        {block.type === "quote" && (
          <div className="flex gap-3">
            <div className="w-1 bg-purple-400 rounded-full flex-shrink-0"/>
            <textarea value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Quote..." rows={2}
              className="flex-1 bg-transparent text-neutral-600 dark:text-neutral-400 italic outline-none resize-none text-lg leading-relaxed"
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
          </div>
        )}

        {block.type === "callout" && (
          <div className={`p-4 rounded-xl border-l-4 ${CALLOUT_STYLES[block.calloutType || "info"]}`}>
            <div className="flex items-center gap-2 mb-2">
              <span>{CALLOUT_ICONS[block.calloutType || "info"]}</span>
              <div className="flex gap-1">
                {(["info","warning","success","error"] as const).map(t => (
                  <button key={t} onClick={() => onUpdate({ calloutType: t })}
                    className={`px-2 py-0.5 rounded text-[10px] capitalize font-medium transition-colors ${block.calloutType === t ? "bg-black/10 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"}`}>{t}</button>
                ))}
              </div>
            </div>
            <textarea value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Callout text..." rows={2}
              className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
          </div>
        )}

        {block.type === "toggle" && (
          <div>
            <button onClick={() => onUpdate({ isExpanded: !block.isExpanded })}
              className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white w-full text-left">
              <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${block.isExpanded ? "" : "-rotate-90"}`}/>
              <input value={block.content} onChange={e => { e.stopPropagation(); onUpdate({ content: e.target.value }); }}
                onClick={e => e.stopPropagation()} placeholder="Toggle title..."
                className="flex-1 bg-transparent outline-none font-semibold"/>
            </button>
            {block.isExpanded && (
              <div className="ml-6 mt-2 pl-4 border-l-2 border-neutral-200 dark:border-neutral-700">
                <textarea value={block.content.split("\n").slice(1).join("\n")} rows={3}
                  onChange={e => onUpdate({ content: block.content.split("\n")[0] + "\n" + e.target.value })}
                  placeholder="Toggle content..."
                  className="w-full bg-transparent text-neutral-600 dark:text-neutral-400 outline-none resize-none text-sm leading-relaxed"
                  onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
              </div>
            )}
          </div>
        )}

        {block.type === "image" && (
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            {block.imageUrl ? (
              <div className="group/img relative">
                <img src={block.imageUrl} alt={block.imageCaption || "Image"} className="w-full max-h-96 object-cover"/>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                  <button onClick={() => onUpdate({ imageUrl: undefined })}
                    className="p-1.5 bg-black/50 hover:bg-red-500 rounded-lg text-white transition-colors">
                    <Trash2 className="w-3.5 h-3.5"/>
                  </button>
                </div>
                <input value={block.imageCaption || ""} onChange={e => onUpdate({ imageCaption: e.target.value })}
                  placeholder="Add a caption..." className="w-full px-4 py-2 text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-900 outline-none text-center"/>
              </div>
            ) : (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleImageFile(e.dataTransfer.files); }}
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                <Image className="w-10 h-10 text-neutral-300 mb-3"/>
                <p className="text-sm text-neutral-400 font-medium">Click or drag to upload image</p>
                <p className="text-xs text-neutral-300 mt-1">PNG, JPG, GIF, WebP supported</p>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleImageFile(e.target.files)}/>
              </div>
            )}
          </div>
        )}

        {block.type === "code" && (
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950">
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
              <select value={block.language || "javascript"} onChange={e => onUpdate({ language: e.target.value })}
                className="bg-transparent text-neutral-400 text-xs outline-none">
                {CODE_LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                {copied ? <><Check className="w-3 h-3 text-green-400"/> Copied</> : <><Copy className="w-3 h-3"/> Copy</>}
              </button>
            </div>
            <textarea value={block.content} onChange={e => onUpdate({ content: e.target.value })}
              placeholder="// Write your code here..." rows={6} spellCheck={false}
              className="w-full bg-transparent text-green-400 font-mono text-sm outline-none resize-none px-4 py-3 leading-relaxed"
              onInput={e => { const t = e.target as HTMLTextAreaElement; t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }}/>
          </div>
        )}

        {block.type === "embed" && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            {block.content ? (
              <div>
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
                  <Link2 className="w-3.5 h-3.5 text-neutral-400"/>
                  <input value={block.content} onChange={e => onUpdate({ content: e.target.value })}
                    className="flex-1 text-xs text-neutral-500 bg-transparent outline-none truncate"/>
                  <a href={block.content} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-purple-500 hover:text-purple-600 flex-shrink-0">Open </a>
                </div>
                <iframe src={block.content} className="w-full h-64 border-0" sandbox="allow-scripts allow-same-origin allow-popups"/>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-xs text-neutral-400 mb-2">Paste a URL to embed</p>
                <input value={block.content} onChange={e => onUpdate({ content: e.target.value })}
                  placeholder="https://..." className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
              </div>
            )}
          </div>
        )}

        {block.type === "checklist" && (
          <div className="space-y-1.5">
            {block.items?.map(item => (
              <div key={item.id} className="flex items-center gap-2 group/item">
                <button onClick={() => updateItem(item.id, { checked: !item.checked })} className="flex-shrink-0">
                  {item.checked
                    ? <div className="w-4 h-4 rounded bg-purple-500 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white"/></div>
                    : <div className="w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-600"/>}
                </button>
                <input value={item.text} onChange={e => updateItem(item.id, { text: e.target.value })} placeholder="Task..."
                  className={`flex-1 bg-transparent outline-none text-sm ${item.checked ? "line-through text-neutral-400" : "text-neutral-800 dark:text-neutral-200"}`}/>
                <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover/item:opacity-100 text-neutral-300 hover:text-red-500 transition-all">
                  <X className="w-3 h-3"/>
                </button>
              </div>
            ))}
            <button onClick={addChecklistItem} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-purple-500 transition-colors mt-1">
              <Plus className="w-3 h-3"/> Add item
            </button>
          </div>
        )}

        {block.type === "table" && block.tableData && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900">
                  {block.tableData.headers.map((h, i) => (
                    <th key={i} className="border-b border-r last:border-r-0 border-neutral-200 dark:border-neutral-800 p-2">
                      <input value={h} onChange={e => updateHeader(i, e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold text-neutral-600 dark:text-neutral-400 outline-none text-center"/>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.tableData.rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="border-b border-r last:border-r-0 border-neutral-100 dark:border-neutral-800 p-2">
                        <input value={cell} onChange={e => updateCell(ri, ci, e.target.value)}
                          className="w-full bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none"/>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addTableRow} className="w-full py-2 text-xs text-neutral-400 hover:text-purple-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors flex items-center justify-center gap-1">
              <Plus className="w-3 h-3"/> Add row
            </button>
          </div>
        )}

        {block.type === "voting" && (
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
            <input value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Poll question..."
              className="w-full font-semibold text-neutral-900 dark:text-white bg-transparent outline-none mb-4"/>
            <div className="space-y-2">
              {block.votingOptions?.map(opt => {
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="flex items-center gap-3">
                    <button onClick={() => vote(opt.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xs font-bold hover:bg-purple-200 transition-colors">
                      {opt.votes}
                    </button>
                    <div className="flex-1">
                      <input value={opt.text} onChange={e => onUpdate({ votingOptions: block.votingOptions?.map(o => o.id === opt.id ? { ...o, text: e.target.value } : o) })}
                        placeholder="Option..." className="w-full bg-transparent outline-none text-sm text-neutral-700 dark:text-neutral-300 mb-1"/>
                      <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400 w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
            <button onClick={addVoteOption} className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-purple-500 transition-colors">
              <Plus className="w-3 h-3"/> Add option
            </button>
          </div>
        )}

        {block.type === "divider" && (
          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"/>
            <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"/>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800"/>
          </div>
        )}
      </div>
    </motion.div>
  );
}


//  Main Component 

export function LoopTemplate({ title = "Loop Workspace", notebookId }: LoopTemplateProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, _setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);

  // Workspace form
  const [showWsForm, setShowWsForm] = useState(false);
  const [wsFormName, setWsFormName] = useState("");
  const [wsFormIcon, setWsFormIcon] = useState("");
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Block menu
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Header image
  const headerImageRef = useRef<HTMLInputElement>(null);

  // DB refs
  const pageIdRef = useRef<string | null>(null);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<Workspace[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    _setActiveId(id);
  }, []);

  // Keep wsRef always in sync with the latest committed state
  useEffect(() => { wsRef.current = workspaces; }, [workspaces]);

  const ws = workspaces.find(w => w.id === activeId) ?? null;

  //  DB Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__loop_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const data = JSON.parse(existing.content || "{}");
            const loaded: Workspace[] = data.workspaces ?? [];
            setWorkspaces(loaded); wsRef.current = loaded;
            const aid = data.activeId ?? loaded[0]?.id ?? null;
            activeIdRef.current = aid; _setActiveId(aid);
          } catch {}
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__loop_template__", content: JSON.stringify({ workspaces: [], activeId: null }) }),
          });
          const created = await cr.json();
          pageIdRef.current = created.page?._id ?? null;
        }
      } catch (err) { console.error("Load failed:", err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  //  DB Save 
  useEffect(() => {
    if (saveVersion === 0 || !notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current; if (!pid) return;
      setSaving(true);
      try {
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__loop_template__", content: JSON.stringify({ workspaces: wsRef.current, activeId: activeIdRef.current }) }),
        });
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion, notebookId]);

  const setAndSave = useCallback((updater: Workspace[] | ((prev: Workspace[]) => Workspace[])) => {
    setWorkspaces(updater); bumpSave();
  }, [bumpSave]);

  const updateWs = useCallback((patch: Partial<Workspace> | ((w: Workspace) => Workspace)) => {
    setWorkspaces(prev => {
      const id = activeIdRef.current;
      return prev.map(w => w.id === id ? (typeof patch === "function" ? patch(w) : { ...w, ...patch }) : w);
    });
    bumpSave();
  }, [bumpSave]);

  //  Workspace CRUD 
  const createWorkspace = () => {
    if (!wsFormName.trim()) return;
    const w = blankWorkspace(wsFormName.trim());
    w.icon = wsFormIcon;
    activeIdRef.current = w.id;
    setAndSave(prev => [...prev, w]);
    setActiveId(w.id);
    setShowWsForm(false); setWsFormName(""); setWsFormIcon("📝");
  };

  const saveEditWorkspace = () => {
    if (!editingWsId || !wsFormName.trim()) return;
    updateWs(w => ({ ...w, name: wsFormName.trim(), icon: wsFormIcon }));
    setEditingWsId(null); setWsFormName(""); setWsFormIcon("");
  };

  const deleteWorkspace = (id: string) => {
    setAndSave(prev => {
      const next = prev.filter(w => w.id !== id);
      if (activeId === id) {
        const newId = next[0]?.id ?? null;
        activeIdRef.current = newId; _setActiveId(newId);
      }
      return next;
    });
    setConfirmDeleteId(null);
  };

  //  Block CRUD 
  const addBlock = (type: BlockType, afterId?: string) => {
    const b = makeBlock(type);
    updateWs(w => {
      const blocks = [...w.blocks];
      if (afterId) {
        const idx = blocks.findIndex(x => x.id === afterId);
        blocks.splice(idx + 1, 0, b);
      } else {
        blocks.push(b);
      }
      return { ...w, blocks };
    });
    setShowBlockMenu(null);
  };

  const updateBlock = useCallback((id: string, patch: Partial<Block>) => {
    updateWs(w => ({ ...w, blocks: w.blocks.map(b => b.id === id ? { ...b, ...patch } : b) }));
  }, [updateWs]);

  const deleteBlock = (id: string) => {
    updateWs(w => ({ ...w, blocks: w.blocks.filter(b => b.id !== id) }));
  };

  const moveBlock = (from: number, to: number) => {
    updateWs(w => {
      const blocks = [...w.blocks];
      const [removed] = blocks.splice(from, 1);
      blocks.splice(to, 0, removed);
      return { ...w, blocks };
    });
  };

  //  Header image 
  const handleHeaderImage = (files: FileList | null) => {
    if (!files?.[0]) return;
    const reader = new FileReader();
    reader.onload = e => updateWs(w => ({ ...w, headerImage: e.target?.result as string }));
    reader.readAsDataURL(files[0]);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex overflow-hidden">
      {/* Saving */}
      {saving && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 text-xs px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-500"/> Saving...
        </div>
      )}

      {/*  Sidebar  */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <LayoutGrid className="w-3.5 h-3.5 text-white"/>
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowDocumentation(true)} className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-purple-500" title="Documentation">
                    <Info className="w-4 h-4"/>
                  </button>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400">
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <button onClick={() => { setWsFormName(""); setWsFormIcon(""); setShowWsForm(true); }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4"/> New Workspace
              </button>
            </div>

            {/* Workspace form */}
            {(showWsForm || editingWsId) && (
              <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
                <input value={wsFormName} onChange={e => setWsFormName(e.target.value)}
                  placeholder="Workspace name" autoFocus
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl outline-none text-sm border border-neutral-200 dark:border-neutral-700"/>
                <div className="flex flex-wrap gap-1">
                  {WORKSPACE_ICONS.map(icon => (
                    <button key={icon} onClick={() => setWsFormIcon(icon)}
                      className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-colors ${wsFormIcon === icon ? "bg-purple-100 dark:bg-purple-900/30 ring-1 ring-purple-400" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                      {icon}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={editingWsId ? saveEditWorkspace : createWorkspace} disabled={!wsFormName.trim()}
                    className="flex-1 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium">
                    {editingWsId ? "Save" : "Create"}
                  </button>
                  <button onClick={() => { setShowWsForm(false); setEditingWsId(null); setWsFormName(""); }}
                    className="px-3 py-1.5 text-neutral-400 text-xs">Cancel</button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {workspaces.length === 0 && <p className="text-xs text-neutral-400 italic px-2 py-4">No workspaces yet</p>}
              {workspaces.map(w => (
                <div key={w.id} className={`rounded-xl mb-1 transition-all ${w.id === activeId ? "bg-purple-50 dark:bg-purple-900/20 ring-1 ring-purple-200 dark:ring-purple-800" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                  <div className="flex items-center gap-2 p-2.5 group cursor-pointer" onClick={() => setActiveId(w.id)}>
                    <span className="text-base flex-shrink-0">{w.icon}</span>
                    <p className={`flex-1 text-sm font-medium truncate ${w.id === activeId ? "text-purple-700 dark:text-purple-300" : "text-neutral-700 dark:text-neutral-300"}`}>{w.name}</p>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); setWsFormName(w.name); setWsFormIcon(w.icon); setEditingWsId(w.id); setShowWsForm(false); }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"><Pencil className="w-3 h-3"/></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === w.id ? null : w.id); }}
                        className={`p-1 rounded transition-colors ${confirmDeleteId === w.id ? "bg-red-100 text-red-500" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"}`}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  {confirmDeleteId === w.id && (
                    <div className="px-2.5 pb-2.5">
                      <p className="text-[11px] text-red-500 font-medium mb-1.5">Delete &quot;{w.name}&quot;?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => deleteWorkspace(w.id)} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/*  Main content  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 z-30 p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm hover:bg-neutral-50 text-neutral-400">
            <ChevronRight className="w-4 h-4"/>
          </button>
        )}

        {!ws ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
              <LayoutGrid className="w-10 h-10 text-white"/>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create a Workspace</h2>
            <p className="text-neutral-500 mb-8 max-w-sm">Build rich pages with text, images, code blocks, tables, polls and more.</p>
            <button onClick={() => { setWsFormName(""); setWsFormIcon(""); setShowWsForm(true); setSidebarOpen(true); }}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold text-lg hover:opacity-90 flex items-center gap-2 transition-opacity">
              <Plus className="w-5 h-5"/> New Workspace
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/*  Header  */}
            <div className="relative group/header">
              {ws.headerImage ? (
                <div className="relative h-52 overflow-hidden">
                  <img src={ws.headerImage} alt="Header" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"/>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <button onClick={() => headerImageRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-medium backdrop-blur-sm transition-colors">
                      <Upload className="w-3.5 h-3.5"/> Change
                    </button>
                    <button onClick={() => updateWs(w => ({ ...w, headerImage: null }))}
                      className="px-3 py-1.5 bg-black/40 hover:bg-red-500/80 text-white rounded-xl text-xs font-medium backdrop-blur-sm transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`h-40 bg-gradient-to-r ${ws.headerColor} relative`}>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    <button onClick={() => headerImageRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/40 text-white rounded-xl text-xs font-medium backdrop-blur-sm transition-colors">
                      <Upload className="w-3.5 h-3.5"/> Add Cover Image
                    </button>
                    <div className="flex gap-1 bg-black/20 backdrop-blur-sm rounded-xl p-1">
                      {HEADER_COLORS.map(c => (
                        <button key={c} onClick={() => updateWs(w => ({ ...w, headerColor: c }))}
                          className={`w-5 h-5 rounded-lg bg-gradient-to-r ${c} transition-transform hover:scale-110 ${ws.headerColor === c ? "ring-2 ring-white" : ""}`}/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <input ref={headerImageRef} type="file" accept="image/*" className="hidden" onChange={e => handleHeaderImage(e.target.files)}/>
            </div>

            {/*  Page content  */}
            <div className="max-w-3xl mx-auto px-12 py-8">
              {/* Workspace icon + title */}
              <div className="flex items-center gap-3 mb-2 -mt-8 relative z-10">
                <span className="text-5xl drop-shadow-lg">{ws.icon}</span>
              </div>
              <input value={ws.pageTitle} onChange={e => updateWs(w => ({ ...w, pageTitle: e.target.value }))}
                placeholder="Untitled"
                className="text-4xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none w-full mb-8 mt-2"/>

              {/* Blocks */}
              <div className="space-y-3 pl-10">
                {ws.blocks.map((block, index) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    index={index}
                    totalBlocks={ws.blocks.length}
                    showMenu={showBlockMenu === block.id}
                    onUpdate={patch => updateBlock(block.id, patch)}
                    onDelete={() => deleteBlock(block.id)}
                    onAddAfter={type => addBlock(type, block.id)}
                    onShowMenu={() => setShowBlockMenu(block.id)}
                    onHideMenu={() => setShowBlockMenu(null)}
                    onMove={moveBlock}
                    draggedId={draggedId}
                    onDragStart={() => setDraggedId(block.id)}
                    onDragOver={e => {
                      e.preventDefault();
                      if (draggedId && draggedId !== block.id) {
                        const from = ws.blocks.findIndex(b => b.id === draggedId);
                        if (from !== index) moveBlock(from, index);
                      }
                    }}
                    onDragEnd={() => setDraggedId(null)}
                  />
                ))}
              </div>

              {/* Empty state / add block */}
              {ws.blocks.length === 0 ? (
                <div className="pl-10">
                  <p className="text-neutral-400 text-sm mb-4">Start building  choose a block type:</p>
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_MENU_ITEMS.slice(0, 8).map(item => (
                      <button key={item.type} onClick={() => addBlock(item.type)}
                        className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 hover:text-purple-600 transition-colors">
                        <item.icon className="w-4 h-4"/>{item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pl-10 mt-4 relative">
                  <div className="relative">
                    <button onClick={() => setShowBlockMenu(showBlockMenu === "__bottom__" ? null : "__bottom__")}
                      className="flex items-center gap-2 text-neutral-400 hover:text-purple-500 text-sm transition-colors">
                      <Plus className="w-4 h-4"/> Add block
                    </button>
                    {showBlockMenu === "__bottom__" && (
                      <BlockMenu onSelect={type => addBlock(type)} onClose={() => setShowBlockMenu(null)}/>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Loop Workspace Guide</h2>
                    <p className="text-purple-100 text-sm">Build rich, flexible pages with blocks</p>
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
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📝 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Loop Workspace is a Notion-like block-based editor. Create multiple workspaces with customizable headers, then build rich pages using 15+ block types including text, headings, lists, images, code, tables, polls, and more. Perfect for documentation, notes, wikis, and collaborative spaces.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🧩 15+ Block Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📄 Basic Blocks</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Text, H1, H2, H3</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📋 Lists</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Bullet, Numbered, Checklist</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">💬 Content</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Quote, Callout, Toggle</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🎨 Media</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Image, Code, Embed</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <h4 className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">⚡ Advanced</h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Table, Poll, Divider</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🎨 Custom Headers</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Upload cover images or choose gradient colors. Add workspace icons for visual organization.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">🔄 Drag & Drop</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Reorder blocks by dragging. Organize content exactly how you want it.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">💡 Smart Callouts</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Info, warning, success, and error callouts with color-coded styling.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">📊 Interactive Elements</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Editable tables, voting polls with live results, collapsible toggles.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">💻 Code Blocks</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Syntax highlighting for 14+ languages with copy-to-clipboard functionality.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Workspace</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Workspace" in sidebar. Choose a name and icon emoji.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Customize Header</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Hover over header to upload cover image or change gradient color.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Page Title</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Untitled" below the workspace icon to add your page title.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Blocks</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click + button or "Add block" to choose from 15+ block types.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Edit Content</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click into blocks to edit. Each block type has unique editing features.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Reorder & Delete</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Hover blocks to see drag handle and delete button. Drag to reorder.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎯 Block Highlights</h3>
                  <div className="space-y-2">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-purple-600">Checklist:</strong> Add items with + button, check off completed tasks</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-purple-600">Toggle:</strong> Collapsible sections - click arrow to expand/collapse content</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-purple-600">Code:</strong> Select language from dropdown, click Copy to copy code</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-purple-600">Table:</strong> Edit headers and cells inline, add rows with + button</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-purple-600">Poll:</strong> Add options, click vote buttons to cast votes, see live percentages</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                      <p className="text-sm"><strong className="text-purple-600">Callout:</strong> Switch between info/warning/success/error types for different contexts</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use headings</strong> - Structure content with H1, H2, H3 for clear hierarchy</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Combine blocks</strong> - Mix text, images, code, and tables for rich documentation</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Toggles for organization</strong> - Hide detailed content in collapsible sections</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Callouts for emphasis</strong> - Highlight important notes with colored callouts</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Multiple workspaces</strong> - Separate topics into different workspaces</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Custom headers</strong> - Visual identity with cover images and colors</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💼 Use Cases</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📚 Documentation</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Technical docs, API references, user guides</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📝 Knowledge Base</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Team wikis, process documentation</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📖 Study Notes</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Lecture notes, research summaries</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📋 Project Pages</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Project overviews, specifications, roadmaps</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your workspaces are automatically saved to the database.</strong> All workspaces, blocks, content, images, and settings are persisted to the server. Look for the "Saving..." indicator to confirm storage. Your work syncs across devices automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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

