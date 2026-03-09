"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Plus, X, Loader2, Pin, PenLine,
  StickyNote, Wand2, Languages, FileText, Check,
  Copy, Trash2, Clock, ChevronDown, Info,
} from "lucide-react";
import { FuturisticCalendar } from "@/components/ui/futuristic-calendar";
import { TemplateFooter } from './template-footer';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PinnedNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Meeting {
  id: string;
  name: string;
  time: string;
  startTime: string;
  endTime: string;
  scratchPad: string;
  writtenNotes: string;
  pinnedNotes: PinnedNote[];
}

interface DayData {
  date: string;
  meetings: Meeting[];
}

interface MeetingNotesTemplateProps {
  title: string;
  notebookId?: string;
  participants?: { name: string; avatar: string }[];
}

type ActiveTab = "written" | "scratch" | "pinned";

// ── Constants ─────────────────────────────────────────────────────────────────

const MEETING_PRESETS = [
  "Stand-up", "Sprint Planning", "Retrospective", "1:1",
  "Design Review", "Product Review", "All Hands", "Client Call",
  "Interview", "Brainstorm", "Strategy Session", "Budget Review",
  "Team Sync", "Demo",
];

const LANGUAGES = [
  // Indian languages
  "Hindi", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Odia", "Punjabi",
  "Assamese", "Maithili", "Sanskrit", "Urdu", "Konkani",
  "Manipuri (Meitei)", "Bodo", "Dogri", "Kashmiri", "Sindhi",
  "Santali", "Nepali (India)",
  // International languages
  "Spanish", "French", "German", "Italian", "Portuguese",
  "Chinese (Simplified)", "Chinese (Traditional)", "Japanese", "Korean",
  "Arabic", "Russian", "Dutch", "Swedish", "Polish",
  "Turkish", "Vietnamese", "Thai", "Indonesian", "Greek",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: Date) => d.toISOString().split("T")[0];
const nowTime = () => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const makeMeeting = (name: string, startTime: string = "", endTime: string = ""): Meeting => ({
  id: Date.now().toString(),
  name,
  time: nowTime(),
  startTime: startTime || nowTime(),
  endTime: endTime || "",
  scratchPad: "",
  writtenNotes: "",
  pinnedNotes: [],
});

// ── AI Panel (defined first so MeetingNotesTemplate can reference it) ─────────

