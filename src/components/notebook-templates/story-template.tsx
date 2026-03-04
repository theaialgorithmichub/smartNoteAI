"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  BookText,
  Plus,
  Loader2,
  Users,
  Film,
  MessageCircle,
  FileText,
  Sparkles,
  Trash2,
  X,
  ChevronRight,
  Image,
  Wand2,
  Save,
  User,
  MapPin,
  Clock,
  Palette
} from "lucide-react";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  description: string;
  backstory: string;
  traits: string[];
  imageUrl?: string;
  relationships: { characterId: string; relationship: string }[];
}

interface Scene {
  id: string;
  title: string;
  location: string;
  time: string;
  description: string;
  characters: string[];
  notes: string;
  order: number;
}

interface Dialogue {
  id: string;
  sceneId?: string;
  characterId: string;
  line: string;
  direction?: string;
}

interface Script {
  id: string;
  title: string;
  content: string;
  type: 'outline' | 'draft' | 'final';
}

interface StoryTemplateProps {
  title?: string;
  notebookId?: string;
}

export function StoryTemplate({ title = "Story Workshop", notebookId }: StoryTemplateProps) {
  const [activeTab, setActiveTab] = useState<'characters' | 'scenes' | 'dialogues' | 'scripts' | 'ai-assist'>('characters');
  const [storyTitle, setStoryTitle] = useState("");
  const [storyGenre, setStoryGenre] = useState("");
  const [storySynopsis, setStorySynopsis] = useState("");
  
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [isAddingScene, setIsAddingScene] = useState(false);
  const [isAddingDialogue, setIsAddingDialogue] = useState(false);
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`story-${notebookId}`, JSON.stringify({ 
          storyTitle, storyGenre, storySynopsis, characters, scenes, dialogues, scripts
        }));
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
      const saved = localStorage.getItem(`story-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setStoryTitle(data.storyTitle || "");
        setStoryGenre(data.storyGenre || "");
        setStorySynopsis(data.storySynopsis || "");
        setCharacters(data.characters || []);
        setScenes(data.scenes || []);
        setDialogues(data.dialogues || []);
        setScripts(data.scripts || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [storyTitle, storyGenre, storySynopsis, characters, scenes, dialogues, scripts]);

  // Character functions
  const addCharacter = () => {
    const newChar: Character = {
      id: Date.now().toString(),
      name: 'New Character',
      role: 'supporting',
      description: '',
      backstory: '',
      traits: [],
      relationships: []
    };
    setCharacters([...characters, newChar]);
    setSelectedCharacterId(newChar.id);
    setIsAddingCharacter(false);
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
    if (selectedCharacterId === id) setSelectedCharacterId(null);
  };

  // Scene functions
  const addScene = () => {
    const newScene: Scene = {
      id: Date.now().toString(),
      title: 'New Scene',
      location: '',
      time: '',
      description: '',
      characters: [],
      notes: '',
      order: scenes.length + 1
    };
    setScenes([...scenes, newScene]);
    setSelectedSceneId(newScene.id);
    setIsAddingScene(false);
  };

  const updateScene = (id: string, updates: Partial<Scene>) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteScene = (id: string) => {
    setScenes(scenes.filter(s => s.id !== id));
    if (selectedSceneId === id) setSelectedSceneId(null);
  };

  // Dialogue functions
  const addDialogue = (characterId: string) => {
    const newDialogue: Dialogue = {
      id: Date.now().toString(),
      characterId,
      sceneId: selectedSceneId || undefined,
      line: '',
      direction: ''
    };
    setDialogues([...dialogues, newDialogue]);
  };

  const updateDialogue = (id: string, updates: Partial<Dialogue>) => {
    setDialogues(dialogues.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDialogue = (id: string) => {
    setDialogues(dialogues.filter(d => d.id !== id));
  };

  // Script functions
  const addScript = () => {
    const newScript: Script = {
      id: Date.now().toString(),
      title: 'Untitled Script',
      content: '',
      type: 'draft'
    };
    setScripts([...scripts, newScript]);
    setSelectedScriptId(newScript.id);
  };

  const updateScript = (id: string, updates: Partial<Script>) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // AI Generation
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const context = {
        storyTitle,
        storyGenre,
        storySynopsis,
        characters: characters.map(c => ({ name: c.name, role: c.role, description: c.description })),
        scenes: scenes.map(s => ({ title: s.title, location: s.location, description: s.description }))
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebookId,
          message: `You are a creative writing assistant helping with a ${storyGenre || 'story'}. 
          
Story context:
- Title: ${storyTitle || 'Untitled'}
- Synopsis: ${storySynopsis || 'Not provided'}
- Characters: ${characters.map(c => c.name).join(', ') || 'None yet'}

User request: ${aiPrompt}

Please provide creative, detailed assistance.`,
          context: [{ pageNumber: 1, title: 'Story Context', content: JSON.stringify(context) }]
        })
      });

      const data = await response.json();
      setAiResponse(data.response || "I couldn't generate a response. Please try again.");
    } catch (error) {
      console.error("AI generation error:", error);
      setAiResponse("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCharacter = characters.find(c => c.id === selectedCharacterId);
  const selectedScene = scenes.find(s => s.id === selectedSceneId);
  const selectedScript = scripts.find(s => s.id === selectedScriptId);

  const roleColors = {
    protagonist: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    antagonist: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    supporting: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    minor: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
  };

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-neutral-950 flex flex-col">
      <TemplateHeader title={title} />
      <div className="flex-1 flex overflow-hidden">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <BookText className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white text-sm">{title}</span>
          </div>
          <input
            type="text"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Story Title"
            className="w-full text-lg font-bold text-neutral-900 dark:text-white bg-transparent outline-none mb-2"
          />
          <input
            type="text"
            value={storyGenre}
            onChange={(e) => setStoryGenre(e.target.value)}
            placeholder="Genre (e.g., Fantasy, Thriller)"
            className="w-full text-sm text-neutral-500 bg-transparent outline-none"
          />
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'characters', label: 'Characters', icon: Users, count: characters.length },
            { id: 'scenes', label: 'Scenes', icon: Film, count: scenes.length },
            { id: 'dialogues', label: 'Dialogues', icon: MessageCircle, count: dialogues.length },
            { id: 'scripts', label: 'Scripts', icon: FileText, count: scripts.length },
            { id: 'ai-assist', label: 'AI Assistant', icon: Sparkles, count: null },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
              {tab.count !== null && (
                <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Synopsis */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <label className="text-xs text-neutral-500 uppercase mb-2 block">Synopsis</label>
          <textarea
            value={storySynopsis}
            onChange={(e) => setStorySynopsis(e.target.value)}
            placeholder="Brief story synopsis..."
            className="w-full h-24 text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2 outline-none resize-none"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="flex h-full">
            {/* Character List */}
            <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Characters</h2>
                <button
                  onClick={addCharacter}
                  className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => setSelectedCharacterId(char.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                      selectedCharacterId === char.id
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    } border border-neutral-200 dark:border-neutral-800`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {char.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 dark:text-white truncate">{char.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[char.role]}`}>
                        {char.role}
                      </span>
                    </div>
                  </button>
                ))}
                {characters.length === 0 && (
                  <p className="text-neutral-400 text-sm text-center py-8">No characters yet</p>
                )}
              </div>
            </div>

            {/* Character Editor */}
            <div className="flex-1 p-6">
              {selectedCharacter ? (
                <div className="max-w-2xl">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                      {selectedCharacter.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={selectedCharacter.name}
                        onChange={(e) => updateCharacter(selectedCharacter.id, { name: e.target.value })}
                        className="text-2xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none w-full"
                      />
                      <div className="flex gap-2 mt-2">
                        {(['protagonist', 'antagonist', 'supporting', 'minor'] as const).map(role => (
                          <button
                            key={role}
                            onClick={() => updateCharacter(selectedCharacter.id, { role })}
                            className={`px-3 py-1 rounded-lg text-xs capitalize ${
                              selectedCharacter.role === role ? roleColors[role] : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCharacter(selectedCharacter.id)}
                      className="p-2 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-neutral-500 mb-2 block">Description</label>
                      <textarea
                        value={selectedCharacter.description}
                        onChange={(e) => updateCharacter(selectedCharacter.id, { description: e.target.value })}
                        placeholder="Physical appearance, personality..."
                        className="w-full h-24 bg-white dark:bg-neutral-900 rounded-xl p-4 outline-none border border-neutral-200 dark:border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-neutral-500 mb-2 block">Backstory</label>
                      <textarea
                        value={selectedCharacter.backstory}
                        onChange={(e) => updateCharacter(selectedCharacter.id, { backstory: e.target.value })}
                        placeholder="Character history, motivations..."
                        className="w-full h-32 bg-white dark:bg-neutral-900 rounded-xl p-4 outline-none border border-neutral-200 dark:border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-neutral-500 mb-2 block">Character Traits</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacter.traits.map((trait, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm flex items-center gap-1">
                            {trait}
                            <button
                              onClick={() => updateCharacter(selectedCharacter.id, { 
                                traits: selectedCharacter.traits.filter((_, idx) => idx !== i) 
                              })}
                              className="hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          placeholder="Add trait..."
                          className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm outline-none w-24"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              updateCharacter(selectedCharacter.id, {
                                traits: [...selectedCharacter.traits, e.currentTarget.value.trim()]
                              });
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-400">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select or create a character</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scenes Tab */}
        {activeTab === 'scenes' && (
          <div className="flex h-full">
            {/* Scene List */}
            <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Scenes</h2>
                <button
                  onClick={addScene}
                  className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {scenes.sort((a, b) => a.order - b.order).map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedSceneId(scene.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selectedSceneId === scene.id
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    } border border-neutral-200 dark:border-neutral-800`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
                        Scene {index + 1}
                      </span>
                    </div>
                    <p className="font-medium text-neutral-900 dark:text-white truncate">{scene.title}</p>
                    {scene.location && (
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {scene.location}
                      </p>
                    )}
                  </button>
                ))}
                {scenes.length === 0 && (
                  <p className="text-neutral-400 text-sm text-center py-8">No scenes yet</p>
                )}
              </div>
            </div>

            {/* Scene Editor */}
            <div className="flex-1 p-6">
              {selectedScene ? (
                <div className="max-w-2xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={selectedScene.title}
                        onChange={(e) => updateScene(selectedScene.id, { title: e.target.value })}
                        placeholder="Scene Title"
                        className="text-2xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none w-full"
                      />
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <MapPin className="w-4 h-4" />
                          <input
                            type="text"
                            value={selectedScene.location}
                            onChange={(e) => updateScene(selectedScene.id, { location: e.target.value })}
                            placeholder="Location"
                            className="bg-transparent outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Clock className="w-4 h-4" />
                          <input
                            type="text"
                            value={selectedScene.time}
                            onChange={(e) => updateScene(selectedScene.id, { time: e.target.value })}
                            placeholder="Time"
                            className="bg-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteScene(selectedScene.id)}
                      className="p-2 text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm text-neutral-500 mb-2 block">Scene Description</label>
                      <textarea
                        value={selectedScene.description}
                        onChange={(e) => updateScene(selectedScene.id, { description: e.target.value })}
                        placeholder="What happens in this scene..."
                        className="w-full h-40 bg-white dark:bg-neutral-900 rounded-xl p-4 outline-none border border-neutral-200 dark:border-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-neutral-500 mb-2 block">Characters in Scene</label>
                      <div className="flex flex-wrap gap-2">
                        {characters.map(char => (
                          <button
                            key={char.id}
                            onClick={() => {
                              const isSelected = selectedScene.characters.includes(char.id);
                              updateScene(selectedScene.id, {
                                characters: isSelected
                                  ? selectedScene.characters.filter(id => id !== char.id)
                                  : [...selectedScene.characters, char.id]
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                              selectedScene.characters.includes(char.id)
                                ? 'bg-amber-500 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            <User className="w-3 h-3" />
                            {char.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-neutral-500 mb-2 block">Notes</label>
                      <textarea
                        value={selectedScene.notes}
                        onChange={(e) => updateScene(selectedScene.id, { notes: e.target.value })}
                        placeholder="Director notes, mood, etc..."
                        className="w-full h-24 bg-white dark:bg-neutral-900 rounded-xl p-4 outline-none border border-neutral-200 dark:border-neutral-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-400">
                  <div className="text-center">
                    <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select or create a scene</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dialogues Tab */}
        {activeTab === 'dialogues' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Dialogues</h2>
                <select
                  value={selectedSceneId || ''}
                  onChange={(e) => setSelectedSceneId(e.target.value || null)}
                  className="px-4 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-none"
                >
                  <option value="">All Scenes</option>
                  {scenes.map(scene => (
                    <option key={scene.id} value={scene.id}>{scene.title}</option>
                  ))}
                </select>
              </div>

              {/* Dialogue List */}
              <div className="space-y-4 mb-6">
                {dialogues
                  .filter(d => !selectedSceneId || d.sceneId === selectedSceneId)
                  .map(dialogue => {
                    const character = characters.find(c => c.id === dialogue.characterId);
                    return (
                      <div key={dialogue.id} className="flex gap-4 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {character?.name.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-neutral-900 dark:text-white">
                              {character?.name || 'Unknown'}
                            </span>
                            <button
                              onClick={() => deleteDialogue(dialogue.id)}
                              className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {dialogue.direction && (
                            <p className="text-sm text-neutral-500 italic mb-2">({dialogue.direction})</p>
                          )}
                          <textarea
                            value={dialogue.line}
                            onChange={(e) => updateDialogue(dialogue.id, { line: e.target.value })}
                            placeholder="Enter dialogue..."
                            className="w-full bg-transparent outline-none resize-none text-neutral-700 dark:text-neutral-300"
                            rows={2}
                          />
                          <input
                            type="text"
                            value={dialogue.direction || ''}
                            onChange={(e) => updateDialogue(dialogue.id, { direction: e.target.value })}
                            placeholder="Stage direction (optional)"
                            className="w-full text-sm text-neutral-500 bg-transparent outline-none mt-2 italic"
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Add Dialogue */}
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-4">
                <p className="text-sm text-neutral-500 mb-3">Add dialogue for:</p>
                <div className="flex flex-wrap gap-2">
                  {characters.map(char => (
                    <button
                      key={char.id}
                      onClick={() => addDialogue(char.id)}
                      className="px-4 py-2 bg-white dark:bg-neutral-700 rounded-xl text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {char.name}
                    </button>
                  ))}
                </div>
                {characters.length === 0 && (
                  <p className="text-neutral-400 text-sm">Create characters first to add dialogues</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scripts Tab */}
        {activeTab === 'scripts' && (
          <div className="flex h-full">
            {/* Script List */}
            <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Scripts</h2>
                <button
                  onClick={addScript}
                  className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {scripts.map(script => (
                  <button
                    key={script.id}
                    onClick={() => setSelectedScriptId(script.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selectedScriptId === script.id
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    } border border-neutral-200 dark:border-neutral-800`}
                  >
                    <p className="font-medium text-neutral-900 dark:text-white truncate">{script.title}</p>
                    <span className="text-xs text-neutral-500 capitalize">{script.type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Script Editor */}
            <div className="flex-1 p-6">
              {selectedScript ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center gap-4 mb-4">
                    <input
                      type="text"
                      value={selectedScript.title}
                      onChange={(e) => updateScript(selectedScript.id, { title: e.target.value })}
                      className="text-xl font-bold text-neutral-900 dark:text-white bg-transparent outline-none flex-1"
                    />
                    <div className="flex gap-2">
                      {(['outline', 'draft', 'final'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => updateScript(selectedScript.id, { type })}
                          className={`px-3 py-1 rounded-lg text-xs capitalize ${
                            selectedScript.type === type
                              ? 'bg-amber-500 text-white'
                              : 'bg-neutral-100 dark:bg-neutral-800'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={selectedScript.content}
                    onChange={(e) => updateScript(selectedScript.id, { content: e.target.value })}
                    placeholder="Start writing your script..."
                    className="flex-1 w-full bg-white dark:bg-neutral-900 rounded-xl p-6 outline-none border border-neutral-200 dark:border-neutral-800 font-mono text-sm resize-none"
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-neutral-400">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select or create a script</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai-assist' && (
          <div className="p-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">AI Writing Assistant</h2>
                  <p className="text-sm text-neutral-500">Get help with your story</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Generate character backstory', prompt: 'Generate a detailed backstory for a new character' },
                  { label: 'Write a scene description', prompt: 'Write a vivid scene description for' },
                  { label: 'Create dialogue', prompt: 'Write a dialogue exchange between characters' },
                  { label: 'Plot twist ideas', prompt: 'Suggest some unexpected plot twists for my story' },
                  { label: 'Describe a location', prompt: 'Describe a setting/location for my story' },
                  { label: 'Character motivation', prompt: 'Help me develop character motivations' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(action.prompt)}
                    className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-left hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    <Wand2 className="w-4 h-4 text-purple-500 mb-2" />
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{action.label}</p>
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI to help with your story... (e.g., 'Write a dramatic confrontation scene between the hero and villain')"
                  className="w-full h-32 bg-transparent outline-none resize-none text-neutral-700 dark:text-neutral-300"
                />
                <div className="flex justify-end">
                  <button
                    onClick={generateWithAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Response */}
              {aiResponse && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      AI Response
                    </h3>
                    <button
                      onClick={() => {
                        const newScript: Script = {
                          id: Date.now().toString(),
                          title: 'AI Generated Content',
                          content: aiResponse,
                          type: 'draft'
                        };
                        setScripts([...scripts, newScript]);
                      }}
                      className="text-sm text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      Save to Scripts
                    </button>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">{aiResponse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
