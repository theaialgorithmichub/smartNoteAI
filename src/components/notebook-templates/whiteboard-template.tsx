"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool, Square, Circle, Type, Eraser, Trash2, Download,
  Undo, Redo, Minus, StickyNote, Loader2, ZoomIn, ZoomOut,
  MousePointer, ArrowRight, Plus, ChevronLeft, ChevronRight,
  Pencil, X, Palette, Info,
} from "lucide-react";

//  Types 

interface Point { x: number; y: number; }

interface DrawElement {
  id: string;
  type: "pen" | "line" | "rectangle" | "circle" | "text" | "sticky" | "arrow";
  points?: Point[];
  start?: Point;
  end?: Point;
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: string;
}

interface Board {
  id: string;
  name: string;
  elements: DrawElement[];
  createdAt: string;
}

interface WhiteboardTemplateProps { title?: string; notebookId?: string; }

//  Constants 

const makeId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

const COLORS = ["#1a1a1a","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#ffffff","#64748b"];
const STROKE_WIDTHS = [2, 4, 6, 10, 16];
const STICKY_COLORS = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa"];

const blankBoard = (name = "Untitled Board"): Board => ({
  id: makeId(), name, elements: [], createdAt: new Date().toISOString(),
});

//  Main Component 

export function WhiteboardTemplate({ title = "Whiteboard", notebookId }: WhiteboardTemplateProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Multi-board state
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeId, _setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);

  // Board form
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [boardFormName, setBoardFormName] = useState("");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Drawing state
  const [tool, setTool] = useState<"select"|"pen"|"line"|"rectangle"|"circle"|"text"|"sticky"|"eraser"|"arrow">("pen");
  const [color, setColor] = useState("#1a1a1a");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [history, setHistory] = useState<DrawElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [textPosition, setTextPosition] = useState<Point | null>(null);
  const [textInput, setTextInput] = useState("");
  const [stickyPosition, setStickyPosition] = useState<Point | null>(null);
  const [stickyInput, setStickyInput] = useState("");

  // DB refs
  const pageIdRef  = useRef<string | null>(null);
  const saveRef    = useRef<NodeJS.Timeout | null>(null);
  const boardsRef  = useRef<Board[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const [saveVersion, setSaveVersion] = useState(0);
  const bumpSave = useCallback(() => setSaveVersion(v => v + 1), []);

  // Keep boardsRef in sync — both via useEffect AND inside every setState updater
  useEffect(() => { boardsRef.current = boards; }, [boards]);

  const setActiveId = useCallback((id: string | null) => {
    activeIdRef.current = id;
    _setActiveId(id);
    // Reset drawing state when switching boards
    setHistory([[]]); setHistoryIndex(0);
    setCurrentElement(null); setIsDrawing(false);
    setZoom(1); setPan({ x: 0, y: 0 });
  }, []);

  const activeBoard = boards.find(b => b.id === activeId) ?? null;

  //  DB Load 
  useEffect(() => {
    if (!notebookId) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === "__whiteboard_template__");
        if (existing) {
          pageIdRef.current = existing._id;
          try {
            const data = JSON.parse(existing.content || "{}");
            const loaded: Board[] = data.boards ?? [];
            setBoards(loaded); boardsRef.current = loaded;
            const aid = data.activeId ?? loaded[0]?.id ?? null;
            activeIdRef.current = aid; _setActiveId(aid);
            if (aid) {
              const b = loaded.find(b => b.id === aid);
              if (b) { setHistory([b.elements]); setHistoryIndex(0); }
            }
          } catch {}
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__whiteboard_template__", content: JSON.stringify({ boards: [], activeId: null }) }),
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
      setSaving(true);
      try {
        // If pageId is missing, create the page first
        let pid = pageIdRef.current;
        if (!pid) {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "__whiteboard_template__", content: "{}" }),
          });
          const created = await cr.json();
          pid = created.page?._id ?? null;
          pageIdRef.current = pid;
        }
        if (!pid) return;
        await fetch(`/api/notebooks/${notebookId}/pages/${pid}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "__whiteboard_template__", content: JSON.stringify({ boards: boardsRef.current, activeId: activeIdRef.current }) }),
        });
      } catch (err) { console.error("Save failed:", err); }
      finally { setSaving(false); }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveVersion, notebookId]);

  //  Board CRUD 
  const createBoard = () => {
    if (!boardFormName.trim()) return;
    const b = blankBoard(boardFormName.trim());
    // Update ref synchronously before state update so save always has latest data
    const next = [...boardsRef.current, b];
    boardsRef.current = next;
    activeIdRef.current = b.id;
    setBoards(next);
    bumpSave();
    setActiveId(b.id);
    setShowBoardForm(false); setBoardFormName("");
  };

  const saveEditBoard = () => {
    if (!editingBoardId || !boardFormName.trim()) return;
    const next = boardsRef.current.map(b => b.id === editingBoardId ? { ...b, name: boardFormName.trim() } : b);
    boardsRef.current = next;
    setBoards(next);
    bumpSave();
    setEditingBoardId(null); setBoardFormName("");
  };

  const deleteBoard = (id: string) => {
    const next = boardsRef.current.filter(b => b.id !== id);
    if (activeId === id) {
      const newId = next[0]?.id ?? null;
      activeIdRef.current = newId; _setActiveId(newId);
    }
    boardsRef.current = next;
    setBoards(next);
    bumpSave();
    setConfirmDeleteId(null);
  };

  //  Save elements to active board 
  const saveElements = useCallback((els: DrawElement[]) => {
    const next = boardsRef.current.map(b => b.id === activeIdRef.current ? { ...b, elements: els } : b);
    boardsRef.current = next;
    setBoards(next);
    bumpSave();
  }, [bumpSave]);

  //  Canvas drawing 
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, el: DrawElement) => {
    ctx.strokeStyle = el.color;
    ctx.fillStyle = el.fill || el.color;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    switch (el.type) {
      case "pen":
        if (el.points && el.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let i = 1; i < el.points.length; i++) {
            const prev = el.points[i - 1];
            const curr = el.points[i];
            ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
          }
          ctx.stroke();
        }
        break;
      case "line":
        if (el.start && el.end) {
          ctx.beginPath(); ctx.moveTo(el.start.x, el.start.y); ctx.lineTo(el.end.x, el.end.y); ctx.stroke();
        }
        break;
      case "arrow":
        if (el.start && el.end) {
          const headlen = 14;
          const dx = el.end.x - el.start.x; const dy = el.end.y - el.start.y;
          const angle = Math.atan2(dy, dx);
          ctx.beginPath(); ctx.moveTo(el.start.x, el.start.y); ctx.lineTo(el.end.x, el.end.y); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(el.end.x, el.end.y);
          ctx.lineTo(el.end.x - headlen * Math.cos(angle - Math.PI / 6), el.end.y - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(el.end.x, el.end.y);
          ctx.lineTo(el.end.x - headlen * Math.cos(angle + Math.PI / 6), el.end.y - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
        break;
      case "rectangle":
        if (el.start && el.end) {
          ctx.strokeRect(el.start.x, el.start.y, el.end.x - el.start.x, el.end.y - el.start.y);
        }
        break;
      case "circle":
        if (el.start && el.end) {
          const rx = Math.abs(el.end.x - el.start.x) / 2;
          const ry = Math.abs(el.end.y - el.start.y) / 2;
          const cx = el.start.x + (el.end.x - el.start.x) / 2;
          const cy = el.start.y + (el.end.y - el.start.y) / 2;
          ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.stroke();
        }
        break;
      case "text":
        if (el.start && el.text) {
          ctx.font = `${el.strokeWidth * 5}px -apple-system, sans-serif`;
          ctx.fillStyle = el.color;
          el.text.split("\n").forEach((line, i) => ctx.fillText(line, el.start!.x, el.start!.y + i * el.strokeWidth * 6));
        }
        break;
      case "sticky":
        if (el.start && el.text) {
          const pad = 14; const w = 200;
          ctx.font = "14px -apple-system, sans-serif";
          const lines = el.text.split("\n");
          const h = lines.length * 22 + pad * 2;
          ctx.shadowColor = "rgba(0,0,0,0.12)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
          ctx.fillStyle = el.fill || "#fef08a";
          ctx.beginPath();
          ctx.roundRect(el.start.x, el.start.y, w, h, 8);
          ctx.fill();
          ctx.shadowColor = "transparent";
          ctx.fillStyle = "#1a1a1a";
          lines.forEach((line, i) => ctx.fillText(line, el.start!.x + pad, el.start!.y + pad + 14 + i * 22));
        }
        break;
    }
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Plain white background  no grid
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const els = activeBoard?.elements ?? [];
    els.forEach(el => drawElement(ctx, el));
    if (currentElement) drawElement(ctx, currentElement);

    ctx.restore();
  }, [activeBoard, currentElement, zoom, pan, drawElement]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => { redrawCanvas(); }, [activeBoard, currentElement, zoom, pan, redrawCanvas]);

  const getCanvasPoint = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || tool === "select") {
      setIsPanning(true); setLastPanPoint({ x: e.clientX, y: e.clientY }); return;
    }
    const point = getCanvasPoint(e);
    if (tool === "text") { setTextPosition(point); return; }
    if (tool === "sticky") { setStickyPosition(point); return; }
    if (tool === "eraser") {
      const threshold = 20 / zoom;
      const els = activeBoard?.elements ?? [];
      const next = els.filter(el => {
        if (el.points) return !el.points.some(p => Math.hypot(p.x - point.x, p.y - point.y) < threshold);
        if (el.start) return Math.hypot(el.start.x - point.x, el.start.y - point.y) > threshold;
        return true;
      });
      saveElements(next);
      setHistory(h => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex(i => i + 1);
      return;
    }
    setIsDrawing(true);
    const newEl: DrawElement = {
      id: makeId(), type: tool as DrawElement["type"], color, strokeWidth,
      points: tool === "pen" ? [point] : undefined,
      start: tool !== "pen" ? point : undefined,
      end: tool !== "pen" ? point : undefined,
    };
    setCurrentElement(newEl);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && lastPanPoint) {
      setPan(p => ({ x: p.x + e.clientX - lastPanPoint.x, y: p.y + e.clientY - lastPanPoint.y }));
      setLastPanPoint({ x: e.clientX, y: e.clientY }); return;
    }
    if (!isDrawing || !currentElement) return;
    const point = getCanvasPoint(e);
    if (currentElement.type === "pen") {
      setCurrentElement(el => el ? { ...el, points: [...(el.points || []), point] } : el);
    } else {
      setCurrentElement(el => el ? { ...el, end: point } : el);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) { setIsPanning(false); setLastPanPoint(null); return; }
    if (currentElement) {
      const els = activeBoard?.elements ?? [];
      const next = [...els, currentElement];
      saveElements(next);
      setHistory(h => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex(i => i + 1);
    }
    setIsDrawing(false); setCurrentElement(null);
  };

  const addText = () => {
    if (!textInput.trim() || !textPosition) return;
    const el: DrawElement = { id: makeId(), type: "text", color, strokeWidth, start: textPosition, text: textInput };
    const next = [...(activeBoard?.elements ?? []), el];
    saveElements(next);
    setHistory(h => [...h.slice(0, historyIndex + 1), next]);
    setHistoryIndex(i => i + 1);
    setTextInput(""); setTextPosition(null);
  };

  const addSticky = (stickyColor: string) => {
    if (!stickyInput.trim() || !stickyPosition) return;
    const el: DrawElement = { id: makeId(), type: "sticky", color: "#1a1a1a", strokeWidth: 2, start: stickyPosition, text: stickyInput, fill: stickyColor };
    const next = [...(activeBoard?.elements ?? []), el];
    saveElements(next);
    setHistory(h => [...h.slice(0, historyIndex + 1), next]);
    setHistoryIndex(i => i + 1);
    setStickyInput(""); setStickyPosition(null);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx); saveElements(history[idx]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx); saveElements(history[idx]);
  };

  const clearCanvas = () => {
    saveElements([]);
    setHistory(h => [...h, []]);
    setHistoryIndex(i => i + 1);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${activeBoard?.name ?? "whiteboard"}.png`;
    link.href = canvas.toDataURL(); link.click();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(4, Math.max(0.2, z + delta)));
  };

  const TOOLS = [
    { id: "select",    icon: MousePointer, label: "Pan / Select" },
    { id: "pen",       icon: PenTool,      label: "Pen" },
    { id: "line",      icon: Minus,        label: "Line" },
    { id: "arrow",     icon: ArrowRight,   label: "Arrow" },
    { id: "rectangle", icon: Square,       label: "Rectangle" },
    { id: "circle",    icon: Circle,       label: "Circle" },
    { id: "text",      icon: Type,         label: "Text" },
    { id: "sticky",    icon: StickyNote,   label: "Sticky Note" },
    { id: "eraser",    icon: Eraser,       label: "Eraser" },
  ] as const;

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500"/>
    </div>
  );


  return (
    <div className="h-screen flex overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      {/* Saving indicator */}
      {saving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 text-xs px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500"/> Saving...
        </div>
      )}

      {/*  Sidebar  */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden z-20">
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Palette className="w-3.5 h-3.5 text-white"/>
                  </div>
                  <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">{title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowDocumentation(true)}
                    className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                    title="Documentation"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
                    <ChevronLeft className="w-4 h-4"/>
                  </button>
                </div>
              </div>
              <button onClick={() => { setBoardFormName(""); setShowBoardForm(true); setEditingBoardId(null); }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors">
                <Plus className="w-4 h-4"/> New Board
              </button>
            </div>

            {/* Board form */}
            {(showBoardForm || editingBoardId) && (
              <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
                <input value={boardFormName} onChange={e => setBoardFormName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (editingBoardId ? saveEditBoard() : createBoard())}
                  placeholder="Board name" autoFocus
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none text-sm border border-neutral-200 dark:border-neutral-700"/>
                <div className="flex gap-2">
                  <button onClick={editingBoardId ? saveEditBoard : createBoard} disabled={!boardFormName.trim()}
                    className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium">
                    {editingBoardId ? "Save" : "Create"}
                  </button>
                  <button onClick={() => { setShowBoardForm(false); setEditingBoardId(null); setBoardFormName(""); }}
                    className="px-3 py-1.5 text-neutral-400 text-xs">Cancel</button>
                </div>
              </div>
            )}

            {/* Board list */}
            <div className="flex-1 overflow-y-auto p-2 min-h-0">
              {boards.length === 0 && <p className="text-xs text-neutral-400 italic px-2 py-4">No boards yet</p>}
              {boards.map(b => (
                <div key={b.id} className={`rounded-xl mb-1 transition-all ${b.id === activeId ? "bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                  <div className="flex items-center gap-2 p-2.5 group cursor-pointer" onClick={() => setActiveId(b.id)}>
                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center ${b.id === activeId ? "bg-blue-500" : "bg-neutral-200 dark:bg-neutral-700"}`}>
                      <PenTool className={`w-3 h-3 ${b.id === activeId ? "text-white" : "text-neutral-500"}`}/>
                    </div>
                    <p className={`flex-1 text-sm font-medium truncate ${b.id === activeId ? "text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-300"}`}>{b.name}</p>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); setBoardFormName(b.name); setEditingBoardId(b.id); setShowBoardForm(false); }}
                        className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400"><Pencil className="w-3 h-3"/></button>
                      <button onClick={e => { e.stopPropagation(); setConfirmDeleteId(confirmDeleteId === b.id ? null : b.id); }}
                        className={`p-1 rounded transition-colors ${confirmDeleteId === b.id ? "bg-red-100 text-red-500" : "hover:bg-red-50 text-neutral-400 hover:text-red-500"}`}>
                        <Trash2 className="w-3 h-3"/>
                      </button>
                    </div>
                  </div>
                  {confirmDeleteId === b.id && (
                    <div className="px-2.5 pb-2.5">
                      <p className="text-[11px] text-red-500 font-medium mb-1.5">Delete &quot;{b.name}&quot;?</p>
                      <div className="flex gap-1.5">
                        <button onClick={() => deleteBoard(b.id)} className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium">Delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 rounded-lg text-xs">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Element count */}
            {activeBoard && (
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                <p className="text-[10px] text-neutral-400 text-center">{activeBoard.elements.length} element{activeBoard.elements.length !== 1 ? "s" : ""}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/*  Main area  */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/*  Toolbar  */}
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-3 py-2 flex items-center gap-3 flex-shrink-0 flex-wrap">
          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400">
              <ChevronRight className="w-4 h-4"/>
            </button>
          )}

          {/* Board name */}
          {activeBoard && (
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:block">{activeBoard.name}</span>
          )}

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 hidden sm:block"/>

          {/* Tools */}
          <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
                className={`p-2 rounded-lg transition-colors ${tool === t.id ? "bg-white dark:bg-neutral-700 shadow-sm text-blue-600" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white/60 dark:hover:bg-neutral-700/60"}`}>
                <t.icon className="w-4 h-4"/>
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"/>

          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} title={c}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? "border-blue-500 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #e5e7eb" : undefined }}/>
            ))}
          </div>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"/>

          {/* Stroke widths */}
          <div className="flex items-center gap-1">
            {STROKE_WIDTHS.map(w => (
              <button key={w} onClick={() => setStrokeWidth(w)} title={`${w}px`}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${strokeWidth === w ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>
                <div className="rounded-full bg-neutral-700 dark:bg-neutral-300" style={{ width: Math.min(w * 1.5, 14), height: Math.min(w * 1.5, 14) }}/>
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"/>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button onClick={undo} disabled={historyIndex <= 0} title="Undo"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors">
              <Undo className="w-4 h-4"/>
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors">
              <Redo className="w-4 h-4"/>
            </button>
          </div>

          <div className="flex-1"/>

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ZoomOut className="w-4 h-4"/>
            </button>
            <button onClick={() => setZoom(1)} className="text-xs text-neutral-500 w-12 text-center hover:text-blue-500 transition-colors font-mono">
              {Math.round(zoom * 100)}%
            </button>
            <button onClick={() => setZoom(z => Math.min(4, z + 0.1))} className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <ZoomIn className="w-4 h-4"/>
            </button>
          </div>

          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700"/>

          <button onClick={downloadCanvas} title="Download PNG" disabled={!activeBoard}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors">
            <Download className="w-4 h-4"/>
          </button>
          <button onClick={clearCanvas} title="Clear board" disabled={!activeBoard}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 disabled:opacity-30 transition-colors">
            <Trash2 className="w-4 h-4"/>
          </button>
        </div>

        {/*  Canvas area  */}
        <div ref={containerRef} className="flex-1 overflow-hidden relative bg-white dark:bg-neutral-950">
          {!activeBoard ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <PenTool className="w-10 h-10 text-white"/>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Create a Board</h2>
              <p className="text-neutral-500 mb-8 max-w-sm">Draw freely on a plain canvas. Create multiple boards to organise your work.</p>
              <button onClick={() => { setBoardFormName(""); setShowBoardForm(true); setSidebarOpen(true); }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold text-lg hover:opacity-90 flex items-center gap-2 transition-opacity">
                <Plus className="w-5 h-5"/> New Board
              </button>
            </div>
          ) : (
            <>
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                  cursor: tool === "select" ? (isPanning ? "grabbing" : "grab")
                        : tool === "eraser" ? "cell"
                        : "crosshair",
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
              />

              {/* Text input popup */}
              {textPosition && (
                <div className="absolute z-20 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4"
                  style={{ left: textPosition.x * zoom + pan.x, top: textPosition.y * zoom + pan.y }}>
                  <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={3}
                    placeholder="Type text..." autoFocus
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addText(); } if (e.key === "Escape") setTextPosition(null); }}
                    className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 rounded-xl outline-none w-52 resize-none text-sm"/>
                  <div className="flex gap-2 mt-2">
                    <button onClick={addText} className="flex-1 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium">Add</button>
                    <button onClick={() => { setTextPosition(null); setTextInput(""); }} className="px-3 py-1.5 text-neutral-400 text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* Sticky note popup */}
              {stickyPosition && (
                <div className="absolute z-20 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-4"
                  style={{ left: stickyPosition.x * zoom + pan.x, top: stickyPosition.y * zoom + pan.y }}>
                  <textarea value={stickyInput} onChange={e => setStickyInput(e.target.value)} rows={4}
                    placeholder="Write a note..." autoFocus
                    onKeyDown={e => e.key === "Escape" && setStickyPosition(null)}
                    className="px-3 py-2 bg-neutral-50 dark:bg-neutral-700 rounded-xl outline-none w-52 resize-none text-sm mb-3"/>
                  <p className="text-[10px] text-neutral-400 mb-2 font-medium uppercase tracking-wide">Pick colour</p>
                  <div className="flex gap-1.5 mb-3">
                    {STICKY_COLORS.map(c => (
                      <button key={c} onClick={() => addSticky(c)}
                        className="w-8 h-8 rounded-xl border-2 border-transparent hover:border-neutral-400 hover:scale-110 transition-all"
                        style={{ backgroundColor: c }}/>
                    ))}
                  </div>
                  <button onClick={() => { setStickyPosition(null); setStickyInput(""); }} className="text-xs text-neutral-400 hover:text-neutral-600">Cancel</button>
                </div>
              )}

              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 text-[10px] text-neutral-300 dark:text-neutral-700 pointer-events-none">
                Scroll to zoom  Middle-click or Select tool to pan
              </div>
            </>
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
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Whiteboard Guide</h2>
                    <p className="text-blue-100 text-sm">Digital canvas for ideas & diagrams</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎨 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Whiteboard is a powerful digital canvas for sketching ideas, creating diagrams, and visual brainstorming. Draw with pen, create shapes, add text and sticky notes, use multiple colors, zoom and pan, and manage multiple boards for different projects.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">✏️ Drawing Tools</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Pen, line, arrow, rectangle, circle, text, and sticky notes.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🎨 Customization</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">10 colors, 5 stroke widths, and 6 sticky note colors.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🔄 Undo/Redo</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Full history tracking with unlimited undo and redo.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">🔍 Zoom & Pan</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Scroll to zoom, use select tool or middle-click to pan.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">📋 Multiple Boards</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Create and manage multiple whiteboards for different projects.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Board</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Board" in the sidebar to create a new whiteboard.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Select a Tool</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Choose from pen, shapes, text, sticky notes, or eraser in the toolbar.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Choose Color & Width</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Select color from palette and adjust stroke width.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Draw on Canvas</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click and drag to draw. For text/sticky notes, click to place then type.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Zoom & Pan</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Scroll to zoom in/out. Use select tool or middle-click to pan around.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Export</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click download icon to export your whiteboard as PNG image.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Keyboard shortcuts</strong> - Use Ctrl+Z for undo, Ctrl+Y for redo</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Sticky notes</strong> - Perfect for brainstorming and organizing ideas</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Arrows</strong> - Use arrows to connect concepts and create flow diagrams</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Color coding</strong> - Use different colors to categorize information</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Multiple boards</strong> - Create separate boards for different projects or topics</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Zoom out</strong> - Zoom out to see the big picture, zoom in for details</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your whiteboards are automatically saved to the server.</strong> All boards, drawings, shapes, text, and sticky notes are stored in the database and synced across devices. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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

