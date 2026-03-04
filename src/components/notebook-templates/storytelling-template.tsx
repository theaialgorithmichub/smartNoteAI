"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import {
  Film, Plus, Loader2, Trash2, Edit3, X, Upload, Sparkles,
  Users, MapPin, Box, Clapperboard, Camera, Image as ImageIcon,
  ChevronDown, ChevronRight, FolderOpen, Save, FileText, Music,
  Languages, Wand2, Network, Volume2
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StoryImage {
  id: string;
  url: string;
  prompt?: string;
  generatedByAI: boolean;
}

interface CharacterRelationship {
  id: string;
  fromCharacterId: string;
  toCharacterId: string;
  relationship: string;
  description: string;
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

interface Character {
  id: string;
  name: string;
  description: string;
  prompt: string;
  images: StoryImage[];
  storyboardImages: StoryImage[];
  x?: number;
  y?: number;
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
  cameraMovement: string;
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
  relationships: CharacterRelationship[];
  dialogues: Dialogue[];
  script: string;
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
  'Eye Level', 'High Angle', 'Low Angle', 'Bird\'s Eye View', 'Dutch Angle',
  'Over the Shoulder', 'Point of View (POV)', 'Worm\'s Eye View'
];

const SHOT_TYPES = [
  'Extreme Wide Shot (EWS)', 'Wide Shot (WS)', 'Full Shot (FS)', 
  'Medium Wide Shot (MWS)', 'Medium Shot (MS)', 'Medium Close-Up (MCU)',
  'Close-Up (CU)', 'Extreme Close-Up (ECU)', 'Two Shot', 'Over the Shoulder (OTS)'
];

const LIGHTING = [
  'Natural Light', 'High Key', 'Low Key', 'Backlighting', 'Side Lighting',
  'Three-Point Lighting', 'Silhouette', 'Golden Hour', 'Blue Hour',
  'Practical Lighting', 'Hard Light', 'Soft Light'
];

const CAMERA_MOVEMENTS = [
  'Static', 'Pan (Left/Right)', 'Tilt (Up/Down)', 'Zoom In', 'Zoom Out',
  'Dolly In', 'Dolly Out', 'Tracking Shot', 'Crane Shot', 'Handheld',
  'Steadicam', 'Aerial Shot', 'Whip Pan'
];

// ─── Component ───────────────────────────────────────────────────────────────

export function StorytellingTemplate({ title = "Story Studio", notebookId }: StorytellingTemplateProps) {
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
  const [sceneForm, setSceneForm] = useState({ 
    name: '', 
    description: '', 
    characterIds: [] as string[], 
    objectIds: [] as string[], 
    environmentId: null as string | null 
  });
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  
  // Shot state
  const [showShotForm, setShowShotForm] = useState<string | null>(null);
  const [shotForm, setShotForm] = useState({
    description: '', 
    characterIds: [] as string[], 
    objectIds: [] as string[],
    environmentId: null as string | null, 
    cameraAngle: 'Eye Level', 
    shotType: 'Medium Shot (MS)',
    lighting: 'Natural Light', 
    cameraMovement: 'Static', 
    prompt: ''
  });
  const [editingShotId, setEditingShotId] = useState<string | null>(null);
  
  // Relationship state
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [relationshipForm, setRelationshipForm] = useState({ fromCharacterId: '', toCharacterId: '', relationship: '', description: '' });
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null);
  
