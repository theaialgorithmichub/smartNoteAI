"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateFooter } from './template-footer';
import {
  Plus, X, Loader2, CheckCircle2, Circle, Trash2, Pencil,
  LayoutDashboard, StickyNote, ListTodo, CalendarDays, BarChart3,
  TrendingUp, TrendingDown, Minus, Clock, Tag, PanelLeft,
} from "lucide-react";

type WidgetType = "notes" | "tasks" | "events" | "stats" | "scratchpad" | "countdown";
interface NoteItem { id: string; title: string; content: string; color: string; }
interface TaskItem { id: string; title: string; dueDate: string; completed: boolean; priority: "low" | "medium" | "high"; tag: string; }
interface EventItem { id: string; title: string; date: string; time: string; color: string; }
interface StatItem { id: string; label: string; value: string; trend: "up" | "down" | "flat"; change: string; }
interface CountdownItem { id: string; label: string; targetDate: string; }
interface Widget { id: string; type: WidgetType; title: string; notes?: NoteItem[]; tasks?: TaskItem[]; events?: EventItem[]; stats?: StatItem[]; scratchpad?: string; countdowns?: CountdownItem[]; }
interface Dashboard { id: string; name: string; emoji: string; widgets: Widget[]; createdAt: string; updatedAt: string; }
interface DashboardTemplateProps { title: string; notebookId?: string; }

const NOTE_COLORS = ["amber","sky","emerald","rose","violet","orange"];
const EVENT_COLORS = ["blue","green","yellow","purple","red","pink"];
const EMOJIS = ["","","","","","","","","","","",""];
const noteDotClass: Record<string,string> = { amber:"bg-amber-400",sky:"bg-sky-400",emerald:"bg-emerald-400",rose:"bg-rose-400",violet:"bg-violet-400",orange:"bg-orange-400" };
const noteBgClass: Record<string,string> = { amber:"bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",sky:"bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800",emerald:"bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",rose:"bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800",violet:"bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",orange:"bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" };
const eventColorMap: Record<string,string> = { blue:"#3b82f6",green:"#10b981",yellow:"#f59e0b",purple:"#8b5cf6",red:"#ef4444",pink:"#ec4899" };
const priorityClass: Record<string,string> = { high:"text-red-500 bg-red-50 dark:bg-red-900/20",medium:"text-amber-500 bg-amber-50 dark:bg-amber-900/20",low:"text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" };

const makeDashboard = (name = "My Dashboard"): Dashboard => ({
  id: Date.now().toString(), name, emoji: "",
  widgets: [
    { id: "w1", type: "stats", title: "Stats", stats: [] },
    { id: "w2", type: "tasks", title: "Tasks", tasks: [] },
    { id: "w3", type: "notes", title: "Notes", notes: [] },
    { id: "w4", type: "events", title: "Events", events: [] },
  ],
  createdAt: new Date().toLocaleString(), updatedAt: new Date().toLocaleString(),
});

const makeWidget = (type: WidgetType): Widget => {
  const titles: Record<WidgetType,string> = { notes:"Notes",tasks:"Tasks",events:"Events",stats:"Stats",scratchpad:"Scratch Pad",countdown:"Countdowns" };
  return { id: Date.now().toString(), type, title: titles[type], notes:type==="notes"?[]:undefined, tasks:type==="tasks"?[]:undefined, events:type==="events"?[]:undefined, stats:type==="stats"?[]:undefined, scratchpad:type==="scratchpad"?"":undefined, countdowns:type==="countdown"?[]:undefined };
};

