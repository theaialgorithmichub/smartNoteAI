import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useNotebookStore } from '../../store/notebookStore';
import { NotebooksAPI, PagesAPI, AIAPI } from '../../services/api';
import { DashboardStackParamList } from '../../navigation/types';

// Templates
import { SimpleTemplate } from '../../components/templates/SimpleTemplate';
import { DiaryTemplate } from '../../components/templates/DiaryTemplate';
import { PlannerTemplate } from '../../components/templates/PlannerTemplate';
import { MeetingNotesTemplate } from '../../components/templates/MeetingNotesTemplate';
import { TodoTemplate } from '../../components/templates/TodoTemplate';
import { HabitTrackerTemplate } from '../../components/templates/HabitTrackerTemplate';
import { ExpenseTemplate } from '../../components/templates/ExpenseTemplate';
import { JournalTemplate } from '../../components/templates/JournalTemplate';
import { RecipeTemplate } from '../../components/templates/RecipeTemplate';
import { FlashcardTemplate } from '../../components/templates/FlashcardTemplate';
import { CodeNotebookTemplate } from '../../components/templates/CodeNotebookTemplate';
import { GoalTrackerTemplate } from '../../components/templates/GoalTrackerTemplate';
import { BudgetPlannerTemplate } from '../../components/templates/BudgetPlannerTemplate';
import { SaveTheDateTemplate } from '../../components/templates/SaveTheDateTemplate';
import { TripTemplate } from '../../components/templates/TripTemplate';
import { ProjectPipelineTemplate } from '../../components/templates/ProjectPipelineTemplate';
import { MindMapTemplate } from '../../components/templates/MindMapTemplate';
import { WhiteboardTemplate } from '../../components/templates/WhiteboardTemplate';
import { StoryTemplate } from '../../components/templates/StoryTemplate';
import { TypewriterTemplate } from '../../components/templates/TypewriterTemplate';
import { StudyBookTemplate } from '../../components/templates/StudyBookTemplate';
import { GroceryListTemplate } from '../../components/templates/GroceryListTemplate';
import { WorkoutLogTemplate } from '../../components/templates/WorkoutLogTemplate';
import { VocabularyTemplate } from '../../components/templates/VocabularyTemplate';
import { AIResearchTemplate } from '../../components/templates/AIResearchTemplate';
import {
  BookNotesTemplate,
  ClassNotesTemplate,
  LinkTemplate,
  GamesScorecardTemplate,
  ExpenseSharerTemplate,
  MealsPlannerTemplate,
  StickerBookTemplate,
  PromptDiaryTemplate,
  ImportantURLsTemplate,
} from '../../components/templates/RemainingTemplates';
import {
  TutorialLearnTemplate,
  AIPromptStudioTemplate,
  ProjectTemplate,
  LoopTemplate,
  MultiPurposeTemplate,
} from '../../components/templates/FinalTemplates';
import { GenericTemplate } from '../../components/templates/GenericTemplate';

type NotebookViewerRouteProp = RouteProp<DashboardStackParamList, 'NotebookViewer'>;

