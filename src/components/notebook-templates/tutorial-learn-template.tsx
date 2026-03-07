'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Circle
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface Section {
  id: string;
  name: string;
  text: string;
  imageUrl?: string;
  imageFile?: File;
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
  steps: Step[];
  createdAt: string;
}

interface TutorialLearnTemplateProps {
  title: string;
  notebookId?: string;
}

export function TutorialLearnTemplate({ title, notebookId }: TutorialLearnTemplateProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageSection, setCurrentImageSection] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newStep, setNewStep] = useState({ name: '' });
  const [newSection, setNewSection] = useState({ name: '', text: '' });

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        const dataToSave = projects.map(project => ({
          ...project,
          steps: project.steps.map(step => ({
            ...step,
            sections: step.sections.map(section => ({
              id: section.id,
              name: section.name,
              text: section.text,
              imageUrl: section.imageUrl
            }))
          }))
        }));
        localStorage.setItem(`tutorial-learn-${notebookId}`, JSON.stringify({ projects: dataToSave }));
      } catch (error) {
        console.error("Failed to save:", error);
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  useEffect(() => {
    if (!notebookId) return;
    try {
      const saved = localStorage.getItem(`tutorial-learn-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [projects]);

  const addProject = () => {
    if (!newProject.name.trim()) return;
    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      steps: [],
      createdAt: new Date().toISOString()
    };
    setProjects([project, ...projects]);
    setSelectedProject(project.id);
    setNewProject({ name: '', description: '' });
    setIsAddingProject(false);
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
      text: newSection.text
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
    setNewSection({ name: '', text: '' });
    setIsAddingSection(null);
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

  const handleImageUpload = (stepId: string, sectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateSection(stepId, sectionId, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
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

          if (section.imageUrl) {
            if (yPosition > pageHeight - 80) {
              doc.addPage();
              yPosition = 20;
            }
            try {
              doc.addImage(section.imageUrl, 'JPEG', margin + 5, yPosition, 80, 60);
              yPosition += 65;
            } catch (error) {
              console.error('Error adding image:', error);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:to-neutral-900">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Create step-by-step tutorials with images and text
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Projects
                  </h2>
                  <Button
                    onClick={() => setIsAddingProject(true)}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>

                <div className="space-y-2">
                  {projects.map((project) => (
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
                          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                            <FileText className="w-3 h-3" />
                            {project.steps.length} steps
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {projects.length === 0 && (
                    <div className="text-center py-8 text-neutral-400 dark:text-neutral-600">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No projects yet</p>
                      <p className="text-xs mt-1">Click "New" to create one</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {currentProject ? (
                <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {currentProject.name}
                      </h2>
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
                      <Button
                        onClick={() => setIsAddingStep(true)}
                        size="sm"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Step
                      </Button>
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
                              <div className="flex-1">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                  Step {index + 1}: {step.name}
                                </h3>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                  {step.sections.length} section{step.sections.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteStep(step.id);
                                }}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            setCurrentImageSection(section.id);
                                            fileInputRef.current?.click();
                                          }}
                                          className="p-1 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                          title="Upload image"
                                        >
                                          <Upload className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setEditingSection(section.id)}
                                          className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                          title="Edit text"
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
                                    </div>

                                    {editingSection === section.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          value={section.text}
                                          onChange={(e) => updateSection(step.id, section.id, { text: e.target.value })}
                                          className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                                          rows={4}
                                          placeholder="Enter section text..."
                                        />
                                        <Button
                                          onClick={() => setEditingSection(null)}
                                          size="sm"
                                          className="bg-green-500 text-white hover:bg-green-600"
                                        >
                                          <Save className="w-4 h-4 mr-1" />
                                          Save
                                        </Button>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">
                                        {section.text || 'No text added yet'}
                                      </p>
                                    )}

                                    {section.imageUrl && (
                                      <div className="mt-3">
                                        <img
                                          src={section.imageUrl}
                                          alt={section.name}
                                          className="max-w-full h-auto rounded-lg border border-neutral-200 dark:border-neutral-700"
                                        />
                                      </div>
                                    )}

                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (currentImageSection === section.id) {
                                          handleImageUpload(step.id, section.id, e);
                                          setCurrentImageSection(null);
                                        }
                                      }}
                                    />
                                  </div>
                                ))}

                                <Button
                                  onClick={() => setIsAddingSection(step.id)}
                                  size="sm"
                                  variant="outline"
                                  className="w-full border-dashed border-2"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Section
                                </Button>
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

        {isAddingSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-8"
            onClick={() => setIsAddingSection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full h-full max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">New Section</h3>
                <button
                  onClick={() => setIsAddingSection(null)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Section Name *
                  </label>
                  <input
                    type="text"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                    placeholder="e.g., Installation"
                    autoFocus
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 flex-shrink-0">
                    Text Content
                  </label>
                  <textarea
                    value={newSection.text}
                    onChange={(e) => setNewSection({ ...newSection, text: e.target.value })}
                    className="w-full h-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white resize-none"
                    placeholder="Enter the content for this section..."
                  />
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => addSection(isAddingSection)}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
                  >
                    Add Section
                  </Button>
                  <Button
                    onClick={() => setIsAddingSection(null)}
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