function StatsWidget({ widget, onChange }: { widget: Widget; onChange: (w: Widget) => void }) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState(""); const [value, setValue] = useState(""); const [trend, setTrend] = useState<"up"|"down"|"flat">("up"); const [change, setChange] = useState("");
  const stats = widget.stats ?? [];
  const add = () => { if (!label.trim()||!value.trim()) return; onChange({ ...widget, stats: [...stats, { id: Date.now().toString(), label, value, trend, change }] }); setLabel(""); setValue(""); setChange(""); setAdding(false); };
  const remove = (id: string) => onChange({ ...widget, stats: stats.filter(s => s.id !== id) });
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {stats.map(s => (
          <div key={s.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 relative group">
            <button onClick={() => remove(s.id)} className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
            {s.change && <div className="flex items-center gap-1 mt-1">{s.trend==="up"?<TrendingUp className="w-3 h-3 text-emerald-500"/>:s.trend==="down"?<TrendingDown className="w-3 h-3 text-red-500"/>:<Minus className="w-3 h-3 text-neutral-400"/>}<span className="text-xs text-neutral-500">{s.change}</span></div>}
          </div>
        ))}
        {stats.length===0&&!adding&&<p className="text-xs text-neutral-400 italic col-span-2 py-2">No stats yet</p>}
      </div>
      {adding ? (
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Label (e.g. Revenue)" className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
            <input value={value} onChange={e=>setValue(e.target.value)} placeholder="Value (e.g. \$12k)" className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={change} onChange={e=>setChange(e.target.value)} placeholder="Change (e.g. +12%)" className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
            <select value={trend} onChange={e=>setTrend(e.target.value as any)} className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"><option value="up">Trending Up</option><option value="down">Trending Down</option><option value="flat">Flat</option></select>
          </div>
          <div className="flex gap-2"><button onClick={add} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Add Stat</button><button onClick={()=>setAdding(false)} className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg text-xs">Cancel</button></div>
        </div>
      ) : <button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-500 transition-colors"><Plus className="w-3.5 h-3.5"/>Add stat</button>}
    </div>
  );
}

