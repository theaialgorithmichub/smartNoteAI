"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon, Plus, Loader2, Trash2, Edit3, X, Search, FolderOpen,
  Upload, Sparkles, Download, Copy, Check, Grid3x3, List, Eye, Wand2, Info
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GeneratedImage {
  id: string;
  url: string;
  generatedByAI: boolean;
  uploadedAt: string;
}

interface ImagePrompt {
  id: string;
  prompt: string;
  description: string;
  tags: string[];
  images: GeneratedImage[];
  createdAt: string;
  updatedAt: string;
}

interface ImagePromptProject {
  id: string;
  name: string;
  description: string;
  prompts: ImagePrompt[];
  createdAt: string;
  updatedAt: string;
}

interface ImagePromptTemplateProps {
  title?: string;
  notebookId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImagePromptTemplate({ title = "Image Prompts", notebookId }: ImagePromptTemplateProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'prompts' | 'gallery'>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Multi-project state
  const [projects, setProjects] = useState<ImagePromptProject[]>([]);
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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI & Upload state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingPromptId, setGeneratingPromptId] = useState<string | null>(null);
  const [uploadingPromptId, setUploadingPromptId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  
  // Persistence
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<ImagePromptProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const selectedPrompt = activeProject?.prompts.find(p => p.id === selectedPromptId) ?? null;

  // ─── Persistence ─────────────────────────────────────────────────────────────

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`image-prompt-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
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
      const saved = localStorage.getItem(`image-prompt-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        if (loadedProjects.length === 0) {
          const defaultProject: ImagePromptProject = {
            id: Date.now().toString(),
            name: "My Image Prompts",
            description: "Default prompt collection",
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
        const defaultProject: ImagePromptProject = {
          id: Date.now().toString(),
          name: "My Image Prompts",
          description: "Default prompt collection",
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

  const updateProject = useCallback((updates: Partial<ImagePromptProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activeProjectId]);

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject: ImagePromptProject = {
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
    const newPrompt: ImagePrompt = {
      id: Date.now().toString(),
      prompt: promptForm.prompt.trim(),
      description: promptForm.description.trim(),
      tags: promptForm.tags,
      images: [],
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

  const copyPrompt = (prompt: ImagePrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Image Operations ────────────────────────────────────────────────────────

  const generateImage = async (promptId: string) => {
    const prompt = activeProject?.prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    setIsGenerating(true);
    setGeneratingPromptId(promptId);
    
    try {
      // Simulate AI image generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt.prompt.substring(0, 30))}`,
        generatedByAI: true,
        uploadedAt: new Date().toISOString()
      };
      
      updateProject({
        prompts: activeProject!.prompts.map(p =>
          p.id === promptId
            ? { ...p, images: [...p.images, newImage], updatedAt: new Date().toISOString() }
            : p
        )
      });
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
      setGeneratingPromptId(null);
    }
  };

  const handleImageUpload = (promptId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !activeProject) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: GeneratedImage = {
          id: Date.now().toString() + Math.random(),
          url: e.target?.result as string,
          generatedByAI: false,
          uploadedAt: new Date().toISOString()
        };
        
        updateProject({
          prompts: activeProject.prompts.map(p =>
            p.id === promptId
              ? { ...p, images: [...p.images, newImage], updatedAt: new Date().toISOString() }
              : p
          )
        });
      };
      reader.readAsDataURL(file);
    });
    
    event.target.value = '';
  };

  const deleteImage = (promptId: string, imageId: string) => {
    if (!activeProject) return;
    updateProject({
      prompts: activeProject.prompts.map(p =>
        p.id === promptId
          ? { ...p, images: p.images.filter(img => img.id !== imageId), updatedAt: new Date().toISOString() }
          : p
      )
    });
  };

  const downloadImage = (imageUrl: string, promptText: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${promptText.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
    link.click();
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-neutral-950 dark:to-neutral-900">
      {saving && (
        <div className="fixed top-20 right-6 flex items-center gap-2 text-sm text-neutral-500 bg-white dark:bg-neutral-800 px-3 py-2 rounded-lg shadow-lg z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImageUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImageUrl} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] rounded-xl"
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
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
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
                className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {[
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'prompts', label: 'Prompts', icon: Wand2 },
                { id: 'gallery', label: 'Gallery', icon: Grid3x3 },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-purple-600 shadow-sm'
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Image Prompt Projects</h2>
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
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg"
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
                      ? 'border-purple-500 shadow-lg'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-purple-300'
                  }`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
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
                      <Wand2 className="w-3 h-3" />
                      {project.prompts.length} prompts
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {project.prompts.reduce((sum, p) => sum + p.images.length, 0)} images
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No image prompt projects yet</p>
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
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
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
                      placeholder="Enter your image generation prompt..."
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
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg"
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

            {/* Prompt List */}
            <div className="space-y-4">
              {filteredPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 transition-all"
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

                  {/* Images */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {prompt.images.map(image => (
                      <div key={image.id} className="relative group aspect-square">
                        <img
                          src={image.url}
                          alt={prompt.prompt}
                          className="w-full h-full object-cover rounded-xl cursor-pointer"
                          onClick={() => setSelectedImageUrl(image.url)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                          <button
                            onClick={() => downloadImage(image.url, prompt.prompt)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <Download className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={() => deleteImage(prompt.id, image.id)}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        {image.generatedByAI && (
                          <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateImage(prompt.id)}
                      disabled={isGenerating && generatingPromptId === prompt.id}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      {isGenerating && generatingPromptId === prompt.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate with AI</>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(prompt.id, e)}
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
                      Upload Images
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPrompts.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No prompts found</p>
                <p className="text-sm">
                  {searchQuery 
                    ? 'Try adjusting your search'
                    : 'Create your first image prompt'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Image Gallery</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-neutral-100 text-neutral-600'}`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-neutral-100 text-neutral-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
              {activeProject.prompts.flatMap(prompt => 
                prompt.images.map(image => ({
                  ...image,
                  prompt: prompt.prompt,
                  promptId: prompt.id
                }))
              ).map(item => (
                <div key={item.id} className={viewMode === 'grid' ? 'relative group aspect-square' : 'flex gap-4 bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800'}>
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className={viewMode === 'grid' ? 'w-full h-full object-cover rounded-xl cursor-pointer' : 'w-32 h-32 object-cover rounded-xl cursor-pointer flex-shrink-0'}
                    onClick={() => setSelectedImageUrl(item.url)}
                  />
                  {viewMode === 'grid' ? (
                    <>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <button
                          onClick={() => downloadImage(item.url, item.prompt)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => deleteImage(item.promptId, item.id)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {item.generatedByAI && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-white mb-2 line-clamp-2">{item.prompt}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {item.generatedByAI && (
                          <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            AI Generated
                          </span>
                        )}
                        <span className="text-xs text-neutral-500">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(item.url, item.prompt)}
                          className="flex items-center gap-1 px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-sm"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        <button
                          onClick={() => deleteImage(item.promptId, item.id)}
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

            {activeProject.prompts.every(p => p.images.length === 0) && (
              <div className="text-center py-20 text-neutral-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No images yet</p>
                <p className="text-sm">Generate or upload images to your prompts</p>
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
              <div className="sticky top-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Image Prompts Guide</h2>
                    <p className="text-pink-100 text-sm">AI image generation & management</p>
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
                    Image Prompts is a comprehensive tool for managing AI image generation prompts and organizing generated images. Create projects, write detailed prompts with tags, generate images with AI, upload your own images, and build a searchable gallery.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                  <div className="grid gap-3">
                    <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                      <h4 className="font-semibold text-pink-900 dark:text-pink-400 mb-1">📁 Multi-Project Organization</h4>
                      <p className="text-sm text-pink-800 dark:text-pink-300">Create separate projects for different themes, clients, or campaigns.</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">✍️ Detailed Prompts</h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300">Write prompts with descriptions and tags for easy searching and filtering.</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🤖 AI Generation</h4>
                      <p className="text-sm text-indigo-800 dark:text-indigo-300">Generate images from prompts using AI (integration required).</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">📤 Image Upload</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300">Upload your own images to associate with prompts.</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-400 mb-1">🖼️ Gallery View</h4>
                      <p className="text-sm text-emerald-800 dark:text-emerald-300">Browse all images in grid or list view with search and filtering.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Create a Project</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "New Project" to create a project with name and description.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Add Prompts</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch to Prompts tab, click "New Prompt" to add prompt text, description, and tags.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Generate Images</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Generate" on a prompt to create AI images (requires AI integration).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Upload Images</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Click "Upload" to add your own images to prompts.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Browse Gallery</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Switch to Gallery tab to view all images in grid or list view.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white">Search & Filter</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Use search bar to find prompts by text or tags.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Detailed prompts</strong> - More specific prompts generate better AI images</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use tags</strong> - Tag prompts by style, subject, or mood for easy filtering</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Organize projects</strong> - Separate projects by client, campaign, or theme</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Save variations</strong> - Upload multiple variations of the same prompt</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Copy prompts</strong> - Use the copy button to reuse successful prompts</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      <strong>Your prompts and images are automatically saved locally.</strong> All projects, prompts, tags, and uploaded images are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
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
