"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateFooter } from './template-footer';
import {
  FileText, Clock, Target, Plus, X, Loader2, Trash2,
  ChevronLeft, ChevronRight, CalendarDays, CheckCircle2,
  Circle, Pencil, AlarmClock, Flag, StickyNote, Info,
} from "lucide-react";

//  Types 

interface Goal { id: string; text: string; done: boolean; }

interface AgendaItem {
  id: string;
  date: string;
  time: string;
  endTime: string;
  title: string;
  description: string;
  notes: string;
  priority: "low" | "medium" | "high";
  done: boolean;
}

interface DayNote { date: string; text: string; }

interface PlannerData {
  planType: string;
  duration: string;
  context: string;
  summaryNotes: string;
  goals: Goal[];
  agendaItems: AgendaItem[];
  dayNotes: DayNote[];
}

interface PlannerTemplateProps { title?: string; notebookId?: string; }

//  Helpers 

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const priorityColor: Record<string,string> = {
  high: "text-red-500 bg-red-50 dark:bg-red-900/20",
  medium: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
  low: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
};
const priorityDot: Record<string,string> = { high:"bg-red-500", medium:"bg-amber-500", low:"bg-emerald-500" };

const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const today = toDateStr(new Date());

const makeItem = (date: string, time = ""): AgendaItem => ({
  id: Date.now().toString(), date, time, endTime: "", title: "", description: "", notes: "", priority: "medium", done: false,
});

const defaultData = (): PlannerData => ({
  planType: "", duration: "", context: "", summaryNotes: "",
  goals: [], agendaItems: [], dayNotes: [],
});

//  Mini Calendar 

