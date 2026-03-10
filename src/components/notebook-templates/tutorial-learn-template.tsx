'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Info,
  Image as ImageIcon,
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  Save,
  Upload,
  Type,
  Layers,
  CheckCircle,
  Circle,
  Search,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateFooter } from './template-footer';

const PROJECT_CATEGORIES = ['AI', 'Prompting', 'Software', 'Ecommerce'] as const;

interface Section {
  id: string;
  name: string;
  text: string;
  imageUrl?: string; // deprecated, use imageUrls
  imageUrls?: string[]; // Cloudinary URLs
  url?: string;
}

interface Step {
  id: string;
  name: string;
  sections: Section[];
  isCompleted: boolean;
  order: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: Step[];
  createdAt: string;
}

export interface TutorialLearnProject {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: TutorialLearnStep[];
  createdAt: string;
}

export interface TutorialLearnStep {
  id: string;
  name: string;
  sections: { id: string; name: string; text: string; imageUrls?: string[]; url?: string }[];
  isCompleted: boolean;
  order: number;
}

interface TutorialLearnTemplateProps {
  title: string;
  notebookId?: string;
  readOnly?: boolean;
  initialProjects?: TutorialLearnProject[];
}

export function TutorialLearnTemplate({ title, notebookId, readOnly, initialProjects }: TutorialLearnTemplateProps) {
  const [projects, setProjects] = useState<Project[]>(readOnly && initialProjects ? initialProjects : []);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<{ stepId: string; sectionId: string } | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectionFormImageRef = useRef<HTMLInputElement>(null);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectCategoryFilter, setProjectCategoryFilter] = useState<string>('All');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({ name: '', description: '', category: 'AI' as string });
  const [newStep, setNewStep] = useState({ name: '' });
  const [newSection, setNewSection] = useState({ name: '', text: '', imageUrls: [] as string[], url: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [loadDone, setLoadDone] = useState(false);
  const pageIdRef = useRef<string | null>(null);

  const TEMPLATE_PAGE_TITLE = '__tutorial_learn_template__';

  const ensureTemplatePage = useCallback(async (): Promise<string | null> => {
    if (!notebookId) return null;
    const res = await fetch(`/api/notebooks/${notebookId}/pages`);
    if (!res.ok) return null;
    const json = await res.json();
    const pages: any[] = json.pages ?? [];
    const existing = pages.find((p: any) => p.title === TEMPLATE_PAGE_TITLE);
    if (existing) return typeof existing._id === 'string' ? existing._id : String(existing._id);
    const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: TEMPLATE_PAGE_TITLE, content: JSON.stringify({ projects: [] }) }),
    });
    if (!cr.ok) return null;
    const created = await cr.json();
    const page = created.page ?? created;
    return page?._id != null ? String(page._id) : null;
  }, [notebookId]);

  useEffect(() => {
    if (readOnly && initialProjects) {
      setLoadDone(true);
      return;
    }
    if (!notebookId) {
      setLoadDone(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notebooks/${notebookId}/pages`);
        if (!res.ok) {
          setLoadDone(true);
          return;
        }
        const json = await res.json();
        const pages: any[] = json.pages ?? [];
        const existing = pages.find((p: any) => p.title === TEMPLATE_PAGE_TITLE);
        if (cancelled) return;
        if (existing) {
          pageIdRef.current = typeof existing._id === 'string' ? existing._id : String(existing._id);
          try {
            const data = typeof existing.content === 'string' ? JSON.parse(existing.content || '{}') : existing.content || {};
            const list = Array.isArray(data.projects) ? data.projects : [];
            const loaded = list.map((p: any) => ({
              ...p,
              category: p.category || 'AI',
              steps: (p.steps || []).map((s: any) => ({
                ...s,
                sections: (s.sections || []).map((sec: any) => ({
                  ...sec,
                  url: sec.url || '',
                  imageUrls: Array.isArray(sec.imageUrls) ? sec.imageUrls : (sec.imageUrl ? [sec.imageUrl] : [])
                }))
              }))
            }));
            setProjects(loaded);
          } catch {
            await fetch(`/api/notebooks/${notebookId}/pages/${existing._id}`, { method: 'DELETE' });
          }
        } else {
          const cr = await fetch(`/api/notebooks/${notebookId}/pages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: TEMPLATE_PAGE_TITLE, content: JSON.stringify({ projects: [] }) }),
          });
          if (!cr.ok) {
            setLoadDone(true);
            return;
          }
          const created = await cr.json();
          const page = created.page ?? created;
          const id = page?._id != null ? String(page._id) : null;
          if (!cancelled && id) pageIdRef.current = id;
        }
      } catch (err) {
        console.error('Tutorial Learn load failed:', err);
      } finally {
        if (!cancelled) setLoadDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, [notebookId]);

  const persistToDb = useCallback(() => {
    if (readOnly || !notebookId || !loadDone) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      let pageId = pageIdRef.current;
      if (!pageId) pageId = await ensureTemplatePage();
      if (pageId) pageIdRef.current = pageId;
      if (!pageId) return;
      setSaving(true);
      try {
        const dataToSave = projects.map(project => ({
          ...project,
          category: project.category || 'AI',
          steps: project.steps.map(step => ({
            ...step,
            sections: step.sections.map(section => ({
              id: section.id,
              name: section.name,
              text: section.text,
              imageUrls: section.imageUrls ?? (section.imageUrl ? [section.imageUrl] : []),
              url: section.url
            }))
          }))
        }));
        const patchRes = await fetch(`/api/notebooks/${notebookId}/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: TEMPLATE_PAGE_TITLE, content: JSON.stringify({ projects: dataToSave }) }),
        });
        if (patchRes.status === 404) {
          pageIdRef.current = null;
          const newId = await ensureTemplatePage();
          if (newId) {
            pageIdRef.current = newId;
            await fetch(`/api/notebooks/${notebookId}/pages/${newId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: TEMPLATE_PAGE_TITLE, content: JSON.stringify({ projects: dataToSave }) }),
            });
          }
        }
      } catch (err) {
        console.error('Tutorial Learn persist failed:', err);
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [notebookId, projects, loadDone, ensureTemplatePage, readOnly]);

  useEffect(() => {
    if (readOnly) return;
    if (loadDone) persistToDb();
  }, [projects, loadDone, persistToDb, readOnly]);

  useEffect(() => {
    if (editingProjectId) {
      const proj = projects.find(p => p.id === editingProjectId);
      if (proj) setNewProject({ name: proj.name, description: proj.description, category: proj.category || 'AI' });
    }
  }, [editingProjectId, projects]);

  const addProject = () => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      category: newProject.category || 'AI',
      steps: [],
      createdAt: new Date().toISOString()
    };
    setProjects([project, ...projects]);
    setSelectedProject(project.id);
    setNewProject({ name: '', description: '', category: 'AI' });
    setIsAddingProject(false);
  };

  const updateProject = (updates: Partial<Pick<Project, 'name' | 'description' | 'category'>>) => {
    if (!editingProjectId) return;
    setProjects(projects.map(p => p.id === editingProjectId ? { ...p, ...updates } : p));
    setEditingProjectId(null);
  };

  const updateStepName = (stepId: string, name: string) => {
    if (!selectedProject) return;
    setProjects(projects.map(p =>
      p.id === selectedProject
        ? { ...p, steps: p.steps.map(s => s.id === stepId ? { ...s, name } : s) }
        : p
    ));
    setEditingStepId(null);
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
    if (selectedProject === id) {
      setSelectedProject(null);
    }
  };

  const addStep = () => {
    if (!selectedProject || !newStep.name.trim()) return;
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    const step: Step = {
      id: Date.now().toString(),
      name: newStep.name,
      sections: [],
      isCompleted: false,
      order: project.steps.length + 1
    };

    setProjects(projects.map(p => 
      p.id === selectedProject 
        ? { ...p, steps: [...p.steps, step] }
        : p
    ));
    setNewStep({ name: '' });
    setIsAddingStep(false);
    setExpandedSteps(new Set([...expandedSteps, step.id]));
  };

  const deleteStep = (stepId: string) => {
    if (!selectedProject) return;
    setProjects(projects.map(p => 
      p.id === selectedProject 
        ? { ...p, steps: p.steps.filter(s => s.id !== stepId) }
        : p
    ));
    setExpandedSteps(new Set([...expandedSteps].filter(id => id !== stepId)));
  };

  const toggleStepCompletion = (stepId: string) => {
    if (!selectedProject) return;
    setProjects(projects.map(p => 
      p.id === selectedProject 
        ? {
            ...p,
            steps: p.steps.map(s => 
              s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s
            )
          }
        : p
    ));
  };

  const addSection = (stepId: string) => {
    if (!selectedProject || !newSection.name.trim()) return;

    const section: Section = {
      id: Date.now().toString(),
      name: newSection.name,
      text: newSection.text,
      imageUrls: newSection.imageUrls.length ? newSection.imageUrls : undefined,
      url: newSection.url?.trim() || undefined
    };

    setProjects(projects.map(p => 
      p.id === selectedProject 
        ? {
            ...p,
            steps: p.steps.map(s => 
              s.id === stepId 
                ? { ...s, sections: [...s.sections, section] }
                : s
            )
          }
        : p
    ));
    setNewSection({ name: '', text: '', imageUrls: [], url: '' });
    setIsAddingSection(null);
  };

  const saveSectionEdit = () => {
    if (!selectedProject || !editingSectionId) return;
    const { stepId, sectionId } = editingSectionId;
    updateSection(stepId, sectionId, {
      name: newSection.name,
      text: newSection.text,
      imageUrls: newSection.imageUrls.length ? newSection.imageUrls : undefined,
      url: newSection.url?.trim() || undefined
    });
    setNewSection({ name: '', text: '', imageUrls: [], url: '' });
    setEditingSectionId(null);
  };

  const openEditSection = (stepId: string, section: Section) => {
    const urls = section.imageUrls ?? (section.imageUrl ? [section.imageUrl] : []);
    setNewSection({
      name: section.name,
      text: section.text,
      imageUrls: urls,
      url: section.url || ''
    });
    setEditingSectionId({ stepId, sectionId: section.id });
  };

  const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      form.append('type', 'attachment');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (res.ok) {
        const json = await res.json();
        if (json.url) urls.push(json.url);
      }
    }
    return urls;
  };

  const updateSection = (stepId: string, sectionId: string, updates: Partial<Section>) => {
    if (!selectedProject) return;
    setProjects(projects.map(p => 
      p.id === selectedProject 
        ? {
            ...p,
            steps: p.steps.map(s => 
              s.id === stepId 
                ? {
                    ...s,
                    sections: s.sections.map(sec => 
                      sec.id === sectionId ? { ...sec, ...updates } : sec
                    )
                  }
                : s
            )
          }
        : p
    ));
  };

  const deleteSection = (stepId: string, sectionId: string) => {
    if (!selectedProject) return;
    setProjects(projects.map(p => 
      p.id === selectedProject 
        ? {
            ...p,
            steps: p.steps.map(s => 
              s.id === stepId 
                ? { ...s, sections: s.sections.filter(sec => sec.id !== sectionId) }
                : s
            )
          }
        : p
    ));
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const exportToPDF = async () => {
    const project = projects.find(p => p.id === selectedProject);
    if (!project) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      doc.setFontSize(20);
      doc.text(project.name, margin, yPosition);
      yPosition += 10;

      if (project.description) {
        doc.setFontSize(12);
        doc.text(project.description, margin, yPosition);
        yPosition += 15;
      }

      project.steps.forEach((step, stepIndex) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(16);
        doc.text(`Step ${stepIndex + 1}: ${step.name}`, margin, yPosition);
        yPosition += 10;

        step.sections.forEach((section) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(14);
          doc.text(section.name, margin + 5, yPosition);
          yPosition += 8;

          if (section.text) {
            doc.setFontSize(11);
            const splitText = doc.splitTextToSize(section.text, 170);
            doc.text(splitText, margin + 5, yPosition);
            yPosition += splitText.length * 6;
          }

          const imgs = section.imageUrls ?? (section.imageUrl ? [section.imageUrl] : []);
          for (const imgUrl of imgs) {
            if (yPosition > pageHeight - 80) {
              doc.addPage();
              yPosition = 20;
            }
            try {
              doc.addImage(imgUrl, 'JPEG', margin + 5, yPosition, 80, 60);
              yPosition += 65;
            } catch {
              try {
                doc.addImage(imgUrl, 'PNG', margin + 5, yPosition, 80, 60);
                yPosition += 65;
              } catch (error) {
                console.error('Error adding image:', error);
              }
            }
          }

          yPosition += 5;
        });

        yPosition += 10;
      });

      doc.save(`${project.name.replace(/\s+/g, '_')}_tutorial.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please make sure you have an internet connection.');
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);

  const filteredProjects = projects.filter(p => {
    const matchSearch = !projectSearch.trim() || p.name.toLowerCase().includes(projectSearch.toLowerCase());
    const matchCategory = projectCategoryFilter === 'All' || p.category === projectCategoryFilter;
    return matchSearch && matchCategory;
  });

  const isSectionModalOpen = isAddingSection !== null || editingSectionId !== null;
  const sectionModalStepId = isAddingSection ?? editingSectionId?.stepId ?? null;

  return (
    <div className="h-full min-h-0 flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:to-neutral-900">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {!readOnly && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowDocumentation(true)}
                className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                title="Documentation"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                <div className="mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    {title}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Create step-by-step tutorials with images and text
                  </p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Projects
                  </h3>
                  {!readOnly && (
                    <Button
                      onClick={() => setIsAddingProject(true)}
                      size="sm"
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search by project name..."
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    />
                  </div>
                  <select
                    value={projectCategoryFilter}
                    onChange={(e) => setProjectCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="All">All categories</option>
                    {PROJECT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedProject === project.id
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-700'
                          : 'bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-2 border-transparent'
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                              {project.category || 'AI'}
                            </span>
                            <span className="text-xs text-neutral-500 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {project.steps.length} steps
                            </span>
                          </div>
                        </div>
                        {!readOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {filteredProjects.length === 0 && (
                    <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{projects.length === 0 ? 'No projects yet' : 'No projects match filters'}</p>
                      <p className="text-xs mt-1">{projects.length === 0 ? 'Click "New" to create one' : 'Try a different search or category'}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {currentProject ? (
                <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                          {currentProject.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                          {currentProject.category || 'AI'}
                        </span>
                        {!readOnly && (
                          <button
                            onClick={() => {
                              setNewProject({ name: currentProject.name, description: currentProject.description, category: currentProject.category || 'AI' });
                              setEditingProjectId(currentProject.id);
                            }}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                            title="Edit project"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {currentProject.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          {currentProject.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={exportToPDF}
                        size="sm"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export PDF
                      </Button>
                      {!readOnly && (
                        <Button
                          onClick={() => setIsAddingStep(true)}
                          size="sm"
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Step
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentProject.steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden"
                      >
                        <div
                          className={`p-4 cursor-pointer transition-colors ${
                            step.isCompleted
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : 'bg-neutral-50 dark:bg-neutral-800/50'
                          }`}
                          onClick={() => toggleStepExpansion(step.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {!readOnly ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStepCompletion(step.id);
                                  }}
                                  className="p-1 hover:bg-white/50 dark:hover:bg-neutral-700/50 rounded transition-colors"
                                >
                                  {step.isCompleted ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-neutral-400" />
                                  )}
                                </button>
                              ) : (
                                step.isCompleted ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" /> : <Circle className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                {!readOnly && editingStepId === step.id ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-neutral-500 text-sm">Step {index + 1}:</span>
                                    <input
                                      type="text"
                                      value={step.name}
                                      onChange={(e) => {
                                        setProjects(projects.map(p =>
                                          p.id === selectedProject
                                            ? { ...p, steps: p.steps.map(s => s.id === step.id ? { ...s, name: e.target.value } : s) }
                                            : p
                                        ));
                                      }}
                                      onBlur={() => setEditingStepId(null)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') setEditingStepId(null); }}
                                      className="flex-1 min-w-0 px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                      Step {index + 1}: {step.name}
                                      {!readOnly && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditingStepId(step.id); }}
                                          className="p-0.5 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                                          title="Edit step name"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                      {step.sections.length} section{step.sections.length !== 1 ? 's' : ''}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!readOnly && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteStep(step.id);
                                  }}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                              {expandedSteps.has(step.id) ? (
                                <ChevronDown className="w-5 h-5 text-neutral-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-neutral-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedSteps.has(step.id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-neutral-200 dark:border-neutral-700"
                            >
                              <div className="p-4 space-y-4">
                                {step.sections.map((section) => (
                                  <div
                                    key={section.id}
                                    className="p-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <h4 className="font-medium text-neutral-900 dark:text-white">
                                        {section.name}
                                      </h4>
                                      {!readOnly && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => openEditSection(step.id, section)}
                                            className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                            title="Edit section"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => deleteSection(step.id, section.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                                      {section.text || 'No text added yet'}
                                    </p>

                                    {((section.imageUrls?.length ?? 0) > 0 || section.imageUrl) && (
                                      <div className="mt-3 flex flex-wrap gap-3">
                                        {(section.imageUrls ?? (section.imageUrl ? [section.imageUrl] : [])).map((url, i) => (
                                          <img
                                            key={i}
                                            src={url}
                                            alt={`${section.name} ${i + 1}`}
                                            className="max-w-full h-auto max-h-48 rounded-lg border border-neutral-200 dark:border-neutral-700 object-cover"
                                          />
                                        ))}
                                      </div>
                                    )}

                                    {section.url && (
                                      <div className="mt-2">
                                        <a
                                          href={section.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                        >
                                          <LinkIcon className="w-4 h-4" />
                                          {section.url}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {!readOnly && (
                                  <Button
                                    onClick={() => {
                                      setNewSection({ name: '', text: '', imageUrls: [], url: '' });
                                      setIsAddingSection(step.id);
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-dashed border-2"
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Section
                                  </Button>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}

                    {currentProject.steps.length === 0 && (
                      <div className="text-center py-12 text-neutral-400 dark:text-neutral-600">
                        <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No steps yet</p>
                        <p className="text-xs mt-1">Click "Add Step" to create your first step</p>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="p-12 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                  <div className="text-center text-neutral-400 dark:text-neutral-600">
                    <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a project to get started</p>
                    <p className="text-sm mt-2">or create a new one</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAddingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddingProject(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">New Project</h3>
                <button
                  onClick={() => setIsAddingProject(false)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="e.g., React Basics Tutorial"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    {PROJECT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="Brief description of the tutorial..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={addProject}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                  >
                    Create Project
                  </Button>
                  <Button
                    onClick={() => setIsAddingProject(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {editingProjectId && (() => {
          const proj = projects.find(p => p.id === editingProjectId);
          if (!proj) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setEditingProjectId(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Edit Project</h3>
                  <button onClick={() => setEditingProjectId(null)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Project Name *</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                      placeholder="e.g., React Basics Tutorial"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    >
                      {PROJECT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Description</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                      rows={3}
                      placeholder="Brief description..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateProject({ name: newProject.name, description: newProject.description, category: newProject.category })}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                    >
                      Save
                    </Button>
                    <Button onClick={() => setEditingProjectId(null)} variant="outline">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}

        {isAddingStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddingStep(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">New Step</h3>
                <button
                  onClick={() => setIsAddingStep(false)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Step Name *
                  </label>
                  <input
                    type="text"
                    value={newStep.name}
                    onChange={(e) => setNewStep({ name: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="e.g., Setting up the environment"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={addStep}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                  >
                    Add Step
                  </Button>
                  <Button
                    onClick={() => setIsAddingStep(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isSectionModalOpen && sectionModalStepId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => { setEditingSectionId(null); setIsAddingSection(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-[calc(100vw-4rem)] h-full max-h-[calc(100vh-4rem)] shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {editingSectionId ? 'Edit Section' : 'New Section'}
                </h3>
                <button
                  onClick={() => { setEditingSectionId(null); setIsAddingSection(null); }}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Section Name *</label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="e.g., Installation"
                    autoFocus={!editingSectionId}
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-[120px]">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Text Content</label>
                  <textarea
                    value={newSection.text}
                    onChange={(e) => setNewSection({ ...newSection, text: e.target.value })}
                    className="w-full flex-1 min-h-[120px] p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    placeholder="Enter the content for this section..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Images (upload to Cloudinary)</label>
                  <input
                    ref={sectionFormImageRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (!files.length) return;
                      setUploadingImages(true);
                      try {
                        const urls = await uploadImagesToCloudinary(files);
                        setNewSection(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
                      } catch (err) {
                        console.error('Upload failed:', err);
                      } finally {
                        setUploadingImages(false);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => sectionFormImageRef.current?.click()}
                    disabled={uploadingImages}
                    className="gap-1"
                  >
                    {uploadingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingImages ? 'Uploading...' : 'Upload images'}
                  </Button>
                  {newSection.imageUrls.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newSection.imageUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`Upload ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
                          <button
                            type="button"
                            onClick={() => setNewSection(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, idx) => idx !== i) }))}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" /> URL (optional)
                  </label>
                  <input
                    type="url"
                    value={newSection.url}
                    onChange={(e) => setNewSection({ ...newSection, url: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-2 flex-shrink-0 pt-2">
                  <Button
                    onClick={() => editingSectionId ? saveSectionEdit() : addSection(sectionModalStepId)}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                  >
                    {editingSectionId ? <><Save className="w-4 h-4 mr-1" /> Save</> : <><Plus className="w-4 h-4 mr-1" /> Add Section</>}
                  </Button>
                  <Button
                    onClick={() => { setEditingSectionId(null); setIsAddingSection(null); }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDocumentation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDocumentation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Tutorial Learn Template Guide
                </h3>
                <button
                  onClick={() => setShowDocumentation(false)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 text-neutral-700 dark:text-neutral-300">
                <section>
                  <h4 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">
                    📚 Overview
                  </h4>
                  <p className="text-sm">
                    Create comprehensive step-by-step tutorials with text and images. Perfect for documentation,
                    training materials, and educational content.
                  </p>
                </section>

                <section>
                  <h4 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">
                    🎯 Features
                  </h4>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Create multiple tutorial projects</li>
                    <li>Organize content into steps and sections</li>
                    <li>Add text and images to each section</li>
                    <li>Mark steps as completed</li>
                    <li>Export tutorials as PDF documents</li>
                    <li>Auto-save functionality</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">
                    📝 How to Use
                  </h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Click "New" to create a tutorial project</li>
                    <li>Select the project and click "Add Step" to create steps</li>
                    <li>Click on a step to expand it and add sections</li>
                    <li>Use the upload button to add images to sections</li>
                    <li>Use the edit button to add or modify text</li>
                    <li>Mark steps as complete using the checkbox</li>
                    <li>Click "Export PDF" to download your tutorial</li>
                  </ol>
                </section>

                <section>
                  <h4 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">
                    💡 Tips
                  </h4>
                  <ul className="text-sm space-y-2 list-disc list-inside">
                    <li>Use clear, descriptive names for steps and sections</li>
                    <li>Add screenshots or diagrams to illustrate complex concepts</li>
                    <li>Break down complex procedures into smaller steps</li>
                    <li>Use the completion checkboxes to track progress</li>
                    <li>Export regularly to backup your tutorials</li>
                  </ul>
                </section>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => setShowDocumentation(false)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                >
                  Got it!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TemplateFooter />
    </div>
  );
}
