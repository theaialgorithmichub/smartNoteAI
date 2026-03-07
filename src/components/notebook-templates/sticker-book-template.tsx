'use client';

import React, { useState, useRef } from 'react';
import { StickyNote, Plus, Trash2, Palette, Move, Info, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';
import { Button } from '@/components/ui/button';

interface StickerBookTemplateProps {
  title: string;
  notebookId?: string;
}

interface Sticker {
  id: number;
  content: string;
  color: string;
  x: number;
  y: number;
}

export function StickerBookTemplate({ title }: StickerBookTemplateProps) {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const colors = [
    { name: 'Yellow', value: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-400' },
    { name: 'Pink', value: 'pink', bg: 'bg-pink-200', border: 'border-pink-400' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-200', border: 'border-blue-400' },
    { name: 'Green', value: 'green', bg: 'bg-green-200', border: 'border-green-400' },
    { name: 'Purple', value: 'purple', bg: 'bg-purple-200', border: 'border-purple-400' },
    { name: 'Orange', value: 'orange', bg: 'bg-orange-200', border: 'border-orange-400' },
    { name: 'Red', value: 'red', bg: 'bg-red-200', border: 'border-red-400' },
    { name: 'Teal', value: 'teal', bg: 'bg-teal-200', border: 'border-teal-400' },
    { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-200', border: 'border-indigo-400' },
    { name: 'Lime', value: 'lime', bg: 'bg-lime-200', border: 'border-lime-400' },
    { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-200', border: 'border-cyan-400' },
    { name: 'Fuchsia', value: 'fuchsia', bg: 'bg-fuchsia-200', border: 'border-fuchsia-400' },
    { name: 'Rose', value: 'rose', bg: 'bg-rose-200', border: 'border-rose-400' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-200', border: 'border-amber-400' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-200', border: 'border-emerald-400' },
  ];

  const getColorClasses = (color: string) => {
    const colorObj = colors.find(c => c.value === color);
    return colorObj || colors[0];
  };

  const handleAddSticker = () => {
    const newSticker: Sticker = {
      id: Date.now(),
      content: '',
      color: selectedColor,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const handleDeleteSticker = (id: number) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  const handleUpdateContent = (id: number, content: string) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, content } : s));
  };

  const handleMouseDown = (e: React.MouseEvent, sticker: Sticker) => {
    if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }
    e.preventDefault();
    setDraggingId(sticker.id);
    dragOffset.current = {
      x: e.clientX - sticker.x,
      y: e.clientY - sticker.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId === null) return;
    
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    
    setStickers(prev => prev.map(s => 
      s.id === draggingId ? { ...s, x: Math.max(0, newX), y: Math.max(0, newY) } : s
    ));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-lime-50 to-green-50 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">Organize your thoughts with sticky notes</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDocumentation(true)}
                  className="p-2 bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400 rounded-lg hover:bg-lime-200 dark:hover:bg-lime-900/50 transition-colors"
                  title="Know More"
                >
                  <Info className="h-5 w-5" />
                </button>
                <Button
                  onClick={handleAddSticker}
                  className="bg-gradient-to-r from-lime-500 to-green-500 text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Sticky Note
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="p-4 bg-white/30 dark:bg-neutral-900/30 border-b border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Palette className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            <div className="flex gap-2">
              {colors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-8 h-8 rounded-lg ${color.bg} border-2 ${
                    selectedColor === color.value ? 'border-neutral-900 dark:border-white scale-110' : color.border
                  } hover:scale-110 transition-transform`}
                  title={color.name}
                />
              ))}
            </div>
            <div className="ml-auto text-sm text-neutral-600 dark:text-neutral-400">
              {stickers.length} sticky notes
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 relative overflow-auto p-8"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative min-h-[800px] min-w-[1200px]">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />

            {/* Stickers */}
            {stickers.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <StickyNote className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Sticky Notes Yet</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">Click "New Sticky Note" to add your first note</p>
                </div>
              </div>
            ) : (
              stickers.map(sticker => {
                const colorClasses = getColorClasses(sticker.color);
                return (
                  <div
                    key={sticker.id}
                    className={`absolute w-56 h-56 ${colorClasses.bg} ${colorClasses.border} border-2 rounded-lg shadow-lg cursor-move hover:shadow-xl transition-shadow group ${
                      draggingId === sticker.id ? 'z-50 scale-105' : 'z-10'
                    }`}
                    style={{ left: sticker.x, top: sticker.y }}
                    onMouseDown={(e) => handleMouseDown(e, sticker)}
                  >
                    <div className="p-4 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <Move className="h-4 w-4 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => handleDeleteSticker(sticker.id)}
                          className="p-1 hover:bg-white/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                      <textarea
                        value={sticker.content}
                        onChange={(e) => handleUpdateContent(sticker.id, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none resize-none text-neutral-900 font-handwriting text-lg"
                        placeholder="Write your note..."
                      />
                    </div>
                    {/* Sticky note shadow effect */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/5 rounded-br-lg" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border-t border-neutral-200 dark:border-neutral-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                <span>Click "New Sticky Note" to add</span>
              </div>
              <div className="flex items-center gap-2">
                <Move className="h-4 w-4" />
                <span>Drag to reposition</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Choose colors from palette</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Modal */}
        {showDocumentation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-neutral-800">
              <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <StickyNote className="h-6 w-6 text-lime-600" />
                    Sticky Notes - Template Documentation
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Complete guide to features and capabilities</p>
                </div>
                <button onClick={() => setShowDocumentation(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">📋 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Sticky Notes is a visual organization tool that lets you create, arrange, and manage colorful sticky notes on a canvas. 
                    Perfect for brainstorming, task management, quick reminders, and organizing thoughts visually.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">✨ Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Drag & Drop</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Click and drag sticky notes anywhere on the canvas to organize visually</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-pink-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">6 Color Options</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Choose from yellow, pink, blue, green, purple, and orange sticky notes</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Instant Create</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Add new sticky notes with one click, placed randomly on canvas</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Easy Delete</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Hover over any note and click trash icon to remove it</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Live Editing</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Type directly on sticky notes, changes save automatically</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Large Canvas</h4>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300">Spacious canvas with grid pattern for organizing many notes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">1. Choose Color</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click on any color in the palette bar to select it. The selected color will have a darker border.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">2. Create Sticky Note</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click "New Sticky Note" button. A new sticky note in your selected color appears at a random position on the canvas.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">3. Write Content</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click inside the sticky note and start typing. Your text is saved automatically as you type.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">4. Move Sticky Notes</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Click and hold anywhere on the sticky note (except the text area), then drag to reposition. Release to place.</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <h4 className="font-bold text-neutral-900 dark:text-white mb-2">5. Delete Sticky Notes</h4>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">Hover over a sticky note to reveal the trash icon in the top-right corner. Click it to delete the note.</p>
                    </div>
                  </div>
                </section>
                <section className="bg-gradient-to-r from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20 p-6 rounded-lg border border-lime-200 dark:border-lime-800">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">💎 Pro Tips</h3>
                  <ul className="space-y-2 text-neutral-700 dark:text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 mt-1">✓</span>
                      <span><strong>Color Coding:</strong> Use different colors to categorize notes (e.g., yellow for tasks, pink for ideas, blue for reminders).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 mt-1">✓</span>
                      <span><strong>Spatial Organization:</strong> Group related notes together by positioning them near each other on the canvas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 mt-1">✓</span>
                      <span><strong>Quick Brainstorming:</strong> Create multiple notes rapidly to capture ideas during brainstorming sessions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 mt-1">✓</span>
                      <span><strong>Visual Workflows:</strong> Arrange notes in columns or rows to create visual workflows or kanban boards.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 mt-1">✓</span>
                      <span><strong>Drag Carefully:</strong> To move a note, click on the colored area (not the text). The move icon appears on hover.</span>
                    </li>
                  </ul>
                </section>
                <section>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">🎯 Use Cases</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Brainstorming</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Capture and organize ideas visually</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Task Management</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Create visual to-do lists and workflows</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Quick Reminders</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Jot down important notes and reminders</p>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                      <p className="font-medium text-neutral-900 dark:text-white mb-1">Project Planning</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Map out project phases and milestones</p>
                    </div>
                  </div>
                </section>
              </div>
              <div className="sticky bottom-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <Button onClick={() => setShowDocumentation(false)} className="w-full bg-gradient-to-r from-lime-500 to-green-500 text-white hover:opacity-90">Got It!</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      <TemplateFooter />
    </div>
  );
}
