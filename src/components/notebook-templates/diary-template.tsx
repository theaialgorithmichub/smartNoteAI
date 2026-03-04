"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Loader2,
  Sun, Cloud, CloudRain, Snowflake, Heart, Smile, Frown, Meh,
  Palette, Image as ImageIcon, Pencil, Trash2, X, Check,
  Eraser, Download, Upload, Info,
} from "lucide-react";

//  Types 

interface DiaryImage { id: string; url: string; caption: string; }

interface DiaryEntry {
  id: string;
  date: string;
  mood: "happy" | "neutral" | "sad";
  weather: "sunny" | "cloudy" | "rainy" | "snowy";
  title: string;
  content: string;
  gratitude: string[];
  images: DiaryImage[];
  drawing: string;
  theme: string;
}

interface DiaryData { entries: DiaryEntry[]; globalTheme: string; }
interface DiaryTemplateProps { title?: string; notebookId?: string; }

//  Themes 

const THEMES: Record<string, {
  label: string; emoji: string;
  bg: string; sidebar: string; card: string; accent: string;
  text: string; subtext: string; border: string; calDot: string;
  calSel: string; headerBg: string; inputBg: string;
}> = {
  default: {
    label: "Classic", emoji: "",
    bg: "bg-amber-50 dark:bg-neutral-950",
    sidebar: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
    card: "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
    accent: "bg-amber-500", calSel: "bg-amber-500 text-white",
    text: "text-neutral-900 dark:text-white", subtext: "text-neutral-500 dark:text-neutral-400",
    border: "border-neutral-200 dark:border-neutral-800",
    calDot: "bg-amber-500", headerBg: "bg-amber-500",
    inputBg: "bg-neutral-50 dark:bg-neutral-800",
  },
  jungle: {
    label: "Jungle", emoji: "",
    bg: "bg-green-50 dark:bg-green-950",
    sidebar: "bg-green-900 border-green-700",
    card: "bg-green-800/80 border-green-700",
    accent: "bg-green-500", calSel: "bg-green-400 text-green-950",
    text: "text-green-50", subtext: "text-green-300",
    border: "border-green-700",
    calDot: "bg-yellow-400", headerBg: "bg-green-800",
    inputBg: "bg-green-900/60",
  },
  ocean: {
    label: "Ocean", emoji: "",
    bg: "bg-sky-50 dark:bg-sky-950",
    sidebar: "bg-sky-900 border-sky-700",
    card: "bg-sky-800/80 border-sky-700",
    accent: "bg-sky-400", calSel: "bg-sky-300 text-sky-950",
    text: "text-sky-50", subtext: "text-sky-300",
    border: "border-sky-700",
    calDot: "bg-cyan-300", headerBg: "bg-sky-800",
    inputBg: "bg-sky-900/60",
  },
  satellite: {
    label: "Satellite", emoji: "",
    bg: "bg-slate-950",
    sidebar: "bg-slate-900 border-slate-700",
    card: "bg-slate-800/80 border-slate-700",
    accent: "bg-indigo-500", calSel: "bg-indigo-400 text-slate-950",
    text: "text-slate-100", subtext: "text-slate-400",
    border: "border-slate-700",
    calDot: "bg-indigo-400", headerBg: "bg-slate-800",
    inputBg: "bg-slate-900/60",
  },
  astronomer: {
    label: "Astronomer", emoji: "",
    bg: "bg-indigo-950",
    sidebar: "bg-indigo-950 border-indigo-800",
    card: "bg-indigo-900/80 border-indigo-800",
    accent: "bg-violet-500", calSel: "bg-violet-400 text-indigo-950",
    text: "text-indigo-50", subtext: "text-indigo-300",
    border: "border-indigo-800",
    calDot: "bg-violet-400", headerBg: "bg-indigo-900",
    inputBg: "bg-indigo-950/60",
  },
  desert: {
    label: "Desert", emoji: "",
    bg: "bg-orange-50 dark:bg-orange-950",
    sidebar: "bg-orange-900 border-orange-700",
    card: "bg-orange-800/80 border-orange-700",
    accent: "bg-orange-400", calSel: "bg-orange-300 text-orange-950",
    text: "text-orange-50", subtext: "text-orange-300",
    border: "border-orange-700",
    calDot: "bg-yellow-300", headerBg: "bg-orange-800",
    inputBg: "bg-orange-900/60",
  },
  arctic: {
    label: "Arctic", emoji: "",
    bg: "bg-blue-50 dark:bg-blue-950",
    sidebar: "bg-blue-900 border-blue-700",
    card: "bg-blue-800/80 border-blue-700",
    accent: "bg-blue-300", calSel: "bg-blue-200 text-blue-950",
    text: "text-blue-50", subtext: "text-blue-300",
    border: "border-blue-700",
    calDot: "bg-cyan-200", headerBg: "bg-blue-800",
    inputBg: "bg-blue-900/60",
  },
  cherry: {
    label: "Cherry Blossom", emoji: "",
    bg: "bg-pink-50 dark:bg-pink-950",
    sidebar: "bg-pink-900 border-pink-700",
    card: "bg-pink-800/80 border-pink-700",
    accent: "bg-pink-400", calSel: "bg-pink-300 text-pink-950",
    text: "text-pink-50", subtext: "text-pink-300",
    border: "border-pink-700",
    calDot: "bg-rose-300", headerBg: "bg-pink-800",
    inputBg: "bg-pink-900/60",
  },
};

