"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateFooter } from './template-footer';
import {
  Layers,
  Plus,
  Loader2,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Check,
  X,
  Sparkles,
  Brain,
  Target,
  Trophy,
  Clock,
  FolderOpen,
  Edit3,
  Info
} from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deck: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  correctCount: number;
  incorrectCount: number;
}

interface Deck {
  id: string;
  name: string;
  color: string;
}

interface FlashProject {
  id: string;
  name: string;
  cards: Flashcard[];
  decks: Deck[];
  createdAt: string;
  updatedAt: string;
}

interface FlashcardTemplateProps {
  title?: string;
  notebookId?: string;
}

export function FlashcardTemplate({ title = "Flashcards", notebookId }: FlashcardTemplateProps) {
  const [activeTab, setActiveTab] = useState<'study' | 'manage' | 'stats'>('study');
  const [selectedDeck, setSelectedDeck] = useState<string>('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newDeck, setNewDeck] = useState("default");
  
  const [isAddingDeck, setIsAddingDeck] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  
  // Multi-project state
  const [projects, setProjects] = useState<FlashProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectFormName, setProjectFormName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<FlashProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const cards = activeProject?.cards ?? [];
  const decks = activeProject?.decks ?? [{ id: 'default', name: 'General', color: '#3b82f6' }];

  const deckColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`flashcard-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`flashcard-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        if (loadedProjects.length === 0) {
          const defaultProject: FlashProject = {
            id: Date.now().toString(),
            name: "My Flash Cards",
            cards: [],
            decks: [{ id: 'default', name: 'General', color: '#3b82f6' }],
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
        const defaultProject: FlashProject = {
          id: Date.now().toString(),
          name: "My Flash Cards",
          cards: [],
          decks: [{ id: 'default', name: 'General', color: '#3b82f6' }],
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

  useEffect(() => {
    saveData();
  }, [projects, activeProjectId]);
  
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    const filtered = selectedDeck === 'all' 
      ? cards 
      : cards.filter(c => c.deck === selectedDeck);
    setStudyCards(isShuffled ? [...filtered].sort(() => Math.random() - 0.5) : filtered);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [cards, selectedDeck, isShuffled]);

  const updateProject = (updates: Partial<FlashProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  };
  
  const addCard = () => {
    if (!newFront.trim() || !newBack.trim() || !activeProject) return;
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: newFront,
      back: newBack,
      deck: newDeck,
      difficulty: 'medium',
      correctCount: 0,
      incorrectCount: 0
    };
    updateProject({ cards: [...cards, newCard] });
    setNewFront("");
    setNewBack("");
    setIsAddingCard(false);
  };

  const deleteCard = (id: string) => {
    if (!activeProject) return;
    updateProject({ cards: cards.filter(c => c.id !== id) });
  };

  const addDeck = () => {
    if (!newDeckName.trim() || !activeProject) return;
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: newDeckName,
      color: deckColors[decks.length % deckColors.length]
    };
    updateProject({ decks: [...decks, newDeck] });
    setNewDeckName("");
    setIsAddingDeck(false);
  };

  const generateCardsWithAI = async () => {
    if (!aiTopic.trim() || !activeProject) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          message: `Create 8 flashcards for studying "${aiTopic}". Include a mix of definitions, concepts, and application questions.

Format as JSON array:
[{"front": "Question or term", "back": "Answer or definition", "difficulty": "easy|medium|hard"}]

Only return the JSON array.`,
          context: []
        })
      });

      const data = await response.json();
      const jsonMatch = data.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        const newCards: Flashcard[] = generated.map((c: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          front: c.front,
          back: c.back,
          deck: 'default',
          difficulty: c.difficulty || 'medium',
          correctCount: 0,
          incorrectCount: 0
        }));
        updateProject({ cards: [...cards, ...newCards] });
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setAiTopic("");
    }
  };

  const markAnswer = (correct: boolean) => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard || !activeProject) return;
    
    updateProject({
      cards: cards.map(c => {
        if (c.id !== currentCard.id) return c;
        return {
          ...c,
          lastReviewed: new Date().toISOString(),
          correctCount: correct ? c.correctCount + 1 : c.correctCount,
          incorrectCount: correct ? c.incorrectCount : c.incorrectCount + 1
        };
      })
    });
    
    setSessionStats(prev => ({
      correct: correct ? prev.correct + 1 : prev.correct,
      incorrect: correct ? prev.incorrect : prev.incorrect + 1,
      total: prev.total + 1
    }));
    
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev + 1) % studyCards.length);
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(prev => (prev - 1 + studyCards.length) % studyCards.length);
    }, 200);
  };

  const currentCard = studyCards[currentCardIndex];
  const currentDeck = decks.find(d => d.id === currentCard?.deck);

  const createProject = () => {
    if (!projectFormName.trim()) return;
    const newProject: FlashProject = {
      id: Date.now().toString(),
      name: projectFormName.trim(),
      cards: [],
      decks: [{ id: 'default', name: 'General', color: '#3b82f6' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowProjectForm(false);
    setProjectFormName("");
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
  };
  
  const totalCorrect = cards.reduce((sum, c) => sum + c.correctCount, 0);
  const totalIncorrect = cards.reduce((sum, c) => sum + c.incorrectCount, 0);
  const masteryRate = totalCorrect + totalIncorrect > 0 
    ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) 
    : 0;

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-violet-50 to-purple-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors ml-auto"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">{cards.length} cards in {decks.length} decks</p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {[
                { id: 'study', label: 'Study', icon: Brain },
                { id: 'manage', label: 'Manage', icon: Layers },
                { id: 'stats', label: 'Stats', icon: Trophy },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-violet-600 dark:text-violet-400 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Projects */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Project:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {projects.map(project => (
                <div key={project.id} className={`group flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${activeProjectId === project.id ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}>
                  <button onClick={() => setActiveProjectId(project.id)} className="flex items-center gap-1.5 text-xs">
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>{project.name}</span>
                  </button>
                  <button onClick={() => { setEditingProjectId(project.id); setProjectFormName(project.name); setShowProjectForm(false); }} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded">
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {projects.length > 1 && (
                    confirmDeleteId === project.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteProject(project.id)} className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px]">Del</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="px-1.5 py-0.5 bg-neutral-300 dark:bg-neutral-600 rounded text-[10px]">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(project.id)} className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )
                  )}
                </div>
              ))}
              <button onClick={() => setShowProjectForm(true)} className="px-3 py-1.5 bg-violet-500 text-white rounded-lg text-xs flex items-center gap-1 hover:bg-violet-600">
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>
          </div>
          
          {/* Project Form */}
          {(showProjectForm || editingProjectId) && (
            <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center gap-2">
              <input
                type="text"
                value={projectFormName}
                onChange={(e) => setProjectFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (editingProjectId ? saveEditProject() : createProject())}
                placeholder="Project name"
                className="flex-1 px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm"
                autoFocus
              />
              <button onClick={editingProjectId ? saveEditProject : createProject} className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm">
                {editingProjectId ? 'Save' : 'Create'}
              </button>
              <button onClick={() => { setShowProjectForm(false); setEditingProjectId(null); setProjectFormName(""); }} className="px-4 py-2 text-neutral-500 text-sm">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Study Tab */}
        {activeTab === 'study' && (
          <div>
            {/* Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <select
                  value={selectedDeck}
                  onChange={(e) => setSelectedDeck(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none"
                >
                  <option value="all">All Decks</option>
                  {decks.map(deck => (
                    <option key={deck.id} value={deck.id}>{deck.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-2 rounded-lg ${isShuffled ? 'bg-violet-100 text-violet-600' : 'bg-neutral-100 text-neutral-600'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </div>
              <div className="text-sm text-neutral-500">
                {currentCardIndex + 1} / {studyCards.length}
              </div>
            </div>

            {/* Flashcard */}
            {studyCards.length > 0 ? (
              <div className="flex flex-col items-center">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full max-w-xl aspect-[3/2] cursor-pointer perspective-1000"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col items-center justify-center backface-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      {currentDeck && (
                        <span
                          className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: currentDeck.color }}
                        >
                          {currentDeck.name}
                        </span>
                      )}
                      <p className="text-2xl font-medium text-neutral-900 dark:text-white text-center">
                        {currentCard?.front}
                      </p>
                      <p className="text-sm text-neutral-400 mt-4">Click to flip</p>
                    </div>
                    
                    {/* Back */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="text-2xl font-medium text-white text-center">
                        {currentCard?.back}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Answer Buttons */}
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mt-8"
                  >
                    <button
                      onClick={() => markAnswer(false)}
                      className="px-8 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl font-medium flex items-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Incorrect
                    </button>
                    <button
                      onClick={() => markAnswer(true)}
                      className="px-8 py-3 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl font-medium flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Correct
                    </button>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-4 mt-8">
                  <button
                    onClick={prevCard}
                    className="p-3 bg-white dark:bg-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                      setSessionStats({ correct: 0, incorrect: 0, total: 0 });
                    }}
                    className="p-3 bg-white dark:bg-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextCard}
                    className="p-3 bg-white dark:bg-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Session Stats */}
                {sessionStats.total > 0 && (
                  <div className="mt-8 flex gap-6 text-sm">
                    <span className="text-green-600">✓ {sessionStats.correct} correct</span>
                    <span className="text-red-600">✗ {sessionStats.incorrect} incorrect</span>
                    <span className="text-neutral-500">
                      {Math.round((sessionStats.correct / sessionStats.total) * 100)}% accuracy
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-neutral-400">
                <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No flashcards yet</p>
                <p className="text-sm">Create some cards to start studying</p>
              </div>
            )}
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-8">
            {/* AI Generate */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Generate with AI
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Enter a topic (e.g., JavaScript Arrays, World War 2)"
                  className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                />
                <button
                  onClick={generateCardsWithAI}
                  disabled={isGenerating || !aiTopic.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  Generate
                </button>
              </div>
            </div>

            {/* Add Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Add Card</h2>
                {!isAddingCard && (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Card
                  </button>
                )}
              </div>
              
              {isAddingCard && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Front (Question)</label>
                    <textarea
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      placeholder="Enter the question or term..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Back (Answer)</label>
                    <textarea
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      placeholder="Enter the answer or definition..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Deck</label>
                    <select
                      value={newDeck}
                      onChange={(e) => setNewDeck(e.target.value)}
                      className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      {decks.map(deck => (
                        <option key={deck.id} value={deck.id}>{deck.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addCard} className="px-4 py-2 bg-violet-500 text-white rounded-lg">
                      Add Card
                    </button>
                    <button onClick={() => setIsAddingCard(false)} className="px-4 py-2 text-neutral-500">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Decks */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Decks</h2>
                <button
                  onClick={() => setIsAddingDeck(true)}
                  className="text-violet-500 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  New Deck
                </button>
              </div>
              
              {isAddingDeck && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Deck name"
                    className="flex-1 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none"
                  />
                  <button onClick={addDeck} className="px-4 py-2 bg-violet-500 text-white rounded-lg">Add</button>
                  <button onClick={() => setIsAddingDeck(false)} className="px-4 py-2 text-neutral-500">Cancel</button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {decks.map(deck => (
                  <span
                    key={deck.id}
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: deck.color }}
                  >
                    {deck.name} ({cards.filter(c => c.deck === deck.id).length})
                  </span>
                ))}
              </div>
            </div>

            {/* Card List */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">All Cards ({cards.length})</h2>
              <div className="space-y-2 max-h-96 overflow-auto">
                {cards.map(card => {
                  const deck = decks.find(d => d.id === card.deck);
                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl group"
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: deck?.color || '#888' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 dark:text-white truncate">{card.front}</p>
                        <p className="text-sm text-neutral-500 truncate">{card.back}</p>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{cards.length}</p>
                  <p className="text-sm text-neutral-500">Total Cards</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{masteryRate}%</p>
                  <p className="text-sm text-neutral-500">Mastery Rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalCorrect + totalIncorrect}</p>
                  <p className="text-sm text-neutral-500">Total Reviews</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Performance by Card</h3>
              <div className="space-y-3">
                {cards.slice(0, 10).map(card => {
                  const total = card.correctCount + card.incorrectCount;
                  const rate = total > 0 ? Math.round((card.correctCount / total) * 100) : 0;
                  return (
                    <div key={card.id} className="flex items-center gap-4">
                      <p className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 truncate">{card.front}</p>
                      <div className="w-32 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-500 w-12 text-right">{rate}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
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
              <div className="sticky top-0 bg-gradient-to-r from-violet-500 to-purple-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Flashcards Guide</h2>
                    <p className="text-purple-100 text-sm">Study smarter with spaced repetition</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🧠 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Flashcards is a powerful study tool with spaced repetition. Create multiple projects, organize cards into decks, study with flip animations, track correct/incorrect answers, generate cards with AI, and monitor your learning progress with detailed statistics.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                      <h4 className="font-semibold text-violet-900 dark:text-violet-400 mb-1">📚 Multi-Deck Organization</h4>
                      <p className="text-sm text-violet-800 dark:text-violet-300">Create color-coded decks to organize cards by subject or topic.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">🔄 Interactive Study Mode</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Flip cards, mark correct/incorrect, shuffle for random order.</p>
                    </div>
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">📊 Progress Tracking</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Track correct/incorrect counts, view success rates, monitor session stats.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🎯 Difficulty Levels</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Mark cards as easy, medium, or hard to prioritize study time.</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">🤖 AI Card Generation</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Generate flashcards automatically from any topic using AI.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Project</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Project" to create a flashcard collection.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create Decks</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Go to Manage tab, create decks to organize cards by subject.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Cards</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add Card" to create cards with front (question) and back (answer).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Study Mode</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Go to Study tab, select a deck, click cards to flip and mark correct/incorrect.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">AI Generation</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Enter a topic and click "Generate with AI" to create cards automatically.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Track Progress</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">View Stats tab to see success rates, deck performance, and study history.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Shuffle cards</strong> - Randomize order to avoid memorizing sequences</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Mark difficulty</strong> - Focus on hard cards during review sessions</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Regular sessions</strong> - Study daily for better retention with spaced repetition</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Concise cards</strong> - Keep questions and answers brief for quick recall</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use AI wisely</strong> - Generate cards then customize for your learning style</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Track stats</strong> - Monitor progress to identify weak areas</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your flashcards are automatically saved locally.</strong> All projects, decks, cards, difficulty levels, and study statistics are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