function TasksWidget({ widget, onChange }: { widget: Widget; onChange: (w: Widget) => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState(""); const [due, setDue] = useState(""); const [priority, setPriority] = useState<"low"|"medium"|"high">("medium"); const [tag, setTag] = useState("");
  const [filter, setFilter] = useState<"all"|"active"|"done">("all");
  const tasks = widget.tasks ?? [];
  const add = () => { if (!title.trim()) return; const formattedDue = due ? new Date(due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "No due date"; onChange({ ...widget, tasks: [...tasks, { id: Date.now().toString(), title, dueDate: formattedDue, completed: false, priority, tag }] }); setTitle(""); setDue(""); setTag(""); setAdding(false); };
  const toggle = (id: string) => onChange({ ...widget, tasks: tasks.map(t => t.id===id?{...t,completed:!t.completed}:t) });
  const remove = (id: string) => onChange({ ...widget, tasks: tasks.filter(t => t.id!==id) });
  const filtered = tasks.filter(t => filter==="all"?true:filter==="done"?t.completed:!t.completed);
  const done = tasks.filter(t=>t.completed).length;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{width:tasks.length?`${(done/tasks.length)*100}%`:"0%"}}/></div>
        <span className="text-xs text-neutral-500">{done}/{tasks.length}</span>
        <div className="flex gap-1 text-xs">{(["all","active","done"] as const).map(f=><button key={f} onClick={()=>setFilter(f)} className={`px-2 py-0.5 rounded-full capitalize ${filter===f?"bg-amber-500 text-white":"text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}>{f}</button>)}</div>
      </div>
      <div className="space-y-1 mb-3 max-h-44 overflow-y-auto">
        {filtered.map(t=>(
          <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 group">
            <button onClick={()=>toggle(t.id)} className="flex-shrink-0">{t.completed?<CheckCircle2 className="w-4 h-4 text-emerald-500"/>:<Circle className="w-4 h-4 text-neutral-300 dark:text-neutral-600"/>}</button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.completed?"line-through text-neutral-400":"text-neutral-800 dark:text-neutral-200"}`}>{t.title}</p>
              <div className="flex items-center gap-2 mt-0.5">{t.dueDate!=="No due date"&&<span className="text-xs text-neutral-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5"/>{t.dueDate}</span>}{t.tag&&<span className="text-xs text-neutral-400 flex items-center gap-0.5"><Tag className="w-2.5 h-2.5"/>{t.tag}</span>}</div>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${priorityClass[t.priority]}`}>{t.priority}</span>
            <button onClick={()=>remove(t.id)} className="p-0.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><X className="w-3.5 h-3.5"/></button>
          </div>
        ))}
        {filtered.length===0&&<p className="text-xs text-neutral-400 italic py-2 text-center">No {filter} tasks</p>}
      </div>
      {adding?(
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Task title..." autoFocus className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={due} onChange={e=>setDue(e.target.value)} className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
            <input value={tag} onChange={e=>setTag(e.target.value)} placeholder="Tag (optional)" className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          </div>
          <div className="flex gap-2 items-center">
            <select value={priority} onChange={e=>setPriority(e.target.value as any)} className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600 flex-1"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
            <button onClick={add} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Add</button>
            <button onClick={()=>setAdding(false)} className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg text-xs">Cancel</button>
          </div>
        </div>
      ):<button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-500 transition-colors"><Plus className="w-3.5 h-3.5"/>Add task</button>}
    </div>
  );
}

function NotesWidget({ widget, onChange }: { widget: Widget; onChange: (w: Widget) => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [color, setColor] = useState("amber");
  const notes = widget.notes ?? [];
  const add = () => { if (!title.trim()) return; onChange({ ...widget, notes: [...notes, { id: Date.now().toString(), title, content, color }] }); setTitle(""); setContent(""); setAdding(false); };
  const remove = (id: string) => onChange({ ...widget, notes: notes.filter(n => n.id!==id) });
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-3 max-h-48 overflow-y-auto">
        {notes.map(n=>(
          <div key={n.id} className={`rounded-xl p-3 border relative group ${noteBgClass[n.color]}`}>
            <button onClick={()=>remove(n.id)} className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5"/></button>
            <div className="flex items-center gap-1.5 mb-1"><div className={`w-2 h-2 rounded-full ${noteDotClass[n.color]}`}/><p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{n.title}</p></div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">{n.content}</p>
          </div>
        ))}
        {notes.length===0&&!adding&&<p className="text-xs text-neutral-400 italic col-span-2 py-2">No notes yet</p>}
      </div>
      {adding?(
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Note title..." autoFocus className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Note content..." className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600 resize-none h-16"/>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">{NOTE_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} className={`w-4 h-4 rounded-full ${noteDotClass[c]} ${color===c?"ring-2 ring-offset-1 ring-neutral-400":""}`}/>)}</div>
            <button onClick={add} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Add</button>
            <button onClick={()=>setAdding(false)} className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg text-xs">Cancel</button>
          </div>
        </div>
      ):<button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-500 transition-colors"><Plus className="w-3.5 h-3.5"/>Add note</button>}
    </div>
  );
}

function EventsWidget({ widget, onChange }: { widget: Widget; onChange: (w: Widget) => void }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState(""); const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [color, setColor] = useState("blue");
  const events = widget.events ?? [];
  const add = () => { if (!title.trim()) return; onChange({ ...widget, events: [...events, { id: Date.now().toString(), title, date, time, color }] }); setTitle(""); setDate(""); setTime(""); setAdding(false); };
  const remove = (id: string) => onChange({ ...widget, events: events.filter(e => e.id!==id) });
  return (
    <div>
      <div className="space-y-2 mb-3 max-h-44 overflow-y-auto">
        {events.map(e=>(
          <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl border-l-4 relative group" style={{borderLeftColor:eventColorMap[e.color],backgroundColor:`${eventColorMap[e.color]}18`}}>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{e.title}</p><p className="text-xs text-neutral-500">{[e.date,e.time].filter(Boolean).join("  ")||"No date set"}</p></div>
            <button onClick={()=>remove(e.id)} className="p-0.5 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"><X className="w-3.5 h-3.5"/></button>
          </div>
        ))}
        {events.length===0&&!adding&&<p className="text-xs text-neutral-400 italic py-2">No events yet</p>}
      </div>
      {adding?(
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 space-y-2">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Event title..." autoFocus className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} className="px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 flex-1">{EVENT_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} className={`w-4 h-4 rounded-full ${color===c?"ring-2 ring-offset-1 ring-neutral-400":""}`} style={{backgroundColor:eventColorMap[c]}}/>)}</div>
            <button onClick={add} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Add</button>
            <button onClick={()=>setAdding(false)} className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg text-xs">Cancel</button>
          </div>
        </div>
      ):<button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-500 transition-colors"><Plus className="w-3.5 h-3.5"/>Add event</button>}
    </div>
  );
}

function ScratchPadWidget({ widget, onChange }: { widget: Widget; onChange: (w: Widget) => void }) {
  return <textarea value={widget.scratchpad??""} onChange={e=>onChange({...widget,scratchpad:e.target.value})} placeholder="Quick notes, ideas, reminders..." className="w-full h-36 bg-transparent outline-none resize-none text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400"/>;
}

function CountdownWidget({ widget, onChange }: { widget: Widget; onChange: (w: Widget) => void }) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState(""); const [targetDate, setTargetDate] = useState("");
  const [now, setNow] = useState(Date.now());
  const countdowns = widget.countdowns ?? [];
  useEffect(() => { const t = setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(t); }, []);
  const getDiff = (target: string) => { const diff=new Date(target).getTime()-now; if(diff<=0) return {days:0,hours:0,mins:0,secs:0,done:true}; return {days:Math.floor(diff/86400000),hours:Math.floor((diff%86400000)/3600000),mins:Math.floor((diff%3600000)/60000),secs:Math.floor((diff%60000)/1000),done:false}; };
  const add = () => { if(!label.trim()||!targetDate) return; onChange({...widget,countdowns:[...countdowns,{id:Date.now().toString(),label,targetDate}]}); setLabel(""); setTargetDate(""); setAdding(false); };
  const remove = (id: string) => onChange({...widget,countdowns:countdowns.filter(c=>c.id!==id)});
  return (
    <div>
      <div className="space-y-3 mb-3">
        {countdowns.map(c=>{ const d=getDiff(c.targetDate); return (
          <div key={c.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 relative group">
            <button onClick={()=>remove(c.id)} className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5"/></button>
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">{c.label}</p>
            {d.done?<p className="text-sm font-bold text-emerald-500">Reached!</p>:(
              <div className="flex gap-2">{[{v:d.days,l:"d"},{v:d.hours,l:"h"},{v:d.mins,l:"m"},{v:d.secs,l:"s"}].map(({v,l})=>(
                <div key={l} className="flex-1 text-center bg-white dark:bg-neutral-700 rounded-lg py-1.5"><p className="text-lg font-bold text-neutral-900 dark:text-white">{String(v).padStart(2,"0")}</p><p className="text-xs text-neutral-400">{l}</p></div>
              ))}</div>
            )}
          </div>
        );})}
        {countdowns.length===0&&!adding&&<p className="text-xs text-neutral-400 italic py-2">No countdowns yet</p>}
      </div>
      {adding?(
        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 space-y-2">
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Event name..." autoFocus className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          <input type="datetime-local" value={targetDate} onChange={e=>setTargetDate(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 rounded-lg outline-none border border-neutral-200 dark:border-neutral-600"/>
          <div className="flex gap-2"><button onClick={add} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Add</button><button onClick={()=>setAdding(false)} className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg text-xs">Cancel</button></div>
        </div>
      ):<button onClick={()=>setAdding(true)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-500 transition-colors"><Plus className="w-3.5 h-3.5"/>Add countdown</button>}
    </div>
  );
}

const WIDGET_ICONS: Record<WidgetType, React.ReactNode> = {
  stats: <BarChart3 className="w-4 h-4"/>, tasks: <ListTodo className="w-4 h-4"/>, notes: <StickyNote className="w-4 h-4"/>,
  events: <CalendarDays className="w-4 h-4"/>, scratchpad: <Pencil className="w-4 h-4"/>, countdown: <Clock className="w-4 h-4"/>,
};

const WIDGET_TYPES: { type: WidgetType; label: string; desc: string }[] = [
  { type: "stats",     label: "Stats",       desc: "Key metrics with trends" },
  { type: "tasks",     label: "Tasks",       desc: "To-do list with priorities" },
  { type: "notes",     label: "Notes",       desc: "Coloured sticky notes" },
  { type: "events",    label: "Events",      desc: "Upcoming calendar events" },
  { type: "scratchpad",label: "Scratch Pad", desc: "Free-form text area" },
  { type: "countdown", label: "Countdown",   desc: "Live countdown timers" },
];

function WidgetCard({ widget, onUpdate, onRemove }: { widget: Widget; onUpdate: (w: Widget) => void; onRemove: () => void }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(widget.title);
  const commitTitle = () => { onUpdate({...widget, title: titleVal.trim()||widget.title}); setEditingTitle(false); };
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-neutral-400">{WIDGET_ICONS[widget.type]}</span>
          {editingTitle ? (
            <input value={titleVal} onChange={e=>setTitleVal(e.target.value)} onBlur={commitTitle} onKeyDown={e=>{if(e.key==="Enter")commitTitle();if(e.key==="Escape")setEditingTitle(false);}} autoFocus className="flex-1 text-sm font-semibold bg-white dark:bg-neutral-700 border border-amber-400 rounded px-1 outline-none text-neutral-900 dark:text-white"/>
          ) : (
            <span className="flex-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200 cursor-pointer hover:text-amber-500 transition-colors" onClick={()=>setEditingTitle(true)}>{widget.title}</span>
          )}
          <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5"/></button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-hidden">
        {widget.type==="stats"     && <StatsWidget     widget={widget} onChange={onUpdate}/>}
        {widget.type==="tasks"     && <TasksWidget     widget={widget} onChange={onUpdate}/>}
        {widget.type==="notes"     && <NotesWidget     widget={widget} onChange={onUpdate}/>}
        {widget.type==="events"    && <EventsWidget    widget={widget} onChange={onUpdate}/>}
        {widget.type==="scratchpad"&& <ScratchPadWidget widget={widget} onChange={onUpdate}/>}
        {widget.type==="countdown" && <CountdownWidget  widget={widget} onChange={onUpdate}/>}
      </div>
    </div>
  );
}

function AddWidgetPanel({ onAdd, onClose }: { onAdd: (type: WidgetType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} transition={{duration:0.15}}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-6 w-[480px] max-w-[95vw]"
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">Add Widget</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"><X className="w-4 h-4"/></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {WIDGET_TYPES.map(w=>(
            <button key={w.type} onClick={()=>{onAdd(w.type);onClose();}}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all text-left group">
              <span className="mt-0.5 text-neutral-400 group-hover:text-amber-500 transition-colors">{WIDGET_ICONS[w.type]}</span>
              <div><p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">{w.label}</p><p className="text-xs text-neutral-400 mt-0.5">{w.desc}</p></div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function DashboardTemplate({ title, notebookId }: DashboardTemplateProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [renamingId, setRenamingId] = useState<string|null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string|null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");

  const saveRef = useRef<NodeJS.Timeout|null>(null);
  const pageIdRef = useRef<string|null>(null);

  const active = dashboards.find(d=>d.id===activeId) ?? dashboards[0] ?? null;

  //  Load from DB 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const data = await res.json();
        const pages: any[] = data.pages ?? [];
        const existing = pages.find((p:any) => p.title === "__dashboard_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const parsed: Dashboard[] = JSON.parse(existing.content || "[]");
            if (parsed.length > 0) { setDashboards(parsed); setActiveId(parsed[0].id); }
            else { const d = makeDashboard(); setDashboards([d]); setActiveId(d.id); }
          } catch { const d = makeDashboard(); setDashboards([d]); setActiveId(d.id); }
        } else {
          const createRes = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ title: "__dashboard_template__", content: "[]" }),
          });
          const created = await createRes.json();
          pageIdRef.current = created.page?._id ?? null;
          const d = makeDashboard(); setDashboards([d]); setActiveId(d.id);
        }
      } catch (err) {
        console.error("Failed to load dashboards:", err);
        const d = makeDashboard(); setDashboards([d]); setActiveId(d.id);
      } finally { setLoading(false); }
    })();
  }, [notebookId]);

  //  Persist to DB 
  const persist = useCallback((list: Dashboard[]) => {
    if (!notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current;
      if (!pid) return;
      setSaving(true);
      try {
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ title: "__dashboard_template__", content: JSON.stringify(list) }),
        });
      } catch (err) { console.error("Failed to save:", err); }
      finally { setSaving(false); }
    }, 1000);
  }, [notebookId]);

  //  Helpers 
  const updateDashboards = (list: Dashboard[]) => { setDashboards(list); persist(list); };

  const createDashboard = () => {
    const name = newName.trim() || "New Dashboard";
    const d = makeDashboard(name);
    const next = [...dashboards, d];
    updateDashboards(next); setActiveId(d.id); setCreatingNew(false); setNewName("");
  };

  const deleteDashboard = (id: string) => {
    const next = dashboards.filter(d=>d.id!==id);
    updateDashboards(next);
    if (activeId===id) setActiveId(next[0]?.id ?? "");
  };

  const updateActive = (patch: Partial<Dashboard>) => {
    const next = dashboards.map(d=>d.id===active?.id?{...d,...patch,updatedAt:new Date().toLocaleString()}:d);
    updateDashboards(next);
  };

  const updateWidget = (w: Widget) => {
    if (!active) return;
    updateActive({ widgets: active.widgets.map(x=>x.id===w.id?w:x) });
  };

  const removeWidget = (id: string) => {
    if (!active) return;
    updateActive({ widgets: active.widgets.filter(x=>x.id!==id) });
  };

  const addWidget = (type: WidgetType) => {
    if (!active) return;
    updateActive({ widgets: [...active.widgets, makeWidget(type)] });
  };

  if (loading) return (
    <div className="h-full min-h-0 flex flex-col bg-neutral-100 dark:bg-neutral-950">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500"/>
      </div>
      <TemplateFooter />
    </div>
  );

  return (
    <div className="h-full min-h-0 flex flex-col bg-neutral-100 dark:bg-neutral-950">
      <div className="flex-1 min-h-0 flex overflow-hidden">

      {/*  Sidebar  */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside initial={{width:0,opacity:0}} animate={{width:260,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:0.2}}
            className="flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-amber-500"/>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">Dashboards</span>
              </div>
              <button onClick={()=>setSidebarOpen(false)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"><PanelLeft className="w-4 h-4"/></button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {dashboards.map(d=>(
                <div key={d.id} className={`group flex items-center gap-2 mx-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${d.id===activeId?"bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400":"hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"}`}
                  onClick={()=>setActiveId(d.id)}>
                  <button onClick={e=>{e.stopPropagation();setShowEmojiPicker(showEmojiPicker===d.id?null:d.id);}} className="text-base flex-shrink-0 hover:scale-110 transition-transform">{d.emoji}</button>
                  {renamingId===d.id ? (
                    <input value={renameVal} onChange={e=>setRenameVal(e.target.value)}
                      onBlur={()=>{ updateDashboards(dashboards.map(x=>x.id===d.id?{...x,name:renameVal.trim()||x.name}:x)); setRenamingId(null); }}
                      onKeyDown={e=>{ if(e.key==="Enter"||e.key==="Escape"){ updateDashboards(dashboards.map(x=>x.id===d.id?{...x,name:renameVal.trim()||x.name}:x)); setRenamingId(null); } }}
                      autoFocus onClick={e=>e.stopPropagation()}
                      className="flex-1 text-sm bg-white dark:bg-neutral-700 border border-amber-400 rounded px-1 outline-none min-w-0"/>
                  ) : (
                    <span className="flex-1 text-sm font-medium truncate">{d.name}</span>
                  )}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={e=>{e.stopPropagation();setRenamingId(d.id);setRenameVal(d.name);}} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"><Pencil className="w-3 h-3"/></button>
                    {dashboards.length>1&&<button onClick={e=>{e.stopPropagation();deleteDashboard(d.id);}} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>}
                  </div>
                  {showEmojiPicker===d.id && (
                    <div className="absolute left-56 top-0 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-3" onClick={e=>e.stopPropagation()}>
                      <div className="grid grid-cols-6 gap-1">
                        {EMOJIS.map(em=><button key={em} onClick={()=>{updateDashboards(dashboards.map(x=>x.id===d.id?{...x,emoji:em}:x));setShowEmojiPicker(null);}} className="text-lg hover:scale-125 transition-transform p-1">{em}</button>)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
              {creatingNew ? (
                <div className="space-y-2">
                  <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createDashboard()} placeholder="Dashboard name..." autoFocus className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none"/>
                  <div className="flex gap-2">
                    <button onClick={createDashboard} className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Create</button>
                    <button onClick={()=>{setCreatingNew(false);setNewName("");}} className="flex-1 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs text-neutral-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={()=>setCreatingNew(true)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-amber-400 hover:text-amber-500 transition-all text-sm font-medium">
                  <Plus className="w-4 h-4"/> New Dashboard
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/*  Main  */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          {!sidebarOpen && (
            <button onClick={()=>setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 mr-1"><PanelLeft className="w-4 h-4"/></button>
          )}
          <span className="text-xl">{active?.emoji ?? ""}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white truncate">{active?.name ?? "Dashboard"}</h1>
            {active && <p className="text-xs text-neutral-400">Updated {active.updatedAt}</p>}
          </div>
          {saving && (
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin"/> Saving...
            </div>
          )}
          {active && (
            <button onClick={()=>setShowAddWidget(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4"/> Add Widget
            </button>
          )}
        </div>

        {/* Widget Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {!active ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-400">
              <LayoutDashboard className="w-16 h-16 opacity-20"/>
              <p className="text-lg font-medium">No dashboard selected</p>
              <button onClick={()=>setCreatingNew(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">Create Dashboard</button>
            </div>
          ) : active.widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-400">
              <LayoutDashboard className="w-16 h-16 opacity-20"/>
              <p className="text-lg font-medium">No widgets yet</p>
              <button onClick={()=>setShowAddWidget(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4"/>Add your first widget</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-min">
              {active.widgets.map(w=>(
                <motion.div key={w.id} layout initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}} transition={{duration:0.2}}>
                  <WidgetCard widget={w} onUpdate={updateWidget} onRemove={()=>removeWidget(w.id)}/>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Widget Modal */}
      <AnimatePresence>
        {showAddWidget && <AddWidgetPanel onAdd={addWidget} onClose={()=>setShowAddWidget(false)}/>}
      </AnimatePresence>
      </div>
      <TemplateFooter />
    </div>
  );
}