function AIPanel({ meeting, notebookId }: { meeting: Meeting; notebookId?: string }) {
  const [aiMode, setAiMode] = useState<"summarize" | "translate">("summarize");
  const [targetLang, setTargetLang] = useState("Spanish");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const allContent = [
    meeting.scratchPad,
    meeting.writtenNotes,
    ...meeting.pinnedNotes.map((n) => `${n.title}: ${n.content}`),
  ].filter(Boolean).join("\n\n");

  const run = async () => {
    if (!allContent.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notebookId,
          mode: "chat",
          message:
            aiMode === "summarize"
              ? `Summarize the following meeting notes. Include: key discussion points, decisions made, and action items.\n\n${allContent}`
              : `Translate the following meeting notes to ${targetLang}. Preserve the structure and formatting.\n\n${allContent}`,
          context: [],
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        setResult(`Error: ${errorData.error || "Failed to process request"}`);
        return;
      }
      
      const data = await res.json();
      console.log("API Response:", data);
      
      if (data.response) {
        setResult(data.response);
      } else if (data.error) {
        setResult(`Error: ${data.error}`);
      } else {
        setResult("No result returned from AI. Please try again.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      setResult(`Something went wrong: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => { setAiMode("summarize"); setResult(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            aiMode === "summarize"
              ? "bg-emerald-500/10 text-emerald-300 border-b-2 border-emerald-500"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Summarize
        </button>
        <button
          onClick={() => { setAiMode("translate"); setResult(""); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            aiMode === "translate"
              ? "bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-500"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Languages className="w-4 h-4" /> Translate
        </button>
      </div>
      <div className="p-4 space-y-3">
        {aiMode === "translate" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 flex-shrink-0">Translate to:</span>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-cyan-500"
            >
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        )}
        <button
          onClick={run}
          disabled={loading || !allContent.trim()}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg ${
            aiMode === "summarize"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
              : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-cyan-500/20"
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {loading ? "Processing…" : aiMode === "summarize" ? "Summarize Meeting" : `Translate to ${targetLang}`}
        </button>
        {!allContent.trim() && (
          <p className="text-xs text-neutral-500 text-center italic">Add notes to this meeting first</p>
        )}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative rounded-xl bg-neutral-950/70 border border-neutral-800 p-3"
            >
              <button onClick={copy} className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
              </button>
              <p className="text-xs text-neutral-300 whitespace-pre-wrap pr-7 leading-relaxed max-h-64 overflow-y-auto">{result}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function MeetingNotesTemplate({ title, notebookId, participants = [] }: MeetingNotesTemplateProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayData, setDayData] = useState<Record<string, DayData>>({});
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("written");
  const [showDropdown, setShowDropdown] = useState(false);
  const [customName, setCustomName] = useState("");
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [pinTitle, setPinTitle] = useState("");
  const [pinContent, setPinContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [editingMeetingTime, setEditingMeetingTime] = useState(false);
  const [tempStartTime, setTempStartTime] = useState("");
  const [tempEndTime, setTempEndTime] = useState("");
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateKey = fmtDate(selectedDate);
  const todayMeetings: Meeting[] = dayData[dateKey]?.meetings || [];
  const activeMeeting = todayMeetings.find((m) => m.id === activeMeetingId) ?? todayMeetings[0] ?? null;

  // Persistence
  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`mtg-v2-${notebookId}`);
      if (saved) setDayData(JSON.parse(saved));
    } catch {}
  }, [notebookId]);

  useEffect(() => {
    if (!notebookId) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      setSaving(true);
      try { localStorage.setItem(`mtg-v2-${notebookId}`, JSON.stringify(dayData)); } catch {}
      finally { setSaving(false); }
    }, 800);
  }, [dayData, notebookId]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Sync activeMeetingId when date changes
  useEffect(() => {
    const meetings = dayData[fmtDate(selectedDate)]?.meetings || [];
    setActiveMeetingId(meetings[0]?.id ?? null);
  }, [selectedDate]);

  // Mutations
  const updateDay = (meetings: Meeting[]) =>
    setDayData((prev) => ({ ...prev, [dateKey]: { date: dateKey, meetings } }));

  const addMeeting = (name: string, startTime?: string, endTime?: string) => {
    const m = makeMeeting(name, startTime, endTime);
    updateDay([...todayMeetings, m]);
    setActiveMeetingId(m.id);
    setShowDropdown(false);
    setCustomName("");
  };

  const updateMeetingTimes = () => {
    if (!activeMeeting) return;
    patchMeeting(activeMeeting.id, { startTime: tempStartTime, endTime: tempEndTime });
    setEditingMeetingTime(false);
  };

  const startEditingTime = () => {
    if (!activeMeeting) return;
    setTempStartTime(activeMeeting.startTime);
    setTempEndTime(activeMeeting.endTime);
    setEditingMeetingTime(true);
  };

  const deleteMeeting = (id: string) => {
    const updated = todayMeetings.filter((m) => m.id !== id);
    updateDay(updated);
    if (activeMeetingId === id) setActiveMeetingId(updated[0]?.id ?? null);
  };

  const patchMeeting = (id: string, patch: Partial<Meeting>) =>
    updateDay(todayMeetings.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const addPin = () => {
    if (!pinTitle.trim() || !activeMeeting) return;
    const pin: PinnedNote = { id: Date.now().toString(), title: pinTitle, content: pinContent, createdAt: nowTime() };
    patchMeeting(activeMeeting.id, { pinnedNotes: [...activeMeeting.pinnedNotes, pin] });
    setPinTitle(""); setPinContent(""); setIsAddingPin(false);
  };

  const removePin = (pinId: string) => {
    if (!activeMeeting) return;
    patchMeeting(activeMeeting.id, { pinnedNotes: activeMeeting.pinnedNotes.filter((p) => p.id !== pinId) });
  };

  const getDatesWithNotes = () =>
    Object.keys(dayData).filter((d) => (dayData[d]?.meetings?.length ?? 0) > 0);

  return (
    <div className="h-full min-h-0 flex flex-col bg-neutral-950 text-neutral-100">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative">
      <div className="pointer-events-none fixed top-0 left-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl -z-0" />
      <div className="pointer-events-none fixed top-40 right-0 h-64 w-64 rounded-full bg-cyan-500/8 blur-3xl -z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 space-y-5">

        {/* ── Header ── */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-300/60">Meeting Notebook</span>
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors"
                title="Know More"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-white mt-1">{title}</h1>
            <p className="text-sm text-emerald-200/60 mt-0.5">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Calendar */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm text-emerald-100 hover:bg-emerald-500/20 transition">
                <CalendarDays className="w-4 h-4" /> Calendar
              </button>
              <div className="absolute right-0 top-full mt-3 w-[300px] z-50 opacity-0 pointer-events-none translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                <FuturisticCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} datesWithNotes={getDatesWithNotes()} size="md" className="w-full" />
              </div>
            </div>

            {/* New Meeting dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> New Meeting <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 max-h-60 overflow-y-auto space-y-0.5">
                      {MEETING_PRESETS.map((name) => (
                        <button
                          key={name}
                          onClick={() => addMeeting(name)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-neutral-200 hover:bg-emerald-500/15 hover:text-emerald-200 transition-colors"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-neutral-800 p-2">
                      <div className="flex gap-1">
                        <input
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && customName.trim() && addMeeting(customName.trim())}
                          placeholder="Custom name…"
                          className="flex-1 px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-200 outline-none focus:border-emerald-500 placeholder-neutral-500"
                        />
                        <button
                          onClick={() => customName.trim() && addMeeting(customName.trim())}
                          className="px-2 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {saving && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-xs text-neutral-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
              </div>
            )}
          </div>
        </header>

        {/* ── Meeting Tabs ── */}
        {todayMeetings.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {todayMeetings.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMeetingId(m.id)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeMeeting?.id === m.id
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600"
                }`}
              >
                <Clock className="w-3.5 h-3.5 opacity-60" />
                {m.name}
                <span className="text-xs opacity-50">{m.time}</span>
                <span
                  onClick={(e) => { e.stopPropagation(); deleteMeeting(m.id); }}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <CalendarDays className="w-8 h-8 text-emerald-400/60" />
            </div>
            <p className="text-neutral-400 text-sm">No meetings for this day</p>
            <p className="text-neutral-600 text-xs mt-1">Click <span className="text-emerald-400">New Meeting</span> to get started</p>
          </div>
        )}

        {/* ── Active Meeting Content ── */}
        {activeMeeting && (
          <div className="grid lg:grid-cols-[1fr_360px] gap-5">

            {/* Left: Notes area */}
            <div className="space-y-4">
              {/* Meeting name + time badge */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-200">{activeMeeting.name}</span>
                  <span className="text-xs text-emerald-400/60">Created: {activeMeeting.time}</span>
                </div>
                {!editingMeetingTime ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-xs text-cyan-400">Start:</span>
                      <span className="text-sm font-medium text-cyan-200">{activeMeeting.startTime || "Not set"}</span>
                      {activeMeeting.endTime && (
                        <>
                          <span className="text-xs text-cyan-400/60">→</span>
                          <span className="text-xs text-cyan-400">End:</span>
                          <span className="text-sm font-medium text-cyan-200">{activeMeeting.endTime}</span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={startEditingTime}
                      className="px-2 py-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700">
                    <input
                      type="time"
                      value={tempStartTime}
                      onChange={(e) => setTempStartTime(e.target.value)}
                      className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-neutral-500">to</span>
                    <input
                      type="time"
                      value={tempEndTime}
                      onChange={(e) => setTempEndTime(e.target.value)}
                      className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-xs text-neutral-200 outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={updateMeetingTimes}
                      className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 rounded text-white text-xs transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMeetingTime(false)}
                      className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300 text-xs transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Tab bar */}
              <div className="flex gap-1 bg-neutral-900 border border-neutral-800 rounded-xl p-1 w-fit">
                {([
                  { id: "written", icon: PenLine, label: "Written Notes" },
                  { id: "scratch", icon: StickyNote, label: "Scratch Pad" },
                  { id: "pinned",  icon: Pin,       label: "Pinned Notes" },
                ] as { id: ActiveTab; icon: any; label: string }[]).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === id
                        ? "bg-emerald-500/15 text-emerald-200 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {activeTab === "written" && (
                  <motion.div key="written" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 shadow-[0_0_40px_rgba(14,116,144,0.08)]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <PenLine className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-base font-semibold text-white">Written Notes</h3>
                    </div>
                    <textarea
                      value={activeMeeting.writtenNotes}
                      onChange={(e) => patchMeeting(activeMeeting.id, { writtenNotes: e.target.value })}
                      placeholder={`Meeting notes for ${activeMeeting.name}…\n\n## Overview\n\n## Key Decisions\n\n## Action Items\n- \n\n## Follow-ups\n`}
                      className="w-full min-h-[420px] bg-transparent border-none outline-none resize-none text-neutral-200 leading-relaxed placeholder-neutral-600 text-sm font-mono"
                    />
                  </motion.div>
                )}

                {activeTab === "scratch" && (
                  <motion.div key="scratch" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl border border-emerald-500/20 bg-neutral-900/60 p-6 shadow-[0_0_30px_rgba(16,185,129,0.08)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-amber-400" />
                        <h3 className="text-base font-semibold text-white">Scratch Pad</h3>
                      </div>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="w-2 h-2 rounded-full bg-neutral-700" />
                        <span className="w-2 h-2 rounded-full bg-neutral-700" />
                      </div>
                    </div>
                    <textarea
                      value={activeMeeting.scratchPad}
                      onChange={(e) => patchMeeting(activeMeeting.id, { scratchPad: e.target.value })}
                      placeholder="Quick ideas, reminders, raw thoughts…"
                      className="w-full min-h-[420px] bg-transparent border-none outline-none resize-none text-neutral-200 leading-relaxed placeholder-neutral-600 text-sm"
                    />
                  </motion.div>
                )}

                {activeTab === "pinned" && (
                  <motion.div key="pinned" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Pin className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-base font-semibold text-white">Pinned Notes</h3>
                      </div>
                      <button
                        onClick={() => setIsAddingPin(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-emerald-500 text-emerald-300 hover:text-emerald-200 text-xs font-medium transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Note
                      </button>
                    </div>

                    {isAddingPin && (
                      <div className="mb-5 p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                        <input
                          value={pinTitle}
                          onChange={(e) => setPinTitle(e.target.value)}
                          placeholder="Note title…"
                          className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-sm text-neutral-200 outline-none focus:border-emerald-500 placeholder-neutral-500"
                        />
                        <textarea
                          value={pinContent}
                          onChange={(e) => setPinContent(e.target.value)}
                          placeholder="Note content…"
                          className="w-full px-3 py-2 bg-neutral-900 rounded-lg border border-neutral-700 text-sm text-neutral-200 outline-none focus:border-emerald-500 placeholder-neutral-500 resize-none h-20"
                        />
                        <div className="flex gap-2">
                          <button onClick={addPin} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition">Pin Note</button>
                          <button onClick={() => { setIsAddingPin(false); setPinTitle(""); setPinContent(""); }} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition">Cancel</button>
                        </div>
                      </div>
                    )}

                    {activeMeeting.pinnedNotes.length === 0 && !isAddingPin ? (
                      <p className="text-sm text-neutral-600 italic text-center py-8">No pinned notes yet — click Add Note</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {activeMeeting.pinnedNotes.map((pin) => (
                          <motion.div
                            key={pin.id}
                            whileHover={{ y: -2 }}
                            className="relative group bg-neutral-950/60 rounded-xl p-4 border border-neutral-800 hover:border-neutral-700 transition-colors"
                          >
                            <button
                              onClick={() => removePin(pin.id)}
                              className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                              <Pin className="w-3 h-3" />
                              <span className="ml-auto">{pin.createdAt}</span>
                            </div>
                            <h4 className="font-semibold text-neutral-100 text-sm mb-1 truncate">{pin.title}</h4>
                            <p className="text-xs text-neutral-400 line-clamp-4">{pin.content}</p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: AI Panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Wand2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-neutral-300">AI Tools</h3>
              </div>
              <AIPanel meeting={activeMeeting} notebookId={notebookId} />

              {/* Meeting stats */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Meeting Stats</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Written words", value: activeMeeting.writtenNotes.split(/\s+/).filter(Boolean).length },
                    { label: "Scratch words", value: activeMeeting.scratchPad.split(/\s+/).filter(Boolean).length },
                    { label: "Pinned notes", value: activeMeeting.pinnedNotes.length },
                    { label: "Meetings today", value: todayMeetings.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-neutral-950/50 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-emerald-300">{value}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-white">Meeting Notes Guide</h2>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-neutral-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-emerald-400" />
                    Overview
                  </h3>
                  <p className="text-neutral-300">
                    A powerful meeting management system with AI-powered summarization and translation. 
                    Organize meetings by date, take structured notes, and leverage AI tools to enhance productivity.
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Meeting Scheduling
                      </h4>
                      <p className="text-sm text-neutral-400">
                        Schedule meetings with start and end times, organize by date, and track multiple meetings per day
                      </p>
                    </div>
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <h4 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                        <PenLine className="h-4 w-4" />
                        Three Note Types
                      </h4>
                      <p className="text-sm text-neutral-400">
                        Written Notes for formal documentation, Scratch Pad for quick ideas, and Pinned Notes for important items
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        AI Summarization
                      </h4>
                      <p className="text-sm text-neutral-400">
                        Automatically generate meeting summaries with key points, decisions, and action items
                      </p>
                    </div>
                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <h4 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Multi-language Translation
                      </h4>
                      <p className="text-sm text-neutral-400">
                        Translate meeting notes to 40+ languages including all major Indian languages
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to Use */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">How to Use</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Create a Meeting</h4>
                        <p className="text-sm text-neutral-400">
                          Click "New Meeting" and select from presets (Stand-up, Sprint Planning, etc.) or enter a custom name. 
                          The meeting is created for the selected date.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Set Meeting Times</h4>
                        <p className="text-sm text-neutral-400">
                          Click "Edit" next to the meeting time badge to set start and end times. Use the time pickers to schedule your meeting.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Take Notes</h4>
                        <p className="text-sm text-neutral-400">
                          Use <strong>Written Notes</strong> for formal meeting documentation, <strong>Scratch Pad</strong> for quick thoughts, 
                          and <strong>Pinned Notes</strong> to highlight important items that need follow-up.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Use AI Tools</h4>
                        <p className="text-sm text-neutral-400">
                          Click "Summarize" to generate a concise summary with key points and action items, or "Translate" 
                          to convert your notes to another language.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        5
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Navigate & Organize</h4>
                        <p className="text-sm text-neutral-400">
                          Use the Calendar to jump to different dates. Dates with meetings are highlighted. 
                          Switch between meetings using the tabs below the header.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Pro Tips</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-300">
                        <strong>Auto-save:</strong> All changes are automatically saved to your browser's local storage every 800ms
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-300">
                        <strong>Meeting Presets:</strong> Use presets like "Stand-up" or "Sprint Planning" for quick meeting creation
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-300">
                        <strong>Pinned Notes:</strong> Use pinned notes for action items that need tracking across meetings
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-300">
                        <strong>Meeting Stats:</strong> Track word counts and note counts in the stats panel on the right
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-300">
                        <strong>Delete Meetings:</strong> Hover over a meeting tab and click the X icon to delete it
                      </p>
                    </div>
                  </div>
                </div>

                {/* Data Persistence */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <h3 className="text-lg font-bold text-amber-300 mb-2 flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Data Storage
                  </h3>
                  <p className="text-sm text-neutral-300">
                    Your meeting notes are automatically saved to your browser's <strong>local storage</strong> (not a remote database). 
                    This means your data persists across sessions but is stored locally on your device. 
                    Clearing browser data will remove your notes.
                  </p>
                </div>

                {/* Use Cases */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Perfect For</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-800/50 rounded-lg">
                      <p className="text-sm font-medium text-white">🏢 Team Meetings</p>
                      <p className="text-xs text-neutral-400 mt-1">Stand-ups, planning, retrospectives</p>
                    </div>
                    <div className="p-3 bg-neutral-800/50 rounded-lg">
                      <p className="text-sm font-medium text-white">👥 1:1 Conversations</p>
                      <p className="text-xs text-neutral-400 mt-1">Manager check-ins, mentoring sessions</p>
                    </div>
                    <div className="p-3 bg-neutral-800/50 rounded-lg">
                      <p className="text-sm font-medium text-white">💼 Client Calls</p>
                      <p className="text-xs text-neutral-400 mt-1">Requirements gathering, status updates</p>
                    </div>
                    <div className="p-3 bg-neutral-800/50 rounded-lg">
                      <p className="text-sm font-medium text-white">🎯 Strategy Sessions</p>
                      <p className="text-xs text-neutral-400 mt-1">Planning, brainstorming, decision-making</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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

