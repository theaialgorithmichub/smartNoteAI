'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, FileText, CheckCircle, Sparkles, TrendingUp, BookOpen, Lightbulb, Search, Info, X, Trash2, Edit2, List } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TemplateHeader } from './template-header';
import { TemplateFooter } from './template-footer';

interface Chapter {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface ResearchTopic {
  id: string;
  title: string;
  chapters: Chapter[];
  createdAt: string;
}

interface ResearchBuilderTemplateProps {
  title: string;
  notebookId?: string;
}

type Stage = 'planning' | 'execution' | 'report';

export function ResearchBuilderTemplate({ title, notebookId }: ResearchBuilderTemplateProps) {
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage>('planning');
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newChapter, setNewChapter] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveData = () => {
    if (!notebookId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      setSaving(true);
      try {
        localStorage.setItem(`research-builder-${notebookId}`, JSON.stringify({ topics }));
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
      const saved = localStorage.getItem(`research-builder-${notebookId}`);
      if (saved) {
        const data = JSON.parse(saved);
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error("Failed to load:", error);
    }
  }, [notebookId]);

  useEffect(() => {
    saveData();
  }, [topics]);

  const addTopic = () => {
    if (!newTopicTitle.trim()) return;
    const topic: ResearchTopic = {
      id: Date.now().toString(),
      title: newTopicTitle,
      chapters: [],
      createdAt: new Date().toISOString()
    };
    setTopics([topic, ...topics]);
    setSelectedTopic(topic.id);
    setNewTopicTitle('');
    setIsAddingTopic(false);
  };

  const deleteTopic = (id: string) => {
    setTopics(topics.filter(t => t.id !== id));
    if (selectedTopic === id) {
      setSelectedTopic(null);
    }
  };

  const addChapter = () => {
    if (!selectedTopic || !newChapter.title.trim()) return;
    const chapter: Chapter = {
      id: Date.now().toString(),
      title: newChapter.title,
      content: newChapter.content,
      status: 'pending'
    };
    setTopics(topics.map(t => 
      t.id === selectedTopic 
        ? { ...t, chapters: [...t.chapters, chapter] }
        : t
    ));
    setNewChapter({ title: '', content: '' });
    setIsAddingChapter(false);
  };

  const deleteChapter = (topicId: string, chapterId: string) => {
    setTopics(topics.map(t => 
      t.id === topicId
        ? { ...t, chapters: t.chapters.filter(c => c.id !== chapterId) }
        : t
    ));
  };

  const updateChapterStatus = (topicId: string, chapterId: string, status: Chapter['status']) => {
    setTopics(topics.map(t => 
      t.id === topicId
        ? { ...t, chapters: t.chapters.map(c => c.id === chapterId ? { ...c, status } : c) }
        : t
    ));
  };

  const updateChapterContent = (topicId: string, chapterId: string, content: string) => {
    setTopics(topics.map(t => 
      t.id === topicId
        ? { ...t, chapters: t.chapters.map(c => c.id === chapterId ? { ...c, content } : c) }
        : t
    ));
  };

  const generateChapterSuggestions = async () => {
    if (!selectedTopic) return;
    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) return;

    setIsGenerating(true);
    
    // Simulate AI generation with relevant suggestions
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const suggestions = [
      `Introduction to ${topic.title}`,
      `Historical Background and Context`,
      `Current State and Trends`,
      `Key Concepts and Theories`,
      `Methodology and Approach`,
      `Case Studies and Examples`,
      `Challenges and Limitations`,
      `Future Directions and Opportunities`,
      `Conclusion and Summary`
    ];
    
    setGeneratedSuggestions(suggestions);
    setShowSuggestions(true);
    setIsGenerating(false);
  };

  const addSuggestedChapter = (suggestion: string) => {
    if (!selectedTopic) return;
    const chapter: Chapter = {
      id: Date.now().toString(),
      title: suggestion,
      content: '',
      status: 'pending'
    };
    setTopics(topics.map(topic =>
      topic.id === selectedTopic
        ? { ...topic, chapters: [...topic.chapters, chapter] }
        : topic
    ));
  };

