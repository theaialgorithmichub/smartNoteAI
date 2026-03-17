/**
 * Final batch of template implementations covering all remaining templates.
 * Includes: TutorialLearn, AIPromptStudio, ProjectTemplate, LoopTemplate,
 * DoodleTemplate, DocumentTemplate, DashboardTemplate, N8NTemplate,
 * ImagePromptTemplate, VideoPromptTemplate, SoundBoxTemplate,
 * ResearchBuilderTemplate, PianoNotesTemplate, CustomTemplate
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Line, Circle as SvgCircle } from 'react-native-svg';
import { PanResponder } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { AIAPI } from '../../services/api';
import { Notebook, Page } from '../../types';

interface TemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (i: number) => void;
}

// ─── 1. Tutorial Learn ────────────────────────────────────────────────────────
interface TutorialSection { id: string; name: string; text: string; url?: string; }
interface TutorialStep { id: string; name: string; sections: TutorialSection[]; isCompleted: boolean; order: number; }
interface TutorialProject { id: string; name: string; description: string; category: string; steps: TutorialStep[]; }

export const TutorialLearnTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#10b981';
  const [projects, setProjects] = useState<TutorialProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', category: 'AI' });
  const CATEGORIES = ['AI', 'Prompting', 'Software', 'Ecommerce', 'Design', 'Marketing'];
  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeStep = activeProject?.steps.find(s => s.id === activeStepId);

  const addProject = () => {
    if (!projectForm.name.trim()) return;
    const project: TutorialProject = {
      id: Date.now().toString(),
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      category: projectForm.category,
      steps: [],
    };
    setProjects(p => [...p, project]);
    setProjectForm({ name: '', description: '', category: 'AI' });
    setShowProjectForm(false);
    setActiveProjectId(project.id);
  };

  const addStep = () => {
    if (!activeProjectId) return;
    const step: TutorialStep = { id: Date.now().toString(), name: `Step ${(activeProject?.steps.length || 0) + 1}`, sections: [], isCompleted: false, order: activeProject?.steps.length || 0 };
    setProjects(p => p.map(proj => proj.id === activeProjectId ? { ...proj, steps: [...proj.steps, step] } : proj));
    setActiveStepId(step.id);
  };

  const addSection = (stepId: string) => {
    if (!activeProjectId) return;
    const section: TutorialSection = { id: Date.now().toString(), name: 'New Section', text: '' };
    setProjects(p => p.map(proj => proj.id === activeProjectId ? {
      ...proj, steps: proj.steps.map(s => s.id === stepId ? { ...s, sections: [...s.sections, section] } : s)
    } : proj));
  };

  const updateSection = (stepId: string, sectionId: string, field: string, value: string) => {
    setProjects(p => p.map(proj => proj.id === activeProjectId ? {
      ...proj, steps: proj.steps.map(s => s.id === stepId ? {
        ...s, sections: s.sections.map(sec => sec.id === sectionId ? { ...sec, [field]: value } : sec)
      } : s)
    } : proj));
  };

  const toggleStep = (stepId: string) => {
    setProjects(p => p.map(proj => proj.id === activeProjectId ? {
      ...proj, steps: proj.steps.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s)
    } : proj));
  };

  const progress = activeProject ? (activeProject.steps.filter(s => s.isCompleted).length / Math.max(1, activeProject.steps.length)) * 100 : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="play-circle" size={22} color="#fff" />
          <Text style={styles.headerTitle}>Tutorial Learn</Text>
          {!activeProject && (
            <TouchableOpacity onPress={() => setShowProjectForm(true)} style={styles.headerAddBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        {activeProject && (
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{activeProject.steps.filter(s => s.isCompleted).length}/{activeProject.steps.length} steps done</Text>
              <Text style={styles.progressPct}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress}%` as any }]} /></View>
          </View>
        )}
      </LinearGradient>

      {!activeProject ? (
        <View>
          {projects.map(proj => (
            <TouchableOpacity key={proj.id} onPress={() => setActiveProjectId(proj.id)}
              style={[styles.projectCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={[styles.projectIcon, { backgroundColor: `${themeColor}20` }]}>
                <Ionicons name="layers" size={22} color={themeColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.projectName, { color: colors.foreground }]}>{proj.name}</Text>
                <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>{proj.category} • {proj.steps.length} steps</Text>
              </View>
              <View style={[styles.catBadge, { backgroundColor: `${themeColor}20` }]}>
                <Text style={[styles.catBadgeText, { color: themeColor }]}>{proj.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
          {projects.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>📚</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No tutorials yet</Text>
              <TouchableOpacity onPress={() => setShowProjectForm(true)} style={[styles.emptyBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.emptyBtnText}>Create Tutorial</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View>
          <TouchableOpacity onPress={() => { setActiveProjectId(null); setActiveStepId(null); }}
            style={[styles.backRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Ionicons name="arrow-back" size={16} color={themeColor} />
            <Text style={[styles.backText, { color: themeColor }]}>All Tutorials</Text>
          </TouchableOpacity>
          <View style={[styles.projectHeader, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.projectDetailTitle, { color: colors.foreground }]}>{activeProject.name}</Text>
            {activeProject.description && <Text style={[styles.projectDesc, { color: colors.mutedForeground }]}>{activeProject.description}</Text>}
          </View>

          {activeProject.steps.map((step, i) => (
            <View key={step.id} style={[styles.stepCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => setActiveStepId(activeStepId === step.id ? null : step.id)} style={styles.stepHeader}>
                <TouchableOpacity onPress={() => toggleStep(step.id)}
                  style={[styles.stepCheck, { borderColor: themeColor, backgroundColor: step.isCompleted ? themeColor : 'transparent' }]}>
                  {step.isCompleted && <Ionicons name="checkmark" size={14} color="#fff" />}
                </TouchableOpacity>
                <Text style={[styles.stepNum, { color: themeColor }]}>Step {i + 1}</Text>
                <TextInput value={step.name} onChangeText={v => setProjects(p => p.map(proj => proj.id === activeProjectId ? { ...proj, steps: proj.steps.map(s => s.id === step.id ? { ...s, name: v } : s) } : proj))}
                  style={[styles.stepNameInput, { color: colors.foreground }]} />
                <Ionicons name={activeStepId === step.id ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              {activeStepId === step.id && (
                <View style={styles.stepBody}>
                  {step.sections.map((section, si) => (
                    <View key={section.id} style={[styles.sectionCard, { backgroundColor: isDark ? '#292524' : '#f8fafc', borderColor: colors.border }]}>
                      <TextInput value={section.name} onChangeText={v => updateSection(step.id, section.id, 'name', v)}
                        placeholder="Section name" placeholderTextColor={colors.mutedForeground}
                        style={[styles.sectionName, { color: colors.foreground, borderColor: colors.border }]} />
                      <TextInput value={section.text} onChangeText={v => updateSection(step.id, section.id, 'text', v)}
                        placeholder="Section content..." placeholderTextColor={colors.mutedForeground} multiline
                        style={[styles.sectionContent, { color: colors.foreground, borderColor: colors.border }]} />
                      <TextInput value={section.url || ''} onChangeText={v => updateSection(step.id, section.id, 'url', v)}
                        placeholder="Reference URL (optional)" placeholderTextColor={colors.mutedForeground}
                        style={[styles.sectionUrl, { color: themeColor, borderColor: colors.border }]} autoCapitalize="none" />
                      <TouchableOpacity onPress={() => setProjects(p => p.map(proj => proj.id === activeProjectId ? {
                        ...proj, steps: proj.steps.map(s => s.id === step.id ? { ...s, sections: s.sections.filter(sec => sec.id !== section.id) } : s)
                      } : proj))} style={styles.sectionDeleteBtn}>
                        <Ionicons name="trash-outline" size={14} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => addSection(step.id)} style={[styles.addSectionBtn, { borderColor: themeColor }]}>
                    <Ionicons name="add" size={14} color={themeColor} />
                    <Text style={[styles.addSectionBtnText, { color: themeColor }]}>Add Section</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity onPress={addStep} style={[styles.addStepBtn, { borderColor: themeColor }]}>
            <Ionicons name="add-circle" size={20} color={themeColor} />
            <Text style={[styles.addStepBtnText, { color: themeColor }]}>Add Step</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showProjectForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Tutorial</Text>
            <TextInput value={projectForm.name} onChangeText={v => setProjectForm(p => ({ ...p, name: v }))} placeholder="Tutorial name"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={projectForm.description} onChangeText={v => setProjectForm(p => ({ ...p, description: v }))} placeholder="Description (optional)" multiline
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={styles.catGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setProjectForm(p => ({ ...p, category: cat }))}
                  style={[styles.catOption, { backgroundColor: projectForm.category === cat ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.catOptionText, { color: projectForm.category === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowProjectForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addProject} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 2. AI Prompt Studio ──────────────────────────────────────────────────────
interface PromptVersion { id: string; version: number; prompt: string; timestamp: string; rating: number; notes: string; }
interface PromptProject { id: string; name: string; description: string; model: string; category: string; versions: PromptVersion[]; }

export const AIPromptStudioTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#a855f7';
  const [projects, setProjects] = useState<PromptProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', model: 'GPT-4o', category: 'text-generation' });
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [promptNotes, setPromptNotes] = useState('');
  const MODELS = ['GPT-4o', 'GPT-4', 'GPT-3.5', 'Claude 3.5', 'Gemini Pro', 'Llama 3'];
  const CATEGORIES = ['text-generation', 'code-generation', 'analysis', 'conversation', 'creative', 'other'];

  const activeProject = projects.find(p => p.id === activeProjectId);

  const addProject = () => {
    if (!projectForm.name.trim()) return;
    const proj: PromptProject = { id: Date.now().toString(), ...projectForm, versions: [] };
    setProjects(p => [...p, proj]);
    setProjectForm({ name: '', description: '', model: 'GPT-4o', category: 'text-generation' });
    setShowProjectForm(false);
    setActiveProjectId(proj.id);
  };

  const saveVersion = () => {
    if (!newPrompt.trim() || !activeProjectId) return;
    const version: PromptVersion = {
      id: Date.now().toString(),
      version: (activeProject?.versions.length || 0) + 1,
      prompt: newPrompt.trim(), timestamp: new Date().toISOString(),
      rating: 0, notes: promptNotes.trim(),
    };
    setProjects(p => p.map(proj => proj.id === activeProjectId ? { ...proj, versions: [...proj.versions, version] } : proj));
    setNewPrompt(''); setPromptNotes('');
  };

  const testPrompt = async () => {
    if (!newPrompt.trim() || testLoading) return;
    setTestLoading(true);
    try {
      const res = await AIAPI.complete(testInput || 'Test this prompt', newPrompt);
      setTestOutput(res.data?.text || res.data?.content || 'Test completed successfully.');
    } catch {
      setTestOutput('Error running test. Please check your API configuration.');
    }
    setTestLoading(false);
  };

  const rateVersion = (versionId: string, rating: number) => {
    setProjects(p => p.map(proj => proj.id === activeProjectId ? {
      ...proj, versions: proj.versions.map(v => v.id === versionId ? { ...v, rating } : v)
    } : proj));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#faf5ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="flash" size={22} color="#fff" />
          <Text style={styles.headerTitle}>AI Prompt Studio</Text>
          {!activeProject && (
            <TouchableOpacity onPress={() => setShowProjectForm(true)} style={styles.headerAddBtn}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        {activeProject && (
          <View style={{ gap: 2, marginTop: 4 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' }}>{activeProject.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{activeProject.model} • {activeProject.versions.length} versions</Text>
          </View>
        )}
      </LinearGradient>

      {!activeProject ? (
        <View>
          {projects.map(proj => (
            <TouchableOpacity key={proj.id} onPress={() => setActiveProjectId(proj.id)}
              style={[styles.projectCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <LinearGradient colors={[themeColor, `${themeColor}88`]} style={styles.projectIcon}>
                <Ionicons name="flash" size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.projectName, { color: colors.foreground }]}>{proj.name}</Text>
                <Text style={[styles.projectMeta, { color: colors.mutedForeground }]}>{proj.model} • {proj.versions.length} versions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
          {projects.length === 0 && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>⚡</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No prompt projects</Text>
              <TouchableOpacity onPress={() => setShowProjectForm(true)} style={[styles.emptyBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.emptyBtnText}>Create Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View>
          <TouchableOpacity onPress={() => setActiveProjectId(null)} style={[styles.backRow, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Ionicons name="arrow-back" size={16} color={themeColor} />
            <Text style={[styles.backText, { color: themeColor }]}>All Projects</Text>
          </TouchableOpacity>

          {/* Prompt editor */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.sectionHeader2}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>✏️ Write Prompt</Text>
              <View style={[styles.modelBadge, { backgroundColor: `${themeColor}20` }]}>
                <Text style={[styles.modelBadgeText, { color: themeColor }]}>{activeProject.model}</Text>
              </View>
            </View>
            <TextInput value={newPrompt} onChangeText={setNewPrompt} placeholder="Write your prompt here..." placeholderTextColor={colors.mutedForeground}
              multiline style={[styles.promptEditor, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={promptNotes} onChangeText={setPromptNotes} placeholder="Notes about this version..." placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={testPrompt} disabled={!newPrompt.trim() || testLoading}
                style={[styles.testBtn, { borderColor: themeColor, opacity: !newPrompt.trim() ? 0.5 : 1 }]}>
                {testLoading ? <ActivityIndicator size="small" color={themeColor} /> : <Ionicons name="play" size={16} color={themeColor} />}
                <Text style={[styles.testBtnText, { color: themeColor }]}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveVersion} disabled={!newPrompt.trim()}
                style={[styles.saveVersionBtn, { backgroundColor: themeColor, opacity: !newPrompt.trim() ? 0.5 : 1 }]}>
                <Ionicons name="save" size={16} color="#fff" />
                <Text style={styles.saveVersionBtnText}>Save Version</Text>
              </TouchableOpacity>
            </View>
            {testOutput ? (
              <View style={[styles.testOutput, { backgroundColor: isDark ? '#292524' : '#f8fafc', borderColor: colors.border }]}>
                <Text style={[styles.testOutputLabel, { color: themeColor }]}>Test Output:</Text>
                <Text style={[styles.testOutputText, { color: colors.foreground }]}>{testOutput}</Text>
              </View>
            ) : null}
          </View>

          {/* Test input */}
          <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🧪 Test Input</Text>
            <TextInput value={testInput} onChangeText={setTestInput} placeholder="Enter test input..." placeholderTextColor={colors.mutedForeground}
              multiline style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
          </View>

          {/* Version history */}
          {activeProject.versions.length > 0 && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📋 Version History</Text>
              {activeProject.versions.slice().reverse().map(version => (
                <View key={version.id} style={[styles.versionCard, { backgroundColor: isDark ? '#292524' : '#f8fafc', borderColor: colors.border }]}>
                  <View style={styles.versionHeader}>
                    <View style={[styles.versionBadge, { backgroundColor: `${themeColor}20` }]}>
                      <Text style={[styles.versionBadgeText, { color: themeColor }]}>v{version.version}</Text>
                    </View>
                    <Text style={[styles.versionDate, { color: colors.mutedForeground }]}>
                      {format(new Date(version.timestamp), 'MMM d, HH:mm')}
                    </Text>
                    <View style={styles.starsRow}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <TouchableOpacity key={i} onPress={() => rateVersion(version.id, i + 1)}>
                          <Ionicons name={i < version.rating ? 'star' : 'star-outline'} size={14} color="#f59e0b" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.versionPrompt, { color: colors.foreground }]} numberOfLines={3}>{version.prompt}</Text>
                  {version.notes && <Text style={[styles.versionNotes, { color: colors.mutedForeground }]}>{version.notes}</Text>}
                  <TouchableOpacity onPress={() => setNewPrompt(version.prompt)} style={[styles.useVersionBtn, { borderColor: themeColor }]}>
                    <Text style={[styles.useVersionText, { color: themeColor }]}>Use This Version</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <Modal visible={showProjectForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Prompt Project</Text>
            <TextInput value={projectForm.name} onChangeText={v => setProjectForm(p => ({ ...p, name: v }))} placeholder="Project name"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <TextInput value={projectForm.description} onChangeText={v => setProjectForm(p => ({ ...p, description: v }))} placeholder="Description"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 12 }]} />
            <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Model</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {MODELS.map(m => (
                <TouchableOpacity key={m} onPress={() => setProjectForm(p => ({ ...p, model: m }))}
                  style={[styles.catOption, { backgroundColor: projectForm.model === m ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.catOptionText, { color: projectForm.model === m ? '#fff' : colors.foreground }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowProjectForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addProject} style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 3. Project Template ──────────────────────────────────────────────────────
interface ProjectTask { id: string; title: string; assignee?: string; status: 'todo'|'in-progress'|'done'; dueDate?: string; priority: 'low'|'medium'|'high'; }
interface Milestone { id: string; title: string; date: string; completed: boolean; }

export const ProjectTemplate: React.FC<TemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#0ea5e9';
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [tab, setTab] = useState<'tasks'|'milestones'|'overview'>('overview');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignee: '', priority: 'medium' as ProjectTask['priority'], dueDate: '' });
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', date: '' });
  const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
  const STATUS_COLORS = { todo: '#6b7280', 'in-progress': '#3b82f6', done: '#10b981' };

  const done = tasks.filter(t => t.status === 'done').length;
  const progress = tasks.length > 0 ? (done / tasks.length) * 100 : 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0f9ff' }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="briefcase" size={22} color="#fff" />
          <TextInput value={projectName} onChangeText={setProjectName} placeholder="Project Name" placeholderTextColor="rgba(255,255,255,0.6)"
            style={{ flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' }} />
        </View>
        {tasks.length > 0 && (
          <View style={{ gap: 6, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{done}/{tasks.length} tasks done</Text>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ height: '100%', backgroundColor: '#fff', borderRadius: 3, width: `${progress}%` as any }} />
            </View>
          </View>
        )}
      </LinearGradient>

      <View style={[styles.tabsRow, { backgroundColor: isDark ? '#1c1917' : '#f0f9ff' }]}>
        {(['overview', 'tasks', 'milestones'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab2, tab === t && { backgroundColor: themeColor }]}>
            <Text style={[styles.tab2Text, { color: tab === t ? '#fff' : colors.foreground }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'overview' && (
        <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Project Overview</Text>
          <TextInput value={projectDesc} onChangeText={setProjectDesc} placeholder="Project description, goals, scope..." placeholderTextColor={colors.mutedForeground}
            multiline style={[styles.input, { color: colors.foreground, borderColor: colors.border, minHeight: 100 }]} />
          <View style={styles.statsRow3}>
            {[
              { label: 'Total Tasks', value: tasks.length, color: themeColor },
              { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
              { label: 'Done', value: done, color: '#10b981' },
              { label: 'Milestones', value: milestones.filter(m => m.completed).length + '/' + milestones.length, color: '#f59e0b' },
            ].map(s => (
              <View key={s.label} style={[styles.statBox3, { backgroundColor: isDark ? '#292524' : '#f8fafc' }]}>
                <Text style={[styles.statBoxNum, { color: s.color }]}>{s.value}</Text>
                <Text style={[styles.statBoxLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {tab === 'tasks' && (
        <View>
          {tasks.map(task => (
            <View key={task.id} style={[styles.taskRow, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => setTasks(p => p.map(t => t.id === task.id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t))}
                style={[styles.taskCheck, { borderColor: STATUS_COLORS[task.status], backgroundColor: task.status === 'done' ? STATUS_COLORS['done'] : 'transparent' }]}>
                {task.status === 'done' && <Ionicons name="checkmark" size={12} color="#fff" />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle2, { color: colors.foreground }, task.status === 'done' && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>{task.title}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                  <View style={[styles.priorityBadge, { backgroundColor: `${PRIORITY_COLORS[task.priority]}20` }]}>
                    <Text style={[styles.priorityText, { color: PRIORITY_COLORS[task.priority] }]}>{task.priority}</Text>
                  </View>
                  {task.assignee && <Text style={[styles.assigneeText, { color: colors.mutedForeground }]}>@{task.assignee}</Text>}
                  {task.dueDate && <Text style={[styles.dueDateText, { color: colors.mutedForeground }]}>{task.dueDate}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => setTasks(p => p.filter(t => t.id !== task.id))}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={() => setShowAddTask(true)} style={[styles.addBtn3, { borderColor: themeColor }]}>
            <Ionicons name="add" size={18} color={themeColor} />
            <Text style={[styles.addBtn3Text, { color: themeColor }]}>Add Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === 'milestones' && (
        <View>
          {milestones.map(m => (
            <TouchableOpacity key={m.id} onPress={() => setMilestones(p => p.map(ml => ml.id === m.id ? { ...ml, completed: !ml.completed } : ml))}
              style={[styles.milestoneRow2, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <View style={[styles.milestoneCheck, { borderColor: themeColor, backgroundColor: m.completed ? themeColor : 'transparent' }]}>
                {m.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.milestoneName, { color: colors.foreground }, m.completed && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>{m.title}</Text>
                <Text style={[styles.milestoneDate, { color: colors.mutedForeground }]}>{m.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setMilestones(p => p.filter(ml => ml.id !== m.id))}>
                <Ionicons name="close" size={16} color="#9ca3af" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setShowAddMilestone(true)} style={[styles.addBtn3, { borderColor: themeColor }]}>
            <Ionicons name="add" size={18} color={themeColor} />
            <Text style={[styles.addBtn3Text, { color: themeColor }]}>Add Milestone</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Task Modal */}
      <Modal visible={showAddTask} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Task</Text>
            <TextInput value={taskForm.title} onChangeText={v => setTaskForm(p => ({ ...p, title: v }))} placeholder="Task title"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <TextInput value={taskForm.assignee} onChangeText={v => setTaskForm(p => ({ ...p, assignee: v }))} placeholder="Assignee"
                placeholderTextColor={colors.mutedForeground} style={[styles.input, { flex: 1, color: colors.foreground, borderColor: colors.border, marginBottom: 0 }]} />
              <TextInput value={taskForm.dueDate} onChangeText={v => setTaskForm(p => ({ ...p, dueDate: v }))} placeholder="Due date"
                placeholderTextColor={colors.mutedForeground} style={[styles.input, { flex: 1, color: colors.foreground, borderColor: colors.border, marginBottom: 0 }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['low', 'medium', 'high'] as const).map(p => (
                <TouchableOpacity key={p} onPress={() => setTaskForm(prev => ({ ...prev, priority: p }))}
                  style={[styles.prioBtn, { backgroundColor: taskForm.priority === p ? PRIORITY_COLORS[p] : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.prioBtnText, { color: taskForm.priority === p ? '#fff' : colors.foreground }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAddTask(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (taskForm.title.trim()) { setTasks(p => [...p, { id: Date.now().toString(), status: 'todo', ...taskForm }]); setTaskForm({ title: '', assignee: '', priority: 'medium', dueDate: '' }); setShowAddTask(false); } }}
                style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal visible={showAddMilestone} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Milestone</Text>
            <TextInput value={milestoneForm.title} onChangeText={v => setMilestoneForm(p => ({ ...p, title: v }))} placeholder="Milestone title"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 10 }]} />
            <TextInput value={milestoneForm.date} onChangeText={v => setMilestoneForm(p => ({ ...p, date: v }))} placeholder="Target date (YYYY-MM-DD)"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, marginBottom: 14 }]} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowAddMilestone(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={{ color: colors.foreground }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { if (milestoneForm.title.trim()) { setMilestones(p => [...p, { id: Date.now().toString(), ...milestoneForm, completed: false }]); setMilestoneForm({ title: '', date: '' }); setShowAddMilestone(false); } }}
                style={[styles.submitBtn, { backgroundColor: themeColor }]}>
                <Text style={styles.submitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ─── 4. Loop Template (Real-time Collaboration Notes) ─────────────────────────
export const LoopTemplate: React.FC<TemplateProps> = ({ notebook, pages, currentPage, pageIndex, onPageChange }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#22c55e';
  const [content, setContent] = useState(currentPage?.content || '');
  const [comments, setComments] = useState<{ id: string; author: string; text: string; time: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('You');
  const [tab, setTab] = useState<'notes'|'comments'>('notes');

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={[styles.header, { paddingBottom: 12 }]}>
        <View style={styles.headerRow}>
          <Ionicons name="sync" size={18} color="#fff" />
          <Text style={[styles.headerTitle, { fontSize: 16 }]}>Loop – Collaborative Notes</Text>
          <View style={[styles.liveBadge]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
          {(['notes', 'comments'] as const).map(t => (
            <TouchableOpacity key={t} onPress={() => setTab(t)}
              style={[styles.headerTab, tab === t && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.headerTabText}>{t === 'notes' ? '📝 Notes' : `💬 Comments (${comments.length})`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {tab === 'notes' ? (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <TextInput value={content} onChangeText={setContent} placeholder="Collaborative notes... Everyone can edit." placeholderTextColor={colors.mutedForeground}
            multiline style={[styles.loopEditor, { color: colors.foreground, backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]} />
          {pages.length > 1 && (
            <View style={styles.pageNavRow}>
              <TouchableOpacity onPress={() => pageIndex > 0 && onPageChange(pageIndex - 1)} disabled={pageIndex === 0}
                style={[styles.pageNavBtn, { borderColor: colors.border, opacity: pageIndex === 0 ? 0.4 : 1 }]}>
                <Ionicons name="chevron-back" size={16} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.pageNavText, { color: colors.mutedForeground }]}>{pageIndex + 1}/{pages.length}</Text>
              <TouchableOpacity onPress={() => pageIndex < pages.length - 1 && onPageChange(pageIndex + 1)} disabled={pageIndex >= pages.length - 1}
                style={[styles.pageNavBtn, { borderColor: colors.border, opacity: pageIndex >= pages.length - 1 ? 0.4 : 1 }]}>
                <Ionicons name="chevron-forward" size={16} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
            {comments.map(c => (
              <View key={c.id} style={[styles.commentCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
                <View style={[styles.commentAvatar, { backgroundColor: themeColor }]}>
                  <Text style={styles.commentAvatarText}>{c.author[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[styles.commentAuthor, { color: themeColor }]}>{c.author}</Text>
                    <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>{c.time}</Text>
                  </View>
                  <Text style={[styles.commentText, { color: colors.foreground }]}>{c.text}</Text>
                </View>
              </View>
            ))}
            {comments.length === 0 && <Text style={[{ color: colors.mutedForeground, textAlign: 'center', paddingVertical: 32, fontSize: 14 }]}>No comments yet</Text>}
          </ScrollView>
          <View style={[styles.commentInput, { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border }]}>
            <TextInput value={newComment} onChangeText={setNewComment} placeholder="Add a comment..." placeholderTextColor={colors.mutedForeground}
              style={[styles.commentTextInput, { color: colors.foreground, backgroundColor: isDark ? '#292524' : '#f5f5f4' }]} />
            <TouchableOpacity onPress={() => { if (newComment.trim()) { setComments(p => [...p, { id: Date.now().toString(), author, text: newComment.trim(), time: format(new Date(), 'HH:mm') }]); setNewComment(''); } }}
              style={[styles.commentSendBtn, { backgroundColor: themeColor }]}>
              <Ionicons name="send" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── 5. Doodle Template (uses Whiteboard renderer) ────────────────────────────
export { WhiteboardTemplate as DoodleTemplate } from './WhiteboardTemplate';

// ─── 6-9. Simpler templates using GenericTemplate with custom header ───────────
const simpleCustomHeader = (title: string, icon: string, color: string, subtitle: string) => ({
  title, icon, color, subtitle,
});

const TEMPLATE_CONFIGS: Record<string, { title: string; icon: string; color: string; subtitle: string; placeholder: string }> = {
  'n8n': { title: 'n8n Workflows', icon: 'git-branch', color: '#f97316', subtitle: 'Workflow automation notes', placeholder: 'Document your n8n workflows, node configurations, and automation tips...' },
  'image-prompt': { title: 'Image Prompts', icon: 'image', color: '#ec4899', subtitle: 'AI image prompt templates', placeholder: 'Write detailed image prompts. Include style, lighting, composition, medium...' },
  'video-prompt': { title: 'Video Prompts', icon: 'videocam', color: '#ef4444', subtitle: 'AI video prompt templates', placeholder: 'Describe your video: scene, motion, camera angles, duration, mood...' },
  'sound-box': { title: 'Sound Box', icon: 'mic', color: '#a855f7', subtitle: 'Voice notes & transcriptions', placeholder: 'Voice-to-text notes will appear here. Use the AI transcription feature to convert speech to text...' },
  'research-builder': { title: 'Research Builder', icon: 'search', color: '#8b5cf6', subtitle: 'AI-assisted research', placeholder: 'Start your research outline. Add chapters, sections, sources, and AI-generated content...' },
  'piano-notes': { title: 'Piano Notes', icon: 'musical-notes', color: '#8b5cf6', subtitle: 'Repertoire & practice log', placeholder: 'Log your practice sessions, pieces, technical exercises, and progress notes...' },
  'custom': { title: 'Custom Notebook', icon: 'create', color: '#64748b', subtitle: 'Your personal notebook', placeholder: 'This is your blank canvas. Write anything you want...' },
  'document': { title: 'Document', icon: 'document-text', color: '#8b5cf6', subtitle: 'Structured document', placeholder: 'Write your document. Use headings, sections, and structured content...' },
  'dashboard': { title: 'Dashboard', icon: 'grid', color: '#06b6d4', subtitle: 'Notes & tasks overview', placeholder: 'Add your notes, tasks, and key information here...' },
};

export const MultiPurposeTemplate: React.FC<TemplateProps & { templateId: string }> = ({ notebook, pages, currentPage, pageIndex, onPageChange, templateId }) => {
  const { colors, isDark } = useTheme();
  const config = TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS['custom'];
  const themeColor = config.color;
  const [content, setContent] = useState(currentPage?.content || '');
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff' }]}>
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={[styles.header, { paddingBottom: 14 }]}>
        <View style={styles.headerRow}>
          <Ionicons name={config.icon as any} size={20} color="#fff" />
          <Text style={[styles.headerTitle, { fontSize: 16 }]}>{config.title}</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>{config.subtitle}</Text>
      </LinearGradient>

      {pages.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
          contentContainerStyle={{ flexDirection: 'row', paddingHorizontal: 12 }}>
          {pages.map((page, i) => (
            <TouchableOpacity key={page._id} onPress={() => onPageChange(i)}
              style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: i === pageIndex ? themeColor : 'transparent' }}>
              <Text style={{ fontSize: 13, color: i === pageIndex ? themeColor : colors.mutedForeground, fontWeight: '500' }}>
                {page.title || `Page ${i + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardDismissMode="on-drag">
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder={config.placeholder}
          placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
          multiline
          style={[styles.richEditor, { color: isDark ? '#f5f5f4' : '#1c1917' }]}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={[styles.editorBar, { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity onPress={() => pageIndex > 0 && onPageChange(pageIndex - 1)} disabled={pageIndex === 0}
            style={[styles.editorBarBtn, { opacity: pageIndex === 0 ? 0.4 : 1 }]}>
            <Ionicons name="chevron-back" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.editorBarWordCount, { color: colors.mutedForeground }]}>{wordCount} words</Text>
          <TouchableOpacity onPress={() => pageIndex < pages.length - 1 && onPageChange(pageIndex + 1)} disabled={pageIndex >= pages.length - 1}
            style={[styles.editorBarBtn, { opacity: pageIndex >= pages.length - 1 ? 0.4 : 1 }]}>
            <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Shared Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 20, fontWeight: '800' },
  headerAddBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  progressSection: { marginTop: 10, gap: 6 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  progressPct: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  backText: { fontSize: 14, fontWeight: '600' },
  projectCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  projectIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  projectName: { fontSize: 15, fontWeight: '700' },
  projectMeta: { fontSize: 12, marginTop: 2 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catOption: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
  catOptionText: { fontSize: 12, fontWeight: '600' },
  projectHeader: { margin: 12, borderRadius: 12, padding: 14 },
  projectDetailTitle: { fontSize: 20, fontWeight: '800' },
  projectDesc: { fontSize: 13, marginTop: 4 },
  stepCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  stepCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  stepNum: { fontSize: 12, fontWeight: '700', width: 44 },
  stepNameInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  stepBody: { padding: 14, paddingTop: 0, borderTopWidth: 1, borderTopColor: '#00000010', gap: 10 },
  sectionCard: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8, position: 'relative' },
  sectionName: { borderBottomWidth: 1, paddingBottom: 6, fontSize: 14, fontWeight: '600' },
  sectionContent: { fontSize: 13, lineHeight: 20, minHeight: 60, borderWidth: 1, borderRadius: 6, padding: 8 },
  sectionUrl: { fontSize: 12, borderBottomWidth: 1, paddingBottom: 4 },
  sectionDeleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  addSectionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed' },
  addSectionBtnText: { fontSize: 13, fontWeight: '600' },
  addStepBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed' },
  addStepBtnText: { fontSize: 14, fontWeight: '700' },
  section: { margin: 12, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  sectionHeader2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  modelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  modelBadgeText: { fontSize: 12, fontWeight: '700' },
  promptEditor: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, lineHeight: 22, minHeight: 140 },
  testBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5 },
  testBtnText: { fontSize: 14, fontWeight: '600' },
  saveVersionBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 10 },
  saveVersionBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  testOutput: { marginTop: 10, borderWidth: 1, borderRadius: 8, padding: 12 },
  testOutputLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  testOutputText: { fontSize: 13, lineHeight: 18 },
  versionCard: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 8 },
  versionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  versionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  versionBadgeText: { fontSize: 11, fontWeight: '700' },
  versionDate: { flex: 1, fontSize: 12 },
  starsRow: { flexDirection: 'row', gap: 2 },
  versionPrompt: { fontSize: 13, lineHeight: 18 },
  versionNotes: { fontSize: 12, fontStyle: 'italic' },
  useVersionBtn: { paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  useVersionText: { fontSize: 13, fontWeight: '600' },
  tabsRow: { flexDirection: 'row', margin: 12, borderRadius: 10, padding: 4, gap: 4 },
  tab2: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tab2Text: { fontSize: 12, fontWeight: '600' },
  statsRow3: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statBox3: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  statBoxNum: { fontSize: 18, fontWeight: '800' },
  statBoxLabel: { fontSize: 10, marginTop: 2 },
  taskRow: { margin: 12, marginBottom: 0, borderRadius: 10, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  taskCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  taskTitle2: { fontSize: 14, fontWeight: '600' },
  assigneeText: { fontSize: 12 },
  dueDateText: { fontSize: 12 },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  addBtn3: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed' },
  addBtn3Text: { fontSize: 14, fontWeight: '700' },
  milestoneRow2: { margin: 12, marginBottom: 0, borderRadius: 10, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  milestoneName: { fontSize: 14, fontWeight: '600' },
  milestoneDate: { fontSize: 12, marginTop: 2 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ade80' },
  liveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  headerTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  headerTabText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  loopEditor: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, lineHeight: 26, minHeight: 300 },
  pageNavRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  pageNavBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  pageNavText: { fontSize: 13 },
  commentCard: { flexDirection: 'row', gap: 10, borderRadius: 10, borderWidth: 1, padding: 12 },
  commentAvatar: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  commentAuthor: { fontSize: 13, fontWeight: '700' },
  commentTime: { fontSize: 11 },
  commentText: { fontSize: 14, marginTop: 4 },
  commentInput: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1 },
  commentTextInput: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  commentSendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  richEditor: { fontSize: 16, lineHeight: 28, minHeight: 400 },
  editorBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderTopWidth: 1 },
  editorBarBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  editorBarWordCount: { flex: 1, textAlign: 'center', fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 4 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14 },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  prioBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  prioBtnText: { fontSize: 13, fontWeight: '700' },
});
