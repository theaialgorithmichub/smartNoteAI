"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon, Plus, Loader2, Trash2, Edit3, X, Search, FolderOpen,
  ExternalLink, Copy, Check, Tag, Sparkles, Globe, Bookmark, Star
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface SavedLink {
  id: string;
  url: string;
  title: string;
  description: string;
  categoryId: string;
  favicon?: string;
  thumbnail?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LinkProject {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  links: SavedLink[];
  createdAt: string;
  updatedAt: string;
}

interface LinkTemplateProps {
  title?: string;
  notebookId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LinkTemplate({ title = "Link Manager", notebookId }: LinkTemplateProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'links' | 'categories'>('projects');
  
  // Multi-project state
  const [projects, setProjects] = useState<LinkProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);
  
  // Category state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', color: '#3b82f6', icon: 'bookmark' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [confirmDeleteCategoryId, setConfirmDeleteCategoryId] = useState<string | null>(null);
  
  // Link state
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkForm, setLinkForm] = useState({ url: '', title: '', description: '', categoryId: '' });
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [confirmDeleteLinkId, setConfirmDeleteLinkId] = useState<string | null>(null);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  
  // Persistence
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<LinkProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;

  // ─── Persistence ─────────────────────────────────────────────────────────────

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`link-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
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
      const saved = localStorage.getItem(`link-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        if (loadedProjects.length === 0) {
          const defaultProject: LinkProject = {
            id: Date.now().toString(),
            name: "My Links",
            description: "Default link collection",
            categories: [
              { id: '1', name: 'Development', color: '#3b82f6', icon: 'code' },
              { id: '2', name: 'Design', color: '#8b5cf6', icon: 'palette' },
              { id: '3', name: 'Resources', color: '#10b981', icon: 'book' },
            ],
            links: [],
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
        const defaultProject: LinkProject = {
          id: Date.now().toString(),
          name: "My Links",
          description: "Default link collection",
          categories: [
            { id: '1', name: 'Development', color: '#3b82f6', icon: 'code' },
            { id: '2', name: 'Design', color: '#8b5cf6', icon: 'palette' },
            { id: '3', name: 'Resources', color: '#10b981', icon: 'book' },
          ],
          links: [],
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

  const updateProject = useCallback((updates: Partial<LinkProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activeProjectId]);

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject: LinkProject = {
      id: Date.now().toString(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      categories: [],
      links: [],
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

  // ─── Category CRUD ───────────────────────────────────────────────────────────

  const createCategory = () => {
    if (!categoryForm.name.trim() || !activeProject) return;
    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryForm.name.trim(),
      color: categoryForm.color,
      icon: categoryForm.icon
    };
    updateProject({ categories: [...activeProject.categories, newCategory] });
    setShowCategoryForm(false);
    setCategoryForm({ name: '', color: '#3b82f6', icon: 'bookmark' });
  };

  const saveEditCategory = () => {
    if (!editingCategoryId || !categoryForm.name.trim() || !activeProject) return;
    updateProject({
      categories: activeProject.categories.map(c =>
        c.id === editingCategoryId
          ? { ...c, name: categoryForm.name.trim(), color: categoryForm.color, icon: categoryForm.icon }
          : c
      )
    });
    setEditingCategoryId(null);
    setCategoryForm({ name: '', color: '#3b82f6', icon: 'bookmark' });
  };

  const deleteCategory = (id: string) => {
    if (!activeProject) return;
    updateProject({ categories: activeProject.categories.filter(c => c.id !== id) });
    setConfirmDeleteCategoryId(null);
  };

  // ─── Link CRUD ───────────────────────────────────────────────────────────────

  const generateDescription = async () => {
    if (!linkForm.url.trim()) return;
    
    setGeneratingDescription(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate a concise, professional description (2-3 sentences) for this URL: ${linkForm.url}. Focus on what the website/resource is about and its main purpose. If you cannot access the URL, provide a general description based on the domain name.`
            }
          ]
        })
      });

      const data = await response.json();
      const description = data.response || 'No description available';
      
      setLinkForm(prev => ({ ...prev, description }));
    } catch (error) {
      console.error('Failed to generate description:', error);
      setLinkForm(prev => ({ ...prev, description: 'Failed to generate description. Please enter manually.' }));
    } finally {
      setGeneratingDescription(false);
    }
  };

  const createLink = () => {
    if (!linkForm.url.trim() || !linkForm.categoryId || !activeProject) return;
    
    const newLink: SavedLink = {
      id: Date.now().toString(),
      url: linkForm.url.trim(),
      title: linkForm.title.trim() || new URL(linkForm.url).hostname,
      description: linkForm.description.trim(),
      categoryId: linkForm.categoryId,
      favicon: `https://www.google.com/s2/favicons?domain=${linkForm.url}&sz=64`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    updateProject({ links: [...activeProject.links, newLink] });
    setShowLinkForm(false);
    setLinkForm({ url: '', title: '', description: '', categoryId: '' });
  };

  const saveEditLink = () => {
    if (!editingLinkId || !linkForm.url.trim() || !linkForm.categoryId || !activeProject) return;
    updateProject({
      links: activeProject.links.map(l =>
        l.id === editingLinkId
          ? { 
              ...l, 
              url: linkForm.url.trim(), 
              title: linkForm.title.trim() || new URL(linkForm.url).hostname,
              description: linkForm.description.trim(), 
              categoryId: linkForm.categoryId,
              updatedAt: new Date().toISOString() 
            }
          : l
      )
    });
    setEditingLinkId(null);
    setLinkForm({ url: '', title: '', description: '', categoryId: '' });
  };

  const deleteLink = (id: string) => {
    if (!activeProject) return;
    updateProject({ links: activeProject.links.filter(l => l.id !== id) });
    setConfirmDeleteLinkId(null);
  };

  const toggleFavorite = (id: string) => {
    if (!activeProject) return;
    updateProject({
      links: activeProject.links.map(l =>
        l.id === id ? { ...l, isFavorite: !l.isFavorite } : l
      )
    });
  };

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Filter & Search ─────────────────────────────────────────────────────────

  const filteredLinks = activeProject?.links.filter(link => {
    if (showFavoritesOnly && !link.isFavorite) return false;
    if (selectedCategoryFilter && link.categoryId !== selectedCategoryFilter) return false;
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      link.title.toLowerCase().includes(query) ||
      link.description.toLowerCase().includes(query) ||
      link.url.toLowerCase().includes(query)
    );
  }) || [];

  const getCategoryById = (id: string) => activeProject?.categories.find(c => c.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:to-neutral-900">
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">
                  {activeProject ? `${activeProject.links.length} links` : 'No project selected'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {[
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'links', label: 'Links', icon: LinkIcon },
                { id: 'categories', label: 'Categories', icon: Tag },
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Link Projects</h2>
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
                    <LinkIcon className="w-5 h-5 text-purple-500" />
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
                      <LinkIcon className="w-3 h-3" />
                      {project.links.length} links
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {project.categories.length} categories
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <LinkIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No link projects yet</p>
                <p className="text-sm">Create your first project to start</p>
              </div>
            )}
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search links..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none"
                />
              </div>
              
              <select
                value={selectedCategoryFilter || ''}
                onChange={(e) => setSelectedCategoryFilter(e.target.value || null)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none"
              >
                <option value="">All Categories</option>
                {activeProject.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                  showFavoritesOnly 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                }`}
              >
                <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>
              
              <button
                onClick={() => setShowLinkForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                Add Link
              </button>
            </div>

            {/* Link Form */}
            {(showLinkForm || editingLinkId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingLinkId ? 'Edit Link' : 'Add New Link'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">URL</label>
                    <input
                      type="url"
                      value={linkForm.url}
                      onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Title (Optional)</label>
                    <input
                      type="text"
                      value={linkForm.title}
                      onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                      placeholder="Leave empty to use domain name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 flex items-center justify-between">
                      <span>Description</span>
                      <button
                        onClick={generateDescription}
                        disabled={generatingDescription || !linkForm.url.trim()}
                        className="text-xs flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
                      >
                        {generatingDescription ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles className="w-3 h-3" /> Generate with AI</>
                        )}
                      </button>
                    </label>
                    <textarea
                      value={linkForm.description}
                      onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                      placeholder="Brief description..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Category</label>
                    <select
                      value={linkForm.categoryId}
                      onChange={(e) => setLinkForm({ ...linkForm, categoryId: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      <option value="">Select a category</option>
                      {activeProject.categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingLinkId ? saveEditLink : createLink}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg"
                  >
                    {editingLinkId ? 'Save' : 'Add'}
                  </button>
                  <button
                    onClick={() => {
                      setShowLinkForm(false);
                      setEditingLinkId(null);
                      setLinkForm({ url: '', title: '', description: '', categoryId: '' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* 3D Link Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map(link => {
                const category = getCategoryById(link.categoryId);
                return (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onMouseEnter={() => setHoveredCardId(link.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                    style={{
                      transform: hoveredCardId === link.id ? 'perspective(1000px) rotateX(5deg) rotateY(-5deg) scale(1.02)' : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                    className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-lg hover:shadow-2xl transition-all relative overflow-hidden group"
                  >
                    {/* 3D Gradient Background */}
                    <div 
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${category?.color || '#3b82f6'} 0%, transparent 100%)`
                      }}
                    />
                    
                    {/* Favorite Star */}
                    <button
                      onClick={() => toggleFavorite(link.id)}
                      className="absolute top-4 right-4 z-10"
                    >
                      <Star 
                        className={`w-5 h-5 transition-all ${
                          link.isFavorite 
                            ? 'fill-yellow-400 text-yellow-400' 
                            : 'text-neutral-300 hover:text-yellow-400'
                        }`}
                      />
                    </button>

                    {/* Favicon & Title */}
                    <div className="flex items-start gap-3 mb-3 relative z-10">
                      {link.favicon && (
                        <img 
                          src={link.favicon} 
                          alt="" 
                          className="w-10 h-10 rounded-lg"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-900 dark:text-white mb-1 truncate pr-8">
                          {link.title}
                        </h3>
                        {category && (
                          <span 
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                            style={{ 
                              backgroundColor: `${category.color}20`,
                              color: category.color
                            }}
                          >
                            <Tag className="w-3 h-3" />
                            {category.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3 relative z-10">
                      {link.description || 'No description available'}
                    </p>

                    {/* URL */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4 relative z-10">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{new URL(link.url).hostname}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 relative z-10">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit
                      </a>
                      <button
                        onClick={() => copyLink(link.url, link.id)}
                        className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        title="Copy URL"
                      >
                        {copiedId === link.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingLinkId(link.id);
                          setLinkForm({ 
                            url: link.url, 
                            title: link.title, 
                            description: link.description, 
                            categoryId: link.categoryId 
                          });
                        }}
                        className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeleteLinkId === link.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => deleteLink(link.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                          >
                            Del
                          </button>
                          <button
                            onClick={() => setConfirmDeleteLinkId(null)}
                            className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteLinkId(link.id)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredLinks.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <LinkIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No links found</p>
                <p className="text-sm">
                  {searchQuery || selectedCategoryFilter || showFavoritesOnly
                    ? 'Try adjusting your filters'
                    : 'Add your first link to get started'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Categories</h2>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                New Category
              </button>
            </div>

            {/* Category Form */}
            {(showCategoryForm || editingCategoryId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Category Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Enter category name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="w-16 h-12 rounded-xl cursor-pointer"
                      />
                      <input
                        type="text"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1 px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingCategoryId ? saveEditCategory : createCategory}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg"
                  >
                    {editingCategoryId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCategoryForm(false);
                      setEditingCategoryId(null);
                      setCategoryForm({ name: '', color: '#3b82f6', icon: 'bookmark' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Category List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject.categories.map(category => {
                const linkCount = activeProject.links.filter(l => l.categoryId === category.id).length;
                return (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 hover:border-purple-300 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <Tag className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setCategoryForm({ name: category.name, color: category.color, icon: category.icon });
                          }}
                          className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {confirmDeleteCategoryId === category.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setConfirmDeleteCategoryId(null)}
                              className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteCategoryId(category.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{category.name}</h3>
                    <p className="text-sm text-neutral-500">{linkCount} link{linkCount !== 1 ? 's' : ''}</p>
                  </div>
                );
              })}
            </div>

            {activeProject.categories.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No categories yet</p>
                <p className="text-sm">Create your first category to organize links</p>
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
    </div>
  );
}
