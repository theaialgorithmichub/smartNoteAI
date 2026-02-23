"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Plus, Loader2, Trash2, Edit3, X, Check, Search, Upload, Sparkles,
  Users, MapPin, Box, Clapperboard, Camera, Image, FileText, Music, Languages,
  MessageSquare, Wand2, ChevronDown, ChevronRight, FolderOpen, Video, Link as LinkIcon
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoryImage {
  id: string;
  url: string;
  prompt?: string;
  generatedByAI: boolean;
}

interface Character {
  id: string;
  name: string;
  description: string;
  prompt: string;
  images: StoryImage[];
  storyboardImages: StoryImage[];
}

interface Environment {
  id: string;
  name: string;
  description: string;
  prompt: string;
  images: StoryImage[];
}

interface StoryObject {
  id: string;
  name: string;
  description: string;
  prompt: string;
  images: StoryImage[];
}

interface Shot {
  id: string;
  number: number;
  description: string;
  characterIds: string[];
  objectIds: string[];
  environmentId: string | null;
  cameraAngle: string;
  shotType: string;
  lighting: string;
  movement: string;
  prompt: string;
  images: StoryImage[];
}

interface Scene {
  id: string;
  name: string;
  description: string;
  characterIds: string[];
  objectIds: string[];
  environmentId: string | null;
  shots: Shot[];
}

interface Dialogue {
  id: string;
  sceneId: string;
  shotId: string | null;
  characterId: string;
  text: string;
  audioUrl?: string;
  timestamp?: string;
}

interface CharacterRelation {
  fromId: string;
  toId: string;
  relationship: string;
}

interface StoryProject {
  id: string;
  name: string;
  type: 'ai-movie' | 'normal-movie';
  genre: string;
  description: string;
  characters: Character[];
  environments: Environment[];
  objects: StoryObject[];
  scenes: Scene[];
  dialogues: Dialogue[];
  characterRelations: CharacterRelation[];
  script?: string;
  createdAt: string;
  updatedAt: string;
}

interface StorytellingTemplateProps {
  title?: string;
  notebookId?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Animation', 'Documentary'
];

const CAMERA_ANGLES = [
  'Eye Level', 'High Angle', 'Low Angle', 'Bird\'s Eye', 'Dutch Angle',
  'Over the Shoulder', 'Point of View'
];

const SHOT_TYPES = [
  'Extreme Wide Shot', 'Wide Shot', 'Full Shot', 'Medium Shot', 'Close-Up',
  'Extreme Close-Up', 'Two Shot', 'Over the Shoulder'
];

const LIGHTING = [
  'Natural', 'High Key', 'Low Key', 'Backlighting', 'Side Lighting',
  'Three-Point', 'Silhouette', 'Golden Hour', 'Blue Hour'
];

const CAMERA_MOVEMENTS = [
  'Static', 'Pan', 'Tilt', 'Zoom', 'Dolly', 'Tracking', 'Crane', 'Handheld', 'Steadicam'
];

// ─── Component ───────────────────────────────────────────────────────────────