export default function NotebookViewerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<NotebookViewerRouteProp>();
  const { notebookId } = route.params;
  const { colors, isDark } = useTheme();
  const {
    currentNotebook,
    currentPages,
    currentPage,
    setCurrentNotebook,
    setCurrentPages,
    setCurrentPage,
    addPage,
  } = useNotebookStore();

  const [loading, setLoading] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [addingPage, setAddingPage] = useState(false);

  const loadNotebook = useCallback(async () => {
    try {
      setLoading(true);
      const [nbRes, pagesRes] = await Promise.all([
        NotebooksAPI.get(notebookId),
        PagesAPI.list(notebookId),
      ]);
      const nb = nbRes.data.notebook || nbRes.data;
      const pages = pagesRes.data.pages || pagesRes.data || [];
      setCurrentNotebook(nb);
      setCurrentPages(pages);
      if (pages.length > 0) setCurrentPage(pages[0]);
    } catch (err) {
      Alert.alert('Error', 'Could not load notebook');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [notebookId]);

  useEffect(() => {
    loadNotebook();
    return () => {
      setCurrentNotebook(null);
      setCurrentPages([]);
      setCurrentPage(null);
    };
  }, []);

  const handlePageChange = (index: number) => {
    if (index < 0 || index >= currentPages.length) return;
    setPageIndex(index);
    setCurrentPage(currentPages[index]);
  };

  const handleAddPage = async () => {
    if (!currentNotebook || addingPage) return;
    setAddingPage(true);
    try {
      const res = await PagesAPI.create(currentNotebook._id, {
        title: `Page ${currentPages.length + 1}`,
        content: '',
      });
      const newPage = res.data.page || res.data;
      addPage(newPage);
      const newIndex = currentPages.length;
      setPageIndex(newIndex);
      setCurrentPage(newPage);
    } catch {
      Alert.alert('Error', 'Could not add page');
    } finally {
      setAddingPage(false);
    }
  };

  const handleShare = async () => {
    if (!currentNotebook) return;
    try {
      await Share.share({
        title: currentNotebook.title,
        message: `Check out my notebook "${currentNotebook.title}" on SmartNote AI`,
      });
    } catch {}
  };

  const handleAIAction = (action: string) => {
    setShowAIPanel(false);
    if (action === 'chat') {
      navigation.navigate('AIChat', { notebookId: currentNotebook?._id });
    } else {
      navigation.navigate('AIChat', { notebookId: currentNotebook?._id });
    }
  };

  const renderTemplate = () => {
    if (!currentNotebook) return null;
    const props = {
      notebook: currentNotebook,
      pages: currentPages,
      currentPage,
      pageIndex,
      onPageChange: handlePageChange,
    };

    switch (currentNotebook.template) {
      case 'simple': return <SimpleTemplate {...props} />;
      case 'diary': return <DiaryTemplate {...props} />;
      case 'planner': return <PlannerTemplate {...props} />;
      case 'meeting-notes': return <MeetingNotesTemplate {...props} />;
      case 'todo': return <TodoTemplate {...props} />;
      case 'habit-tracker': return <HabitTrackerTemplate {...props} />;
      case 'expense': return <ExpenseTemplate {...props} />;
      case 'journal': return <JournalTemplate {...props} />;
      case 'recipe': return <RecipeTemplate {...props} />;
      case 'flashcard': return <FlashcardTemplate {...props} />;
      case 'code-notebook': return <CodeNotebookTemplate {...props} />;
      case 'goal-tracker': return <GoalTrackerTemplate {...props} />;
      case 'budget-planner': return <BudgetPlannerTemplate {...props} />;
      case 'save-the-date': return <SaveTheDateTemplate {...props} />;
      case 'trip': return <TripTemplate {...props} />;
      case 'project-pipeline': return <ProjectPipelineTemplate {...props} />;
      case 'mind-map': return <MindMapTemplate {...props} />;
      case 'whiteboard': return <WhiteboardTemplate {...props} />;
      case 'story': return <StoryTemplate {...props} />;
      case 'storytelling': return <StoryTemplate {...props} />;
      case 'typewriter': return <TypewriterTemplate {...props} />;
      case 'studybook': return <StudyBookTemplate {...props} />;
      case 'grocery-list': return <GroceryListTemplate {...props} />;
      case 'workout-log': return <WorkoutLogTemplate {...props} />;
      case 'vocabulary': return <VocabularyTemplate {...props} />;
      case 'ai-research': return <AIResearchTemplate {...props} />;
      case 'book-notes': return <BookNotesTemplate {...props} />;
      case 'class-notes': return <ClassNotesTemplate {...props} />;
      case 'link': return <LinkTemplate {...props} />;
      case 'games-scorecard': return <GamesScorecardTemplate {...props} />;
      case 'expense-sharer': return <ExpenseSharerTemplate {...props} />;
      case 'meals-planner': return <MealsPlannerTemplate {...props} />;
      case 'sticker-book': return <StickerBookTemplate {...props} />;
      case 'prompt-diary': return <PromptDiaryTemplate {...props} />;
      case 'important-urls': return <ImportantURLsTemplate {...props} />;
      case 'tutorial-learn': return <TutorialLearnTemplate {...props} />;
      case 'ai-prompt-studio': return <AIPromptStudioTemplate {...props} />;
      case 'project': return <ProjectTemplate {...props} />;
      case 'loop': return <LoopTemplate {...props} />;
      case 'doodle': return <WhiteboardTemplate {...props} />;
      case 'n8n':
      case 'image-prompt':
      case 'video-prompt':
      case 'sound-box':
      case 'research-builder':
      case 'piano-notes':
      case 'custom':
      case 'document':
      case 'dashboard':
        return <MultiPurposeTemplate {...props} templateId={currentNotebook!.template} />;
      default: return <GenericTemplate {...props} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Opening notebook...</Text>
      </View>
    );
  }

  const themeColor = currentNotebook?.appearance?.themeColor || '#8B4513';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Notebook Header */}
      <View style={[styles.header, {
        backgroundColor: isDark ? 'rgba(28,25,23,0.98)' : 'rgba(255,255,255,0.98)',
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerSpine, { backgroundColor: themeColor }]} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {currentNotebook?.title}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowAIPanel(!showAIPanel)} style={styles.headerBtn}>
            <Ionicons name="flash" size={20} color={showAIPanel ? '#f59e0b' : colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Ionicons name="share-outline" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowOptionsModal(true)} style={styles.headerBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Page navigation tabs */}
      {currentPages.length > 0 && (
        <View style={[styles.pageTabs, { backgroundColor: isDark ? '#1c1917' : '#fafaf9', borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageTabsScroll}>
            {currentPages.map((page, i) => (
              <TouchableOpacity
                key={page._id}
                onPress={() => handlePageChange(i)}
                style={[styles.pageTab, { borderBottomColor: i === pageIndex ? themeColor : 'transparent', borderBottomWidth: 2 }]}
              >
                <Text style={[styles.pageTabText, { color: i === pageIndex ? themeColor : colors.mutedForeground }]} numberOfLines={1}>
                  {page.title || `Page ${i + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addPageTab}
              onPress={handleAddPage}
              disabled={addingPage}
            >
              {addingPage
                ? <ActivityIndicator size="small" color={colors.mutedForeground} />
                : <Ionicons name="add" size={18} color={colors.mutedForeground} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Template Content */}
      <View style={styles.content}>{renderTemplate()}</View>

      {/* AI Quick Panel */}
      {showAIPanel && (
        <View style={[styles.aiPanel, { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border }]}>
          <View style={styles.aiPanelHeader}>
            <View style={styles.aiPanelTitle}>
              <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiPanelIcon}>
                <Ionicons name="flash" size={14} color="#fff" />
              </LinearGradient>
              <Text style={[styles.aiPanelTitleText, { color: colors.foreground }]}>AI Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAIPanel(false)}>
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiActions}>
            {[
              { icon: 'sparkles', label: 'Complete', color: '#f59e0b', action: 'complete' },
              { icon: 'create', label: 'Improve', color: '#3b82f6', action: 'improve' },
              { icon: 'list', label: 'Outline', color: '#10b981', action: 'outline' },
              { icon: 'help-circle', label: 'Ask AI', color: '#a855f7', action: 'ask' },
              { icon: 'image', label: 'Generate Image', color: '#ec4899', action: 'image' },
              { icon: 'chatbubbles', label: 'Chat', color: '#06b6d4', action: 'chat' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.aiAction, { backgroundColor: `${action.color}15`, borderColor: `${action.color}30` }]}
                onPress={() => handleAIAction(action.action)}
              >
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={18} color={action.color} />
                <Text style={[styles.aiActionText, { color: colors.foreground }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Options Modal */}
      <Modal visible={showOptionsModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={[styles.optionsSheet, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={[styles.optionsHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.optionsTitle, { color: colors.foreground }]}>Notebook Options</Text>
            {[
              { icon: 'pencil', label: 'Edit Notebook', color: '#f59e0b', action: () => { setShowOptionsModal(false); navigation.navigate('EditNotebook', { notebookId }); } },
              { icon: 'share-social', label: 'Share', color: '#3b82f6', action: () => { setShowOptionsModal(false); handleShare(); } },
              { icon: 'chatbubbles', label: 'AI Chat', color: '#a855f7', action: () => { setShowOptionsModal(false); navigation.navigate('AIChat', { notebookId }); } },
              { icon: 'analytics', label: 'Analytics', color: '#10b981', action: () => { setShowOptionsModal(false); navigation.navigate('Analytics'); } },
              { icon: 'trash', label: 'Move to Trash', color: '#ef4444', action: async () => { setShowOptionsModal(false); await NotebooksAPI.delete(notebookId); navigation.goBack(); } },
            ].map((opt) => (
              <TouchableOpacity key={opt.label} onPress={opt.action} style={styles.optionItem}>
                <View style={[styles.optionIcon, { backgroundColor: `${opt.color}20` }]}>
                  <Ionicons name={opt.icon as keyof typeof Ionicons.glyphMap} size={18} color={opt.color} />
                </View>
                <Text style={[styles.optionLabel, { color: opt.color === '#ef4444' ? '#ef4444' : colors.foreground }]}>
                  {opt.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 10,
    paddingHorizontal: 12, borderBottomWidth: 1, gap: 8,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' },
  headerSpine: { width: 4, height: 24, borderRadius: 2 },
  headerTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  headerActions: { flexDirection: 'row', gap: 2 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  pageTabs: { borderBottomWidth: 1 },
  pageTabsScroll: { flexDirection: 'row', paddingHorizontal: 12 },
  pageTab: { paddingHorizontal: 12, paddingVertical: 10, marginRight: 4, minWidth: 80 },
  pageTabText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  addPageTab: { paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' },
  content: { flex: 1 },
  aiPanel: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  aiPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiPanelTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiPanelIcon: { width: 26, height: 26, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  aiPanelTitleText: { fontSize: 15, fontWeight: '700' },
  aiActions: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  aiAction: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  aiActionText: { fontSize: 13, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  optionsSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  optionsHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  optionsTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  optionIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