  // Dialogue state
  const [showDialogueForm, setShowDialogueForm] = useState(false);
  const [dialogueForm, setDialogueForm] = useState({ sceneId: '', shotId: null as string | null, characterId: '', text: '' });
  const [editingDialogueId, setEditingDialogueId] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Script state
  const [scriptText, setScriptText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const scriptFileInputRef = useRef<HTMLInputElement>(null);
  
  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  // Translation state
  const [translateInput, setTranslateInput] = useState('');
  const [translateOutput, setTranslateOutput] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('Malayalam');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  
  // AI & Upload state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<{ type: string; id: string; imageType?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<{ type: string; id: string; imageType?: string } | null>(null);
  
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
        localStorage.setItem(`storytelling-${notebookId}`, JSON.stringify({ 
          projects: projectsRef.current, 
          activeProjectId 
        }));
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

  // ─── Helper: Update Project ──────────────────────────────────────────────────

  const updateProject = useCallback((updates: Partial<StoryProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activeProjectId]);

  // ─── Project CRUD ────────────────────────────────────────────────────────────

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
      relationships: [],
      dialogues: [],
      script: '',
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
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectId(remaining[0]?.id || null);
    }
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
          ? { 
              ...s, 
              name: sceneForm.name.trim(), 
              description: sceneForm.description.trim(), 
              characterIds: sceneForm.characterIds, 
              objectIds: sceneForm.objectIds, 
              environmentId: sceneForm.environmentId 
            }
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
      cameraMovement: shotForm.cameraMovement,
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
    setShowShotForm(null);
    setShotForm({
      description: '', characterIds: [], objectIds: [],
      environmentId: null, cameraAngle: 'Eye Level', shotType: 'Medium Shot (MS)',
      lighting: 'Natural Light', cameraMovement: 'Static', prompt: ''
    });
  };

  const deleteShot = (sceneId: string, shotId: string) => {
    if (!activeProject) return;
    updateProject({
      scenes: activeProject.scenes.map(s =>
        s.id === sceneId
          ? { ...s, shots: s.shots.filter(shot => shot.id !== shotId).map((shot, idx) => ({ ...shot, number: idx + 1 })) }
          : s
      )
    });
  };

  // ─── Image Upload ────────────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !uploadingFor || !activeProject) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImage: StoryImage = {
          id: Date.now().toString() + Math.random(),
          url,
          generatedByAI: false
        };

        const { type, id, imageType } = uploadingFor;

        if (type === 'character') {
          updateProject({
            characters: activeProject.characters.map(c =>
              c.id === id
                ? imageType === 'storyboard'
                  ? { ...c, storyboardImages: [...c.storyboardImages, newImage] }
                  : { ...c, images: [...c.images, newImage] }
                : c
            )
          });
        } else if (type === 'environment') {
          updateProject({
            environments: activeProject.environments.map(e =>
              e.id === id ? { ...e, images: [...e.images, newImage] } : e
            )
          });
        } else if (type === 'object') {
          updateProject({
            objects: activeProject.objects.map(o =>
              o.id === id ? { ...o, images: [...o.images, newImage] } : o
            )
          });
        } else if (type === 'shot') {
          updateProject({
            scenes: activeProject.scenes.map(scene => ({
              ...scene,
              shots: scene.shots.map(shot =>
                shot.id === id ? { ...shot, images: [...shot.images, newImage] } : shot
              )
            }))
          });
        }
      };
      reader.readAsDataURL(file);
    });

    setUploadingFor(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerImageUpload = (type: string, id: string, imageType?: string) => {
    setUploadingFor({ type, id, imageType });
    fileInputRef.current?.click();
  };

  // ─── AI Image Generation ─────────────────────────────────────────────────────

  const generateImages = async (type: string, id: string, prompt: string, imageType?: string) => {
    if (!prompt.trim() || !activeProject) return;
    
    setIsGenerating(true);
    setGeneratingFor({ type, id, imageType });
    
    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newImage: StoryImage = {
        id: Date.now().toString(),
        url: `https://via.placeholder.com/800x600?text=${encodeURIComponent(prompt.substring(0, 30))}`,
        prompt,
        generatedByAI: true
      };

      if (type === 'character') {
        updateProject({
          characters: activeProject.characters.map(c =>
            c.id === id
              ? imageType === 'storyboard'
                ? { ...c, storyboardImages: [...c.storyboardImages, newImage] }
                : { ...c, images: [...c.images, newImage] }
              : c
          )
        });
      } else if (type === 'environment') {
        updateProject({
          environments: activeProject.environments.map(e =>
            e.id === id ? { ...e, images: [...e.images, newImage] } : e
          )
        });
      } else if (type === 'object') {
        updateProject({
          objects: activeProject.objects.map(o =>
            o.id === id ? { ...o, images: [...o.images, newImage] } : o
          )
        });
      } else if (type === 'shot') {
        updateProject({
          scenes: activeProject.scenes.map(scene => ({
            ...scene,
            shots: scene.shots.map(shot =>
              shot.id === id ? { ...shot, images: [...shot.images, newImage] } : shot
            )
          }))
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setGeneratingFor(null);
    }
  };

  // ─── Delete Image ────────────────────────────────────────────────────────────

  const deleteImage = (type: string, itemId: string, imageId: string, imageType?: string) => {
    if (!activeProject) return;

    if (type === 'character') {
      updateProject({
        characters: activeProject.characters.map(c =>
          c.id === itemId
            ? imageType === 'storyboard'
              ? { ...c, storyboardImages: c.storyboardImages.filter(img => img.id !== imageId) }
              : { ...c, images: c.images.filter(img => img.id !== imageId) }
            : c
        )
      });
    } else if (type === 'environment') {
      updateProject({
        environments: activeProject.environments.map(e =>
          e.id === itemId ? { ...e, images: e.images.filter(img => img.id !== imageId) } : e
        )
      });
    } else if (type === 'object') {
      updateProject({
        objects: activeProject.objects.map(o =>
          o.id === itemId ? { ...o, images: o.images.filter(img => img.id !== imageId) } : o
        )
      });
    } else if (type === 'shot') {
      updateProject({
        scenes: activeProject.scenes.map(scene => ({
          ...scene,
          shots: scene.shots.map(shot =>
            shot.id === itemId ? { ...shot, images: shot.images.filter(img => img.id !== imageId) } : shot
          )
        }))
      });
    }
  };

  // ─── Multi-Select Helpers ────────────────────────────────────────────────────

  const toggleSelection = (array: string[], id: string) => {
    return array.includes(id) ? array.filter(i => i !== id) : [...array, id];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-neutral-950 dark:to-neutral-900">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

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
                { id: 'mapping', label: 'Mapping', icon: Network },
                { id: 'script', label: 'Script', icon: FileText },
                { id: 'dialogue', label: 'Dialogue', icon: Volume2 },
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
                    <label className="text-sm text-neutral-500 mb-1 block">Project Name *</label>
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
                      onChange={(e) => setProjectForm({ ...projectForm, type: e.target.value as 'ai-movie' | 'normal-movie' })}
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
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    {editingProjectId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProjectId(null);
                      setProjectForm({ name: '', type: 'normal-movie', genre: 'Drama', description: '' });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
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
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
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
                        <button
                          onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project?')) deleteProject(project.id); }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
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
                      <p className="text-neutral-400">Chars</p>
                    </div>
                    <div>
                      <p className="font-bold text-green-600">{project.environments.length}</p>
                      <p className="text-neutral-400">Envs</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600">{project.objects.length}</p>
                      <p className="text-neutral-400">Objs</p>
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

            {/* Character Form */}
            {(showCharacterForm || editingCharacterId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingCharacterId ? 'Edit Character' : 'Create Character'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Name *</label>
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
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    {editingCharacterId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCharacterForm(false);
                      setEditingCharacterId(null);
                      setCharacterForm({ name: '', description: '', prompt: '' });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Character List */}
            <div className="grid grid-cols-1 gap-6">
              {activeProject.characters.map(character => (
                <div key={character.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-500" />
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{character.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{character.description}</p>
                      </div>
                    </div>
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
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this character?')) deleteCharacter(character.id); }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Character Images */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Character Images</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => triggerImageUpload('character', character.id)}
                            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </button>
                          {character.prompt && (
                            <button
                              onClick={() => generateImages('character', character.id, character.prompt)}
                              disabled={isGenerating && generatingFor?.type === 'character' && generatingFor?.id === character.id && !generatingFor?.imageType}
                              className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
                            >
                              {isGenerating && generatingFor?.type === 'character' && generatingFor?.id === character.id && !generatingFor?.imageType ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Generate AI</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {character.images.map(img => (
                          <div key={img.id} className="relative group">
                            <img src={img.url} alt="" className="w-full h-32 object-cover rounded-lg" />
                            <button
                              onClick={() => deleteImage('character', character.id, img.id)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {img.generatedByAI && (
                              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded">AI</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Storyboard Reference Images */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Storyboard References</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => triggerImageUpload('character', character.id, 'storyboard')}
                            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </button>
                          {character.prompt && (
                            <button
                              onClick={() => generateImages('character', character.id, character.prompt, 'storyboard')}
                              disabled={isGenerating && generatingFor?.type === 'character' && generatingFor?.id === character.id && generatingFor?.imageType === 'storyboard'}
                              className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm flex items-center gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
                            >
                              {isGenerating && generatingFor?.type === 'character' && generatingFor?.id === character.id && generatingFor?.imageType === 'storyboard' ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Generate AI</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {character.storyboardImages.map(img => (
                          <div key={img.id} className="relative group">
                            <img src={img.url} alt="" className="w-full h-32 object-cover rounded-lg" />
                            <button
                              onClick={() => deleteImage('character', character.id, img.id, 'storyboard')}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {img.generatedByAI && (
                              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded">AI</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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

            {/* Environment Form */}
            {(showEnvironmentForm || editingEnvironmentId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingEnvironmentId ? 'Edit Environment' : 'Create Environment'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Name *</label>
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
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    {editingEnvironmentId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowEnvironmentForm(false);
                      setEditingEnvironmentId(null);
                      setEnvironmentForm({ name: '', description: '', prompt: '' });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Environment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProject.environments.map(env => (
                <div key={env.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{env.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{env.description}</p>
                      </div>
                    </div>
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
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this environment?')) deleteEnvironment(env.id); }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Images</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerImageUpload('environment', env.id)}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      {env.prompt && (
                        <button
                          onClick={() => generateImages('environment', env.id, env.prompt)}
                          disabled={isGenerating && generatingFor?.type === 'environment' && generatingFor?.id === env.id}
                          className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center gap-2 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50"
                        >
                          {isGenerating && generatingFor?.type === 'environment' && generatingFor?.id === env.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Generate AI</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {env.images.map(img => (
                      <div key={img.id} className="relative group">
                        <img src={img.url} alt="" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          onClick={() => deleteImage('environment', env.id, img.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {img.generatedByAI && (
                          <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded">AI</span>
                        )}
                      </div>
                    ))}
                  </div>
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

            {/* Object Form */}
            {(showObjectForm || editingObjectId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingObjectId ? 'Edit Object' : 'Create Object'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Name *</label>
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
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingObjectId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowObjectForm(false);
                      setEditingObjectId(null);
                      setObjectForm({ name: '', description: '', prompt: '' });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Object List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeProject.objects.map(obj => (
                <div key={obj.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Box className="w-6 h-6 text-blue-500" />
                      <div>
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{obj.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{obj.description}</p>
                      </div>
                    </div>
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
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this object?')) deleteObject(obj.id); }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Images</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerImageUpload('object', obj.id)}
                        className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm flex items-center gap-2 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Upload className="w-4 h-4" />
                        Upload
                      </button>
                      {obj.prompt && (
                        <button
                          onClick={() => generateImages('object', obj.id, obj.prompt)}
                          disabled={isGenerating && generatingFor?.type === 'object' && generatingFor?.id === obj.id}
                          className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50"
                        >
                          {isGenerating && generatingFor?.type === 'object' && generatingFor?.id === obj.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Generate AI</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {obj.images.map(img => (
                      <div key={img.id} className="relative group">
                        <img src={img.url} alt="" className="w-full h-32 object-cover rounded-lg" />
                        <button
                          onClick={() => deleteImage('object', obj.id, img.id)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {img.generatedByAI && (
                          <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">AI</span>
                        )}
                      </div>
                    ))}
                  </div>
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

            {/* Scene Form */}
            {(showSceneForm || editingSceneId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingSceneId ? 'Edit Scene' : 'Create Scene'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Scene Name *</label>
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
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Characters in Scene</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      {activeProject.characters.map(char => (
                        <label key={char.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sceneForm.characterIds.includes(char.id)}
                            onChange={() => setSceneForm({ ...sceneForm, characterIds: toggleSelection(sceneForm.characterIds, char.id) })}
                            className="rounded"
                          />
                          <span className="text-sm">{char.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Objects in Scene</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      {activeProject.objects.map(obj => (
                        <label key={obj.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sceneForm.objectIds.includes(obj.id)}
                            onChange={() => setSceneForm({ ...sceneForm, objectIds: toggleSelection(sceneForm.objectIds, obj.id) })}
                            className="rounded"
                          />
                          <span className="text-sm">{obj.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Environment</label>
                    <select
                      value={sceneForm.environmentId || ''}
                      onChange={(e) => setSceneForm({ ...sceneForm, environmentId: e.target.value || null })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="">None</option>
                      {activeProject.environments.map(env => (
                        <option key={env.id} value={env.id}>{env.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingSceneId ? saveEditScene : createScene}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingSceneId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowSceneForm(false);
                      setEditingSceneId(null);
                      setSceneForm({ name: '', description: '', characterIds: [], objectIds: [], environmentId: null });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Scene List */}
            <div className="space-y-4">
              {activeProject.scenes.map(scene => (
                <div key={scene.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => setExpandedScenes(prev => {
                          const next = new Set(prev);
                          if (next.has(scene.id)) next.delete(scene.id);
                          else next.add(scene.id);
                          return next;
                        })}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        {expandedScenes.has(scene.id) ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>
                      <Clapperboard className="w-6 h-6 text-orange-500" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{scene.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{scene.description}</p>
                        <div className="flex gap-2 mt-2 text-xs text-neutral-500">
                          <span>{scene.characterIds.length} characters</span>
                          <span>•</span>
                          <span>{scene.objectIds.length} objects</span>
                          <span>•</span>
                          <span>{scene.shots.length} shots</span>
                        </div>
                      </div>
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
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this scene?')) deleteScene(scene.id); }}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Shots */}
                  {expandedScenes.has(scene.id) && (
                    <div className="ml-8 mt-4 space-y-4 border-l-2 border-neutral-200 dark:border-neutral-700 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">Shots</h4>
                        <button
                          onClick={() => setShowShotForm(scene.id)}
                          className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm flex items-center gap-2 hover:bg-orange-200 dark:hover:bg-orange-900/50"
                        >
                          <Plus className="w-4 h-4" />
                          Add Shot
                        </button>
                      </div>

                      {/* Shot Form */}
                      {showShotForm === scene.id && (
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 space-y-3">
                          <h5 className="font-semibold text-sm">Create Shot #{scene.shots.length + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="text-xs text-neutral-500 mb-1 block">Description *</label>
                              <textarea
                                value={shotForm.description}
                                onChange={(e) => setShotForm({ ...shotForm, description: e.target.value })}
                                placeholder="Shot description..."
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm resize-none"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-neutral-500 mb-1 block">Camera Angle</label>
                              <select
                                value={shotForm.cameraAngle}
                                onChange={(e) => setShotForm({ ...shotForm, cameraAngle: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm"
                              >
                                {CAMERA_ANGLES.map(angle => (
                                  <option key={angle} value={angle}>{angle}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-neutral-500 mb-1 block">Shot Type</label>
                              <select
                                value={shotForm.shotType}
                                onChange={(e) => setShotForm({ ...shotForm, shotType: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm"
                              >
                                {SHOT_TYPES.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-neutral-500 mb-1 block">Lighting</label>
                              <select
                                value={shotForm.lighting}
                                onChange={(e) => setShotForm({ ...shotForm, lighting: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm"
                              >
                                {LIGHTING.map(light => (
                                  <option key={light} value={light}>{light}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-neutral-500 mb-1 block">Camera Movement</label>
                              <select
                                value={shotForm.cameraMovement}
                                onChange={(e) => setShotForm({ ...shotForm, cameraMovement: e.target.value })}
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm"
                              >
                                {CAMERA_MOVEMENTS.map(movement => (
                                  <option key={movement} value={movement}>{movement}</option>
                                ))}
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs text-neutral-500 mb-1 block">AI Prompt</label>
                              <textarea
                                value={shotForm.prompt}
                                onChange={(e) => setShotForm({ ...shotForm, prompt: e.target.value })}
                                placeholder="Detailed prompt for AI image generation..."
                                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 rounded-lg outline-none text-sm resize-none"
                                rows={2}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => createShot(scene.id)}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                            >
                              Create Shot
                            </button>
                            <button
                              onClick={() => {
                                setShowShotForm(null);
                                setShotForm({
                                  description: '', characterIds: [], objectIds: [],
                                  environmentId: null, cameraAngle: 'Eye Level', shotType: 'Medium Shot (MS)',
                                  lighting: 'Natural Light', cameraMovement: 'Static', prompt: ''
                                });
                              }}
                              className="px-4 py-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Shot List */}
                      {scene.shots.map(shot => (
                        <div key={shot.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Camera className="w-5 h-5 text-orange-500" />
                              <span className="font-semibold text-sm">Shot #{shot.number}</span>
                            </div>
                            <button
                              onClick={() => deleteShot(scene.id, shot.id)}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">{shot.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 mb-3">
                            <div><span className="font-medium">Angle:</span> {shot.cameraAngle}</div>
                            <div><span className="font-medium">Type:</span> {shot.shotType}</div>
                            <div><span className="font-medium">Lighting:</span> {shot.lighting}</div>
                            <div><span className="font-medium">Movement:</span> {shot.cameraMovement}</div>
                          </div>
                          
                          {/* Shot Images */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Images</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => triggerImageUpload('shot', shot.id)}
                                  className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded text-xs flex items-center gap-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  Upload
                                </button>
                                {shot.prompt && (
                                  <button
                                    onClick={() => generateImages('shot', shot.id, shot.prompt)}
                                    disabled={isGenerating && generatingFor?.type === 'shot' && generatingFor?.id === shot.id}
                                    className="px-2 py-1 bg-orange-200 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-xs flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {isGenerating && generatingFor?.type === 'shot' && generatingFor?.id === shot.id ? (
                                      <><Loader2 className="w-3 h-3 animate-spin" /> Gen...</>
                                    ) : (
                                      <><Sparkles className="w-3 h-3" /> AI</>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {shot.images.map(img => (
                                <div key={img.id} className="relative group">
                                  <img src={img.url} alt="" className="w-full h-20 object-cover rounded-lg" />
                                  <button
                                    onClick={() => deleteImage('shot', shot.id, img.id)}
                                    className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-2 h-2" />
                                  </button>
                                  {img.generatedByAI && (
                                    <span className="absolute bottom-0.5 left-0.5 px-1 py-0.5 bg-orange-500 text-white text-[10px] rounded">AI</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

        {/* Character Mapping Tab */}
        {activeTab === 'mapping' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Character Mapping</h2>
              <button
                onClick={() => setShowRelationshipForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Relationship
              </button>
            </div>

            {/* Relationship Form */}
            {showRelationshipForm && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Create Relationship</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">From Character</label>
                    <select
                      value={relationshipForm.fromCharacterId}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, fromCharacterId: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="">Select character</option>
                      {activeProject.characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">To Character</label>
                    <select
                      value={relationshipForm.toCharacterId}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, toCharacterId: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="">Select character</option>
                      {activeProject.characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Relationship Type</label>
                    <input
                      type="text"
                      value={relationshipForm.relationship}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, relationship: e.target.value })}
                      placeholder="e.g., Friend, Enemy, Mentor, etc."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <input
                      type="text"
                      value={relationshipForm.description}
                      onChange={(e) => setRelationshipForm({ ...relationshipForm, description: e.target.value })}
                      placeholder="Brief description"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (relationshipForm.fromCharacterId && relationshipForm.toCharacterId && relationshipForm.relationship) {
                        const newRel: CharacterRelationship = {
                          id: Date.now().toString(),
                          fromCharacterId: relationshipForm.fromCharacterId,
                          toCharacterId: relationshipForm.toCharacterId,
                          relationship: relationshipForm.relationship,
                          description: relationshipForm.description
                        };
                        updateProject({ relationships: [...(activeProject.relationships || []), newRel] });
                        setShowRelationshipForm(false);
                        setRelationshipForm({ fromCharacterId: '', toCharacterId: '', relationship: '', description: '' });
                      }
                    }}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowRelationshipForm(false);
                      setRelationshipForm({ fromCharacterId: '', toCharacterId: '', relationship: '', description: '' });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Visualization */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <div className="relative w-full h-[600px] bg-neutral-50 dark:bg-neutral-800 rounded-xl overflow-hidden">
                <svg className="w-full h-full">
                  {/* Draw relationship lines */}
                  {(activeProject.relationships || []).map(rel => {
                    const fromChar = activeProject.characters.find(c => c.id === rel.fromCharacterId);
                    const toChar = activeProject.characters.find(c => c.id === rel.toCharacterId);
                    if (!fromChar || !toChar) return null;
                    const fromX = (fromChar.x || 100) + 50;
                    const fromY = (fromChar.y || 100) + 50;
                    const toX = (toChar.x || 200) + 50;
                    const toY = (toChar.y || 200) + 50;
                    return (
                      <g key={rel.id}>
                        <line
                          x1={fromX}
                          y1={fromY}
                          x2={toX}
                          y2={toY}
                          stroke="#ec4899"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        <text
                          x={(fromX + toX) / 2}
                          y={(fromY + toY) / 2}
                          fill="#ec4899"
                          fontSize="12"
                          textAnchor="middle"
                        >
                          {rel.relationship}
                        </text>
                      </g>
                    );
                  })}
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#ec4899" />
                    </marker>
                  </defs>
                </svg>
                
                {/* Character nodes */}
                {activeProject.characters.map((char, idx) => (
                  <div
                    key={char.id}
                    className="absolute w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-move shadow-lg"
                    style={{
                      left: char.x || (100 + idx * 150),
                      top: char.y || (100 + (idx % 3) * 150)
                    }}
                    draggable
                    onDragEnd={(e) => {
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (rect) {
                        const x = e.clientX - rect.left - 50;
                        const y = e.clientY - rect.top - 50;
                        updateProject({
                          characters: activeProject.characters.map(c =>
                            c.id === char.id ? { ...c, x, y } : c
                          )
                        });
                      }
                    }}
                  >
                    {char.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Relationships</h3>
              {(activeProject.relationships || []).map(rel => {
                const fromChar = activeProject.characters.find(c => c.id === rel.fromCharacterId);
                const toChar = activeProject.characters.find(c => c.id === rel.toCharacterId);
                return (
                  <div key={rel.id} className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {fromChar?.name} → {toChar?.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {rel.relationship} {rel.description && `• ${rel.description}`}
                      </p>
                    </div>
                    <button
                      onClick={() => updateProject({ relationships: (activeProject.relationships || []).filter(r => r.id !== rel.id) })}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Script Tab */}
        {activeTab === 'script' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Script</h2>
              <div className="flex gap-2">
                <input
                  ref={scriptFileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        setScriptText(text);
                        updateProject({ script: text });
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => scriptFileInputRef.current?.click()}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium flex items-center gap-2 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  <Upload className="w-5 h-5" />
                  Upload Script
                </button>
                <button
                  onClick={async () => {
                    if (!activeProject.script) return;
                    setIsParsing(true);
                    try {
                      const response = await fetch('/api/story-script', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: activeProject.script, mode: 'parse' })
                      });
                      const data = await response.json();
                      
                      if (data.characters || data.environments || data.objects || data.scenes) {
                        // Map parsed data to project structure
                        const newCharacters = (data.characters || []).map((c: any) => ({
                          id: Date.now().toString() + Math.random(),
                          name: c.name,
                          description: c.description,
                          prompt: c.prompt,
                          images: [],
                          storyboardImages: []
                        }));
                        
                        const newEnvironments = (data.environments || []).map((e: any) => ({
                          id: Date.now().toString() + Math.random(),
                          name: e.name,
                          description: e.description,
                          prompt: e.prompt,
                          images: []
                        }));
                        
                        const newObjects = (data.objects || []).map((o: any) => ({
                          id: Date.now().toString() + Math.random(),
                          name: o.name,
                          description: o.description,
                          prompt: o.prompt,
                          images: []
                        }));
                        
                        // Create character/environment/object lookup
                        const charMap = new Map(newCharacters.map((c: any) => [c.name, c.id]));
                        const envMap = new Map(newEnvironments.map((e: any) => [e.name, e.id]));
                        const objMap = new Map(newObjects.map((o: any) => [o.name, o.id]));
                        
                        const newScenes = (data.scenes || []).map((s: any, idx: number) => ({
                          id: Date.now().toString() + Math.random(),
                          name: s.name,
                          description: s.description,
                          characterIds: (s.characterNames || []).map((n: string) => charMap.get(n)).filter(Boolean),
                          objectIds: (s.objectNames || []).map((n: string) => objMap.get(n)).filter(Boolean),
                          environmentId: envMap.get(s.environmentName) || null,
                          shots: (s.shots || []).map((shot: any, shotIdx: number) => ({
                            id: Date.now().toString() + Math.random() + shotIdx,
                            number: shotIdx + 1,
                            description: shot.description,
                            characterIds: [],
                            objectIds: [],
                            environmentId: null,
                            cameraAngle: shot.cameraAngle || 'Eye Level',
                            shotType: shot.shotType || 'Medium Shot (MS)',
                            lighting: shot.lighting || 'Natural Light',
                            cameraMovement: shot.cameraMovement || 'Static',
                            prompt: shot.prompt || '',
                            images: []
                          }))
                        }));
                        
                        updateProject({
                          characters: [...activeProject.characters, ...newCharacters],
                          environments: [...activeProject.environments, ...newEnvironments],
                          objects: [...activeProject.objects, ...newObjects],
                          scenes: [...activeProject.scenes, ...newScenes]
                        });
                        
                        alert(`AI parsing complete! Generated:\n- ${newCharacters.length} characters\n- ${newEnvironments.length} environments\n- ${newObjects.length} objects\n- ${newScenes.length} scenes`);
                      } else {
                        alert('No data extracted from script. Please ensure your script is properly formatted.');
                      }
                    } catch (error) {
                      console.error('Script parsing failed:', error);
                      alert('Error parsing script. Please try again.');
                    } finally {
                      setIsParsing(false);
                    }
                  }}
                  disabled={!activeProject.script || isParsing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {isParsing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Parsing...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Parse with AI</>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
              <textarea
                value={activeProject.script}
                onChange={(e) => {
                  setScriptText(e.target.value);
                  updateProject({ script: e.target.value });
                }}
                placeholder="Paste or upload your script here..."
                className="w-full h-[600px] px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Dialogue Tab */}
        {activeTab === 'dialogue' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Dialogues & Sound Tracks</h2>
              <button
                onClick={() => setShowDialogueForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Dialogue
              </button>
            </div>

            {/* Dialogue Form */}
            {showDialogueForm && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Create Dialogue</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Scene</label>
                    <select
                      value={dialogueForm.sceneId}
                      onChange={(e) => setDialogueForm({ ...dialogueForm, sceneId: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="">Select scene</option>
                      {activeProject.scenes.map(scene => (
                        <option key={scene.id} value={scene.id}>{scene.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Character</label>
                    <select
                      value={dialogueForm.characterId}
                      onChange={(e) => setDialogueForm({ ...dialogueForm, characterId: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="">Select character</option>
                      {activeProject.characters.map(char => (
                        <option key={char.id} value={char.id}>{char.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-neutral-500 mb-1 block">Dialogue Text</label>
                    <textarea
                      value={dialogueForm.text}
                      onChange={(e) => setDialogueForm({ ...dialogueForm, text: e.target.value })}
                      placeholder="Enter dialogue..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (dialogueForm.sceneId && dialogueForm.characterId && dialogueForm.text) {
                        const newDialogue: Dialogue = {
                          id: Date.now().toString(),
                          sceneId: dialogueForm.sceneId,
                          shotId: dialogueForm.shotId,
                          characterId: dialogueForm.characterId,
                          text: dialogueForm.text
                        };
                        updateProject({ dialogues: [...(activeProject.dialogues || []), newDialogue] });
                        setShowDialogueForm(false);
                        setDialogueForm({ sceneId: '', shotId: null, characterId: '', text: '' });
                      }
                    }}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowDialogueForm(false);
                      setDialogueForm({ sceneId: '', shotId: null, characterId: '', text: '' });
                    }}
                    className="px-6 py-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Dialogues List */}
            <div className="space-y-4">
              {(activeProject.dialogues || []).map(dialogue => {
                const scene = activeProject.scenes.find(s => s.id === dialogue.sceneId);
                const character = activeProject.characters.find(c => c.id === dialogue.characterId);
                return (
                  <div key={dialogue.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">
                          {character?.name} • {scene?.name}
                        </p>
                        <p className="text-neutral-900 dark:text-white mt-2">{dialogue.text}</p>
                      </div>
                      <button
                        onClick={() => updateProject({ dialogues: (activeProject.dialogues || []).filter(d => d.id !== dialogue.id) })}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Audio Track
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">AI Script Assistant</h2>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
              <div>
                <label className="text-sm text-neutral-500 mb-2 block">Describe your script idea</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="E.g., Write a script for an action movie about a detective solving a mystery in a futuristic city..."
                  className="w-full h-32 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                />
              </div>
              <button
                onClick={async () => {
                  if (!aiPrompt.trim()) return;
                  setIsGeneratingScript(true);
                  try {
                    const response = await fetch('/api/story-script', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ prompt: aiPrompt, mode: 'generate' })
                    });
                    const data = await response.json();
                    if (data.script) {
                      setAiResponse(data.script);
                    } else {
                      setAiResponse('Failed to generate script. Please try again.');
                    }
                  } catch (error) {
                    console.error('Script generation failed:', error);
                    setAiResponse('Error generating script. Please check your connection and try again.');
                  } finally {
                    setIsGeneratingScript(false);
                  }
                }}
                disabled={!aiPrompt.trim() || isGeneratingScript}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                {isGeneratingScript ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                ) : (
                  <><Wand2 className="w-5 h-5" /> Generate Script</>
                )}
              </button>
            </div>

            {aiResponse && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Generated Script</h3>
                  <button
                    onClick={() => updateProject({ script: aiResponse })}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                  >
                    Use This Script
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm text-neutral-700 dark:text-neutral-300">
                  {aiResponse}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Translation Tab */}
        {activeTab === 'translate' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Translation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Input</h3>
                <textarea
                  value={translateInput}
                  onChange={(e) => setTranslateInput(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="w-full h-64 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                />
                <div className="flex gap-2">
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                  >
                    <optgroup label="European Languages">
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Russian">Russian</option>
                      <option value="Dutch">Dutch</option>
                    </optgroup>
                    <optgroup label="Asian Languages">
                      <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                      <option value="Chinese (Traditional)">Chinese (Traditional)</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Thai">Thai</option>
                      <option value="Vietnamese">Vietnamese</option>
                    </optgroup>
                    <optgroup label="Indian Languages">
                      <option value="Hindi">Hindi</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Urdu">Urdu</option>
                    </optgroup>
                    <optgroup label="Other Languages">
                      <option value="Arabic">Arabic</option>
                      <option value="Turkish">Turkish</option>
                      <option value="Hebrew">Hebrew</option>
                      <option value="Indonesian">Indonesian</option>
                      <option value="Malay">Malay</option>
                      <option value="Swahili">Swahili</option>
                    </optgroup>
                  </select>
                  <button
                    onClick={async () => {
                      if (!translateInput.trim()) return;
                      setIsTranslating(true);
                      setTranslationError('');
                      setTranslateOutput('');
                      try {
                        const response = await fetch('/api/story-script', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            mode: 'translate',
                            targetLanguage,
                            text: translateInput
                          })
                        });
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                        }
                        
                        const data = await response.json();
                        if (data.translation) {
                          setTranslateOutput(data.translation);
                          setTranslationError('');
                        } else {
                          setTranslationError('No translation received. Please try again.');
                        }
                      } catch (error: any) {
                        console.error('Translation failed:', error);
                        const errorMsg = error.message || 'Unknown error occurred';
                        setTranslationError(`Translation failed: ${errorMsg}`);
                        setTranslateOutput('');
                      } finally {
                        setIsTranslating(false);
                      }
                    }}
                    disabled={!translateInput.trim() || isTranslating}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                  >
                    {isTranslating ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Translating...</>
                    ) : (
                      <><Languages className="w-5 h-5" /> Translate</>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Output ({targetLanguage})</h3>
                {translationError && (
                  <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{translationError}</p>
                  </div>
                )}
                <div className="w-full h-64 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl overflow-auto">
                  <pre className="whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
                    {translateOutput || 'Translation will appear here...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Project Selected */}
        {activeTab !== 'projects' && !activeProject && (
          <div className="text-center py-20 text-neutral-400">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No project selected</p>
            <p className="text-sm">Select or create a project to continue</p>
          </div>
        )}
      </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
