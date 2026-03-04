"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import {
  Video, Plus, Loader2, Trash2, Edit3, X, Search, FolderOpen,
  Upload, Link as LinkIcon, Download, Copy, Check, Grid3x3, List, 
  Play, Pause, Volume2, VolumeX, Maximize, ExternalLink, Info
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VideoItem {
  id: string;
  url: string;
  isUrl: boolean;
  thumbnail?: string;
  duration?: string;
  uploadedAt: string;
}

interface VideoPrompt {
  id: string;
  prompt: string;
  description: string;
  tags: string[];
  videos: VideoItem[];
  createdAt: string;
  updatedAt: string;
}

interface VideoPromptProject {
  id: string;
  name: string;
  description: string;
  prompts: VideoPrompt[];
  createdAt: string;
  updatedAt: string;
}

interface VideoPromptTemplateProps {
  title?: string;
  notebookId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VideoPromptTemplate({ title = "Video Prompts", notebookId }: VideoPromptTemplateProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'prompts' | 'library'>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Multi-project state
  const [projects, setProjects] = useState<VideoPromptProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);
  
  // Prompt state
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [promptForm, setPromptForm] = useState({ prompt: '', description: '', tags: [] as string[] });
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [confirmDeletePromptId, setConfirmDeletePromptId] = useState<string | null>(null);
  
