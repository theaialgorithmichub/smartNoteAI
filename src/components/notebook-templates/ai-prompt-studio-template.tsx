"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Play,
  Save,
  Download,
  Upload,
  Settings,
  Sparkles,
  Brain,
  Zap,
  BarChart3,
  Clock,
  Star,
  Edit2,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  FileText,
  Code,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface PromptVersion {
  id: string;
  version: number;
  prompt: string;
  timestamp: string;
  rating: number;
  notes: string;
}

interface TestResult {
  id: string;
  versionId: string;
  input: string;
  output: string;
  timestamp: string;
  latency: number;
  tokens: number;
  cost: number;
  rating: number;
}

interface PromptProject {
  id: string;
  name: string;
  description: string;
  category: 'text-generation' | 'code-generation' | 'analysis' | 'conversation' | 'creative' | 'other';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  versions: PromptVersion[];
  testResults: TestResult[];
  isExpanded: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface AIPromptStudioTemplateProps {
  title: string;
  notebookId?: string;
}

const MODELS = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google' },
];

const CATEGORIES = [
  { value: 'text-generation', label: 'Text Generation', icon: FileText, color: 'bg-blue-500' },
  { value: 'code-generation', label: 'Code Generation', icon: Code, color: 'bg-green-500' },
  { value: 'analysis', label: 'Analysis', icon: BarChart3, color: 'bg-purple-500' },
  { value: 'conversation', label: 'Conversation', icon: MessageSquare, color: 'bg-amber-500' },
  { value: 'creative', label: 'Creative', icon: Sparkles, color: 'bg-pink-500' },
  { value: 'other', label: 'Other', icon: Brain, color: 'bg-slate-500' },
];

