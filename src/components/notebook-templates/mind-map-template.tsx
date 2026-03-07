"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MindMapNode {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  parentId: string | null;
  children: string[];
}

interface MindMapTemplateProps {
  title: string;
  notebookId?: string;
}

const COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];
const CX = 500, CY = 350;

function freshMap(title: string): MindMapNode[] {
  return [{
    id: '1', text: title || 'Central Idea', color: COLORS[0],
    x: CX, y: CY, parentId: null, children: []
  }];
}

export function MindMapTemplate({ title, notebookId }: MindMapTemplateProps) {
  const [nodes, setNodes] = useState<MindMapNode[]>(() => freshMap(title));
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);

  const storageKey = `mindmap-v2-${notebookId || 'default'}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNodes(parsed);
          return;
        }
      }
    } catch {}
    setNodes(freshMap(title));
  }, [notebookId]);

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(nodes));
    }
  }, [nodes]);

  const addChild = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;
    const siblings = nodes.filter(n => n.parentId === parentId).length;
    const isRoot = parentId === '1';
    const dist = isRoot ? 180 : 130;
    // Spread children evenly: first child goes right, subsequent ones fan out
    const baseAngle = isRoot ? (siblings * (Math.PI * 2 / Math.max(8, siblings + 1))) : (siblings * 50 * (Math.PI / 180) - Math.PI / 3);
    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: 'New Idea',
      color: COLORS[(nodes.length) % COLORS.length],
      x: parent.x + Math.cos(baseAngle) * dist,
      y: parent.y + Math.sin(baseAngle) * dist,
      parentId,
      children: [],
    };
    setNodes(prev => {
      const updated = prev.map(n => n.id === parentId ? { ...n, children: [...n.children, newNode.id] } : n);
      return [...updated, newNode];
    });
    setSelected(newNode.id);
    setEditing(newNode.id);
    setEditText('New Idea');
  };

  const deleteNode = (id: string) => {
    const getAllDescendants = (nid: string, all: MindMapNode[]): string[] => {
      const node = all.find(n => n.id === nid);
      if (!node) return [];
      return [nid, ...node.children.flatMap(cid => getAllDescendants(cid, all))];
    };
    const toDelete = new Set(getAllDescendants(id, nodes));
    setNodes(prev => {
      const filtered = prev.filter(n => !toDelete.has(n.id));
      return filtered.map(n => ({
        ...n, children: n.children.filter(cid => !toDelete.has(cid))
      }));
    });
    setSelected(null);
  };

  const saveEdit = () => {
    if (!editing) return;
    setNodes(prev => prev.map(n => n.id === editing ? { ...n, text: editText } : n));
    setEditing(null);
  };

  const resetMap = () => {
    const fresh = freshMap(title);
    setNodes(fresh);
    setSelected(null);
    localStorage.removeItem(storageKey);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(nodes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `mind-map.json`; a.click();
  };

  const selectedNode = nodes.find(n => n.id === selected);

  return (
    <div className="h-full min-h-0 flex flex-col" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)' }}>
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-black/30 border-b border-white/10">
        <button onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.3))} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-white/60 text-sm">{Math.round(zoom * 100)}%</span>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <button onClick={resetMap} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Reset">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={exportJSON} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors" title="Export">
          <Download className="w-4 h-4" />
        </button>
        <div className="ml-auto text-white/40 text-xs">Click a node to select  Select to add children</div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox={`${CX - 500/zoom} ${CY - 350/zoom} ${1000/zoom} ${700/zoom}`}
            onClick={(e) => {
              if (e.target === svgRef.current) setSelected(null);
            }}
          >
            {/* Connections */}
            {nodes.map(node => {
              if (!node.parentId) return null;
              const parent = nodes.find(n => n.id === node.parentId);
              if (!parent) return null;
              return (
                <line key={`l-${node.id}`}
                  x1={parent.x} y1={parent.y} x2={node.x} y2={node.y}
                  stroke={node.color} strokeWidth="2.5" opacity="0.7"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const isRoot = !node.parentId;
              const isSelected = selected === node.id;
              const r = isRoot ? 65 : 45;
              return (
                <g key={node.id} style={{ cursor: 'pointer' }}
                  onClick={(e) => { e.stopPropagation(); setSelected(node.id); }}
                >
                  {/* Glow on selected */}
                  {isSelected && (
                    <circle cx={node.x} cy={node.y} r={r + 8}
                      fill="none" stroke="white" strokeWidth="2" opacity="0.5"
                      strokeDasharray="6 3"
                    />
                  )}
                  <circle cx={node.x} cy={node.y} r={r}
                    fill={node.color}
                    stroke={isSelected ? 'white' : 'rgba(255,255,255,0.2)'}
                    strokeWidth={isSelected ? 3 : 1}
                    filter="url(#shadow)"
                  />
                  <foreignObject
                    x={node.x - r + 6} y={node.y - 16}
                    width={(r - 6) * 2} height={32}
                    style={{ pointerEvents: 'none' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: '100%', color: 'white', fontSize: isRoot ? '13px' : '11px',
                      fontWeight: 600, textAlign: 'center', lineHeight: 1.2,
                      wordBreak: 'break-word', padding: '0 4px'
                    }}>
                      {node.text.length > 18 ? node.text.slice(0, 18) + '' : node.text}
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.3" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Sidebar */}
        {selectedNode && (
          <div className="w-72 flex-shrink-0 bg-gray-900/95 border-l border-white/10 p-4 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Node</h3>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit text */}
            {editing === selectedNode.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none"
                  rows={3}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit(); } }}
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center justify-center gap-1">
                    <Save className="w-3 h-3" /> Save
                  </button>
                  <button onClick={() => setEditing(null)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-white/60 text-xs uppercase tracking-wide">Text</p>
                <p className="text-white font-medium break-words">{selectedNode.text}</p>
                <button onClick={() => { setEditing(selectedNode.id); setEditText(selectedNode.text); }}
                  className="mt-1 flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
                  <Edit2 className="w-3 h-3" /> Edit text
                </button>
              </div>
            )}

            {/* Color picker */}
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide mb-2">Color</p>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, color: c } : n))}
                    className="w-10 h-10 rounded-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: c, outline: selectedNode.color === c ? '2px solid white' : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto">
              <button onClick={() => addChild(selectedNode.id)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
                <Plus className="w-4 h-4" /> Add Child Node
              </button>
              {selectedNode.parentId && (
                <button onClick={() => deleteNode(selectedNode.id)}
                  className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/30 rounded-lg flex items-center justify-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" /> Delete Node
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
