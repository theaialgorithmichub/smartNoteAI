"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil,
  Eraser,
  Trash2,
  Download,
  Loader2,
  Undo,
  Redo,
  Circle,
  Square,
  Minus,
  Palette,
  Plus,
  FolderOpen,
  Edit3,
  X,
  Info
} from "lucide-react";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  size: number;
  tool: 'pen' | 'eraser';
}

interface DoodleProject {
  id: string;
  name: string;
  paths: DrawingPath[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DoodleTemplateProps {
  title?: string;
  notebookId?: string;
}

const colors = [
  '#000000', '#374151', '#6B7280', '#EF4444', '#F97316', '#F59E0B', 
  '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E'
];

const brushSizes = [2, 4, 8, 12, 20];

export function DoodleTemplate({ title = "Doodle Pad", notebookId }: DoodleTemplateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
  const [saving, setSaving] = useState(false);
  
  // Multi-project state
  const [projects, setProjects] = useState<DoodleProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormName, setProjectFormName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDocumentation, setShowDocumentation] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<DoodleProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const paths = activeProject?.paths ?? [];
  const notes = activeProject?.notes ?? "";

  // Save data
  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`doodle-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [notebookId, activeProjectId]);

  // Load data
  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`doodle-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        if (loadedProjects.length === 0) {
          // Create default project
          const defaultProject: DoodleProject = {
            id: Date.now().toString(),
            name: "My First Doodle",
            paths: [],
            notes: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setProjects([defaultProject]);
          projectsRef.current = [defaultProject];
          setActiveProjectId(defaultProject.id);
        } else {
          setProjects(loadedProjects);
          projectsRef.current = loadedProjects;
          setActiveProjectId(data.activeProjectId || loadedProjects[0]?.id || null);
        }
      } else {
        // Create default project for new users
        const defaultProject: DoodleProject = {
          id: Date.now().toString(),
          name: "My First Doodle",
          paths: [],
          notes: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects([defaultProject]);
        projectsRef.current = [defaultProject];
        setActiveProjectId(defaultProject.id);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  // Auto-save
  useEffect(() => {
    saveData();
  }, [projects, saveData]);
  
  // Update projectsRef when projects change
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Redraw canvas when paths change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    [...paths, currentPath].filter(Boolean).forEach(path => {
      if (!path || path.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = path.tool === 'eraser' ? '#FFFFFF' : path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });
  }, [paths, currentPath]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    setIsDrawing(true);
    setCurrentPath({
      points: [point],
      color,
      size: brushSize,
      tool
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;
    
    const point = getCanvasPoint(e);
    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points, point]
    });
  };

  const stopDrawing = () => {
    if (isDrawing && currentPath && currentPath.points.length > 1 && activeProject) {
      setUndoStack([...undoStack, paths]);
      setRedoStack([]);
      updateProject({ paths: [...paths, currentPath] });
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };
  
  const updateProject = (updates: Partial<DoodleProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const undo = () => {
    if (undoStack.length === 0 || !activeProject) return;
    const previousPaths = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, paths]);
    updateProject({ paths: previousPaths });
    setUndoStack(undoStack.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0 || !activeProject) return;
    const nextPaths = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, paths]);
    updateProject({ paths: nextPaths });
    setRedoStack(redoStack.slice(0, -1));
  };

  const clearCanvas = () => {
    if (!activeProject) return;
    setUndoStack([...undoStack, paths]);
    setRedoStack([]);
    updateProject({ paths: [] });
  };
  
  const createProject = () => {
    if (!projectFormName.trim()) return;
    const newProject: DoodleProject = {
      id: Date.now().toString(),
      name: projectFormName.trim(),
      paths: [],
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowProjectForm(false);
    setProjectFormName("");
    setUndoStack([]);
    setRedoStack([]);
  };
  
  const saveEditProject = () => {
    if (!editingProjectId || !projectFormName.trim()) return;
    setProjects(prev => prev.map(p => 
      p.id === editingProjectId 
        ? { ...p, name: projectFormName.trim(), updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingProjectId(null);
    setProjectFormName("");
  };
  
  const deleteProject = (id: string) => {
    const next = projects.filter(p => p.id !== id);
    if (activeProjectId === id) {
      setActiveProjectId(next[0]?.id ?? null);
    }
    setProjects(next);
    setConfirmDeleteId(null);
    setUndoStack([]);
    setRedoStack([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `doodle-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col">
      <TemplateHeader title={title} />
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Toolbar */}
          <div className="w-16 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col items-center py-4 gap-2">
            {/* Tools */}
            <button
              onClick={() => setTool('pen')}
              className={`p-3 rounded-xl transition-colors ${
                tool === 'pen' 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' 
                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Pen"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-3 rounded-xl transition-colors ${
                tool === 'eraser' 
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' 
                  : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Eraser"
            >
              <Eraser className="w-5 h-5" />
            </button>

            <div className="w-8 h-px bg-neutral-200 dark:bg-neutral-700 my-2" />

            {/* Brush Sizes */}
            {brushSizes.map(size => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  brushSize === size 
                    ? 'bg-neutral-200 dark:bg-neutral-700' 
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title={`Size ${size}`}
              >
                <div 
                  className="rounded-full bg-neutral-800 dark:bg-white"
                  style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                />
              </button>
            ))}

            <div className="w-8 h-px bg-neutral-200 dark:bg-neutral-700 my-2" />

            {/* Actions */}
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-3 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              title="Undo"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-3 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              title="Redo"
            >
              <Redo className="w-5 h-5" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-3 rounded-xl text-neutral-400 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
              title="Clear"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={downloadCanvas}
              className="p-3 rounded-xl text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Color Palette */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-neutral-400 mr-2" />
              {colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer ml-2"
                title="Custom color"
              />
            </div>

            {/* Canvas */}
            <div className="flex-1 p-4">
              <div className="h-full bg-white rounded-2xl shadow-lg overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 cursor-crosshair touch-none"
                  style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
                />
              </div>
            </div>
          </div>

          {/* Projects & Notes Sidebar */}
          <div className="w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-neutral-900 dark:text-white">{title}</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowDocumentation(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-indigo-500" title="Documentation">
                    <Info className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowProjectForm(true)} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-indigo-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Project Form */}
              {(showProjectForm || editingProjectId) && (
                <div className="mb-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={projectFormName}
                    onChange={(e) => setProjectFormName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (editingProjectId ? saveEditProject() : createProject())}
                    placeholder="Project name"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={editingProjectId ? saveEditProject : createProject} className="flex-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm">
                      {editingProjectId ? 'Save' : 'Create'}
                    </button>
                    <button onClick={() => { setShowProjectForm(false); setEditingProjectId(null); setProjectFormName(""); }} className="px-3 py-1.5 text-neutral-500 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {/* Project List */}
              <div className="space-y-1">
                {projects.map(project => (
                  <div key={project.id} className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeProjectId === project.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}>
                    <button onClick={() => { setActiveProjectId(project.id); setUndoStack([]); setRedoStack([]); }} className="flex items-center gap-2 flex-1 text-left">
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm truncate">{project.name}</span>
                    </button>
                    <button onClick={() => { setEditingProjectId(project.id); setProjectFormName(project.name); setShowProjectForm(false); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && (
                      confirmDeleteId === project.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteProject(project.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Delete</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(project.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Notes */}
            {activeProject && (
              <div className="flex-1 p-4 flex flex-col">
                <label className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => updateProject({ notes: e.target.value })}
                  placeholder="Add notes about your doodle...

- Ideas
- Concepts
- Descriptions"
                  className="flex-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 text-sm text-neutral-700 dark:text-neutral-300 outline-none resize-none placeholder-neutral-400"
                />
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
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💼 Use Cases</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">💡 Brainstorming</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Sketch mind maps, diagrams, and visual ideas</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">🎨 Art & Sketching</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Create digital art and quick sketches</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">📐 Diagrams</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Draw flowcharts, wireframes, and technical diagrams</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="font-semibold text-neutral-900 dark:text-white text-sm mb-1">✏️ Visual Notes</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">Annotate ideas with drawings and doodles</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your doodles are automatically saved locally.</strong> All projects, drawings, and notes are stored in your browser's local storage. Changes save automatically as you draw. Look for the "Saving..." indicator to confirm storage.
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
      </div>
      <TemplateFooter />
    </div>
  );
}