export function AIPromptStudioTemplate({ title, notebookId }: AIPromptStudioTemplateProps) {
  const [projects, setProjects] = useState<PromptProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [isTestRunning, setIsTestRunning] = useState(false);

  const [newProject, setNewProject] = useState<Partial<PromptProject>>({
    name: '',
    description: '',
    category: 'text-generation',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    tags: [],
  });

  useEffect(() => {
    if (notebookId) {
      const saved = localStorage.getItem(`ai-prompt-studio-${notebookId}`);
      if (saved) {
        setProjects(JSON.parse(saved));
      }
    }
  }, [notebookId]);

  useEffect(() => {
    if (notebookId && projects.length > 0) {
      localStorage.setItem(`ai-prompt-studio-${notebookId}`, JSON.stringify(projects));
    }
  }, [projects, notebookId]);

  const createProject = () => {
    if (!newProject.name) return;

    const initialVersion: PromptVersion = {
      id: Date.now().toString(),
      version: 1,
      prompt: '',
      timestamp: new Date().toISOString(),
      rating: 0,
      notes: '',
    };

    const project: PromptProject = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description || '',
      category: newProject.category as any,
      model: newProject.model || 'gpt-4-turbo',
      temperature: newProject.temperature || 0.7,
      maxTokens: newProject.maxTokens || 2000,
      systemPrompt: newProject.systemPrompt || '',
      versions: [initialVersion],
      testResults: [],
      isExpanded: false,
      tags: newProject.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects(prev => [...prev, project]);
    setShowNewProject(false);
    setSelectedProject(project.id);
    setNewProject({
      name: '',
      description: '',
      category: 'text-generation',
      model: 'gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: '',
      tags: [],
    });
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject === projectId) {
      setSelectedProject(null);
    }
  };

  const addPromptVersion = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      const latestVersion = p.versions[p.versions.length - 1];
      const newVersion: PromptVersion = {
        id: Date.now().toString(),
        version: latestVersion.version + 1,
        prompt: latestVersion.prompt,
        timestamp: new Date().toISOString(),
        rating: 0,
        notes: '',
      };

      return {
        ...p,
        versions: [...p.versions, newVersion],
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const updatePromptVersion = (projectId: string, versionId: string, prompt: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      return {
        ...p,
        versions: p.versions.map(v => 
          v.id === versionId ? { ...v, prompt } : v
        ),
        updatedAt: new Date().toISOString(),
      };
    }));
  };

  const rateVersion = (projectId: string, versionId: string, rating: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      return {
        ...p,
        versions: p.versions.map(v => 
          v.id === versionId ? { ...v, rating } : v
        ),
      };
    }));
  };

  const runTest = async (projectId: string, versionId: string) => {
    if (!testInput.trim()) return;

    setIsTestRunning(true);

    // Simulate API call (replace with actual OpenAI/Anthropic/etc. call)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const testResult: TestResult = {
      id: Date.now().toString(),
      versionId,
      input: testInput,
      output: 'This is a simulated AI response. In production, this would be the actual API response.',
      timestamp: new Date().toISOString(),
      latency: Math.random() * 3000 + 500,
      tokens: Math.floor(Math.random() * 500 + 100),
      cost: Math.random() * 0.05 + 0.01,
      rating: 0,
    };

    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      return {
        ...p,
        testResults: [...p.testResults, testResult],
      };
    }));

    setIsTestRunning(false);
    setTestInput('');
  };

  const exportProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const latestVersion = selectedProjectData?.versions[selectedProjectData.versions.length - 1];

  const stats = selectedProjectData ? {
    totalVersions: selectedProjectData.versions.length,
    totalTests: selectedProjectData.testResults.length,
    avgLatency: selectedProjectData.testResults.length > 0
      ? Math.round(selectedProjectData.testResults.reduce((sum, r) => sum + r.latency, 0) / selectedProjectData.testResults.length)
      : 0,
    totalCost: selectedProjectData.testResults.reduce((sum, r) => sum + r.cost, 0).toFixed(4),
  } : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-neutral-900 dark:to-purple-950">
      <TemplateHeader title={title} />

      <div className="flex-1 overflow-hidden p-6">
        <div className="max-w-full mx-auto h-full flex gap-6">
          {/* Projects Sidebar */}
          <div className="w-80 space-y-4">
            <Button
              onClick={() => setShowNewProject(true)}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>

            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {projects.map(project => {
                const categoryConfig = CATEGORIES.find(c => c.value === project.category);
                const Icon = categoryConfig?.icon || Brain;

                return (
                  <Card
                    key={project.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedProject === project.id
                        ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-500'
                        : 'bg-white/80 dark:bg-neutral-900/80 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${categoryConfig?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {project.versions.length} versions • {project.testResults.length} tests
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6 overflow-y-auto">
            {selectedProjectData ? (
              <>
                {/* Project Header */}
                <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {selectedProjectData.name}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-300">
                        {selectedProjectData.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => exportProject(selectedProjectData.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deleteProject(selectedProjectData.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  {stats && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-300">Versions</p>
                        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                          {stats.totalVersions}
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-300">Tests</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stats.totalTests}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-300">Avg Latency</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {stats.avgLatency}ms
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-slate-300">Total Cost</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${stats.totalCost}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Configuration */}
                <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuration
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Model
                      </label>
                      <select
                        value={selectedProjectData.model}
                        onChange={(e) => setProjects(prev => prev.map(p => 
                          p.id === selectedProject ? { ...p, model: e.target.value } : p
                        ))}
                        className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 text-sm"
                      >
                        {MODELS.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label} ({model.provider})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Temperature: {selectedProjectData.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={selectedProjectData.temperature}
                        onChange={(e) => setProjects(prev => prev.map(p => 
                          p.id === selectedProject ? { ...p, temperature: parseFloat(e.target.value) } : p
                        ))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        value={selectedProjectData.maxTokens}
                        onChange={(e) => setProjects(prev => prev.map(p => 
                          p.id === selectedProject ? { ...p, maxTokens: parseInt(e.target.value) } : p
                        ))}
                        className="w-full p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      System Prompt
                    </label>
                    <textarea
                      value={selectedProjectData.systemPrompt}
                      onChange={(e) => setProjects(prev => prev.map(p => 
                        p.id === selectedProject ? { ...p, systemPrompt: e.target.value } : p
                      ))}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                      rows={3}
                      placeholder="Enter system prompt..."
                    />
                  </div>
                </Card>

                {/* Prompt Versions */}
                <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Prompt Versions
                    </h3>
                    <Button
                      onClick={() => addPromptVersion(selectedProjectData.id)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Version
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {selectedProjectData.versions.map((version) => (
                      <div
                        key={version.id}
                        className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-violet-500 text-white text-xs font-bold rounded-full">
                              v{version.version}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(version.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => rateVersion(selectedProjectData.id, version.id, star)}
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    star <= version.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                            <Button
                              onClick={() => copyToClipboard(version.prompt)}
                              variant="ghost"
                              size="sm"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <textarea
                          value={version.prompt}
                          onChange={(e) => updatePromptVersion(selectedProjectData.id, version.id, e.target.value)}
                          className="w-full p-3 border rounded-lg dark:bg-neutral-900 dark:border-neutral-700 font-mono text-sm"
                          rows={6}
                          placeholder="Enter your prompt here..."
                        />
                        {version === latestVersion && (
                          <Button
                            onClick={() => setShowTestModal(true)}
                            className="mt-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                            size="sm"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Test This Version
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Test Results */}
                {selectedProjectData.testResults.length > 0 && (
                  <Card className="p-6 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Test Results
                    </h3>
                    <div className="space-y-4">
                      {selectedProjectData.testResults.slice().reverse().map((result) => (
                        <div
                          key={result.id}
                          className="p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-slate-500">
                              {new Date(result.timestamp).toLocaleString()}
                            </span>
                            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {result.latency.toFixed(0)}ms
                              </span>
                              <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                {result.tokens} tokens
                              </span>
                              <span className="flex items-center gap-1">
                                💰 ${result.cost.toFixed(4)}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                Input:
                              </p>
                              <p className="text-sm text-slate-900 dark:text-white bg-white dark:bg-neutral-900 p-2 rounded">
                                {result.input}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                                Output:
                              </p>
                              <p className="text-sm text-slate-900 dark:text-white bg-white dark:bg-neutral-900 p-2 rounded">
                                {result.output}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-12 text-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm">
                <Brain className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Select a project or create a new one to get started
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewProject(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  New Prompt Project
                </h2>
                <Button onClick={() => setShowNewProject(false)} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    placeholder="e.g., Blog Post Generator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    rows={3}
                    placeholder="Describe your prompt project..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Category
                    </label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value as any })}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                      Model
                    </label>
                    <select
                      value={newProject.model}
                      onChange={(e) => setNewProject({ ...newProject, model: e.target.value })}
                      className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    >
                      {MODELS.map(model => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={createProject}
                    disabled={!newProject.name}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                  <Button
                    onClick={() => setShowNewProject(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Modal */}
      <AnimatePresence>
        {showTestModal && latestVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Test Prompt
                </h2>
                <Button onClick={() => setShowTestModal(false)} variant="ghost" size="sm">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Test Input
                  </label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full p-3 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
                    rows={6}
                    placeholder="Enter test input..."
                    disabled={isTestRunning}
                  />
                </div>

                <Button
                  onClick={() => runTest(selectedProject!, latestVersion.id)}
                  disabled={!testInput.trim() || isTestRunning}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                >
                  {isTestRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Test
                    </>
                  )}
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
