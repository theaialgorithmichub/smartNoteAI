"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import {
  FolderKanban, Plus, Loader2, FileText, Users, Trash2, X,
  GitBranch, Palette, Globe, Link, ExternalLink, ChevronLeft,
  ChevronRight, Pencil, AlertCircle, CheckCircle2, Circle,
  ArrowUp, ArrowDown, Minus, MessageSquare, Paperclip, Image,
  GripVertical, ChevronDown, ChevronUp, Tag, Clock, Star,
  Upload, Download, Eye, MoreHorizontal, Layers, Zap, Info,
  BarChart3, PieChart, TrendingUp, Activity, Send, Bot,
} from "lucide-react";

//  Types 

type Priority = "critical" | "high" | "medium" | "low";
type IssueType = "task" | "bug" | "feature" | "improvement";
type TicketStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

interface TeamMember { id: string; name: string; role: string; color: string; }
interface Comment { id: string; authorId: string; authorName: string; text: string; createdAt: string; }
interface Attachment { id: string; name: string; url: string; type: "image" | "document" | "link"; size?: string; createdAt: string; }

interface Ticket {
  id: string; title: string; description: string;
  type: IssueType; priority: Priority; status: TicketStatus;
  assigneeId: string | null; reporterId: string | null;
  sprintId: string | null; projectId: string;
  labels: string[]; storyPoints: number;
  comments: Comment[]; attachments: Attachment[];
  createdAt: string; updatedAt: string;
}

interface Sprint {
  id: string; projectId: string; name: string;
  goal: string; startDate: string; endDate: string;
  status: "planning" | "active" | "completed";
  createdAt: string;
}

interface ProjectDocument {
  id: string; title: string; content: string;
  images: string[]; type: "readme" | "spec" | "notes" | "api";
  updatedAt: string;
}

interface ProjectLink { id: string; title: string; url: string; type: "website" | "github" | "figma" | "docs" | "other"; }

interface Project {
  id: string; name: string; description: string; key: string;
  status: "planning" | "in-progress" | "review" | "completed";
  techStack: string[]; links: ProjectLink[];
  team: TeamMember[]; sprints: Sprint[];
  tickets: Ticket[]; documents: ProjectDocument[];
  createdAt: string;
}

interface ProjectTemplateProps { title?: string; notebookId?: string; }

//  Constants 

const STATUSES: { id: TicketStatus; label: string; color: string; bg: string }[] = [
  { id: "backlog",     label: "Backlog",     color: "text-neutral-500",  bg: "bg-neutral-100 dark:bg-neutral-800" },
  { id: "todo",        label: "To Do",       color: "text-blue-600",     bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: "in_progress", label: "In Progress", color: "text-amber-600",    bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "review",      label: "Review",      color: "text-purple-600",   bg: "bg-purple-50 dark:bg-purple-900/20" },
  { id: "done",        label: "Done",        color: "text-green-600",    bg: "bg-green-50 dark:bg-green-900/20" },
];

const PRIORITIES: { id: Priority; label: string; color: string; icon: React.ElementType }[] = [
  { id: "critical", label: "Critical", color: "text-red-600",    icon: ArrowUp },
  { id: "high",     label: "High",     color: "text-orange-500", icon: ArrowUp },
  { id: "medium",   label: "Medium",   color: "text-yellow-500", icon: Minus },
  { id: "low",      label: "Low",      color: "text-blue-400",   icon: ArrowDown },
];

const ISSUE_TYPES: { id: IssueType; label: string; color: string }[] = [
  { id: "task",        label: "Task",        color: "bg-blue-500" },
  { id: "bug",         label: "Bug",         color: "bg-red-500" },
  { id: "feature",     label: "Feature",     color: "bg-green-500" },
  { id: "improvement", label: "Improvement", color: "bg-purple-500" },
];

const MEMBER_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f97316","#22c55e","#14b8a6","#3b82f6","#f59e0b"];

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const getPriorityInfo = (p: Priority) => PRIORITIES.find(x => x.id === p) ?? PRIORITIES[2];
const getStatusInfo   = (s: TicketStatus) => STATUSES.find(x => x.id === s) ?? STATUSES[0];
const getTypeInfo     = (t: IssueType) => ISSUE_TYPES.find(x => x.id === t) ?? ISSUE_TYPES[0];

const blankProject = (): Partial<Project> => ({
  name: "", description: "", key: "", status: "planning", techStack: [], links: [],
});

const avatarInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

function Avatar({ member, size = "sm" }: { member: TeamMember; size?: "xs" | "sm" | "md" }) {
  const sz = size === "xs" ? "w-5 h-5 text-[9px]" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: member.color }} title={member.name}>
      {avatarInitials(member.name)}
    </div>
  );
}


//  TicketModal 

interface TicketModalProps {
  ticket: Ticket;
  project: Project;
  onClose: () => void;
  onUpdate: (patch: Partial<Ticket>) => void;
  onDelete: () => void;
}