  // Video state
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [addingUrlToPromptId, setAddingUrlToPromptId] = useState<string | null>(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload state
  const [uploadingPromptId, setUploadingPromptId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  
  // Persistence
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<VideoPromptProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const selectedPrompt = activeProject?.prompts.find(p => p.id === selectedPromptId) ?? null;

  // ─── Persistence ─────────────────────────────────────────────────────────────

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`video-prompt-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
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
      const saved = localStorage.getItem(`video-prompt-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        if (loadedProjects.length === 0) {
          const defaultProject: VideoPromptProject = {
            id: Date.now().toString(),
            name: "My Video Prompts",
            description: "Default video collection",
            prompts: [],
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
        const defaultProject: VideoPromptProject = {
          id: Date.now().toString(),
          name: "My Video Prompts",
          description: "Default video collection",
          prompts: [],
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
  }, [projects, activeProjectId, saveData]);
  
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // ─── Project CRUD ────────────────────────────────────────────────────────────

  const updateProject = useCallback((updates: Partial<VideoPromptProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activeProjectId]);

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject: VideoPromptProject = {
      id: Date.now().toString(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      prompts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setShowProjectForm(false);
    setProjectForm({ name: '', description: '' });
  };

  const saveEditProject = () => {
    if (!editingProjectId || !projectForm.name.trim()) return;
    setProjects(prev => prev.map(p => 
      p.id === editingProjectId 
        ? { ...p, name: projectForm.name.trim(), description: projectForm.description.trim(), updatedAt: new Date().toISOString() }
        : p
    ));
    setEditingProjectId(null);
    setProjectForm({ name: '', description: '' });
  };

  const deleteProject = (id: string) => {
    const next = projects.filter(p => p.id !== id);
    if (activeProjectId === id) {
      setActiveProjectId(next[0]?.id ?? null);
    }
    setProjects(next);
    setConfirmDeleteProjectId(null);
  };

  // ─── Prompt CRUD ─────────────────────────────────────────────────────────────

  const createPrompt = () => {
    if (!promptForm.prompt.trim() || !activeProject) return;
    const newPrompt: VideoPrompt = {
      id: Date.now().toString(),
      prompt: promptForm.prompt.trim(),
      description: promptForm.description.trim(),
      tags: promptForm.tags,
      videos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    updateProject({ prompts: [...activeProject.prompts, newPrompt] });
    setShowPromptForm(false);
    setPromptForm({ prompt: '', description: '', tags: [] });
    setSelectedPromptId(newPrompt.id);
  };

  const saveEditPrompt = () => {
    if (!editingPromptId || !promptForm.prompt.trim() || !activeProject) return;
    updateProject({
      prompts: activeProject.prompts.map(p =>
        p.id === editingPromptId
          ? { ...p, prompt: promptForm.prompt.trim(), description: promptForm.description.trim(), tags: promptForm.tags, updatedAt: new Date().toISOString() }
          : p
      )
    });
    setEditingPromptId(null);
    setPromptForm({ prompt: '', description: '', tags: [] });
  };

  const deletePrompt = (id: string) => {
    if (!activeProject) return;
    updateProject({ prompts: activeProject.prompts.filter(p => p.id !== id) });
    if (selectedPromptId === id) {
      setSelectedPromptId(null);
    }
    setConfirmDeletePromptId(null);
  };

  const copyPrompt = (prompt: VideoPrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Video Operations ────────────────────────────────────────────────────────

  const addVideoUrl = () => {
    if (!videoUrl.trim() || !addingUrlToPromptId || !activeProject) return;
    
    const newVideo: VideoItem = {
      id: Date.now().toString(),
      url: videoUrl.trim(),
      isUrl: true,
      uploadedAt: new Date().toISOString()
    };
    
    updateProject({
      prompts: activeProject.prompts.map(p =>
        p.id === addingUrlToPromptId
          ? { ...p, videos: [...p.videos, newVideo], updatedAt: new Date().toISOString() }
          : p
      )
    });
    
    setShowUrlForm(false);
    setVideoUrl('');
    setAddingUrlToPromptId(null);
  };

  const handleVideoUpload = (promptId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !activeProject) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newVideo: VideoItem = {
          id: Date.now().toString() + Math.random(),
          url: e.target?.result as string,
          isUrl: false,
          uploadedAt: new Date().toISOString()
        };
        
        updateProject({
          prompts: activeProject.prompts.map(p =>
            p.id === promptId
              ? { ...p, videos: [...p.videos, newVideo], updatedAt: new Date().toISOString() }
              : p
          )
        });
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  };

  const deleteVideo = (promptId: string, videoId: string) => {
    if (!activeProject) return;
    updateProject({
      prompts: activeProject.prompts.map(p =>
        p.id === promptId
          ? { ...p, videos: p.videos.filter(v => v.id !== videoId), updatedAt: new Date().toISOString() }
          : p
      )
    });
  };

  // ─── Search & Filter ─────────────────────────────────────────────────────────

  const filteredPrompts = activeProject?.prompts.filter(prompt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prompt.prompt.toLowerCase().includes(query) ||
      prompt.description.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-neutral-950 dark:to-neutral-900">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideoUrl && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPlayingVideoUrl(null)}
        >
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setPlayingVideoUrl(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <video 
              src={playingVideoUrl} 
              controls 
              autoPlay
              className="w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">
                  {activeProject ? `${activeProject.prompts.length} prompts` : 'No project selected'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {[
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'prompts', label: 'Prompts', icon: Video },
                { id: 'library', label: 'Library', icon: Grid3x3 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-cyan-600 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Video Prompt Projects</h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
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
                <div className="space-y-4">
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
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Brief description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingProjectId ? saveEditProject : createProject}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg"
                  >
                    {editingProjectId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowProjectForm(false);
                      setEditingProjectId(null);
                      setProjectForm({ name: '', description: '' });
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
                      ? 'border-cyan-500 shadow-lg'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-cyan-300'
                  }`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Video className="w-5 h-5 text-cyan-500" />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProjectId(project.id);
                          setProjectForm({ name: project.name, description: project.description });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {projects.length > 1 && (
                        confirmDeleteProjectId === project.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteProjectId(null); }}
                              className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteProjectId(project.id); }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      {project.prompts.length} prompts
                    </span>
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {project.prompts.reduce((sum, p) => sum + p.videos.length, 0)} videos
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No video prompt projects yet</p>
                <p className="text-sm">Create your first project to start</p>
              </div>
            )}
          </div>
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none"
                />
              </div>
              <button
                onClick={() => setShowPromptForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                New Prompt
              </button>
            </div>

            {/* Prompt Form */}
            {(showPromptForm || editingPromptId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingPromptId ? 'Edit Prompt' : 'Create New Prompt'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Prompt</label>
                    <textarea
                      value={promptForm.prompt}
                      onChange={(e) => setPromptForm({ ...promptForm, prompt: e.target.value })}
                      placeholder="Enter your video prompt..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Description (Optional)</label>
                    <input
                      type="text"
                      value={promptForm.description}
                      onChange={(e) => setPromptForm({ ...promptForm, description: e.target.value })}
                      placeholder="Brief description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingPromptId ? saveEditPrompt : createPrompt}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg"
                  >
                    {editingPromptId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptForm(false);
                      setEditingPromptId(null);
                      setPromptForm({ prompt: '', description: '', tags: [] });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* URL Form */}
            {showUrlForm && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Add Video URL</h3>
                <div>
                  <label className="text-sm text-neutral-500 mb-1 block">Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4 or YouTube URL"
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addVideoUrl}
                    className="px-6 py-2 bg-cyan-500 text-white rounded-lg"
                  >
                    Add URL
                  </button>
                  <button
                    onClick={() => {
                      setShowUrlForm(false);
                      setVideoUrl('');
                      setAddingUrlToPromptId(null);
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Prompt List */}
            <div className="space-y-4">
              {filteredPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-cyan-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="font-semibold text-neutral-900 dark:text-white mb-1">{prompt.prompt}</p>
                      {prompt.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{prompt.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyPrompt(prompt)}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                        title="Copy prompt"
                      >
                        {copiedId === prompt.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingPromptId(prompt.id);
                          setPromptForm({ prompt: prompt.prompt, description: prompt.description, tags: prompt.tags });
                        }}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeletePromptId === prompt.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => deletePrompt(prompt.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                          >
                            Del
                          </button>
                          <button
                            onClick={() => setConfirmDeletePromptId(null)}
                            className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeletePromptId(prompt.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {prompt.videos.map(video => (
                      <div key={video.id} className="relative group aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden">
                        {video.isUrl ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <LinkIcon className="w-8 h-8 text-neutral-400" />
                          </div>
                        ) : (
                          <video 
                            src={video.url} 
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setPlayingVideoUrl(video.url)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <Play className="w-4 h-4 text-white" />
                          </button>
                          {video.isUrl && (
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                            >
                              <ExternalLink className="w-4 h-4 text-white" />
                            </a>
                          )}
                          <button
                            onClick={() => deleteVideo(prompt.id, video.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        {video.isUrl && (
                          <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            URL
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAddingUrlToPromptId(prompt.id);
                        setShowUrlForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg hover:opacity-90"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Add URL
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => handleVideoUpload(prompt.id, e)}
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        setUploadingPromptId(prompt.id);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Video
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No prompts found</p>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Try adjusting your search'
                    : 'Create your first video prompt'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Video Library</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-cyan-100 text-cyan-600' : 'bg-neutral-100 text-neutral-600'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-cyan-100 text-cyan-600' : 'bg-neutral-100 text-neutral-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Library Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
              {activeProject.prompts.flatMap(prompt => 
                prompt.videos.map(video => ({
                  ...video,
                  prompt: prompt.prompt,
                  promptId: prompt.id
                }))
              ).map(item => (
                <div key={item.id} className={viewMode === 'grid' ? 'relative group aspect-video bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-hidden' : 'flex gap-4 bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800'}>
                  {item.isUrl ? (
                    <div className={viewMode === 'grid' ? 'w-full h-full flex items-center justify-center' : 'w-32 h-20 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-xl flex-shrink-0'}>
                      <LinkIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                  ) : (
                    <video 
                      src={item.url} 
                      className={viewMode === 'grid' ? 'w-full h-full object-cover' : 'w-32 h-20 object-cover rounded-xl flex-shrink-0'}
                    />
                  )}
                  {viewMode === 'grid' ? (
                    <>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPlayingVideoUrl(item.url)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                        >
                          <Play className="w-4 h-4 text-white" />
                        </button>
                        {item.isUrl && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <ExternalLink className="w-4 h-4 text-white" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteVideo(item.promptId, item.id)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {item.isUrl && (
                        <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          URL
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-white mb-2 line-clamp-2">{item.prompt}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {item.isUrl && (
                          <span className="bg-cyan-100 text-cyan-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            URL
                          </span>
                        )}
                        <span className="text-xs text-neutral-500">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPlayingVideoUrl(item.url)}
                          className="flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm"
                        >
                          <Play className="w-3 h-3" />
                          Play
                        </button>
                        {item.isUrl && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Open
                          </a>
                        )}
                        <button
                          onClick={() => deleteVideo(item.promptId, item.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {activeProject.prompts.every(p => p.videos.length === 0) && (
              <div className="text-center py-20 text-neutral-400">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No videos yet</p>
                <p className="text-sm">Upload videos or add URLs to your prompts</p>
              </div>
            )}
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
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Video Prompts Guide</h2>
                    <p className="text-cyan-100 text-sm">Video generation & library management</p>
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
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🎬 Overview</h3>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    Video Prompts is a comprehensive tool for managing video generation prompts and organizing video content. Create projects, write detailed prompts with tags, add video URLs, upload video files, and build a searchable video library.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">📁 Multi-Project Organization</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Create separate projects for different video campaigns or themes.</p>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                      <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">✍️ Detailed Prompts</h4>
                      <p className="text-sm text-cyan-800 dark:text-cyan-300">Write prompts with descriptions and tags for easy searching.</p>
                    </div>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 dark:text-teal-400 mb-1">🔗 Video URLs</h4>
                      <p className="text-sm text-teal-800 dark:text-teal-300">Add YouTube, Vimeo, or any video URLs to prompts.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">📤 Video Upload</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Upload video files directly to associate with prompts.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">📚 Video Library</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Browse all videos in grid or list view with search.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Project</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Project" to create a project with name and description.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Prompts</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch to Prompts tab, click "New Prompt" to add prompt text, description, and tags.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Video URLs</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Add URL" to link YouTube, Vimeo, or other video URLs.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Upload Videos</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Upload" to add video files from your device.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Browse Library</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch to Library tab to view all videos in grid or list view.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Detailed prompts</strong> - Specific prompts help organize and find videos later</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use tags</strong> - Tag by topic, style, or purpose for easy filtering</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Organize projects</strong> - Separate projects by campaign or client</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Mix URLs and uploads</strong> - Combine external and local videos</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Copy prompts</strong> - Reuse successful prompts for similar videos</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your prompts and video references are automatically saved locally.</strong> All projects, prompts, tags, video URLs, and uploaded video data are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
