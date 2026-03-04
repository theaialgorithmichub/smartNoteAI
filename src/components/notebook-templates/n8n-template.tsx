"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';
import {
  Workflow, Plus, Loader2, Trash2, Edit3, X, Search, FolderOpen,
  GitBranch, Play, Download, Upload, Copy, Check, Zap, Settings,
  ChevronRight, Eye, Code, FileJson
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  parameters?: Record<string, any>;
}

interface WorkflowConnection {
  source: string;
  target: string;
  sourceOutput?: string;
  targetInput?: string;
}

interface N8nTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  workflowJson: string;
  createdAt: string;
  updatedAt: string;
}

interface N8nProject {
  id: string;
  name: string;
  description: string;
  templates: N8nTemplate[];
  createdAt: string;
  updatedAt: string;
}

interface N8nTemplateProps {
  title?: string;
  notebookId?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Marketing',
  'Sales',
  'Development',
  'Data Processing',
  'Communication',
  'Productivity',
  'E-commerce',
  'Social Media',
  'Analytics',
  'Other'
];

const NODE_COLORS: Record<string, string> = {
  trigger: '#10b981',
  action: '#3b82f6',
  transform: '#f59e0b',
  condition: '#8b5cf6',
  webhook: '#ec4899',
  database: '#06b6d4',
  api: '#ef4444',
  default: '#6b7280'
};

// ─── Component ───────────────────────────────────────────────────────────────