const DAYS = ["S","M","T","W","T","F","S"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const todayStr = toDateStr(new Date());

const blankEntry = (date: string, theme: string): DiaryEntry => ({
  id: Date.now().toString(), date, mood: "neutral", weather: "sunny",
  title: "", content: "", gratitude: [], images: [], drawing: "", theme,
});

function DrawingCanvas({ value, onChange, theme, date }: { value: string; onChange: (v: string) => void; theme: typeof THEMES[string]; date: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [tool, setTool] = useState<"pen"|"eraser">("pen");
  const [color, setColor] = useState("#1e293b");
  const [size, setSize] = useState(3);
  const [loaded, setLoaded] = useState(false);

  // Reset loaded whenever the date changes so the canvas reloads the correct drawing
  useEffect(() => {
    setLoaded(false);
  }, [date]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    if (loaded) return;
    if (value) {
      const img = new window.Image();
      img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); setLoaded(true); };
      img.src = value;
    } else {
      ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,canvas.width,canvas.height); setLoaded(true);
    }
  }, [value, loaded]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    drawing.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineWidth = tool === "eraser" ? size * 5 : size;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  };

  const stopDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current; if (!canvas) return;
    onChange(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,canvas.width,canvas.height);
    onChange("");
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/png"); a.download = "diary-drawing.png"; a.click();
  };

  const COLORS = ["#1e293b","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#ffffff"];

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          <button onClick={() => setTool("pen")} className={`p-2 rounded-lg transition-colors ${tool==="pen" ? "bg-blue-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}><Pencil className="w-3.5 h-3.5"/></button>
          <button onClick={() => setTool("eraser")} className={`p-2 rounded-lg transition-colors ${tool==="eraser" ? "bg-neutral-700 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"}`}><Eraser className="w-3.5 h-3.5"/></button>
        </div>
        <div className="flex gap-1">
          {COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
              className={`w-5 h-5 rounded-full border-2 transition-all ${color===c&&tool==="pen" ? "border-blue-500 scale-125" : "border-transparent"}`}
              style={{ backgroundColor: c }}/>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Size</span>
          <input type="range" min={1} max={20} value={size} onChange={e => setSize(Number(e.target.value))} className="w-20 accent-blue-500"/>
        </div>
        <div className="flex gap-1 ml-auto">
          <button onClick={downloadCanvas} className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-blue-500 transition-colors" title="Download"><Download className="w-3.5 h-3.5"/></button>
          <button onClick={clearCanvas} className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-500 transition-colors" title="Clear"><Trash2 className="w-3.5 h-3.5"/></button>
        </div>
      </div>
      {/* Canvas */}
      <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 cursor-crosshair">
        <canvas ref={canvasRef} width={800} height={400}
          className="w-full touch-none"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}/>
      </div>
    </div>
  );
}

export function DiaryTemplate({ title = "My Diary", notebookId }: DiaryTemplateProps) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [globalTheme, setGlobalTheme] = useState("default");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"write"|"images"|"draw">("write");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; date: string | null }>({ show: false, date: null });

  const pageIdRef = useRef<string | null>(null);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const entriesRef = useRef<DiaryEntry[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = THEMES[globalTheme] ?? THEMES.default;

  //  Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__diary_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const data: DiaryData = JSON.parse(existing.content || "{}");
            setEntries(data.entries || []);
            entriesRef.current = data.entries || [];
            setGlobalTheme(data.globalTheme || "default");
          } catch {}
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__diary_template__", content: JSON.stringify({ entries: [], globalTheme: "default" }) }),
          });
          const created = await cr.json();
          pageIdRef.current = created.page?._id ?? null;
        }
      } catch (err) { console.error("Load failed:", err); }
      finally { setLoading(false); }
    })();
  }, [notebookId]);

  // Refs to always hold latest values — avoids stale closures entirely
  const globalThemeRef = useRef(globalTheme);
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => { globalThemeRef.current = globalTheme; }, [globalTheme]);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);

  // saveVersion bump triggers the debounced DB write
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  useEffect(() => {
    if (saveVersion === 0 || !notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(async () => {
      const pid = pageIdRef.current; if (!pid) return;
      setSaving(true);
      try {
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "__diary_template__",
            content: JSON.stringify({ entries: entriesRef.current, globalTheme: globalThemeRef.current }),
          }),
        });
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1200);
  }, [saveVersion, notebookId]);

  // setAndSave: sync state + ref, then trigger save
  const setAndSave = useCallback((list: DiaryEntry[]) => {
    setEntries(list);
    entriesRef.current = list;
    bumpSave();
  }, [bumpSave]);

  //  Entry helpers 
  const currentEntry = entries.find(e => e.date === selectedDate) ?? null;

  // upsert reads from refs — never stale
  const upsert = useCallback((updates: Partial<DiaryEntry>) => {
    const list = entriesRef.current;
    const date = selectedDateRef.current;
    const theme = globalThemeRef.current;
    const existing = list.find(e => e.date === date);
    let next: DiaryEntry[];
    if (existing) {
      next = list.map(e => e.date === date ? { ...e, ...updates } : e);
    } else {
      next = [...list, { ...blankEntry(date, theme), ...updates }];
    }
    setAndSave(next);
  }, [setAndSave]);

  //  Image upload 
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "diary");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        const img: DiaryImage = { id: Date.now().toString(), url: data.url, caption: "" };
        const current = entriesRef.current.find(e => e.date === selectedDate);
        upsert({ images: [...(current?.images || []), img] });
      }
    } catch (err) { console.error("Upload failed:", err); }
    finally { setUploadingImage(false); }
  };

  const updateImageCaption = (imgId: string, caption: string) => {
    const current = entriesRef.current.find(e => e.date === selectedDate);
    if (!current) return;
    upsert({ images: current.images.map(img => img.id === imgId ? { ...img, caption } : img) });
  };

  const removeImage = (imgId: string) => {
    const current = entriesRef.current.find(e => e.date === selectedDate);
    if (!current) return;
    upsert({ images: current.images.filter(img => img.id !== imgId) });
  };

  const deleteDiaryEntry = (date: string) => {
    setDeleteConfirm({ show: true, date });
  };

  const confirmDelete = () => {
    if (deleteConfirm.date) {
      const updated = entriesRef.current.filter(e => e.date !== deleteConfirm.date);
      setEntries(updated);
      entriesRef.current = updated;
      bumpSave();
      // If we deleted the current entry, go to today
      if (deleteConfirm.date === selectedDate) {
        setSelectedDate(todayStr);
      }
    }
    setDeleteConfirm({ show: false, date: null });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, date: null });
  };

  //  Calendar helpers 
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDisplayDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const hasEntry = (date: Date) => entries.some(e => e.date === toDateStr(date));

  const moodConfig = {
    happy: { icon: <Smile className="w-5 h-5"/>, label: "Happy", active: "bg-green-500 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400" },
    neutral: { icon: <Meh className="w-5 h-5"/>, label: "Okay", active: "bg-yellow-500 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400" },
    sad: { icon: <Frown className="w-5 h-5"/>, label: "Sad", active: "bg-red-500 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-400" },
  };
  const weatherConfig = {
    sunny: { icon: <Sun className="w-5 h-5"/>, active: "bg-yellow-500 text-white" },
    cloudy: { icon: <Cloud className="w-5 h-5"/>, active: "bg-slate-400 text-white" },
    rainy: { icon: <CloudRain className="w-5 h-5"/>, active: "bg-blue-500 text-white" },
    snowy: { icon: <Snowflake className="w-5 h-5"/>, active: "bg-cyan-400 text-white" },
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <TemplateHeader title={title} />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500"/>
      </div>
      <TemplateFooter />
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col ${t.bg}`}>
      <TemplateHeader title={title} />
      <div className="flex-1 flex overflow-hidden">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ""; }}/>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500"/> Saving...
        </div>
      )}

      {/*  Sidebar  */}
      <div className={`w-72 flex-shrink-0 border-r flex flex-col overflow-hidden ${t.sidebar}`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b ${t.border} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{t.emoji}</span>
              <h2 className={`text-base font-bold ${t.text}`}>{title}</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowDocumentation(true)}
                className={`p-2 rounded-xl transition-colors hover:bg-white/10 ${t.subtext}`}
                title="Documentation">
                <Info className="w-4 h-4"/>
              </button>
              <button onClick={() => setShowThemePicker(v => !v)}
                className={`p-2 rounded-xl transition-colors ${showThemePicker ? "bg-white/20" : "hover:bg-white/10"} ${t.subtext}`}
                title="Change theme">
                <Palette className="w-4 h-4"/>
              </button>
            </div>
          </div>

          {/* Theme picker */}
          <AnimatePresence>
            {showThemePicker && (
              <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.15}}
                className="overflow-hidden mt-3">
                <p className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${t.subtext}`}>Theme</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.entries(THEMES).map(([key, th]) => (
                    <button key={key} onClick={() => { setGlobalTheme(key); globalThemeRef.current = key; bumpSave(); setShowThemePicker(false); }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${globalTheme===key ? "bg-white/20 ring-2 ring-white/40" : "hover:bg-white/10"}`}>
                      <span className="text-lg">{th.emoji}</span>
                      <span className={`text-[9px] font-medium ${t.subtext} truncate w-full text-center`}>{th.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Month nav */}
        <div className={`px-4 py-3 border-b ${t.border} flex-shrink-0`}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1))}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${t.subtext}`}><ChevronLeft className="w-4 h-4"/></button>
            <span className={`text-sm font-semibold ${t.text}`}>{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1))}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${t.subtext}`}><ChevronRight className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {DAYS.map((d,i) => <div key={i} className={`text-center text-[10px] font-medium py-1 ${t.subtext}`}>{d}</div>)}
            {getDaysInMonth(currentMonth).map((date, i) => {
              if (!date) return <div key={i}/>;
              const ds = toDateStr(date);
              const isSel = ds === selectedDate;
              const isToday = ds === todayStr;
              const hasE = hasEntry(date);
              return (
                <button key={i} onClick={() => setSelectedDate(ds)}
                  className={`aspect-square rounded-lg text-xs flex items-center justify-center relative transition-all font-medium
                    ${isSel ? t.calSel : isToday ? "ring-2 ring-white/40 " + t.subtext : "hover:bg-white/10 " + t.subtext}`}>
                  {date.getDate()}
                  {hasE && !isSel && <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${t.calDot}`}/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent entries */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          <p className={`text-[10px] font-bold uppercase tracking-wide mb-2 px-1 ${t.subtext}`}>Recent Entries</p>
          {entries.length === 0 && <p className={`text-xs italic px-1 ${t.subtext}`}>No entries yet</p>}
          {[...entries].sort((a,b) => b.date.localeCompare(a.date)).slice(0,10).map(entry => (
            <button key={entry.id} onClick={() => setSelectedDate(entry.date)}
              className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all ${entry.date===selectedDate ? "bg-white/20" : "hover:bg-white/10"}`}>
              <p className={`text-xs font-semibold truncate ${t.text}`}>{entry.title || "Untitled Entry"}</p>
              <p className={`text-[10px] ${t.subtext}`}>{formatDisplayDate(entry.date)}</p>
              {entry.images.length > 0 && <p className={`text-[10px] ${t.subtext}`}> {entry.images.length} image{entry.images.length>1?"s":""}</p>}
            </button>
          ))}
        </div>
      </div>

      {/*  Main Content  */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8">

          {/* Date header */}
          <div className={`mb-6 pb-4 border-b ${t.border}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${t.subtext}`}>
                  {t.emoji} {t.label} Diary
                </p>
                <h1 className={`text-2xl font-bold ${t.text}`}>{formatDisplayDate(selectedDate)}</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(toDateStr(d)); setCurrentMonth(new Date(d.getFullYear(), d.getMonth())); }}
                  className={`p-2 rounded-xl hover:bg-white/10 ${t.subtext}`}><ChevronLeft className="w-4 h-4"/></button>
                <button onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 ${t.subtext}`}>Today</button>
                <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(toDateStr(d)); setCurrentMonth(new Date(d.getFullYear(), d.getMonth())); }}
                  className={`p-2 rounded-xl hover:bg-white/10 ${t.subtext}`}><ChevronRight className="w-4 h-4"/></button>
                {hasEntry(new Date(selectedDate)) && (
                  <button onClick={() => deleteDiaryEntry(selectedDate)}
                    className={`p-2 rounded-xl hover:bg-red-500/20 ${t.subtext} hover:text-red-500 transition-colors`}
                    title="Delete this entry">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mood + Weather */}
          <div className={`flex gap-6 mb-6 p-4 rounded-2xl border ${t.card}`}>
            <div>
              <p className={`text-xs font-semibold mb-2 ${t.subtext}`}>How are you feeling?</p>
              <div className="flex gap-2">
                {(Object.keys(moodConfig) as DiaryEntry["mood"][]).map(mood => (
                  <button key={mood} onClick={() => upsert({ mood })}
                    className={`p-2.5 rounded-xl transition-all ${currentEntry?.mood===mood ? moodConfig[mood].active : moodConfig[mood].inactive}`}>
                    {moodConfig[mood].icon}
                  </button>
                ))}
              </div>
            </div>
            <div className={`w-px ${t.border} bg-current opacity-20`}/>
            <div>
              <p className={`text-xs font-semibold mb-2 ${t.subtext}`}>Weather</p>
              <div className="flex gap-2">
                {(Object.keys(weatherConfig) as DiaryEntry["weather"][]).map(w => (
                  <button key={w} onClick={() => upsert({ weather: w })}
                    className={`p-2.5 rounded-xl transition-all ${currentEntry?.weather===w ? weatherConfig[w].active : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"}`}>
                    {weatherConfig[w].icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <input type="text" value={currentEntry?.title || ""} onChange={e => upsert({ title: e.target.value })}
            placeholder="Give this day a title..."
            className={`w-full text-2xl font-bold bg-transparent outline-none mb-6 placeholder-neutral-300 dark:placeholder-neutral-600 ${t.text}`}/>

          {/* Tabs */}
          <div className={`flex gap-1 p-1 rounded-xl mb-6 ${t.inputBg}`}>
            {([["write"," Write"],["images"," Images"],["draw"," Draw"]] as const).map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab===tab ? "bg-white dark:bg-neutral-700 shadow-sm " + t.text : t.subtext}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Write tab */}
          {activeTab === "write" && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-6 border ${t.card}`}>
                <textarea value={currentEntry?.content || ""} onChange={e => upsert({ content: e.target.value })}
                  placeholder={"Dear Diary...\n\nWrite about your day, your thoughts, feelings, and experiences..."}
                  className={`w-full min-h-[320px] bg-transparent outline-none resize-none leading-relaxed text-sm ${t.text} placeholder-neutral-400`}/>
              </div>

              {/* Gratitude */}
              <div className={`rounded-2xl p-5 border ${t.card}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold flex items-center gap-2 ${t.text}`}>
                    <Heart className="w-4 h-4 text-pink-400"/> Gratitude
                  </h3>
                  <button onClick={() => upsert({ gratitude: [...(currentEntry?.gratitude||[]), ""] })}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-pink-400"><Plus className="w-4 h-4"/></button>
                </div>
                <p className={`text-xs mb-3 ${t.subtext}`}>What are you grateful for today?</p>
                <div className="space-y-2">
                  {(currentEntry?.gratitude || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 group">
                      <span className="text-pink-400 text-sm"></span>
                      <input value={item} onChange={e => {
                        const g = [...(currentEntry?.gratitude||[])]; g[idx]=e.target.value; upsert({ gratitude: g });
                      }} placeholder="I am grateful for..."
                        className={`flex-1 px-3 py-1.5 rounded-lg text-sm outline-none ${t.inputBg} ${t.text}`}/>
                      <button onClick={() => upsert({ gratitude: (currentEntry?.gratitude||[]).filter((_,i)=>i!==idx) })}
                        className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-400 transition-opacity"><X className="w-3.5 h-3.5"/></button>
                    </div>
                  ))}
                  {(!currentEntry?.gratitude || currentEntry.gratitude.length===0) && (
                    <p className={`text-xs italic ${t.subtext}`}>Click + to add things you are grateful for</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Images tab */}
          {activeTab === "images" && (
            <div className="space-y-4">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}
                className={`w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all ${t.border} hover:bg-white/5`}>
                {uploadingImage ? <Loader2 className={`w-8 h-8 animate-spin ${t.subtext}`}/> : <Upload className={`w-8 h-8 ${t.subtext}`}/>}
                <p className={`text-sm font-medium ${t.subtext}`}>{uploadingImage ? "Uploading..." : "Click to upload an image"}</p>
                <p className={`text-xs ${t.subtext}`}>PNG, JPG, GIF up to 10MB</p>
              </button>

              {(currentEntry?.images || []).length === 0 && !uploadingImage && (
                <div className={`text-center py-6 ${t.subtext}`}>
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40"/>
                  <p className="text-sm">No images yet for this day</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {(currentEntry?.images || []).map(img => (
                  <div key={img.id} className={`rounded-2xl overflow-hidden border ${t.card} group`}>
                    <div className="relative">
                      <img src={img.url} alt={img.caption || "Diary image"} className="w-full h-48 object-cover"/>
                      <button onClick={() => removeImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                    <div className="p-3">
                      <input value={img.caption} onChange={e => updateImageCaption(img.id, e.target.value)}
                        placeholder="Add a caption..."
                        className={`w-full text-xs bg-transparent outline-none ${t.text} placeholder-neutral-400`}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Draw tab */}
          {activeTab === "draw" && (
            <div className={`rounded-2xl p-5 border ${t.card}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${t.text}`}> Drawing Canvas</h3>
                <p className={`text-xs ${t.subtext}`}>Draw, sketch, or doodle anything</p>
              </div>
              <DrawingCanvas
                value={currentEntry?.drawing || ""}
                onChange={v => upsert({ drawing: v })}
                theme={t}
                date={selectedDate}
              />
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
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Classic Diary Guide</h2>
                    <p className="text-amber-100 text-sm">Your personal digital journal</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📖 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Classic Diary is a beautiful digital journal template that helps you capture your daily thoughts, feelings, and memories. With mood tracking, weather logging, gratitude journaling, image uploads, and a drawing canvas, it's your complete personal diary solution.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-400 mb-1">📅 Interactive Calendar</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Navigate through months and dates with an intuitive calendar. Dates with entries are marked with dots for easy identification.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">😊 Mood & Weather Tracking</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Track your daily mood (happy, neutral, sad) and weather conditions (sunny, cloudy, rainy, snowy) with one click.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">✍️ Rich Writing Experience</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Write freely with a clean, distraction-free editor. Add titles and detailed entries for each day.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">❤️ Gratitude Journal</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">List things you're grateful for each day. Studies show gratitude journaling improves mental well-being.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">🖼️ Image Uploads</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Upload photos from your day. Add captions to remember the context of each image.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🎨 Drawing Canvas</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Sketch, doodle, or draw with a full-featured canvas. Choose colors, adjust brush size, and save your artwork.</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-400 mb-1">🎨 8 Beautiful Themes</h4>
                      <p className="text-sm text-orange-800 dark:text-orange-300">Choose from Classic, Jungle, Ocean, Satellite, Astronomer, Desert, Arctic, and Cherry Blossom themes.</p>
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
                        <p className="font-semibold text-neutral-900 dark:text-white">Select a Date</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click on any date in the calendar or use the navigation arrows. Click "Today" to jump to the current date.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Set Mood & Weather</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click the emoji that represents your mood and the icon that matches the weather for that day.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Write Your Entry</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Give your day a title and write about your experiences, thoughts, and feelings in the "Write" tab.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Gratitude</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click the + button in the Gratitude section to add things you're thankful for.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Upload Images</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch to the "Images" tab and click to upload photos. Add captions to describe each image.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Draw & Sketch</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use the "Draw" tab to create sketches. Choose colors, adjust brush size, and use the eraser tool.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Tabs */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">📑 Three Content Tabs</h3>
                  <div className="space-y-3">
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-amber-500" />
                        Write Tab
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Your main writing space with a free-form text editor and gratitude journal section. Perfect for daily reflections and thoughts.
                      </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        Images Tab
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Upload and organize photos from your day. Add captions to each image to preserve memories and context.
                      </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4 text-amber-500" />
                        Draw Tab
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Express yourself visually with a drawing canvas. Choose from 9 colors, adjust brush size, and download your artwork.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Themes */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎨 Available Themes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-amber-500"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Classic (Default)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-green-600"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Jungle</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-sky-600"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Ocean</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-slate-700"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Satellite</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-indigo-700"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Astronomer</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-orange-600"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Desert</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-blue-600"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Arctic</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="w-4 h-4 rounded bg-pink-600"></div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Cherry Blossom</span>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Write consistently</strong> - Even a few sentences daily builds a valuable record</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use gratitude journaling</strong> - Listing 3-5 things you're grateful for boosts happiness</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Add photos</strong> - Visual memories help you recall details years later</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track mood patterns</strong> - Review past entries to identify what makes you happy</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Change themes</strong> - Match your diary's look to your mood or season</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use the drawing canvas</strong> - Sometimes a sketch expresses more than words</p>
                  </div>
                </div>

                {/* Data Storage */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your diary entries are automatically saved to the database.</strong> All entries, moods, weather, gratitude lists, images, and drawings are persisted to the server. Look for the "Saving..." indicator to confirm storage. Your diary syncs across devices automatically.
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Delete Diary Entry?</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Are you sure you want to delete this diary entry from {deleteConfirm.date ? formatDisplayDate(deleteConfirm.date) : ''}? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
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