function TicketModal({ ticket, project, onClose, onUpdate, onDelete }: TicketModalProps) {
  const [commentText, setCommentText] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addComment = () => {
    if (!commentText.trim()) return;
    const c: Comment = { id: makeId(), authorId: "me", authorName: "You", text: commentText.trim(), createdAt: new Date().toISOString() };
    onUpdate({ comments: [...ticket.comments, c], updatedAt: new Date().toISOString() });
    setCommentText("");
  };

  const deleteComment = (id: string) => onUpdate({ comments: ticket.comments.filter(c => c.id !== id) });

  const addLabel = () => {
    if (!labelInput.trim() || ticket.labels.includes(labelInput.trim())) return;
    onUpdate({ labels: [...ticket.labels, labelInput.trim()] });
    setLabelInput("");
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const att: Attachment = { id: makeId(), name: file.name, url: e.target?.result as string, type: "image", size: (file.size / 1024).toFixed(0) + " KB", createdAt: new Date().toISOString() };
          onUpdate({ attachments: [...ticket.attachments, att] });
        };
        reader.readAsDataURL(file);
      } else {
        const att: Attachment = { id: makeId(), name: file.name, url: "", type: "document", size: (file.size / 1024).toFixed(0) + " KB", createdAt: new Date().toISOString() };
        onUpdate({ attachments: [...ticket.attachments, att] });
      }
    }
  };

  const assignee = project.team.find(m => m.id === ticket.assigneeId) ?? null;
  const priorityInfo = getPriorityInfo(ticket.priority);
  const PriorityIcon = priorityInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-4xl border border-neutral-200 dark:border-neutral-800 shadow-2xl my-8 flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-3 p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className={`w-3 h-3 rounded-sm mt-1.5 flex-shrink-0 ${getTypeInfo(ticket.type).color}`}/>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-neutral-400">{project.key}-{ticket.id.slice(-4).toUpperCase()}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeInfo(ticket.type).color} text-white`}>{getTypeInfo(ticket.type).label}</span>
            </div>
            <input value={ticket.title} onChange={e => onUpdate({ title: e.target.value })}
              className="text-xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none w-full"/>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onDelete} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4"/>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left  description, attachments, comments */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Description</label>
              <textarea value={ticket.description} onChange={e => onUpdate({ description: e.target.value })}
                placeholder="Add a description..." rows={5}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm text-neutral-700 dark:text-neutral-300 resize-none"/>
            </div>

            {/* Attachments drop zone */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Attachments</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-3 ${dragOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-indigo-300"}`}>
                <Upload className="w-5 h-5 mx-auto mb-1 text-neutral-400"/>
                <p className="text-xs text-neutral-400">Drag & drop files or click to upload</p>
                <p className="text-[10px] text-neutral-300 mt-0.5">Images, documents supported</p>
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" className="hidden"
                  onChange={e => handleFiles(e.target.files)}/>
              </div>
              {ticket.attachments.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {ticket.attachments.map(att => (
                    <div key={att.id} className="group relative bg-neutral-50 dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                      {att.type === "image" && att.url ? (
                        <img src={att.url} alt={att.name} className="w-full h-28 object-cover"/>
                      ) : (
                        <div className="h-28 flex flex-col items-center justify-center gap-2">
                          <Paperclip className="w-6 h-6 text-neutral-400"/>
                          <p className="text-xs text-neutral-500 truncate px-2 max-w-full">{att.name}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {att.type === "image" && att.url && (
                          <a href={att.url} download={att.name} className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30"><Download className="w-4 h-4"/></a>
                        )}
                        <button onClick={() => onUpdate({ attachments: ticket.attachments.filter(a => a.id !== att.id) })}
                          className="p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500"><Trash2 className="w-4 h-4"/></button>
                      </div>
                      <div className="px-2 py-1 flex items-center justify-between">
                        <p className="text-[10px] text-neutral-500 truncate">{att.name}</p>
                        {att.size && <p className="text-[10px] text-neutral-400 flex-shrink-0 ml-1">{att.size}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-3 block">Comments ({ticket.comments.length})</label>
              <div className="space-y-3 mb-3">
                {ticket.comments.map(c => (
                  <div key={c.id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">Y</div>
                    <div className="flex-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{c.authorName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                          <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all">
                            <X className="w-3 h-3"/>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">Y</div>
                <div className="flex-1 flex gap-2">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && addComment()}
                    placeholder="Add a comment..." className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                  <button onClick={addComment} disabled={!commentText.trim()}
                    className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors">
                    <MessageSquare className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right  metadata sidebar */}
          <div className="lg:w-64 p-6 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-800 space-y-5 flex-shrink-0">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Status</label>
              <select value={ticket.status} onChange={e => onUpdate({ status: e.target.value as TicketStatus })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm font-medium">
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Priority</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map(p => (
                  <button key={p.id} onClick={() => onUpdate({ priority: p.id })}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${ticket.priority === p.id ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 ring-1 ring-indigo-300" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100"}`}>
                    <p.icon className={`w-3 h-3 ${p.color}`}/>{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {ISSUE_TYPES.map(t => (
                  <button key={t.id} onClick={() => onUpdate({ type: t.id })}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${ticket.type === t.id ? "ring-1 ring-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100"}`}>
                    <div className={`w-2 h-2 rounded-sm ${t.color}`}/>{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Assignee</label>
              <select value={ticket.assigneeId ?? ""} onChange={e => onUpdate({ assigneeId: e.target.value || null })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm">
                <option value="">Unassigned</option>
                {project.team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {assignee && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar member={assignee} size="xs"/>
                  <span className="text-xs text-neutral-500">{assignee.role}</span>
                </div>
              )}
            </div>

            {/* Story Points */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Story Points</label>
              <input type="number" min={0} max={100} value={ticket.storyPoints}
                onChange={e => onUpdate({ storyPoints: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Labels</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {ticket.labels.map(l => (
                  <span key={l} className="flex items-center gap-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded-full">
                    {l}
                    <button onClick={() => onUpdate({ labels: ticket.labels.filter(x => x !== l) })}><X className="w-2.5 h-2.5"/></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1">
                <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addLabel()}
                  placeholder="Add label..." className="flex-1 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-xs"/>
                <button onClick={addLabel} className="px-2 py-1.5 bg-indigo-500 text-white rounded-lg text-xs">+</button>
              </div>
            </div>

            {/* Sprint */}
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Sprint</label>
              <select value={ticket.sprintId ?? ""} onChange={e => onUpdate({ sprintId: e.target.value || null })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm">
                <option value="">Backlog</option>
                {project.sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Dates */}
            <div className="text-[10px] text-neutral-400 space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <p>Created: {new Date(ticket.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


//  KanbanCard 

function KanbanCard({ ticket, project, onOpen, onDragStart }: {
  ticket: Ticket; project: Project;
  onOpen: () => void; onDragStart: (e: React.DragEvent) => void;
}) {
  const priorityInfo = getPriorityInfo(ticket.priority);
  const PIcon = priorityInfo.icon;
  const assignee = project.team.find(m => m.id === ticket.assigneeId) ?? null;
  return (
    <div draggable onDragStart={onDragStart} onClick={onOpen}
      className="bg-white dark:bg-neutral-900 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group select-none">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${getTypeInfo(ticket.type).color}`}/>
          <span className="text-[10px] font-mono text-neutral-400">{project.key}-{ticket.id.slice(-4).toUpperCase()}</span>
        </div>
        <PIcon className={`w-3.5 h-3.5 flex-shrink-0 ${priorityInfo.color}`}/>
      </div>
      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-2 line-clamp-2">{ticket.title}</p>
      {ticket.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {ticket.labels.slice(0, 2).map(l => (
            <span key={l} className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-1.5 py-0.5 rounded-full">{l}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2 text-neutral-400">
          {ticket.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]"><MessageSquare className="w-3 h-3"/>{ticket.comments.length}</span>
          )}
          {ticket.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]"><Paperclip className="w-3 h-3"/>{ticket.attachments.length}</span>
          )}
          {ticket.storyPoints > 0 && (
            <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">{ticket.storyPoints}pt</span>
          )}
        </div>
        {assignee && <Avatar member={assignee} size="xs"/>}
      </div>
    </div>
  );
}

//  Main Component 

export function ProjectTemplate({ title = "Project Hub", notebookId }: ProjectTemplateProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, _setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview"|"kanban"|"documents"|"team"|"dashboard"|"ai">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);

  // Project form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Project>>(blankProject());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Kanban
  const [activeSprint, setActiveSprint] = useState<string | "backlog">("backlog");
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sprintForm, setSprintForm] = useState({ name: "", goal: "", startDate: "", endDate: "" });
  const [dragTicketId, setDragTicketId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TicketStatus | null>(null);

  // Ticket
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState<TicketStatus | null>(null);
  const [ticketForm, setTicketForm] = useState({ title: "", type: "task" as IssueType, priority: "medium" as Priority });

  // Documents
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docImageDragOver, setDocImageDragOver] = useState(false);
  const docImageRef = useRef<HTMLInputElement>(null);

  // Team
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: "", role: "" });

  // Tech / links
  const [newTech, setNewTech] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ title: "", url: "", type: "website" as ProjectLink["type"] });
  
  // AI Chat
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // DB refs
  const pageIdRef = useRef<string | null>(null);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<Project[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  // Sync activeIdRef immediately (not via useEffect) to avoid stale closure on first save
  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    _setActiveId(id);
  }, []);

  const project = projects.find(p => p.id === activeId) ?? null;
  const openTicket = project?.tickets.find(t => t.id === openTicketId) ?? null;

  //  DB Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__project_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const data = JSON.parse(existing.content || "{}");
            const loaded: Project[] = (data.projects ?? []).map((p: any) => ({
              ...p, tickets: (p.tickets ?? []).map((t: any) => ({ ...t, trains: undefined, comments: t.comments ?? [], attachments: t.attachments ?? [], labels: t.labels ?? [] })),
              documents: (p.documents ?? []).map((d: any) => ({ ...d, images: d.images ?? [] })),
            }));
            setProjects(loaded); projectsRef.current = loaded;
            setActiveId(data.activeId ?? loaded[0]?.id ?? null);
          } catch {}
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__project_template__", content: JSON.stringify({ projects: [], activeId: null }) }),
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
          body: JSON.stringify({ title: "__project_template__", content: JSON.stringify({ projects: projectsRef.current, activeId: activeIdRef.current }) }),
        });
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion, notebookId]);

  const setAndSave = useCallback((list: Project[]) => {
    setProjects(list); projectsRef.current = list; bumpSave();
  }, [bumpSave]);

  const updateProject = useCallback((patch: Partial<Project> | ((p: Project) => Project)) => {
    setProjects(prev => {
      const id = activeIdRef.current;
      const next = prev.map(p => p.id === id ? (typeof patch === "function" ? patch(p) : { ...p, ...patch }) : p);
      projectsRef.current = next; return next;
    });
    bumpSave();
  }, [bumpSave]);

  //  Project CRUD 
  const createProject = () => {
    if (!formData.name) return;
    const key = (formData.key || formData.name).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "PROJ";
    const p: Project = {
      id: makeId(), name: formData.name, description: formData.description || "",
      key, status: formData.status || "planning", techStack: [], links: [],
      team: [], sprints: [], tickets: [], documents: [], createdAt: new Date().toISOString(),
    };
    const next = [...projectsRef.current, p];
    // Set activeIdRef BEFORE setAndSave so the first save captures the correct activeId
    activeIdRef.current = p.id;
    setAndSave(next); setActiveId(p.id);
    setShowCreateForm(false); setFormData(blankProject()); setActiveTab("overview");
  };

  const saveEditProject = () => {
    if (!editingProjectId || !formData.name) return;
    // Only patch safe scalar fields — never overwrite arrays like tickets/sprints/team/documents
    updateProject(p => ({
      ...p,
      name: formData.name ?? p.name,
      description: formData.description ?? p.description,
      key: formData.key ?? p.key,
      status: formData.status ?? p.status,
    }));
    setEditingProjectId(null); setFormData(blankProject());
  };

  const deleteProject = (id: string) => {
    const next = projectsRef.current.filter(p => p.id !== id);
    if (activeId === id) {
      const newActive = next[0]?.id ?? null;
      activeIdRef.current = newActive;
      _setActiveId(newActive);
    }
    setAndSave(next); setConfirmDeleteId(null);
  };

  //  Sprint CRUD 
  const createSprint = () => {
    if (!sprintForm.name) return;
    const s: Sprint = { id: makeId(), projectId: activeId!, name: sprintForm.name, goal: sprintForm.goal, startDate: sprintForm.startDate, endDate: sprintForm.endDate, status: "planning", createdAt: new Date().toISOString() };
    updateProject(p => ({ ...p, sprints: [...p.sprints, s] }));
    setSprintForm({ name: "", goal: "", startDate: "", endDate: "" }); setShowSprintForm(false);
    setActiveSprint(s.id);
  };

  const deleteSprint = (id: string) => {
    updateProject(p => ({
      ...p,
      sprints: p.sprints.filter(s => s.id !== id),
      tickets: p.tickets.map(t => t.sprintId === id ? { ...t, sprintId: null } : t),
    }));
    if (activeSprint === id) setActiveSprint("backlog");
  };

  //  Ticket CRUD 
  const createTicket = (status: TicketStatus) => {
    if (!ticketForm.title) return;
    const t: Ticket = {
      id: makeId(), title: ticketForm.title, description: "", type: ticketForm.type,
      priority: ticketForm.priority, status,
      assigneeId: null, reporterId: null,
      sprintId: activeSprint === "backlog" ? null : activeSprint,
      projectId: activeId!,
      labels: [], storyPoints: 0, comments: [], attachments: [],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    updateProject(p => ({ ...p, tickets: [...p.tickets, t] }));
    setTicketForm({ title: "", type: "task", priority: "medium" });
    setShowTicketForm(null);
    setOpenTicketId(t.id);
  };

  const updateTicket = useCallback((id: string, patch: Partial<Ticket>) => {
    updateProject(p => ({ ...p, tickets: p.tickets.map(t => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t) }));
  }, [updateProject]);

  const deleteTicket = (id: string) => {
    updateProject(p => ({ ...p, tickets: p.tickets.filter(t => t.id !== id) }));
    setOpenTicketId(null);
  };

  //  Drag & Drop 
  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    setDragTicketId(ticketId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (dragTicketId) updateTicket(dragTicketId, { status });
    setDragTicketId(null); setDragOverStatus(null);
  };

  //  Document helpers 
  const addDocument = () => {
    const d: ProjectDocument = { id: makeId(), title: "Untitled Document", content: "", images: [], type: "notes", updatedAt: new Date().toISOString() };
    updateProject(p => ({ ...p, documents: [...p.documents, d] }));
    setSelectedDocId(d.id);
  };

  const updateDocument = (id: string, patch: Partial<ProjectDocument>) => {
    updateProject(p => ({ ...p, documents: p.documents.map(d => d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d) }));
  };

  const handleDocImages = (files: FileList | null) => {
    if (!files || !selectedDocId) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => {
        const url = e.target?.result as string;
        updateDocument(selectedDocId, { images: [...(project?.documents.find(d => d.id === selectedDocId)?.images ?? []), url] });
      };
      reader.readAsDataURL(file);
    });
  };

  //  Team helpers 
  const addMember = () => {
    if (!memberForm.name) return;
    const m: TeamMember = { id: makeId(), name: memberForm.name, role: memberForm.role, color: MEMBER_COLORS[project?.team.length ?? 0 % MEMBER_COLORS.length] };
    updateProject(p => ({ ...p, team: [...p.team, m] }));
    setMemberForm({ name: "", role: "" }); setShowMemberForm(false);
  };

  //  AI Chat handler 
  const handleAIChat = async () => {
    if (!aiInput.trim() || !project) return;
    
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiInput("");
    setAiLoading(true);

    try {
      // Prepare project context for AI
      const context = `Project: ${project.name}
Description: ${project.description}
Status: ${project.status}
Tech Stack: ${project.techStack.join(', ')}
Team: ${project.team.map(m => `${m.name} (${m.role})`).join(', ')}
Total Tickets: ${project.tickets.length}
Tickets by Status:
- Backlog: ${project.tickets.filter(t => t.status === 'backlog').length}
- To Do: ${project.tickets.filter(t => t.status === 'todo').length}
- In Progress: ${project.tickets.filter(t => t.status === 'in_progress').length}
- Review: ${project.tickets.filter(t => t.status === 'review').length}
- Done: ${project.tickets.filter(t => t.status === 'done').length}
Tickets by Priority:
- Critical: ${project.tickets.filter(t => t.priority === 'critical').length}
- High: ${project.tickets.filter(t => t.priority === 'high').length}
- Medium: ${project.tickets.filter(t => t.priority === 'medium').length}
- Low: ${project.tickets.filter(t => t.priority === 'low').length}
Recent Tickets: ${project.tickets.slice(0, 5).map(t => `${t.title} (${t.status})`).join(', ')}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          mode: 'chat',
          message: `You are a project management assistant. Based on the following project data, answer the user's question:\n\n${context}\n\nUser Question: ${userMessage}`,
          context: [],
        }),
      });

      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();
      setAiMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response from AI' }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  //  Computed 
  const sprintTickets = useMemo(() => {
    if (!project) return [] as Ticket[];
    if (activeSprint === "backlog") return project.tickets.filter(t => !t.sprintId);
    return project.tickets.filter(t => t.sprintId === activeSprint);
  }, [project, activeSprint]);

  const ticketsByStatus = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = { backlog: [], todo: [], in_progress: [], review: [], done: [] };
    sprintTickets.forEach(t => { map[t.status].push(t); });
    return map;
  }, [sprintTickets]);

  const selectedDoc = project?.documents.find(d => d.id === selectedDocId) ?? null;


  //  Loading 
  if (loading) return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-neutral-950">
      <TemplateHeader title={title} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500"/>
      </div>
      <TemplateFooter />
    </div>
  );

  const closeProjectForm = () => { setShowCreateForm(false); setEditingProjectId(null); setFormData(blankProject()); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col">
      <TemplateHeader title={title} />
      <div className="flex-1 flex overflow-hidden">
      {/* Ticket Modal */}
      <AnimatePresence>
        {openTicket && project && (
          <TicketModal
            ticket={openTicket} project={project}
            onClose={() => setOpenTicketId(null)}
            onUpdate={patch => updateTicket(openTicket.id, patch)}
            onDelete={() => deleteTicket(openTicket.id)}
          />
        )}
      </AnimatePresence>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2 text-xs px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500"/> Saving...
        </div>
      )}

      {/* Project Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateForm || editingProjectId) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{editingProjectId ? "Edit Project" : "New Project"}</h2>
                <button onClick={closeProjectForm} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Project Name *</label>
                  <input value={formData.name || ""} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. SmartNotes App" className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Project Key (e.g. SNA)</label>
                  <input value={formData.key || ""} onChange={e => setFormData(p => ({ ...p, key: e.target.value.toUpperCase().slice(0, 5) }))}
                    placeholder="Auto-generated from name" className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm font-mono"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Description</label>
                  <textarea value={formData.description || ""} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="What is this project about?" rows={2}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm resize-none"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 mb-1 block uppercase tracking-wide">Status</label>
                  <select value={formData.status || "planning"} onChange={e => setFormData(p => ({ ...p, status: e.target.value as Project["status"] }))}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm">
                    {(["planning","in-progress","review","completed"] as const).map(s => <option key={s} value={s}>{s.replace("-"," ")}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={editingProjectId ? saveEditProject : createProject} disabled={!formData.name}
                    className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl font-semibold text-sm transition-colors">
                    {editingProjectId ? "Save Changes" : "Create Project"}
                  </button>
                  <button onClick={closeProjectForm} className="px-6 py-3 text-neutral-500 hover:text-neutral-700 text-sm">Cancel</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/*  Sidebar  */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-4 h-4 text-white"/>
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowDocumentation(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-indigo-500" title="Documentation">
                    <Info className="w-4 h-4"/>
                  </button>
                  <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <button onClick={() => { setFormData(blankProject()); setShowCreateForm(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4"/> New Project
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 min-h-0">
              {projects.length === 0 && <p className="text-xs text-neutral-400 italic px-2 py-4">No projects yet</p>}
              {projects.map(p => (
                <div key={p.id} className={`rounded-xl mb-1.5 transition-all ${p.id === activeId ? "bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                  <div className="flex items-center gap-2 p-3 group cursor-pointer" onClick={() => { setActiveId(p.id); setActiveTab("overview"); }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-[10px]">{p.key}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${p.id === activeId ? "text-indigo-700 dark:text-indigo-300" : "text-neutral-800 dark:text-neutral-200"}`}>{p.name}</p>
                      <p className="text-[10px] text-neutral-400 capitalize">{p.status.replace("-"," ")}  {p.tickets.length} tickets</p>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); setFormData({ ...p }); setEditingProjectId(p.id); }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"><Pencil className="w-3 h-3"/></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === p.id ? null : p.id); }}
                        className={`p-1 rounded transition-colors ${confirmDeleteId === p.id ? "bg-red-100 text-red-500" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"}`}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  {confirmDeleteId === p.id && (
                    <div className="px-3 pb-3">
                      <p className="text-[11px] text-red-500 font-medium mb-2">Delete &quot;{p.name}&quot;?</p>
                      <div className="flex gap-2">
                        <button onClick={() => deleteProject(p.id)} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">Delete</button>
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

      {/*  Main  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <div className="px-6 py-3 flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                <ChevronRight className="w-4 h-4"/>
              </button>
            )}
            {project ? (
              <>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-neutral-900 dark:text-white truncate">{project.name}</h1>
                  <p className="text-xs text-neutral-500">{project.key}  {project.tickets.length} tickets  {project.team.length} members</p>
                </div>
                <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl overflow-x-auto">
                  {([
                    ["overview","Overview",FolderKanban],
                    ["kanban","Board",Layers],
                    ["documents","Docs",FileText],
                    ["team","Team",Users],
                    ["dashboard","Analytics",BarChart3],
                    ["ai","AI Assistant",Bot],
                  ] as const).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === id ? "bg-white dark:bg-neutral-700 text-indigo-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                      <Icon className="w-3.5 h-3.5"/><span>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* No project */}
          {!project && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                <FolderKanban className="w-10 h-10 text-indigo-500"/>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create Your First Project</h2>
              <p className="text-neutral-500 mb-8 max-w-sm">Manage sprints, kanban boards, tickets, documents and your team  all in one place.</p>
              <button onClick={() => { setFormData(blankProject()); setShowCreateForm(true); }}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 flex items-center gap-2 transition-opacity">
                <Plus className="w-5 h-5"/> New Project
              </button>
            </div>
          )}


          {/*  Overview Tab  */}
          {project && activeTab === "overview" && (
            <div className="max-w-4xl space-y-6">
              {/* Hero */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full">{project.key}</span>
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">{project.status.replace("-"," ")}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{project.name}</h2>
                    <p className="text-indigo-100 text-sm">{project.description || "No description"}</p>
                  </div>
                  <button onClick={() => { setFormData({ ...project }); setEditingProjectId(project.id); }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex-shrink-0">
                    <Pencil className="w-4 h-4"/>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {[
                    { label: "Tickets", value: project.tickets.length },
                    { label: "Sprints", value: project.sprints.length },
                    { label: "Team", value: project.team.length },
                    { label: "Done", value: project.tickets.filter(t => t.status === "done").length },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-indigo-200">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full text-sm font-medium">
                      {tech}
                      <button onClick={() => updateProject(p => ({ ...p, techStack: p.techStack.filter((_, idx) => idx !== i) }))}
                        className="hover:text-red-500 ml-0.5"><X className="w-3 h-3"/></button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input value={newTech} onChange={e => setNewTech(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && newTech.trim()) { updateProject(p => ({ ...p, techStack: [...p.techStack, newTech.trim()] })); setNewTech(""); } }}
                      placeholder="Add tech..." className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm outline-none w-28"/>
                    <button onClick={() => { if (newTech.trim()) { updateProject(p => ({ ...p, techStack: [...p.techStack, newTech.trim()] })); setNewTech(""); } }}
                      className="px-3 py-1.5 bg-indigo-500 text-white rounded-full text-sm">Add</button>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Project Links</h3>
                  <button onClick={() => setShowLinkForm(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-indigo-500"><Plus className="w-4 h-4"/></button>
                </div>
                {showLinkForm && (
                  <div className="mb-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-3">
                    <input value={linkForm.title} onChange={e => setLinkForm(f => ({ ...f, title: e.target.value }))} placeholder="Link title"
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg text-sm outline-none"/>
                    <input value={linkForm.url} onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..."
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-700 rounded-lg text-sm outline-none"/>
                    <div className="flex gap-2 flex-wrap">
                      {(["website","github","figma","docs","other"] as const).map(t => (
                        <button key={t} onClick={() => setLinkForm(f => ({ ...f, type: t }))}
                          className={`px-3 py-1 rounded-lg text-xs capitalize ${linkForm.type === t ? "bg-indigo-500 text-white" : "bg-neutral-200 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300"}`}>{t}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { if (linkForm.title && linkForm.url) { updateProject(p => ({ ...p, links: [...p.links, { id: makeId(), ...linkForm }] })); setLinkForm({ title: "", url: "", type: "website" }); setShowLinkForm(false); } }}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm">Add</button>
                      <button onClick={() => setShowLinkForm(false)} className="px-4 py-2 text-neutral-500 text-sm">Cancel</button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {project.links.map(link => (
                    <div key={link.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl group">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                          {link.type === "github" ? <GitBranch className="w-4 h-4"/> : link.type === "figma" ? <Palette className="w-4 h-4"/> : link.type === "docs" ? <FileText className="w-4 h-4"/> : <Globe className="w-4 h-4"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{link.title}</p>
                          <p className="text-xs text-neutral-400 truncate">{link.url}</p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"/>
                      </a>
                      <button onClick={() => updateProject(p => ({ ...p, links: p.links.filter(l => l.id !== link.id) }))}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-all flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  ))}
                </div>
                {project.links.length === 0 && !showLinkForm && <p className="text-neutral-400 text-sm text-center py-6">No links added yet</p>}
              </div>
            </div>
          )}


          {/*  Kanban Board Tab  */}
          {project && activeTab === "kanban" && (
            <div className="flex flex-col h-full min-h-0 space-y-4">
              {/* Sprint selector bar */}
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => setActiveSprint("backlog")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeSprint === "backlog" ? "bg-indigo-500 text-white" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-indigo-300"}`}>
                  Backlog ({project.tickets.filter(t => !t.sprintId).length})
                </button>
                {project.sprints.map(s => (
                  <div key={s.id} className="flex items-center gap-1 group">
                    <button onClick={() => setActiveSprint(s.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeSprint === s.id ? "bg-indigo-500 text-white" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-indigo-300"}`}>
                      {s.name} ({project.tickets.filter(t => t.sprintId === s.id).length})
                    </button>
                    <button onClick={() => deleteSprint(s.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-all">
                      <X className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                ))}
                <button onClick={() => setShowSprintForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl text-sm text-neutral-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                  <Plus className="w-4 h-4"/> New Sprint
                </button>
              </div>

              {/* Sprint form */}
              {showSprintForm && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 max-w-lg">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Create Sprint</h3>
                  <div className="space-y-3">
                    <input value={sprintForm.name} onChange={e => setSprintForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Sprint name (e.g. Sprint 1)" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                    <input value={sprintForm.goal} onChange={e => setSprintForm(f => ({ ...f, goal: e.target.value }))}
                      placeholder="Sprint goal (optional)" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">Start Date</label>
                        <input type="date" value={sprintForm.startDate} onChange={e => setSprintForm(f => ({ ...f, startDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 mb-1 block">End Date</label>
                        <input type="date" value={sprintForm.endDate} onChange={e => setSprintForm(f => ({ ...f, endDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={createSprint} disabled={!sprintForm.name}
                        className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium">Create Sprint</button>
                      <button onClick={() => setShowSprintForm(false)} className="px-5 py-2 text-neutral-500 text-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sprint info bar */}
              {activeSprint !== "backlog" && (() => {
                const sprint = project.sprints.find(s => s.id === activeSprint);
                if (!sprint) return null;
                const total = sprintTickets.length;
                const done = sprintTickets.filter(t => t.status === "done").length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center gap-6 flex-wrap">
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{sprint.name}</p>
                      {sprint.goal && <p className="text-xs text-neutral-500 mt-0.5">{sprint.goal}</p>}
                    </div>
                    {sprint.startDate && <div className="text-xs text-neutral-500"><span className="font-medium">Start:</span> {sprint.startDate}</div>}
                    {sprint.endDate && <div className="text-xs text-neutral-500"><span className="font-medium">End:</span> {sprint.endDate}</div>}
                    <div className="flex-1 min-w-[120px]">
                      <div className="flex justify-between text-xs text-neutral-500 mb-1"><span>Progress</span><span>{done}/{total} done</span></div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Kanban columns */}
              <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
                {STATUSES.map(col => (
                  <div key={col.id}
                    onDragOver={e => { e.preventDefault(); setDragOverStatus(col.id); }}
                    onDragLeave={() => setDragOverStatus(null)}
                    onDrop={e => handleDrop(e, col.id)}
                    className={`flex-shrink-0 w-72 flex flex-col rounded-2xl transition-colors ${dragOverStatus === col.id ? "ring-2 ring-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10" : "bg-neutral-100/60 dark:bg-neutral-800/40"}`}>
                    {/* Column header */}
                    <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${col.id === "done" ? "bg-green-500" : col.id === "in_progress" ? "bg-amber-500" : col.id === "review" ? "bg-purple-500" : col.id === "todo" ? "bg-blue-500" : "bg-neutral-400"}`}/>
                        <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                        <span className="text-xs bg-white dark:bg-neutral-700 text-neutral-500 px-1.5 py-0.5 rounded-full font-medium">
                          {ticketsByStatus[col.id].length}
                        </span>
                      </div>
                      <button onClick={() => { setShowTicketForm(col.id); setTicketForm({ title: "", type: "task", priority: "medium" }); }}
                        className="p-1 rounded-lg hover:bg-white dark:hover:bg-neutral-700 text-neutral-400 hover:text-indigo-500 transition-colors">
                        <Plus className="w-4 h-4"/>
                      </button>
                    </div>

                    {/* Add ticket form */}
                    {showTicketForm === col.id && (
                      <div className="mx-3 mb-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-2">
                        <input value={ticketForm.title} onChange={e => setTicketForm(f => ({ ...f, title: e.target.value }))}
                          onKeyDown={e => e.key === "Enter" && createTicket(col.id)}
                          placeholder="Ticket title..." autoFocus
                          className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-sm"/>
                        <div className="flex gap-2">
                          <select value={ticketForm.type} onChange={e => setTicketForm(f => ({ ...f, type: e.target.value as IssueType }))}
                            className="flex-1 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-xs">
                            {ISSUE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                          </select>
                          <select value={ticketForm.priority} onChange={e => setTicketForm(f => ({ ...f, priority: e.target.value as Priority }))}
                            className="flex-1 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none text-xs">
                            {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => createTicket(col.id)} disabled={!ticketForm.title}
                            className="flex-1 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium">Create</button>
                          <button onClick={() => setShowTicketForm(null)} className="px-3 py-1.5 text-neutral-400 text-xs">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 min-h-[100px]">
                      {ticketsByStatus[col.id].map(ticket => (
                        <KanbanCard key={ticket.id} ticket={ticket} project={project}
                          onOpen={() => setOpenTicketId(ticket.id)}
                          onDragStart={e => handleDragStart(e, ticket.id)}/>
                      ))}
                      {ticketsByStatus[col.id].length === 0 && !showTicketForm && (
                        <div className="h-16 flex items-center justify-center text-xs text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/*  Documents Tab  */}
          {project && activeTab === "documents" && (
            <div className="flex gap-5 h-full min-h-[600px]">
              {/* Doc list */}
              <div className="w-56 flex-shrink-0 space-y-2">
                <button onClick={addDocument}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4"/> New Document
                </button>
                {project.documents.map(doc => (
                  <button key={doc.id} onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${selectedDocId === doc.id ? "bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 dark:ring-indigo-800" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-200"}`}>
                    <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-neutral-400 capitalize">{doc.type}</span>
                      {doc.images.length > 0 && <span className="text-[10px] text-neutral-400 flex items-center gap-0.5"><Image className="w-2.5 h-2.5"/>{doc.images.length}</span>}
                    </div>
                  </button>
                ))}
                {project.documents.length === 0 && <p className="text-xs text-neutral-400 italic px-2 py-4">No documents yet</p>}
              </div>

              {/* Doc editor */}
              <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
                {selectedDoc ? (
                  <>
                    {/* Doc toolbar */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                      <input value={selectedDoc.title} onChange={e => updateDocument(selectedDoc.id, { title: e.target.value })}
                        className="flex-1 text-lg font-bold text-neutral-900 dark:text-white bg-transparent outline-none"/>
                      <div className="flex gap-1.5">
                        {(["readme","spec","notes","api"] as const).map(t => (
                          <button key={t} onClick={() => updateDocument(selectedDoc.id, { type: t })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${selectedDoc.type === t ? "bg-indigo-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200"}`}>{t}</button>
                        ))}
                      </div>
                      <button onClick={() => { updateProject(p => ({ ...p, documents: p.documents.filter(d => d.id !== selectedDoc.id) })); setSelectedDocId(null); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col overflow-y-auto">
                      {/* Text content */}
                      <textarea value={selectedDoc.content} onChange={e => updateDocument(selectedDoc.id, { content: e.target.value })}
                        placeholder="Start writing your document..." rows={12}
                        className="w-full px-5 py-4 bg-transparent text-neutral-700 dark:text-neutral-300 outline-none resize-none text-sm leading-relaxed flex-shrink-0"/>

                      {/* Image section */}
                      <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                            <Image className="w-4 h-4"/> Images ({selectedDoc.images.length})
                          </h4>
                          <button onClick={() => docImageRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-200 transition-colors">
                            <Upload className="w-3.5 h-3.5"/> Upload Image
                          </button>
                          <input ref={docImageRef} type="file" multiple accept="image/*" className="hidden"
                            onChange={e => handleDocImages(e.target.files)}/>
                        </div>

                        {/* Image drop zone */}
                        <div
                          onDragOver={e => { e.preventDefault(); setDocImageDragOver(true); }}
                          onDragLeave={() => setDocImageDragOver(false)}
                          onDrop={e => { e.preventDefault(); setDocImageDragOver(false); handleDocImages(e.dataTransfer.files); }}
                          onClick={() => docImageRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-4 ${docImageDragOver ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20" : "border-neutral-200 dark:border-neutral-700 hover:border-indigo-300"}`}>
                          <Image className="w-5 h-5 mx-auto mb-1 text-neutral-400"/>
                          <p className="text-xs text-neutral-400">Drag & drop images or click to upload</p>
                          <p className="text-[10px] text-neutral-300 mt-0.5">Images are saved with the document</p>
                        </div>

                        {/* Image grid */}
                        {selectedDoc.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {selectedDoc.images.map((imgUrl, idx) => (
                              <div key={idx} className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 aspect-video bg-neutral-100 dark:bg-neutral-800">
                                <img src={imgUrl} alt={`Image ${idx + 1}`} className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <a href={imgUrl} download={`image-${idx + 1}.png`}
                                    className="p-1.5 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors">
                                    <Download className="w-4 h-4"/>
                                  </a>
                                  <button onClick={() => updateDocument(selectedDoc.id, { images: selectedDoc.images.filter((_, i) => i !== idx) })}
                                    className="p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4"/>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-3">
                    <FileText className="w-12 h-12 text-neutral-200"/>
                    <p className="text-sm">Select or create a document</p>
                    <button onClick={addDocument} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600">
                      New Document
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/*  Team Tab  */}
          {project && activeTab === "team" && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Team Members</h2>
                <button onClick={() => setShowMemberForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4"/> Add Member
                </button>
              </div>

              {showMemberForm && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Add Team Member</h3>
                  <input value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Full name" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                  <input value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="Role (e.g. Frontend Developer, Designer)" className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"/>
                  <div className="flex gap-2">
                    <button onClick={addMember} disabled={!memberForm.name}
                      className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium">Add</button>
                    <button onClick={() => setShowMemberForm(false)} className="px-5 py-2 text-neutral-500 text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.team.map(member => {
                  const memberTickets = project.tickets.filter(t => t.assigneeId === member.id);
                  const donePct = memberTickets.length > 0 ? Math.round((memberTickets.filter(t => t.status === "done").length / memberTickets.length) * 100) : 0;
                  return (
                    <div key={member.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: member.color }}>
                          {avatarInitials(member.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-900 dark:text-white">{member.name}</p>
                          <p className="text-sm text-neutral-500">{member.role || "No role set"}</p>
                        </div>
                        <button onClick={() => updateProject(p => ({ ...p, team: p.team.filter(m => m.id !== member.id) }))}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-all">
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2">
                          <p className="text-lg font-bold text-neutral-900 dark:text-white">{memberTickets.length}</p>
                          <p className="text-[10px] text-neutral-400">Assigned</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2">
                          <p className="text-lg font-bold text-amber-500">{memberTickets.filter(t => t.status === "in_progress").length}</p>
                          <p className="text-[10px] text-neutral-400">In Progress</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2">
                          <p className="text-lg font-bold text-green-500">{memberTickets.filter(t => t.status === "done").length}</p>
                          <p className="text-[10px] text-neutral-400">Done</p>
                        </div>
                      </div>
                      {memberTickets.length > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-neutral-400 mb-1"><span>Completion</span><span>{donePct}%</span></div>
                          <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${donePct}%` }}/>
                          </div>
                        </div>
                      )}
                      {memberTickets.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">Recent Tickets</p>
                          {memberTickets.slice(0, 3).map(t => {
                            const si = getStatusInfo(t.status);
                            return (
                              <button key={t.id} onClick={() => { setOpenTicketId(t.id); setActiveTab("kanban"); }}
                                className="w-full flex items-center gap-2 text-left px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                <div className={`w-2 h-2 rounded-sm flex-shrink-0 ${getTypeInfo(t.type).color}`}/>
                                <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate flex-1">{t.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${si.bg} ${si.color}`}>{si.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {project.team.length === 0 && !showMemberForm && (
                <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                  <Users className="w-12 h-12 mx-auto mb-4 text-neutral-200"/>
                  <p className="text-neutral-400 mb-4">No team members yet</p>
                  <button onClick={() => setShowMemberForm(true)} className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600">Add First Member</button>
                </div>
              )}
            </div>
          )}

          {/*  Dashboard Tab  */}
          {project && activeTab === "dashboard" && (
            <div className="max-w-6xl space-y-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">📊 Project Analytics</h2>
                <p className="text-indigo-100">Real-time insights and metrics for {project.name}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Total Tickets</p>
                    <Activity className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">{project.tickets.length}</p>
                  <p className="text-xs text-neutral-400 mt-1">{project.tickets.filter(t => t.status === 'done').length} completed</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">In Progress</p>
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">{project.tickets.filter(t => t.status === 'in_progress').length}</p>
                  <p className="text-xs text-neutral-400 mt-1">Active work items</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Team Size</p>
                    <Users className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">{project.team.length}</p>
                  <p className="text-xs text-neutral-400 mt-1">Active members</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Completion</p>
                    <PieChart className="w-5 h-5 text-purple-500" />
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {project.tickets.length > 0 ? Math.round((project.tickets.filter(t => t.status === 'done').length / project.tickets.length) * 100) : 0}%
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Overall progress</p>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  Ticket Status Distribution
                </h3>
                <div className="space-y-3">
                  {STATUSES.map(status => {
                    const count = project.tickets.filter(t => t.status === status.id).length;
                    const percentage = project.tickets.length > 0 ? (count / project.tickets.length) * 100 : 0;
                    return (
                      <div key={status.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{status.label}</span>
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2">
                          <div className={`h-2 rounded-full ${status.bg.replace('bg-', 'bg-gradient-to-r from-').replace('dark:bg-', 'to-')}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Priority Breakdown */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <ArrowUp className="w-5 h-5 text-red-500" />
                    Priority Breakdown
                  </h3>
                  <div className="space-y-3">
                    {PRIORITIES.map(priority => {
                      const count = project.tickets.filter(t => t.priority === priority.id).length;
                      return (
                        <div key={priority.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <priority.icon className={`w-4 h-4 ${priority.color}`} />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{priority.label}</span>
                          </div>
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Issue Type Breakdown */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    Issue Types
                  </h3>
                  <div className="space-y-3">
                    {ISSUE_TYPES.map(type => {
                      const count = project.tickets.filter(t => t.type === type.id).length;
                      return (
                        <div key={type.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded ${type.color}`} />
                            <span className="text-sm text-neutral-700 dark:text-neutral-300">{type.label}</span>
                          </div>
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Team Performance */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Team Performance
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {project.team.map(member => {
                    const memberTickets = project.tickets.filter(t => t.assigneeId === member.id);
                    const completed = memberTickets.filter(t => t.status === 'done').length;
                    const completionRate = memberTickets.length > 0 ? (completed / memberTickets.length) * 100 : 0;
                    return (
                      <div key={member.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar member={member} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{member.name}</p>
                            <p className="text-xs text-neutral-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-500">Assigned</span>
                            <span className="font-bold text-neutral-900 dark:text-white">{memberTickets.length}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-500">Completed</span>
                            <span className="font-bold text-green-600">{completed}</span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 mt-2">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${completionRate}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/*  AI Assistant Tab  */}
          {project && activeTab === "ai" && (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Bot className="w-7 h-7" />
                  AI Project Assistant
                </h2>
                <p className="text-purple-100">Ask me anything about your project, tickets, team, or status</p>
              </div>

              <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {aiMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" />
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Start a Conversation</h3>
                      <p className="text-neutral-500 max-w-md mb-6">Ask me about ticket status, project progress, team workload, or anything else!</p>
                      <div className="grid grid-cols-2 gap-3 max-w-lg">
                        <button onClick={() => setAiInput("What's the current status of the project?")} className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <p className="font-medium text-neutral-900 dark:text-white">Project Status</p>
                          <p className="text-xs text-neutral-500 mt-1">Get overall progress</p>
                        </button>
                        <button onClick={() => setAiInput("Which tickets are in progress?")} className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <p className="font-medium text-neutral-900 dark:text-white">Active Tickets</p>
                          <p className="text-xs text-neutral-500 mt-1">See what's being worked on</p>
                        </button>
                        <button onClick={() => setAiInput("Show me high priority tickets")} className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <p className="font-medium text-neutral-900 dark:text-white">Priority Items</p>
                          <p className="text-xs text-neutral-500 mt-1">Focus on urgent work</p>
                        </button>
                        <button onClick={() => setAiInput("How is the team performing?")} className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                          <p className="font-medium text-neutral-900 dark:text-white">Team Performance</p>
                          <p className="text-xs text-neutral-500 mt-1">Check team metrics</p>
                        </button>
                      </div>
                    </div>
                  ) : (
                    aiMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user' 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">You</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAIChat()}
                      placeholder="Ask about your project..."
                      className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm"
                      disabled={aiLoading}
                    />
                    <button
                      onClick={handleAIChat}
                      disabled={aiLoading || !aiInput.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
              <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Project Hub Guide</h2>
                    <p className="text-indigo-100 text-sm">Agile project management platform</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📊 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Project Hub is a complete agile project management system. Create projects, manage sprints, track tickets with a Kanban board, collaborate with your team, and maintain project documentation - all in one place.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🎯 Multi-Project Management</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Create and manage multiple projects with unique keys, descriptions, and status tracking.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">📋 Kanban Board</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Drag-and-drop tickets across Backlog, To Do, In Progress, Review, and Done columns.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🎫 Rich Ticket System</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Tasks, bugs, features, improvements with priorities, story points, labels, comments, and attachments.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">🏃 Sprint Management</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Create sprints with goals, dates, and assign tickets to organize work into iterations.</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">👥 Team Collaboration</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Add team members with roles, assign tickets, track individual progress and completion rates.</p>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg p-4">
                      <h4 className="font-semibold text-rose-900 dark:text-rose-400 mb-1">📄 Project Documents</h4>
                      <p className="text-sm text-rose-800 dark:text-rose-300">Create README, specs, notes, and API docs with rich text and embedded images.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Project</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Project" in the sidebar. Add name, key (e.g., SNA), description, and status.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Team Members</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Go to Team tab, add members with names and roles. They'll get color-coded avatars.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create Sprints</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">In Kanban view, create sprints with names, goals, start/end dates to organize work.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Tickets</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click + in any Kanban column. Set type (task/bug/feature), priority, title, and details.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Manage Tickets</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click tickets to add descriptions, comments, attachments, labels, assign members, set story points.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Progress</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Drag tickets across board columns. View Overview for stats, Team tab for individual progress.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use project keys</strong> - Short 3-5 letter codes make ticket IDs readable (e.g., SNA-1234)</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Label everything</strong> - Tags help filter and organize tickets across sprints</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Story points</strong> - Estimate effort to track velocity and plan capacity</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Sprint goals</strong> - Clear objectives keep teams focused and aligned</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use documents</strong> - Keep specs and notes in Docs tab for easy reference</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Comment actively</strong> - Discussion in tickets keeps context and decisions visible</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your projects are automatically saved to the database.</strong> All projects, tickets, sprints, team members, documents, comments, and attachments are persisted to the server. Look for the "Saving..." indicator to confirm storage. Your work syncs across devices automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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