export function N8nTemplate({ title = "n8n Workflows", notebookId }: N8nTemplateProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'canvas'>('projects');
  
  // Multi-project state
  const [projects, setProjects] = useState<N8nProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState<string | null>(null);
  
  // Template state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '', description: '', category: 'Other', tags: [] as string[], workflowJson: ''
  });
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [confirmDeleteTemplateId, setConfirmDeleteTemplateId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Canvas state
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Persistence
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectsRef = useRef<N8nProject[]>([]);
  
  const activeProject = projects.find(p => p.id === activeProjectId) ?? null;
  const selectedTemplate = activeProject?.templates.find(t => t.id === selectedTemplateId) ?? null;

  // ─── Persistence ─────────────────────────────────────────────────────────────

  const saveData = useCallback(() => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`n8n-${notebookId}`, JSON.stringify({ projects: projectsRef.current, activeProjectId }));
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
      const saved = localStorage.getItem(`n8n-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        const loadedProjects = data.projects || [];
        if (loadedProjects.length === 0) {
          const defaultProject: N8nProject = {
            id: Date.now().toString(),
            name: "My Workflows",
            description: "Default workflow collection",
            templates: [],
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
        const defaultProject: N8nProject = {
          id: Date.now().toString(),
          name: "My Workflows",
          description: "Default workflow collection",
          templates: [],
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

  const updateProject = useCallback((updates: Partial<N8nProject>) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(p => 
      p.id === activeProjectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, [activeProjectId]);

  const createProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject: N8nProject = {
      id: Date.now().toString(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      templates: [],
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

  // ─── Template CRUD ───────────────────────────────────────────────────────────

  const parseWorkflowJson = (jsonString: string): { nodes: WorkflowNode[]; connections: WorkflowConnection[] } => {
    try {
      const workflow = JSON.parse(jsonString);
      const nodes: WorkflowNode[] = workflow.nodes || [];
      const connections: WorkflowConnection[] = workflow.connections || [];
      return { nodes, connections };
    } catch {
      return { nodes: [], connections: [] };
    }
  };

  const createTemplate = () => {
    if (!templateForm.name.trim() || !activeProject) return;
    const { nodes, connections } = parseWorkflowJson(templateForm.workflowJson);
    
    const newTemplate: N8nTemplate = {
      id: Date.now().toString(),
      name: templateForm.name.trim(),
      description: templateForm.description.trim(),
      category: templateForm.category,
      tags: templateForm.tags,
      nodes,
      connections,
      workflowJson: templateForm.workflowJson,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    updateProject({ templates: [...activeProject.templates, newTemplate] });
    setShowTemplateForm(false);
    setTemplateForm({ name: '', description: '', category: 'Other', tags: [], workflowJson: '' });
    setSelectedTemplateId(newTemplate.id);
    setActiveTab('canvas');
  };

  const saveEditTemplate = () => {
    if (!editingTemplateId || !templateForm.name.trim() || !activeProject) return;
    const { nodes, connections } = parseWorkflowJson(templateForm.workflowJson);
    
    updateProject({
      templates: activeProject.templates.map(t =>
        t.id === editingTemplateId
          ? {
              ...t,
              name: templateForm.name.trim(),
              description: templateForm.description.trim(),
              category: templateForm.category,
              tags: templateForm.tags,
              nodes,
              connections,
              workflowJson: templateForm.workflowJson,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    });
    setEditingTemplateId(null);
    setTemplateForm({ name: '', description: '', category: 'Other', tags: [], workflowJson: '' });
  };

  const deleteTemplate = (id: string) => {
    if (!activeProject) return;
    updateProject({ templates: activeProject.templates.filter(t => t.id !== id) });
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
    }
    setConfirmDeleteTemplateId(null);
  };

  const copyTemplateJson = (template: N8nTemplate) => {
    navigator.clipboard.writeText(template.workflowJson);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const importWorkflowJson = (jsonString: string) => {
    try {
      JSON.parse(jsonString);
      setTemplateForm({ ...templateForm, workflowJson: jsonString });
      setIsImporting(false);
    } catch {
      alert('Invalid JSON format');
    }
  };

  // ─── Search & Filter ─────────────────────────────────────────────────────────

  const filteredTemplates = activeProject?.templates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-neutral-950 dark:to-neutral-900">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto">
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Workflow className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-neutral-900 dark:text-white">{title}</h1>
                <p className="text-xs text-neutral-500">
                  {activeProject ? `${activeProject.templates.length} templates` : 'No project selected'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              {[
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'templates', label: 'Templates', icon: GitBranch },
                { id: 'canvas', label: 'Canvas', icon: Eye },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-neutral-700 text-indigo-600 shadow-sm'
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
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Workflow Projects</h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
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
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg"
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
                      ? 'border-indigo-500 shadow-lg'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-indigo-300'
                  }`}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Workflow className="w-5 h-5 text-indigo-500" />
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
                      <GitBranch className="w-3 h-3" />
                      {project.templates.length} templates
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <Workflow className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No workflow projects yet</p>
                <p className="text-sm">Create your first project to start</p>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && activeProject && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowTemplateForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90"
              >
                <Plus className="w-5 h-5" />
                New Template
              </button>
            </div>

            {/* Template Form */}
            {(showTemplateForm || editingTemplateId) && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-4">
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {editingTemplateId ? 'Edit Template' : 'Create New Template'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Template Name</label>
                    <input
                      type="text"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="Enter template name"
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 mb-1 block">Category</label>
                    <select
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-neutral-500 mb-1 block">Description</label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      placeholder="Describe what this workflow does..."
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-neutral-500 mb-1 block">Workflow JSON</label>
                    <textarea
                      value={templateForm.workflowJson}
                      onChange={(e) => setTemplateForm({ ...templateForm, workflowJson: e.target.value })}
                      placeholder='{"nodes": [], "connections": []}'
                      className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl outline-none resize-none font-mono text-sm"
                      rows={8}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={editingTemplateId ? saveEditTemplate : createTemplate}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg"
                  >
                    {editingTemplateId ? 'Save' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateForm(false);
                      setEditingTemplateId(null);
                      setTemplateForm({ name: '', description: '', category: 'Other', tags: [], workflowJson: '' });
                    }}
                    className="px-6 py-2 text-neutral-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Template List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-indigo-500" />
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                        {template.category}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setActiveTab('canvas');
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                        title="View in canvas"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => copyTemplateJson(template)}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                        title="Copy JSON"
                      >
                        {copiedId === template.id ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplateId(template.id);
                          setTemplateForm({
                            name: template.name,
                            description: template.description,
                            category: template.category,
                            tags: template.tags,
                            workflowJson: template.workflowJson
                          });
                        }}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {confirmDeleteTemplateId === template.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                          >
                            Del
                          </button>
                          <button
                            onClick={() => setConfirmDeleteTemplateId(null)}
                            className="px-2 py-1 bg-neutral-200 dark:bg-neutral-700 rounded text-xs"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteTemplateId(template.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                    {template.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{template.nodes.length} nodes</span>
                    <span>•</span>
                    <span>{template.connections.length} connections</span>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No templates found</p>
                <p className="text-sm">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Create your first workflow template'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Canvas Tab */}
        {activeTab === 'canvas' && selectedTemplate && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{selectedTemplate.name}</h2>
                <p className="text-sm text-neutral-500">{selectedTemplate.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCanvasZoom(Math.max(0.5, canvasZoom - 0.1))}
                  className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50"
                >
                  <span className="text-sm">−</span>
                </button>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 min-w-[60px] text-center">
                  {Math.round(canvasZoom * 100)}%
                </span>
                <button
                  onClick={() => setCanvasZoom(Math.min(2, canvasZoom + 0.1))}
                  className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50"
                >
                  <span className="text-sm">+</span>
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div 
              ref={canvasRef}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              style={{ height: '600px' }}
            >
              <div 
                className="relative w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:20px_20px]"
                style={{ 
                  transform: `scale(${canvasZoom}) translate(${canvasPan.x}px, ${canvasPan.y}px)`,
                  transformOrigin: 'center'
                }}
              >
                {/* Render nodes */}
                {selectedTemplate.nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="absolute bg-white dark:bg-neutral-800 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 p-4 shadow-lg"
                    style={{
                      left: node.position?.x || index * 200 + 100,
                      top: node.position?.y || 100,
                      borderColor: NODE_COLORS[node.type] || NODE_COLORS.default
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: NODE_COLORS[node.type] || NODE_COLORS.default }}
                      />
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        {node.type}
                      </span>
                    </div>
                    <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {node.name}
                    </p>
                  </div>
                ))}

                {/* Render connections */}
                <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                  {selectedTemplate.connections.map((conn, index) => {
                    const sourceNode = selectedTemplate.nodes.find(n => n.id === conn.source);
                    const targetNode = selectedTemplate.nodes.find(n => n.id === conn.target);
                    if (!sourceNode || !targetNode) return null;

                    const sourceX = (sourceNode.position?.x || index * 200 + 100) + 100;
                    const sourceY = (sourceNode.position?.y || 100) + 40;
                    const targetX = (targetNode.position?.x || (index + 1) * 200 + 100);
                    const targetY = (targetNode.position?.y || 100) + 40;

                    return (
                      <line
                        key={`${conn.source}-${conn.target}-${index}`}
                        x1={sourceX}
                        y1={sourceY}
                        x2={targetX}
                        y2={targetY}
                        stroke="#6366f1"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Template Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Category</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{selectedTemplate.category}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Nodes</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{selectedTemplate.nodes.length}</p>
              </div>
              <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Connections</p>
                <p className="font-semibold text-neutral-900 dark:text-white">{selectedTemplate.connections.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'canvas' && !selectedTemplate && (
          <div className="text-center py-20 text-neutral-400">
            <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No template selected</p>
            <p className="text-sm">Select a template from the Templates tab to view it here</p>
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
      <TemplateFooter />
    </div>
  );
}