export function StorytellingTemplate({ title = "Storytelling Studio", notebookId }: StorytellingTemplateProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'characters' | 'environments' | 'objects' | 'scenes' | 'mapping' | 'script' | 'dialogue' | 'ai' | 'translate'>('projects');
  
  // Multi-project state
  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState<{ name: string; type: 'ai-movie' | 'normal-movie'; genre: string; description: string }>({ 
    name: '', 
    type: 'normal-movie', 
    genre: 'Drama', 
    description: '' 
  });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Character state
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [characterForm, setCharacterForm] = useState({ name: '', description: '', prompt: '' });
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  
  // Environment state
  const [showEnvironmentForm, setShowEnvironmentForm] = useState(false);
  const [environmentForm, setEnvironmentForm] = useState({ name: '', description: '', prompt: '' });
  const [editingEnvironmentId, setEditingEnvironmentId] = useState<string | null>(null);
  
  // Object state
  const [showObjectForm, setShowObjectForm] = useState(false);
  const [objectForm, setObjectForm] = useState({ name: '', description: '', prompt: '' });
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);
  
  // Scene state
  const [showSceneForm, setShowSceneForm] = useState(false);
  const [sceneForm, setSceneForm] = useState({ name: '', description: '', characterIds: [] as string[], objectIds: [] as string[], environmentId: null as string | null });
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  
  // Shot state
  const [showShotForm, setShowShotForm] = useState(false);
  const [shotForm, setShotForm] = useState({
    number: 1, description: '', characterIds: [] as string[], objectIds: [] as string[],
    environmentId: null as string | null, cameraAngle: 'Eye Level', shotType: 'Medium Shot',
    lighting: 'Natural', movement: 'Static', prompt: ''
  });
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  
  // AI & Upload state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingType, setGeneratingType] = useState<string>('');
  const [uploadingFor, setUploadingFor] = useState<{ type: string; id: string } | null>(null);
  
  // Script state
  const [scriptText, setScriptText] = useState('');
  const [isParsingScript, setIsParsingScript] = useState(false);
  
  // Translation state
  const [translateText, setTranslateText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistence
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<StoryProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  // ─── Persistence ─────────────────────────────────────────────────────────────

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`storytelling-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [notebookId, activeProjectId]);

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`storytelling-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        setProjects(loadedProjects);
        projectsRef.current = loadedProjects;
        setActiveProjectId(data.activeProjectId || loadedProjects[0]?.id || null);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [projects, activeProjectId, saveData]);
  
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // ─── Project CRUD ────────────────────────────────────────────────────────────

  const updateProject = useCallback((updates: Partial<StoryProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activeProjectId]);

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject: StoryProject = {
      id: Date.now().toString(),
      name: projectForm.name.trim(),
      type: projectForm.type,
      genre: projectForm.genre,
      description: projectForm.description.trim(),
      characters: [],
      environments: [],
      objects: [],
      scenes: [],
      dialogues: [],
      characterRelations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowProjectForm(false);
    setProjectForm({ name: '', type: 'normal-movie', genre: 'Drama', description: '' });
  };

  const saveEditProject = () => {
    if (!editingProjectId || !projectForm.name.trim()) return;
    setProjects(prev => prev.map(p => 
      p.id === editingProjectId 
        ? { ...p, name: projectForm.name.trim(), type: projectForm.type, genre: projectForm.genre, description: projectForm.description.trim(), updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingProjectId(null);
    setProjectForm({ name: '', type: 'normal-movie', genre: 'Drama', description: '' });
  };

  const deleteProject = (id: string) => {
    const next = projects.filter(p => p.id !== id);
    if (activeProjectId === id) {
      setActiveProjectId(next[0]?.id ?? null);
    }
    setProjects(next);
    setConfirmDeleteId(null);
  };

  // ─── Character CRUD ──────────────────────────────────────────────────────────

  const createCharacter = () => {
    if (!characterForm.name.trim() || !activeProject) return;
    const newCharacter: Character = {
      id: Date.now().toString(),
      name: characterForm.name.trim(),
      description: characterForm.description.trim(),
      prompt: characterForm.prompt.trim(),
      images: [],
      storyboardImages: []
    };
    updateProject({ characters: [...activeProject.characters, newCharacter] });
    setShowCharacterForm(false);
    setCharacterForm({ name: '', description: '', prompt: '' });
  };

  const saveEditCharacter = () => {
    if (!editingCharacterId || !characterForm.name.trim() || !activeProject) return;
    updateProject({
      characters: activeProject.characters.map(c =>
        c.id === editingCharacterId
          ? { ...c, name: characterForm.name.trim(), description: characterForm.description.trim(), prompt: characterForm.prompt.trim() }
          : c
      )
    });
    setEditingCharacterId(null);
    setCharacterForm({ name: '', description: '', prompt: '' });
  };

  const deleteCharacter = (id: string) => {
    if (!activeProject) return;
    updateProject({ characters: activeProject.characters.filter(c => c.id !== id) });
  };

  const generateCharacterImages = async (characterId: string) => {
    const character = activeProject?.characters.find(c => c.id === characterId);
    if (!character || !character.prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratingType(`character-${characterId}`);
    
    try {
      // Simulate AI image generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newImage: StoryImage = {
        id: Date.now().toString(),
        url: `https://via.placeholder.com/400x600?text=${encodeURIComponent(character.name)}`,
        prompt: character.prompt,
        generatedByAI: true
      };
      
      updateProject({
        characters: activeProject!.characters.map(c =>
          c.id === characterId
            ? { ...c, images: [...c.images, newImage] }
            : c
        )
      });
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setGeneratingType('');
    }
  };

  // ─── Environment CRUD ────────────────────────────────────────────────────────

  const createEnvironment = () => {
    if (!environmentForm.name.trim() || !activeProject) return;
    const newEnvironment: Environment = {
      id: Date.now().toString(),
      name: environmentForm.name.trim(),
      description: environmentForm.description.trim(),
      prompt: environmentForm.prompt.trim(),
      images: []
    };
    updateProject({ environments: [...activeProject.environments, newEnvironment] });
    setShowEnvironmentForm(false);
    setEnvironmentForm({ name: '', description: '', prompt: '' });
  };

  const saveEditEnvironment = () => {
    if (!editingEnvironmentId || !environmentForm.name.trim() || !activeProject) return;
    updateProject({
      environments: activeProject.environments.map(e =>
        e.id === editingEnvironmentId
          ? { ...e, name: environmentForm.name.trim(), description: environmentForm.description.trim(), prompt: environmentForm.prompt.trim() }
          : e
      )
    });
    setEditingEnvironmentId(null);
    setEnvironmentForm({ name: '', description: '', prompt: '' });
  };

  const deleteEnvironment = (id: string) => {
    if (!activeProject) return;
    updateProject({ environments: activeProject.environments.filter(e => e.id !== id) });
  };

  // ─── Object CRUD ─────────────────────────────────────────────────────────────

  const createObject = () => {
    if (!objectForm.name.trim() || !activeProject) return;
    const newObject: StoryObject = {
      id: Date.now().toString(),
      name: objectForm.name.trim(),
      description: objectForm.description.trim(),
      prompt: objectForm.prompt.trim(),
      images: []
    };
    updateProject({ objects: [...activeProject.objects, newObject] });
    setShowObjectForm(false);
    setObjectForm({ name: '', description: '', prompt: '' });
  };

  const saveEditObject = () => {
    if (!editingObjectId || !objectForm.name.trim() || !activeProject) return;
    updateProject({
      objects: activeProject.objects.map(o =>
        o.id === editingObjectId
          ? { ...o, name: objectForm.name.trim(), description: objectForm.description.trim(), prompt: objectForm.prompt.trim() }
          : o
      )
    });
    setEditingObjectId(null);
    setObjectForm({ name: '', description: '', prompt: '' });
  };

  const deleteObject = (id: string) => {
    if (!activeProject) return;
    updateProject({ objects: activeProject.objects.filter(o => o.id !== id) });
  };

  // ─── Scene CRUD ──────────────────────────────────────────────────────────────

  const createScene = () => {
    if (!sceneForm.name.trim() || !activeProject) return;
    const newScene: Scene = {
      id: Date.now().toString(),
      name: sceneForm.name.trim(),
      description: sceneForm.description.trim(),
      characterIds: sceneForm.characterIds,
      objectIds: sceneForm.objectIds,
      environmentId: sceneForm.environmentId,
      shots: []
    };
    updateProject({ scenes: [...activeProject.scenes, newScene] });
    setShowSceneForm(false);
    setSceneForm({ name: '', description: '', characterIds: [], objectIds: [], environmentId: null });
  };

  const saveEditScene = () => {
    if (!editingSceneId || !sceneForm.name.trim() || !activeProject) return;
    updateProject({
      scenes: activeProject.scenes.map(s =>
        s.id === editingSceneId
          ? { ...s, name: sceneForm.name.trim(), description: sceneForm.description.trim(), characterIds: sceneForm.characterIds, objectIds: sceneForm.objectIds, environmentId: sceneForm.environmentId }
          : s
      )
    });
    setEditingSceneId(null);
    setSceneForm({ name: '', description: '', characterIds: [], objectIds: [], environmentId: null });
  };

  const deleteScene = (id: string) => {
    if (!activeProject) return;
    updateProject({ scenes: activeProject.scenes.filter(s => s.id !== id) });
  };

  // ─── Shot CRUD ───────────────────────────────────────────────────────────────

  const createShot = (sceneId: string) => {
    if (!shotForm.description.trim() || !activeProject) return;
    const scene = activeProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;
    
    const newShot: Shot = {
      id: Date.now().toString(),
      number: scene.shots.length + 1,
      description: shotForm.description.trim(),
      characterIds: shotForm.characterIds,
      objectIds: shotForm.objectIds,
      environmentId: shotForm.environmentId,
      cameraAngle: shotForm.cameraAngle,
      shotType: shotForm.shotType,
      lighting: shotForm.lighting,
      movement: shotForm.movement,
      prompt: shotForm.prompt.trim(),
      images: []
    };
    
    updateProject({
      scenes: activeProject.scenes.map(s =>
        s.id === sceneId
          ? { ...s, shots: [...s.shots, newShot] }
          : s
      )
    });
    setShowShotForm(false);
    setShotForm({
      number: 1, description: '', characterIds: [], objectIds: [],
      environmentId: null, cameraAngle: 'Eye Level', shotType: 'Medium Shot',
      lighting: 'Natural', movement: 'Static', prompt: ''
    });
  };

  const deleteShot = (sceneId: string, shotId: string) => {
    if (!activeProject) return;
    updateProject({
      scenes: activeProject.scenes.map(s =>
        s.id === sceneId
          ? { ...s, shots: s.shots.filter(shot => shot.id !== shotId) }
          : s
      )
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-neutral-950 dark:to-neutral-900">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">
                  {activeProject ? `${activeProject.type === 'ai-movie' ? 'AI' : 'Normal'} Movie · ${activeProject.genre}` : 'No project selected'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl overflow-x-auto">
              {[
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'characters', label: 'Characters', icon: Users },
                { id: 'environments', label: 'Environments', icon: MapPin },
                { id: 'objects', label: 'Objects', icon: Box },
                { id: 'scenes', label: 'Scenes', icon: Clapperboard },
                { id: 'mapping', label: 'Mapping', icon: Users },
                { id: 'script', label: 'Script', icon: FileText },
                { id: 'dialogue', label: 'Dialogue', icon: Music },
                { id: 'ai', label: 'AI Assistant', icon: Wand2 },
                { id: 'translate', label: 'Translate', icon: Languages },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-purple-600 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Story Projects</h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            </div>

            {/* Project Form */}
            {(showProjectForm || editingProjectId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingProjectId ? 'Edit Project' : 'Create New Project'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Project Name</label>
                    <input
                      type="text"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                      placeholder="Enter project name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Type</label>
                    <select
                      value={projectForm.type}
                      onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value as ('ai-movie' | 'normal-movie') })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="normal-movie">Normal Movie</option>
                      <option value="ai-movie">AI Movie</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Genre</label>
                    <select
                      value={projectForm.genre}
                      onChange={(e) => setProjectForm({ ...projectForm, genre: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Brief description of your story..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingProjectId ? saveEditProject : createProject}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg"
                  >
                    {editingProjectId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProjectId(null);
                      setProjectForm({ name: '', type: 'normal-movie', genre: 'Drama', description: '' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Project List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`bg-white dark:bg-neutral-900 rounded-2xl p-6 border-2 transition-all cursor-pointer group ${
                    activeProjectId === project.id
                      ? 'border-purple-500 shadow-lg'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-purple-300'
                  }`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Film className="w-5 h-5 text-purple-500" />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.type === 'ai-movie'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {project.type === 'ai-movie' ? 'AI' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectId(project.id);
                          setProjectForm({
                            name: project.name,
                            type: project.type,
                            genre: project.genre,
                            description: project.description
                          });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {projects.length > 1 && (
                        confirmDeleteId === project.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                              className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(project.id); }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{project.name}</h3>
                  <p className="text-xs text-neutral-500 mb-3">{project.genre}</p>
                  {project.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">{project.description}</p>
                  )}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="font-bold text-purple-600">{project.characters.length}</p>
                      <p className="text-neutral-400">Characters</p>
                    </div>
                    <div>
                      <p className="font-bold text-green-600">{project.environments.length}</p>
                      <p className="text-neutral-400">Locations</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600">{project.objects.length}</p>
                      <p className="text-neutral-400">Objects</p>
                    </div>
                    <div>
                      <p className="font-bold text-orange-600">{project.scenes.length}</p>
                      <p className="text-neutral-400">Scenes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Film className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No story projects yet</p>
                <p className="text-sm">Create your first project to start storytelling</p>
              </div>
            )}
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Characters</h2>
              <button
                onClick={() => setShowCharacterForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Character
              </button>
            </div>

            {(showCharacterForm || editingCharacterId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingCharacterId ? 'Edit Character' : 'Create Character'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Name</label>
                    <input
                      type="text"
                      value={characterForm.name}
                      onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                      placeholder="Character name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={characterForm.description}
                      onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
                      placeholder="Character description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">AI Prompt (for image generation)</label>
                    <textarea
                      value={characterForm.prompt}
                      onChange={(e) => setCharacterForm({ ...characterForm, prompt: e.target.value })}
                      placeholder="Detailed prompt for AI image generation..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingCharacterId ? saveEditCharacter : createCharacter}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg"
                  >
                    {editingCharacterId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCharacterForm(false);
                      setEditingCharacterId(null);
                      setCharacterForm({ name: '', description: '', prompt: '' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject.characters.map(character => (
                <div key={character.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingCharacterId(character.id);
                          setCharacterForm({
                            name: character.name,
                            description: character.description,
                            prompt: character.prompt
                          });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCharacter(character.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{character.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{character.description}</p>
                  {character.prompt && (
                    <button
                      onClick={() => generateCharacterImages(character.id)}
                      disabled={isGenerating}
                      className="w-full px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
                    >
                      {isGenerating && generatingType === `character-${character.id}` ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Image</>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {activeProject.characters.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No characters yet</p>
                <p className="text-sm">Add characters to your story</p>
              </div>
            )}
          </div>
        )}

        {/* Environments Tab */}
        {activeTab === 'environments' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Environments</h2>
              <button
                onClick={() => setShowEnvironmentForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Environment
              </button>
            </div>

            {(showEnvironmentForm || editingEnvironmentId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingEnvironmentId ? 'Edit Environment' : 'Create Environment'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Name</label>
                    <input
                      type="text"
                      value={environmentForm.name}
                      onChange={(e) => setEnvironmentForm({ ...environmentForm, name: e.target.value })}
                      placeholder="Environment name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={environmentForm.description}
                      onChange={(e) => setEnvironmentForm({ ...environmentForm, description: e.target.value })}
                      placeholder="Environment description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">AI Prompt</label>
                    <textarea
                      value={environmentForm.prompt}
                      onChange={(e) => setEnvironmentForm({ ...environmentForm, prompt: e.target.value })}
                      placeholder="Detailed prompt for AI image generation..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingEnvironmentId ? saveEditEnvironment : createEnvironment}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg"
                  >
                    {editingEnvironmentId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEnvironmentForm(false);
                      setEditingEnvironmentId(null);
                      setEnvironmentForm({ name: '', description: '', prompt: '' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject.environments.map(env => (
                <div key={env.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingEnvironmentId(env.id);
                          setEnvironmentForm({
                            name: env.name,
                            description: env.description,
                            prompt: env.prompt
                          });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEnvironment(env.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{env.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{env.description}</p>
                </div>
              ))}
            </div>

            {activeProject.environments.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No environments yet</p>
                <p className="text-sm">Add locations and settings to your story</p>
              </div>
            )}
          </div>
        )}

        {/* Objects Tab */}
        {activeTab === 'objects' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Objects</h2>
              <button
                onClick={() => setShowObjectForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Object
              </button>
            </div>

            {(showObjectForm || editingObjectId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingObjectId ? 'Edit Object' : 'Create Object'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Name</label>
                    <input
                      type="text"
                      value={objectForm.name}
                      onChange={(e) => setObjectForm({ ...objectForm, name: e.target.value })}
                      placeholder="Object name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={objectForm.description}
                      onChange={(e) => setObjectForm({ ...objectForm, description: e.target.value })}
                      placeholder="Object description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">AI Prompt</label>
                    <textarea
                      value={objectForm.prompt}
                      onChange={(e) => setObjectForm({ ...objectForm, prompt: e.target.value })}
                      placeholder="Detailed prompt for AI image generation..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingObjectId ? saveEditObject : createObject}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    {editingObjectId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowObjectForm(false);
                      setEditingObjectId(null);
                      setObjectForm({ name: '', description: '', prompt: '' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject.objects.map(obj => (
                <div key={obj.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <Box className="w-5 h-5 text-blue-500" />
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingObjectId(obj.id);
                          setObjectForm({
                            name: obj.name,
                            description: obj.description,
                            prompt: obj.prompt
                          });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteObject(obj.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{obj.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{obj.description}</p>
                </div>
              ))}
            </div>

            {activeProject.objects.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Box className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No objects yet</p>
                <p className="text-sm">Add props and items to your story</p>
              </div>
            )}
          </div>
        )}

        {/* Scenes Tab */}
        {activeTab === 'scenes' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Scenes</h2>
              <button
                onClick={() => setShowSceneForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Scene
              </button>
            </div>

            {(showSceneForm || editingSceneId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingSceneId ? 'Edit Scene' : 'Create Scene'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Scene Name</label>
                    <input
                      type="text"
                      value={sceneForm.name}
                      onChange={(e) => setSceneForm({ ...sceneForm, name: e.target.value })}
                      placeholder="Scene name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={sceneForm.description}
                      onChange={(e) => setSceneForm({ ...sceneForm, description: e.target.value })}
                      placeholder="Scene description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingSceneId ? saveEditScene : createScene}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg"
                  >
                    {editingSceneId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSceneForm(false);
                      setEditingSceneId(null);
                      setSceneForm({ name: '', description: '', characterIds: [], objectIds: [], environmentId: null });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {activeProject.scenes.map(scene => (
                <div key={scene.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clapperboard className="w-5 h-5 text-orange-500" />
                      <h3 className="font-bold text-neutral-900 dark:text-white">{scene.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingSceneId(scene.id);
                          setSceneForm({
                            name: scene.name,
                            description: scene.description,
                            characterIds: scene.characterIds,
                            objectIds: scene.objectIds,
                            environmentId: scene.environmentId
                          });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteScene(scene.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{scene.description}</p>
                  <div className="text-xs text-neutral-500">
                    {scene.shots.length} shot{scene.shots.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>

            {activeProject.scenes.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No scenes yet</p>
                <p className="text-sm">Add scenes to structure your story</p>
              </div>
            )}
          </div>
        )}

        {/* Placeholder for other tabs */}
        {['mapping', 'script', 'dialogue', 'ai', 'translate'].includes(activeTab) && activeProject && (
          <div className="text-center py-20 text-neutral-400">
            <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Coming Soon</p>
            <p className="text-sm">This feature is under development</p>
          </div>
        )}

        {activeTab !== 'projects' && !activeProject && (
          <div className="text-center py-20 text-neutral-400">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No project selected</p>
            <p className="text-sm">Select or create a project to continue</p>
          </div>
        )}
      </div>
    </div>
  );
}
