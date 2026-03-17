import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useNotebookStore } from '../../store/notebookStore';
import { NotebooksAPI, PagesAPI } from '../../services/api';
import { DashboardStackParamList } from '../../navigation/types';
import { SimpleTemplate } from '../../components/templates/SimpleTemplate';
import { DiaryTemplate } from '../../components/templates/DiaryTemplate';
import { PlannerTemplate } from '../../components/templates/PlannerTemplate';
import { MeetingNotesTemplate } from '../../components/templates/MeetingNotesTemplate';
import { TodoTemplate } from '../../components/templates/TodoTemplate';
import { HabitTrackerTemplate } from '../../components/templates/HabitTrackerTemplate';
import { ExpenseTemplate } from '../../components/templates/ExpenseTemplate';
import { JournalTemplate } from '../../components/templates/JournalTemplate';
import { GenericTemplate } from '../../components/templates/GenericTemplate';

const { width } = Dimensions.get('window');

type NotebookViewerRouteProp = RouteProp<DashboardStackParamList, 'NotebookViewer'>;

export default function NotebookViewerScreen() {
  const navigation = useNavigation();
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
  } = useNotebookStore();

  const [loading, setLoading] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

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
      if (pages.length > 0) {
        setCurrentPage(pages[0]);
      }
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
    setPageIndex(index);
    setCurrentPage(currentPages[index]);
  };

  const renderTemplate = () => {
    if (!currentNotebook) return null;
    const template = currentNotebook.template;
    const props = {
      notebook: currentNotebook,
      pages: currentPages,
      currentPage,
      pageIndex,
      onPageChange: handlePageChange,
    };

    switch (template) {
      case 'simple':
        return <SimpleTemplate {...props} />;
      case 'diary':
        return <DiaryTemplate {...props} />;
      case 'planner':
        return <PlannerTemplate {...props} />;
      case 'meeting-notes':
        return <MeetingNotesTemplate {...props} />;
      case 'todo':
        return <TodoTemplate {...props} />;
      case 'habit-tracker':
        return <HabitTrackerTemplate {...props} />;
      case 'expense':
        return <ExpenseTemplate {...props} />;
      case 'journal':
        return <JournalTemplate {...props} />;
      default:
        return <GenericTemplate {...props} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Opening notebook...
        </Text>
      </View>
    );
  }

  const themeColor = currentNotebook?.appearance?.themeColor || '#8B4513';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Notebook Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDark ? 'rgba(28,25,23,0.98)' : 'rgba(255,255,255,0.98)',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
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
            <Ionicons
              name="flash"
              size={20}
              color={showAIPanel ? '#f59e0b' : colors.foreground}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* Share */}}
            style={styles.headerBtn}
          >
            <Ionicons name="share-outline" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {/* Options */}}
            style={styles.headerBtn}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Page navigation tabs */}
      {currentPages.length > 1 && (
        <View style={[styles.pageTabs, { backgroundColor: isDark ? '#1c1917' : '#fafaf9', borderBottomColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pageTabsScroll}>
            {currentPages.map((page, i) => (
              <TouchableOpacity
                key={page._id}
                onPress={() => handlePageChange(i)}
                style={[
                  styles.pageTab,
                  {
                    borderBottomColor: i === pageIndex ? themeColor : 'transparent',
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pageTabText,
                    { color: i === pageIndex ? themeColor : colors.mutedForeground },
                  ]}
                  numberOfLines={1}
                >
                  {page.title || `Page ${i + 1}`}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Add page button */}
            <TouchableOpacity style={styles.addPageTab} onPress={() => {/* Add page */}}>
              <Ionicons name="add" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Template Content */}
      <View style={styles.content}>
        {renderTemplate()}
      </View>

      {/* AI Quick Panel */}
      {showAIPanel && (
        <View
          style={[
            styles.aiPanel,
            { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border },
          ]}
        >
          <View style={styles.aiPanelHeader}>
            <View style={styles.aiPanelTitle}>
              <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiPanelIcon}>
                <Ionicons name="flash" size={14} color="#fff" />
              </LinearGradient>
              <Text style={[styles.aiPanelTitleText, { color: colors.foreground }]}>
                AI Assistant
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowAIPanel(false)}>
              <Ionicons name="close" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiActions}>
            {[
              { icon: 'sparkles', label: 'Complete', color: '#f59e0b' },
              { icon: 'create', label: 'Improve', color: '#3b82f6' },
              { icon: 'list', label: 'Outline', color: '#10b981' },
              { icon: 'help-circle', label: 'Ask AI', color: '#a855f7' },
              { icon: 'image', label: 'Generate Image', color: '#ec4899' },
              { icon: 'chatbubbles', label: 'Chat', color: '#06b6d4' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.aiAction, { backgroundColor: `${action.color}15`, borderColor: `${action.color}30` }]}
                onPress={() => {/* Navigate to AI screen */}}
              >
                <Ionicons name={action.icon as keyof typeof Ionicons.glyphMap} size={18} color={action.color} />
                <Text style={[styles.aiActionText, { color: colors.foreground }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  headerSpine: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 2,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTabs: {
    borderBottomWidth: 1,
  },
  pageTabsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  pageTab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 4,
    minWidth: 80,
  },
  pageTabText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  addPageTab: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  aiPanel: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiPanelTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiPanelIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiPanelTitleText: {
    fontSize: 15,
    fontWeight: '700',
  },
  aiActions: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  aiAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  aiActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