function MiniCalendar({
  selectedDate, onSelect, agendaItems,
}: { selectedDate: string; onSelect: (d: string) => void; agendaItems: AgendaItem[]; }) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  const datesWithItems = new Set(agendaItems.map(a => a.date));

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prev = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); };
  const next = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); };

  const cells: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <button onClick={prev} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"><ChevronLeft className="w-4 h-4"/></button>
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={next} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"><ChevronRight className="w-4 h-4"/></button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DAYS.map(d => <p key={d} className="text-center text-[10px] font-semibold text-neutral-400 pb-1">{d}</p>)}
      </div>
      {/* Date cells */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>;
          const ds = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday = ds === today;
          const isSelected = ds === selectedDate;
          const hasItems = datesWithItems.has(ds);
          return (
            <button key={i} onClick={() => onSelect(ds)}
              className={`relative mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                ${isSelected ? "bg-amber-500 text-white font-bold shadow-md" :
                  isToday ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold" :
                  "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"}`}>
              {day}
              {hasItems && !isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

//  Time Picker 

function TimePicker({ value, onChange, placeholder = "Time" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <AlarmClock className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0"/>
      <input type="time" value={value} onChange={e => onChange(e.target.value)}
        className="bg-transparent text-sm text-neutral-700 dark:text-neutral-300 outline-none w-24 cursor-pointer"/>
    </div>
  );
}

function AgendaCard({ item, onUpdate, onRemove }: { item: AgendaItem; onUpdate: (a: AgendaItem) => void; onRemove: () => void; }) {
  const [expanded, setExpanded] = useState(!item.title);
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.97 }}
      className={`rounded-xl border transition-all ${item.done ? "border-neutral-100 dark:border-neutral-800 opacity-60" : "border-neutral-200 dark:border-neutral-700"} bg-white dark:bg-neutral-900 overflow-hidden group`}>
      {/* Row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={() => onUpdate({...item, done:!item.done})} className="flex-shrink-0">
          {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Circle className="w-4 h-4 text-neutral-300 dark:text-neutral-600"/>}
        </button>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`w-2 h-2 rounded-full ${priorityDot[item.priority]}`}/>
          <span className="text-xs text-neutral-400 font-mono w-10">{item.time||"--:--"}</span>
          {item.endTime && <><span className="text-xs text-neutral-300"></span><span className="text-xs text-neutral-400 font-mono">{item.endTime}</span></>}
        </div>
        <input value={item.title} onChange={e => onUpdate({...item, title:e.target.value})} placeholder="Add title..."
          className={`flex-1 text-sm font-medium bg-transparent outline-none ${item.done ? "line-through text-neutral-400" : "text-neutral-800 dark:text-neutral-200"}`}/>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={() => setExpanded(v => !v)} className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"><Pencil className="w-3.5 h-3.5"/></button>
          <button onClick={onRemove} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>
        </div>
      </div>
      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.15}}
            className="border-t border-neutral-100 dark:border-neutral-800 px-4 pb-4 pt-3 space-y-3 overflow-hidden">
            {/* Time pickers */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 w-14">Start</span>
                <TimePicker value={item.time} onChange={v => onUpdate({...item, time:v})} placeholder="Start time"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 w-14">End</span>
                <TimePicker value={item.endTime} onChange={v => onUpdate({...item, endTime:v})} placeholder="End time"/>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 w-14">Priority</span>
                <select value={item.priority} onChange={e => onUpdate({...item, priority:e.target.value as any})}
                  className="px-2 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none text-neutral-700 dark:text-neutral-300">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <textarea value={item.description} onChange={e => onUpdate({...item, description:e.target.value})} placeholder="Description..."
              className="w-full text-sm text-neutral-600 dark:text-neutral-400 bg-transparent outline-none resize-none placeholder-neutral-400" rows={2}/>
            <textarea value={item.notes} onChange={e => onUpdate({...item, notes:e.target.value})} placeholder="Notes, action items, follow-ups..."
              className="w-full text-sm text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2.5 outline-none resize-none placeholder-neutral-400" rows={3}/>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function PlannerTemplate({ title = "Untitled Plan", notebookId }: PlannerTemplateProps) {
  const [data, setData] = useState<PlannerData>(defaultData());
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab, setActiveTab] = useState<"agenda"|"notes"|"summary">("agenda");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newPriority, setNewPriority] = useState<"low"|"medium"|"high">("medium");
  const [addingGoal, setAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [showDocumentation, setShowDocumentation] = useState(false);

  const saveRef = useRef<NodeJS.Timeout|null>(null);
  const pageIdRef = useRef<string|null>(null);

  //  Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p:any) => p.title === "__planner_template__");
        console.log('[PLANNER] Loading data:', { existing, content: existing?.content });
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const parsed = JSON.parse(existing.content || "{}");
            console.log('[PLANNER] Parsed data:', parsed);
            // Check if content is valid
            if (existing.content && existing.content.trim() && Object.keys(parsed).length > 0) {
              setData({ ...defaultData(), ...parsed });
              setLoading(false);
              return;
            }
            // If content is empty or corrupted, delete and recreate
            console.log('[PLANNER] Empty/corrupted content detected, recreating page...');
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: "DELETE" });
          } catch (err) {
            console.error('[PLANNER] Parse error:', err);
            // Delete corrupted page
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: "DELETE" });
          }
        }
        // Create new page
        const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ title: "__planner_template__", content: JSON.stringify(defaultData()) }),
        });
        const created = await cr.json();
        console.log('[PLANNER] Created new page:', created);
        pageIdRef.current = created.page?._id ?? null;
      } catch (err) { console.error("Failed to load planner:", err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  //  Persist 
  const persist = useCallback((d: PlannerData) => {
    if (!notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current; if (!pid) return;
      setSaving(true);
      console.log('[PLANNER] Saving data:', d);
      try {
        const payload = { title: "__planner_template__", content: JSON.stringify(d) };
        console.log('[PLANNER] Save payload:', payload);
        const response = await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: {"Content-Type":"application/json"},
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        console.log('[PLANNER] Save response:', result);
        console.log('[PLANNER] Saved page content:', result.page?.content);
      } catch (err) { console.error("Failed to save:", err); }
      finally { setSaving(false); }
    }, 1000);
  }, [notebookId]);

  const update = (patch: Partial<PlannerData>) => { const next = {...data,...patch}; setData(next); persist(next); };

  const addItem = () => {
    if (!newTitle.trim()) return;
    const item: AgendaItem = { id: Date.now().toString(), date: selectedDate, time: newTime, endTime: newEndTime, title: newTitle, description: "", notes: "", priority: newPriority, done: false };
    update({ agendaItems: [...data.agendaItems, item].sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time)) });
    setNewTitle(""); setNewTime(""); setNewEndTime(""); setAddingItem(false);
  };

  const updateItem = (item: AgendaItem) => update({ agendaItems: data.agendaItems.map(a => a.id===item.id ? item : a) });
  const removeItem = (id: string) => update({ agendaItems: data.agendaItems.filter(a => a.id!==id) });

  const addGoalFn = () => {
    if (!newGoal.trim()) return;
    update({ goals: [...data.goals, { id: Date.now().toString(), text: newGoal, done: false }] });
    setNewGoal(""); setAddingGoal(false);
  };

  const dayItems = data.agendaItems.filter(a => a.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));
  const dayNote = data.dayNotes.find(n => n.date === selectedDate);

  const formatDate = (ds: string) => {
    const d = new Date(ds+"T00:00:00"); return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  if (loading) return (
    <div className="h-full min-h-0 flex flex-col bg-amber-50/50 dark:bg-neutral-950">
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500"/>
      </div>
      <TemplateFooter />
    </div>
  );

  return (
    <div className="h-full min-h-0 bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
            <CalendarDays className="w-5 h-5 text-white"/>
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">{title}</h1>
            <p className="text-xs text-neutral-400">{data.agendaItems.length} items  {data.goals.length} goals</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {(["agenda","notes","summary"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`pb-0.5 text-sm border-b-2 capitalize transition-colors ${activeTab===tab ? "border-amber-500 text-amber-600 dark:text-amber-400 font-semibold" : "border-transparent text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}>
              {tab}
            </button>
          ))}
          <button
            onClick={() => setShowDocumentation(true)}
            className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            title="Documentation"
          >
            <Info className="h-4 w-4" />
          </button>
          {saving && <div className="flex items-center gap-1.5 text-xs text-neutral-400"><Loader2 className="w-3 h-3 animate-spin"/>Saving...</div>}
          {!saving && notebookId && <div className="text-xs text-emerald-600 dark:text-emerald-400">Saved</div>}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/*  Left: Calendar + Context  */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 p-4 overflow-y-auto border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          {/* Calendar */}
          <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} agendaItems={data.agendaItems}/>

          {/* Context */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Context</h3>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Type</label>
              <input value={data.planType} onChange={e => update({planType:e.target.value})} placeholder="Meeting, Interview..."
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg outline-none text-neutral-800 dark:text-neutral-200"/>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Duration</label>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-neutral-400"/>
                <input value={data.duration} onChange={e => update({duration:e.target.value})} placeholder="e.g. 50 min"
                  className="flex-1 text-sm bg-transparent outline-none text-neutral-800 dark:text-neutral-200"/>
              </div>
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Background</label>
              <textarea value={data.context} onChange={e => update({context:e.target.value})} placeholder="Context, prep notes..."
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg outline-none resize-none" rows={3}/>
            </div>
          </div>

          {/* Goals */}
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Goals</h3>
              <button onClick={() => setAddingGoal(true)} className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-neutral-400 hover:text-amber-500 transition-colors"><Plus className="w-3.5 h-3.5"/></button>
            </div>
            {addingGoal && (
              <div className="mb-3 flex gap-2">
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key==="Enter"&&addGoalFn()} placeholder="Goal..." autoFocus
                  className="flex-1 px-2 py-1.5 text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg outline-none"/>
                <button onClick={addGoalFn} className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium">Add</button>
                <button onClick={() => { setAddingGoal(false); setNewGoal(""); }} className="p-1.5 text-neutral-400 hover:text-neutral-600"><X className="w-3.5 h-3.5"/></button>
              </div>
            )}
            <div className="space-y-1.5">
              {data.goals.length===0&&!addingGoal&&<p className="text-xs text-neutral-400 italic">No goals yet</p>}
              {data.goals.map((g,i) => (
                <div key={g.id} className="flex items-center gap-2 group">
                  <button onClick={() => update({goals:data.goals.map(x=>x.id===g.id?{...x,done:!x.done}:x)})} className="flex-shrink-0">
                    {g.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500"/> : <Circle className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600"/>}
                  </button>
                  <span className={`flex-1 text-xs ${g.done?"line-through text-neutral-400":"text-neutral-700 dark:text-neutral-300"}`}>{i+1}. {g.text}</span>
                  <button onClick={() => update({goals:data.goals.filter(x=>x.id!==g.id)})} className="opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"><X className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*  Right: Main Content  */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab==="agenda" && (
            <>
              {/* Selected day header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{formatDate(selectedDate)}</h2>
                  <p className="text-sm text-neutral-400 mt-0.5">{dayItems.length} item{dayItems.length!==1?"s":""} scheduled{selectedDate===today?"  Today":""}</p>
                </div>
                <button onClick={() => setAddingItem(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
                  <Plus className="w-4 h-4"/> Add Item
                </button>
              </div>

              {/* Add item form */}
              <AnimatePresence>
                {addingItem && (
                  <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                    className="mb-5 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 shadow-sm space-y-3">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">New item for {formatDate(selectedDate)}</p>
                    <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key==="Enter"&&addItem()} placeholder="Item title..." autoFocus
                      className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl outline-none text-neutral-800 dark:text-neutral-200"/>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400 w-10">Start</span>
                        <TimePicker value={newTime} onChange={setNewTime}/>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400 w-10">End</span>
                        <TimePicker value={newEndTime} onChange={setNewEndTime}/>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-neutral-400"/>
                        <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)}
                          className="px-2 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none text-neutral-700 dark:text-neutral-300">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addItem} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium">Add</button>
                      <button onClick={() => { setAddingItem(false); setNewTitle(""); setNewTime(""); setNewEndTime(""); }} className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm text-neutral-500">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Day note */}
              <div className="mb-5 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                <StickyNote className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0"/>
                <textarea value={dayNote?.text??""} onChange={e => {
                  const text = e.target.value;
                  const existing = data.dayNotes.find(n=>n.date===selectedDate);
                  const next = existing ? data.dayNotes.map(n=>n.date===selectedDate?{...n,text}:n) : [...data.dayNotes,{date:selectedDate,text}];
                  update({dayNotes:next});
                }} placeholder="Day note for this date..." rows={2}
                  className="flex-1 text-xs text-neutral-600 dark:text-neutral-400 bg-transparent outline-none resize-none placeholder-amber-300 dark:placeholder-amber-700"/>
              </div>

              {/* Agenda items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {dayItems.length===0&&!addingItem&&(
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-neutral-300 dark:text-neutral-700">
                      <CalendarDays className="w-12 h-12"/>
                      <p className="text-sm font-medium">No items for this day</p>
                      <button onClick={() => setAddingItem(true)} className="text-xs text-amber-500 hover:text-amber-600 font-medium">+ Add an item</button>
                    </div>
                  )}
                  {dayItems.map(item => (
                    <AgendaCard key={item.id} item={item} onUpdate={updateItem} onRemove={() => removeItem(item.id)}/>
                  ))}
                </AnimatePresence>
              </div>

              {/* Upcoming items from other dates */}
              {(() => {
                const upcoming = data.agendaItems.filter(a => a.date > selectedDate && !a.done).slice(0,5);
                if (!upcoming.length) return null;
                return (
                  <div className="mt-8">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3">Upcoming</h3>
                    <div className="space-y-2">
                      {upcoming.map(a => (
                        <button key={a.id} onClick={() => setSelectedDate(a.date)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors text-left group">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[a.priority]}`}/>
                          <span className="text-xs text-neutral-400 font-mono w-10 flex-shrink-0">{a.time||"--:--"}</span>
                          <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 truncate">{a.title}</span>
                          <span className="text-xs text-neutral-400 group-hover:text-amber-500 transition-colors">{formatDate(a.date)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {activeTab==="notes" && (
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">Session Notes</h2>
              <textarea value={data.summaryNotes} onChange={e => update({summaryNotes:e.target.value})}
                placeholder={"Take notes during your session...\n\n- Key observations\n- Important quotes\n- Action items\n- Follow-up questions"}
                className="w-full min-h-[500px] bg-transparent text-neutral-700 dark:text-neutral-300 outline-none resize-none placeholder-neutral-400 text-sm leading-relaxed"/>
            </div>
          )}

          {activeTab==="summary" && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Summary</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label:"Total Items", value: data.agendaItems.length },
                  { label:"Completed", value: data.agendaItems.filter(a=>a.done).length },
                  { label:"Goals Done", value: `${data.goals.filter(g=>g.done).length}/${data.goals.length}` },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
                    <p className="text-2xl font-bold text-amber-500">{s.value}</p>
                    <p className="text-xs text-neutral-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Goals</h3>
                <div className="space-y-2">
                  {data.goals.length===0&&<p className="text-sm text-neutral-400 italic">No goals set</p>}
                  {data.goals.map(g => (
                    <div key={g.id} className="flex items-center gap-2">
                      {g.done?<CheckCircle2 className="w-4 h-4 text-emerald-500"/>:<Circle className="w-4 h-4 text-neutral-300"/>}
                      <span className={`text-sm ${g.done?"line-through text-neutral-400":"text-neutral-700 dark:text-neutral-300"}`}>{g.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">All Agenda Items</h3>
                <div className="space-y-2">
                  {data.agendaItems.length===0&&<p className="text-sm text-neutral-400 italic">No items</p>}
                  {data.agendaItems.map(a => (
                    <div key={a.id} className="flex items-center gap-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[a.priority]}`}/>
                      <span className="text-xs text-neutral-400 font-mono w-20 flex-shrink-0">{a.date}</span>
                      <span className="text-xs text-neutral-400 font-mono w-10 flex-shrink-0">{a.time||"--:--"}</span>
                      <span className={`flex-1 text-sm ${a.done?"line-through text-neutral-400":"text-neutral-700 dark:text-neutral-300"}`}>{a.title}</span>
                      {a.done&&<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"/>}
                    </div>
                  ))}
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
              <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Planner Template Guide</h2>
                    <p className="text-amber-100 text-sm">Organize your day, week, or project</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📅 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    The Planner Template is a comprehensive tool for organizing your schedule, setting goals, and tracking progress. Perfect for daily planning, meeting preparation, project management, or interview prep.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">📆 Interactive Calendar</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Navigate through dates with a visual calendar. Dates with scheduled items are marked for easy identification.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">⏰ Time-Based Agenda</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Schedule items with start/end times, set priorities (high, medium, low), and mark tasks as complete.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🎯 Goal Tracking</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Set goals for your session or project and track completion with checkboxes.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">📝 Notes & Summary</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Take session notes, add day-specific notes, and view comprehensive summaries with statistics.</p>
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
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Context</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Fill in the plan type (e.g., "Meeting", "Interview"), duration, and background information in the left sidebar.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Define Goals</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Add goals you want to achieve. Check them off as you complete them.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Schedule Agenda Items</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click a date on the calendar, then "Add Item" to create scheduled tasks with times, priorities, and details.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Take Notes & Review</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use the "Notes" tab for session notes and "Summary" tab to view progress statistics.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Tabs */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📑 Three Main Tabs</h3>
                  <div className="space-y-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-amber-500" />
                        Agenda Tab
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                        Your main workspace for scheduling and managing daily items:
                      </p>
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-4">
                        <li>• View and manage items for the selected date</li>
                        <li>• Add start/end times and set priority levels</li>
                        <li>• Expand items to add descriptions and notes</li>
                        <li>• Add day-specific notes in the sticky note area</li>
                        <li>• See upcoming items from future dates</li>
                      </ul>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-amber-500" />
                        Notes Tab
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        A free-form text area for session notes, observations, action items, and follow-up questions. Perfect for meeting minutes or interview notes.
                      </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-amber-500" />
                        Summary Tab
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        View statistics and progress: total items, completed items, goal completion rate, and a complete list of all agenda items across all dates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority System */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚦 Priority System</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div>
                        <p className="font-semibold text-red-900 dark:text-red-400 text-sm">High Priority</p>
                        <p className="text-xs text-red-700 dark:text-red-300">Critical tasks that must be completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div>
                        <p className="font-semibold text-amber-900 dark:text-amber-400 text-sm">Medium Priority</p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">Important tasks with some flexibility</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-400 text-sm">Low Priority</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Nice-to-have tasks or optional items</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💼 Common Use Cases</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📋 Meeting Prep</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Set agenda, define goals, take notes</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">💼 Interview Planning</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Prepare questions, track responses</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📅 Daily Planning</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Organize tasks, set priorities, track time</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🎯 Project Milestones</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Track deliverables and deadlines</p>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use time blocks</strong> to allocate specific durations for each task</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Set realistic goals</strong> - 3-5 goals per session is ideal</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Expand agenda items</strong> to add detailed notes and action items</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use day notes</strong> for quick observations specific to each date</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Check the Summary tab</strong> regularly to track your progress</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Mark items complete</strong> as you finish them for satisfaction!</p>
                  </div>
                </div>

                {/* Data Storage */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your planner data is automatically saved to the database.</strong> All agenda items, goals, notes, and context are persisted to the server. Look for the "Saved" indicator in the header to confirm successful storage. Your data syncs across devices automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
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
      <TemplateFooter />
    </div>
  );
}

