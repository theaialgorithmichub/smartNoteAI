'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Info,
  X,
  Calendar,
  Target,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TemplateFooter } from './template-footer';

interface Piece {
  id: string;
  title: string;
  composer: string;
  keySignature: string;
  status: 'want-to-learn' | 'learning' | 'learned';
  notes: string;
}

interface PracticeEntry {
  id: string;
  date: string;
  pieceId: string;
  duration: string;
  focus: string;
}

interface TechniqueItem {
  id: string;
  name: string;
  notes: string;
}

interface PianoNotesData {
  pieces: Piece[];
  practiceLog: PracticeEntry[];
  technique: TechniqueItem[];
  generalNotes: string;
}

const defaultData: PianoNotesData = {
  pieces: [],
  practiceLog: [],
  technique: [],
  generalNotes: '',
};

interface PianoNotesTemplateProps {
  title: string;
  notebookId?: string;
}

const STATUS_LABELS: Record<Piece['status'], string> = {
  'want-to-learn': 'Want to learn',
  learning: 'Learning',
  learned: 'Learned',
};

export function PianoNotesTemplate({ title, notebookId }: PianoNotesTemplateProps) {
  const [data, setData] = useState<PianoNotesData>(defaultData);
  const [activeTab, setActiveTab] = useState<'repertoire' | 'practice' | 'technique' | 'notes'>('repertoire');
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showPieceForm, setShowPieceForm] = useState(false);
  const [showPracticeForm, setShowPracticeForm] = useState(false);
  const [showTechniqueForm, setShowTechniqueForm] = useState(false);
  const [editingPieceId, setEditingPieceId] = useState<string | null>(null);
  const [editingTechniqueId, setEditingTechniqueId] = useState<string | null>(null);
  const [newPiece, setNewPiece] = useState<Partial<Piece>>({
    title: '',
    composer: '',
    keySignature: '',
    status: 'want-to-learn',
    notes: '',
  });
  const [newPractice, setNewPractice] = useState<Partial<PracticeEntry>>({
    date: new Date().toISOString().split('T')[0],
    pieceId: '',
    duration: '',
    focus: '',
  });
  const [newTechnique, setNewTechnique] = useState({ name: '', notes: '' });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = notebookId ? `piano-notes-${notebookId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as PianoNotesData;
        setData({
          pieces: parsed.pieces || [],
          practiceLog: parsed.practiceLog || [],
          technique: parsed.technique || [],
          generalNotes: parsed.generalNotes ?? '',
        });
      }
    } catch (e) {
      console.error('Failed to load piano notes:', e);
    }
  }, [storageKey]);

  const persist = (next: PianoNotesData) => {
    setData(next);
    if (!storageKey) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } finally {
        setSaving(false);
      }
    }, 400);
  };

  const addOrUpdatePiece = () => {
    if (!newPiece.title?.trim()) return;
    if (editingPieceId) {
      persist({
        ...data,
        pieces: data.pieces.map((p) =>
          p.id === editingPieceId
            ? {
                id: p.id,
                title: newPiece.title!,
                composer: newPiece.composer ?? '',
                keySignature: newPiece.keySignature ?? '',
                status: newPiece.status ?? 'want-to-learn',
                notes: newPiece.notes ?? '',
              }
            : p
        ),
      });
      setEditingPieceId(null);
    } else {
      persist({
        ...data,
        pieces: [
          {
            id: Date.now().toString(),
            title: newPiece.title!,
            composer: newPiece.composer ?? '',
            keySignature: newPiece.keySignature ?? '',
            status: (newPiece.status as Piece['status']) ?? 'want-to-learn',
            notes: newPiece.notes ?? '',
          },
          ...data.pieces,
        ],
      });
    }
    setNewPiece({
      title: '',
      composer: '',
      keySignature: '',
      status: 'want-to-learn',
      notes: '',
    });
    setShowPieceForm(false);
  };

  const deletePiece = (id: string) => {
    persist({
      ...data,
      pieces: data.pieces.filter((p) => p.id !== id),
      practiceLog: data.practiceLog.filter((e) => e.pieceId !== id),
    });
    if (editingPieceId === id) {
      setEditingPieceId(null);
      setShowPieceForm(false);
    }
  };

  const addPracticeEntry = () => {
    if (!newPractice.date?.trim()) return;
    persist({
      ...data,
      practiceLog: [
        {
          id: Date.now().toString(),
          date: newPractice.date!,
          pieceId: newPractice.pieceId ?? '',
          duration: newPractice.duration ?? '',
          focus: newPractice.focus ?? '',
        },
        ...data.practiceLog,
      ],
    });
    setNewPractice({
      date: new Date().toISOString().split('T')[0],
      pieceId: '',
      duration: '',
      focus: '',
    });
    setShowPracticeForm(false);
  };

  const deletePracticeEntry = (id: string) => {
    persist({ ...data, practiceLog: data.practiceLog.filter((e) => e.id !== id) });
  };

  const addOrUpdateTechnique = () => {
    if (!newTechnique.name.trim()) return;
    if (editingTechniqueId) {
      persist({
        ...data,
        technique: data.technique.map((t) =>
          t.id === editingTechniqueId
            ? { id: t.id, name: newTechnique.name, notes: newTechnique.notes }
            : t
        ),
      });
      setEditingTechniqueId(null);
    } else {
      persist({
        ...data,
        technique: [
          { id: Date.now().toString(), name: newTechnique.name, notes: newTechnique.notes },
          ...data.technique,
        ],
      });
    }
    setNewTechnique({ name: '', notes: '' });
    setShowTechniqueForm(false);
  };

  const deleteTechnique = (id: string) => {
    persist({ ...data, technique: data.technique.filter((t) => t.id !== id) });
    if (editingTechniqueId === id) {
      setEditingTechniqueId(null);
      setShowTechniqueForm(false);
    }
  };

  const setGeneralNotes = (value: string) => {
    persist({ ...data, generalNotes: value });
  };

  const getPieceTitle = (pieceId: string) =>
    data.pieces.find((p) => p.id === pieceId)?.title ?? '—';

  const tabs = [
    { id: 'repertoire' as const, label: 'Repertoire', icon: Music },
    { id: 'practice' as const, label: 'Practice Log', icon: Clock },
    { id: 'technique' as const, label: 'Technique', icon: Target },
    { id: 'notes' as const, label: 'General Notes', icon: FileText },
  ];

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-slate-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-lg">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Repertoire, practice log & technique notes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Saving...</span>
              )}
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="About this template"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-600 text-white dark:bg-slate-500'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Repertoire */}
          {activeTab === 'repertoire' && (
            <Card className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Pieces</h2>
                <button
                  onClick={() => {
                    setEditingPieceId(null);
                    setNewPiece({
                      title: '',
                      composer: '',
                      keySignature: '',
                      status: 'want-to-learn',
                      notes: '',
                    });
                    setShowPieceForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Piece
                </button>
              </div>
              {data.pieces.length === 0 && !showPieceForm ? (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No pieces yet. Add your first piece to start tracking your repertoire.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.pieces.map((piece) => (
                    <div
                      key={piece.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex flex-wrap items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            {piece.title}
                          </span>
                          {piece.composer && (
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                              {piece.composer}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {STATUS_LABELS[piece.status]}
                          </span>
                          {piece.keySignature && (
                            <span className="text-xs text-neutral-500">{piece.keySignature}</span>
                          )}
                        </div>
                        {piece.notes && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                            {piece.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingPieceId(piece.id);
                            setNewPiece({ ...piece });
                            setShowPieceForm(true);
                          }}
                          className="p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
                          title="Edit"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deletePiece(piece.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Practice Log */}
          {activeTab === 'practice' && (
            <Card className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Practice Log</h2>
                <button
                  onClick={() => {
                    setNewPractice({
                      date: new Date().toISOString().split('T')[0],
                      pieceId: data.pieces[0]?.id ?? '',
                      duration: '',
                      focus: '',
                    });
                    setShowPracticeForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Log Practice
                </button>
              </div>
              {data.practiceLog.length === 0 && !showPracticeForm ? (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No practice entries yet. Log your first session.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.practiceLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                          <Calendar className="h-4 w-4" />
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-neutral-900 dark:text-white">
                          {getPieceTitle(entry.pieceId)}
                        </span>
                        {entry.duration && (
                          <span className="text-sm text-neutral-500">{entry.duration}</span>
                        )}
                        {entry.focus && (
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {entry.focus}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deletePracticeEntry(entry.id)}
                        className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Technique */}
          {activeTab === 'technique' && (
            <Card className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Technique & Exercises
                </h2>
                <button
                  onClick={() => {
                    setEditingTechniqueId(null);
                    setNewTechnique({ name: '', notes: '' });
                    setShowTechniqueForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              {data.technique.length === 0 && !showTechniqueForm ? (
                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Add scales, arpeggios, or exercises you practice.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.technique.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex flex-wrap items-start justify-between gap-2"
                    >
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{t.name}</p>
                        {t.notes && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {t.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingTechniqueId(t.id);
                            setNewTechnique({ name: t.name, notes: t.notes });
                            setShowTechniqueForm(true);
                          }}
                          className="p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg"
                        >
                          <BookOpen className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTechnique(t.id)}
                          className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* General Notes */}
          {activeTab === 'notes' && (
            <Card className="p-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                General Notes
              </h2>
              <textarea
                value={data.generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Goals, teacher notes, performance prep, or anything else..."
                className="w-full min-h-[200px] px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-y"
              />
            </Card>
          )}
        </div>

        {/* Add/Edit Piece modal */}
        <AnimatePresence>
          {showPieceForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowPieceForm(false);
                setEditingPieceId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
              >
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingPieceId ? 'Edit Piece' : 'Add Piece'}
                </h3>
                <input
                  value={newPiece.title}
                  onChange={(e) => setNewPiece({ ...newPiece, title: e.target.value })}
                  placeholder="Piece title"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <input
                  value={newPiece.composer}
                  onChange={(e) => setNewPiece({ ...newPiece, composer: e.target.value })}
                  placeholder="Composer"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <input
                    value={newPiece.keySignature}
                    onChange={(e) => setNewPiece({ ...newPiece, keySignature: e.target.value })}
                    placeholder="Key (e.g. C major)"
                    className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  />
                  <select
                    value={newPiece.status}
                    onChange={(e) =>
                      setNewPiece({
                        ...newPiece,
                        status: e.target.value as Piece['status'],
                      })
                    }
                    className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newPiece.notes}
                  onChange={(e) => setNewPiece({ ...newPiece, notes: e.target.value })}
                  placeholder="Notes"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addOrUpdatePiece}
                    disabled={!newPiece.title?.trim()}
                    className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-medium"
                  >
                    {editingPieceId ? 'Save' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPieceForm(false);
                      setEditingPieceId(null);
                    }}
                    className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Practice modal */}
        <AnimatePresence>
          {showPracticeForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPracticeForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
              >
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Log Practice</h3>
                <input
                  type="date"
                  value={newPractice.date}
                  onChange={(e) => setNewPractice({ ...newPractice, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <select
                  value={newPractice.pieceId}
                  onChange={(e) => setNewPractice({ ...newPractice, pieceId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                >
                  <option value="">— No piece —</option>
                  {data.pieces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <input
                  value={newPractice.duration}
                  onChange={(e) => setNewPractice({ ...newPractice, duration: e.target.value })}
                  placeholder="Duration (e.g. 30 min)"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <input
                  value={newPractice.focus}
                  onChange={(e) => setNewPractice({ ...newPractice, focus: e.target.value })}
                  placeholder="What you worked on"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addPracticeEntry}
                    className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowPracticeForm(false)}
                    className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add/Edit Technique modal */}
        <AnimatePresence>
          {showTechniqueForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowTechniqueForm(false);
                setEditingTechniqueId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4"
              >
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {editingTechniqueId ? 'Edit' : 'Add'} Technique / Exercise
                </h3>
                <input
                  value={newTechnique.name}
                  onChange={(e) => setNewTechnique({ ...newTechnique, name: e.target.value })}
                  placeholder="e.g. C major scale, Hanon No. 1"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
                <textarea
                  value={newTechnique.notes}
                  onChange={(e) => setNewTechnique({ ...newTechnique, notes: e.target.value })}
                  placeholder="Notes"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={addOrUpdateTechnique}
                    disabled={!newTechnique.name.trim()}
                    className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg font-medium"
                  >
                    {editingTechniqueId ? 'Save' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTechniqueForm(false);
                      setEditingTechniqueId(null);
                    }}
                    className="flex-1 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Documentation modal */}
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
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Piano Notes
                  </h2>
                  <button
                    onClick={() => setShowDocumentation(false)}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
                  Track your piano journey: build a repertoire list (piece, composer, key, status),
                  log practice sessions with date, piece, duration and focus, add technique and
                  exercises (scales, arpeggios), and keep general notes for goals or teacher feedback.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <TemplateFooter />
    </div>
  );
}