  const generateAnalysis = async () => {
    if (!selectedTopic) return;
    const topic = topics.find(t => t.id === selectedTopic);
    if (!topic) return;

    setIsGenerating(true);
    
    // Simulate AI analysis generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = `AI Analysis for "${topic.title}":

✓ Research scope is well-defined
✓ ${topic.chapters.length} chapters provide comprehensive coverage
✓ ${topic.chapters.filter(c => c.status === 'completed').length} chapters completed

Recommendations:
• Consider adding more case studies
• Expand on practical applications
• Include expert interviews
• Add visual data representations

Key Insights:
• Strong foundation with current chapter structure
• Content depth varies across chapters
• Consider adding more empirical evidence
• Visual aids would enhance comprehension`;
    
    setAiAnalysis(analysis);
    setShowAnalysis(true);
    setIsGenerating(false);
  };

  const currentTopic = topics.find(t => t.id === selectedTopic);
  const chapters = currentTopic?.chapters || [];

  const stages = [
    { id: 'planning', name: 'Planning', icon: Lightbulb, color: 'blue' },
    { id: 'execution', name: 'Execution', icon: FileText, color: 'purple' },
    { id: 'report', name: 'Report', icon: TrendingUp, color: 'green' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-violet-50 to-purple-50 dark:from-neutral-900 dark:to-neutral-800">
      <TemplateHeader title={title} />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <button
              onClick={() => setShowDocumentation(true)}
              className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              title="Documentation"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">AI-Powered Research Assistant</p>
        </div>

        {/* Research Topics */}
        <Card className="p-6 bg-white dark:bg-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <List className="h-5 w-5 text-violet-600" />
              Research Topics
            </h3>
            <button
              onClick={() => setIsAddingTopic(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              New Topic
            </button>
          </div>
          {topics.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topics.map((topic) => (
                <Card
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    selectedTopic === topic.id
                      ? 'bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-500'
                      : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-violet-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className={`h-5 w-5 ${
                      selectedTopic === topic.id ? 'text-violet-600' : 'text-neutral-400'
                    }`} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTopic(topic.id);
                      }}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete topic"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1 text-sm line-clamp-2">{topic.title}</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {topic.chapters.length} chapters
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
              <p className="text-neutral-600 dark:text-neutral-400">No research topics yet</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Click "New Topic" to start researching</p>
            </div>
          )}
        </Card>

        {selectedTopic && currentTopic && (
          <Card className="p-6 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 border-2 border-violet-300 dark:border-violet-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-violet-700 dark:text-violet-400 mb-1">Current Research Topic</p>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{currentTopic.title}</h2>
              </div>
            </div>
          </Card>
        )}

        {/* Stage Navigation */}
        <div className="grid grid-cols-3 gap-4">
          {stages.map((stage) => {
            const Icon = stage.icon;
            const isActive = currentStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id as Stage)}
                className={`p-6 rounded-xl border-2 transition-all ${
                  isActive
                    ? `bg-gradient-to-br from-${stage.color}-500 to-${stage.color}-600 border-${stage.color}-600 text-white shadow-lg scale-105`
                    : `bg-white dark:bg-neutral-800 border-${stage.color}-200 dark:border-${stage.color}-800 hover:border-${stage.color}-400 dark:hover:border-${stage.color}-600`
                }`}
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 ${isActive ? 'text-white' : `text-${stage.color}-600`}`} />
                <p className={`font-bold text-center ${isActive ? 'text-white' : `text-neutral-900 dark:text-white`}`}>
                  {stage.name}
                </p>
              </button>
            );
          })}
        </div>

        {/* Stage Content */}
        {!selectedTopic ? (
          <Card className="p-12 bg-white dark:bg-neutral-800 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-violet-400" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Select or Create a Research Topic</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Choose a topic above or create a new one to start your research</p>
          </Card>
        ) : currentStage === 'planning' && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  Define Research Chapters
                </h3>
                <button
                  onClick={() => setIsAddingChapter(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Chapter
                </button>
              </div>

              {chapters.length > 0 ? (
                <div className="space-y-3">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <h4 className="flex-1 font-semibold text-neutral-900 dark:text-white">
                            {chapter.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={chapter.status}
                            onChange={(e) => updateChapterStatus(selectedTopic, chapter.id, e.target.value as Chapter['status'])}
                            className={`px-3 py-1 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${
                              chapter.status === 'completed'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : chapter.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-400'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => deleteChapter(selectedTopic, chapter.id)}
                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete chapter"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-neutral-400" />
                  <p className="text-neutral-600 dark:text-neutral-400">No chapters yet</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Click "Add Chapter" to start organizing</p>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <div className="flex items-center gap-4">
                <Brain className="h-12 w-12" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">AI Chapter Suggestions</h3>
                  <p className="text-blue-100">
                    Click to get AI-powered chapter suggestions based on your research topic
                  </p>
                </div>
                <Button 
                  onClick={generateChapterSuggestions}
                  disabled={isGenerating}
                  className="bg-white text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentStage === 'execution' && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Content Preparation
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Progress: {Math.round((chapters.filter(c => c.status === 'completed').length / chapters.length) * 100)}%
                  </span>
                </div>
              </div>

              {chapters.length > 0 ? (
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <Card key={chapter.id} className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <CheckCircle
                            className={`h-6 w-6 cursor-pointer ${
                              chapter.status === 'completed'
                                ? 'text-green-600'
                                : 'text-neutral-300 dark:text-neutral-600'
                            }`}
                            onClick={() => selectedTopic && updateChapterStatus(selectedTopic, chapter.id, chapter.status === 'completed' ? 'in-progress' : 'completed')}
                          />
                          <h4 className="font-bold text-neutral-900 dark:text-white">{chapter.title}</h4>
                        </div>
                        <button
                          onClick={() => setSelectedChapter(chapter)}
                          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                        >
                          <Edit2 className="h-3 w-3 inline mr-1" />
                          Edit
                        </button>
                      </div>
                      
                      <textarea
                        value={chapter.content}
                        onChange={(e) => selectedTopic && updateChapterContent(selectedTopic, chapter.id, e.target.value)}
                        placeholder="Write content for this chapter..."
                        className="w-full h-32 p-3 bg-white dark:bg-neutral-800 border border-purple-200 dark:border-purple-700 rounded-lg text-sm text-neutral-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {chapter.content ? `${chapter.content.length} characters` : 'No content yet'}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                  <p className="text-neutral-600 dark:text-neutral-400">No chapters to work on</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">Add chapters in the Planning stage first</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {currentStage === 'report' && (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Research Analysis & Report
                </h3>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>

              {/* Research Summary */}
              <div className="mb-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-bold text-neutral-900 dark:text-white mb-3">Research Summary</h4>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  This research explores the transformative impact of Artificial Intelligence in Healthcare. 
                  Through {chapters.length} comprehensive chapters, we examine current applications, challenges, 
                  and future prospects of AI technologies in medical practice.
                </p>
              </div>

              {/* Statistics */}
              <div className="grid sm:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Chapters</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">{chapters.length}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {chapters.filter(c => c.status === 'completed').length}
                  </p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                    {chapters.filter(c => c.status === 'in-progress').length}
                  </p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Words</p>
                  <p className="text-3xl font-bold text-neutral-900 dark:text-white">2,847</p>
                </Card>
              </div>

              {/* Key Findings */}
              <Card className="p-5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <h4 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-600" />
                  Key Findings
                </h4>
                <ul className="space-y-3">
                  {[
                    'AI-powered diagnostic tools show 95% accuracy in early disease detection',
                    'Machine learning algorithms reduce diagnosis time by 60%',
                    'Integration challenges remain in legacy healthcare systems',
                    'Patient data privacy is a critical concern requiring robust frameworks',
                  ].map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Card>

            {/* AI Analysis */}
            <Card className="p-6 bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <div className="flex items-center gap-4">
                <Brain className="h-12 w-12" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">AI-Powered Analysis</h3>
                  <p className="text-violet-100">
                    Generate comprehensive analysis, insights, and recommendations based on your research
                  </p>
                </div>
                <Button 
                  onClick={generateAnalysis}
                  disabled={isGenerating}
                  className="bg-white text-violet-600 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Add Topic Modal */}
        <AnimatePresence>
          {isAddingTopic && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingTopic(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">New Research Topic</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Topic Title</label>
                    <input
                      type="text"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      placeholder="e.g., Artificial Intelligence in Healthcare"
                      className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={addTopic}
                      disabled={!newTopicTitle.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    >
                      Create Topic
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingTopic(false);
                        setNewTopicTitle('');
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Chapter Modal */}
        <AnimatePresence>
          {isAddingChapter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsAddingChapter(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white">Add New Chapter</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Define a chapter for your research topic</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Chapter Title *
                    </label>
                    <input
                      type="text"
                      value={newChapter.title}
                      onChange={(e) => setNewChapter({ ...newChapter, title: e.target.value })}
                      placeholder="e.g., Introduction to AI in Healthcare"
                      className="w-full px-5 py-4 text-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-neutral-900 dark:text-white font-medium"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-base font-bold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                      <Edit2 className="h-5 w-5 text-indigo-600" />
                      Initial Content (optional)
                    </label>
                    <textarea
                      value={newChapter.content}
                      onChange={(e) => setNewChapter({ ...newChapter, content: e.target.value })}
                      placeholder="Write initial content or leave empty to add later..."
                      rows={8}
                      className="w-full px-5 py-4 text-base bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-neutral-900 dark:text-white resize-none"
                    />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                      💡 Tip: You can add or edit content later in the Execution stage
                    </p>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <button
                      onClick={() => {
                        setIsAddingChapter(false);
                        setNewChapter({ title: '', content: '' });
                      }}
                      className="flex-1 px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-semibold text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addChapter}
                      disabled={!newChapter.title.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg flex items-center justify-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Add Chapter
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View/Edit Chapter Modal */}
        <AnimatePresence>
          {selectedChapter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedChapter(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 p-6 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedChapter.title}</h2>
                    <p className="text-purple-100 text-sm mt-1">{currentTopic?.title}</p>
                  </div>
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                      {selectedChapter.content || 'No content available for this chapter yet.'}
                    </p>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <button
                    onClick={() => setSelectedChapter(null)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Suggestions Modal */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowSuggestions(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                    AI Chapter Suggestions
                  </h3>
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Click on any suggestion to add it as a chapter to your research
                </p>
                <div className="space-y-2">
                  {generatedSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        addSuggestedChapter(suggestion);
                        setGeneratedSuggestions(prev => prev.filter((_, i) => i !== idx));
                      }}
                      className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-900 dark:text-white">{suggestion}</span>
                        <Plus className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
                {generatedSuggestions.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="text-neutral-600 dark:text-neutral-400">All suggestions added!</p>
                  </div>
                )}
                <div className="mt-6">
                  <button
                    onClick={() => setShowSuggestions(false)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Analysis Modal */}
        <AnimatePresence>
          {showAnalysis && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAnalysis(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="sticky top-0 bg-gradient-to-r from-violet-500 via-purple-600 to-pink-600 p-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">AI Analysis Results</h2>
                      <p className="text-violet-100 text-sm">Comprehensive research insights</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-violet-200 dark:border-violet-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="h-6 w-6 text-violet-600" />
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Analysis Report</h3>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-base text-neutral-700 dark:text-neutral-300 leading-relaxed bg-white dark:bg-neutral-800 p-5 rounded-lg border border-violet-200 dark:border-violet-700">
{aiAnalysis}
                      </pre>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-bold text-green-900 dark:text-green-400">Strengths</h4>
                      </div>
                      <p className="text-sm text-green-800 dark:text-green-300">Well-structured research with clear objectives</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        <h4 className="font-bold text-amber-900 dark:text-amber-400">Opportunities</h4>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-300">Expand with more empirical data</p>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-violet-500/50 transition-all font-bold text-lg"
                  >
                    Close Analysis
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
            <div className="sticky top-0 bg-gradient-to-r from-violet-500 to-purple-600 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Research Builder Guide</h2>
                  <p className="text-violet-100 text-sm">AI-powered research assistant</p>
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
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🧠 Overview</h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Research Builder is an AI-powered research assistant that guides you through the entire research process. From planning and execution to report writing, organize chapters, track progress, generate AI insights, and build comprehensive research papers with structured methodology.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">✨ Key Features</h3>
                <div className="grid gap-3">
                  <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
                    <h4 className="font-semibold text-violet-900 dark:text-violet-400 mb-1">📋 Three-Stage Process</h4>
                    <p className="text-sm text-violet-800 dark:text-violet-300">Structured workflow: Planning, Execution, and Report stages.</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-400 mb-1">📚 Chapter Management</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-300">Organize research into chapters with status tracking.</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-1">🤖 AI Analysis</h4>
                    <p className="text-sm text-indigo-800 dark:text-indigo-300">Generate insights, recommendations, and comprehensive analysis.</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-1">✅ Progress Tracking</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">Monitor chapter completion status (pending, in-progress, completed).</p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-900 dark:text-cyan-400 mb-1">💡 Key Findings</h4>
                    <p className="text-sm text-cyan-800 dark:text-cyan-300">Document and organize important research findings.</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">🚀 How to Use</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Set Research Topic</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Enter your research topic to begin the research process.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Planning Stage</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Outline chapters, define methodology, and plan research approach.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Execution Stage</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Conduct research, write chapters, and document findings.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Track Progress</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Update chapter status as you complete each section.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">5</div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Use AI Analysis</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Generate AI-powered insights and recommendations for your research.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold">6</div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">Report Stage</p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">Compile findings into a comprehensive research report.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💡 Pro Tips</h3>
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Start with planning</strong> - Outline all chapters before execution</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Update regularly</strong> - Mark chapter status as you progress</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Document findings</strong> - Record key insights as you discover them</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Use AI wisely</strong> - Leverage AI for analysis and recommendations</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Stay organized</strong> - Keep chapters structured and well-defined</p>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">✅ <strong>Review stages</strong> - Move through planning, execution, and report systematically</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3">💾 Data Storage</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    <strong>Your research data is automatically saved locally.</strong> All topics, chapters, findings, and progress are stored in your browser's local storage. Look for the "Saving..." indicator to confirm storage.
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700 p-6">
              <button
                onClick={() => setShowDocumentation(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Got it!
              </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </div>
      <TemplateFooter />
    </div>
  );
}
