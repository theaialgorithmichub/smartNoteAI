import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface Lesson { id: string; title: string; estimatedMinutes: number; explanation: string; keyPoints: string[]; completed: boolean; }
interface Chapter { id: string; title: string; overview: string; level: 'beginner'|'intermediate'|'advanced'; estimatedHours: number; lessons: Lesson[]; completed: boolean; }

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

const LEVEL_COLORS = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };

export const StudyBookTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#10b981';
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: '', overview: '', level: 'beginner' as Chapter['level'], estimatedHours: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', estimatedMinutes: '', explanation: '', keyPoints: '' });
  const [reviewMode, setReviewMode] = useState(false);

  const addChapter = () => {
    if (!chapterForm.title.trim()) return;
    const ch: Chapter = {
      id: Date.now().toString(),
      title: chapterForm.title, overview: chapterForm.overview,
      level: chapterForm.level, estimatedHours: parseFloat(chapterForm.estimatedHours) || 1,
      lessons: [], completed: false,
    };
    setChapters(p => [...p, ch]);
    setChapterForm({ title: '', overview: '', level: 'beginner', estimatedHours: '' });
    setShowChapterForm(false);
  };

  const addLesson = () => {
    if (!lessonForm.title.trim() || !activeChapterId) return;
    const lesson: Lesson = {
      id: Date.now().toString(),
      title: lessonForm.title, estimatedMinutes: parseInt(lessonForm.estimatedMinutes) || 30,
      explanation: lessonForm.explanation,
      keyPoints: lessonForm.keyPoints.split('\n').filter(Boolean),
      completed: false,
    };
    setChapters(p => p.map(ch => ch.id === activeChapterId ? { ...ch, lessons: [...ch.lessons, lesson] } : ch));
    setLessonForm({ title: '', estimatedMinutes: '', explanation: '', keyPoints: '' });
    setShowLessonForm(false);
  };

  const toggleLesson = (chapterId: string, lessonId: string) => {
    setChapters(p => p.map(ch => ch.id === chapterId ? {
      ...ch, lessons: ch.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l),
      completed: ch.lessons.every(l => l.id === lessonId ? !l.completed : l.completed),
    } : ch));
  };

  const totalLessons = chapters.flatMap(c => c.lessons).length;
  const completedLessons = chapters.flatMap(c => c.lessons).filter(l => l.completed).length;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const activeChapter = chapters.find(c => c.id === activeChapterId);
  const activeLesson = activeChapter?.lessons.find(l => l.id === activeLessonId);

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f0fdf4' }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[themeColor, `${themeColor}99`]} style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="school" size={22} color="#fff" />
          <Text style={styles.headerTitle}>{notebook.title || 'Study Book'}</Text>
          <TouchableOpacity onPress={() => setReviewMode(!reviewMode)} style={[styles.reviewBtn, { backgroundColor: reviewMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name="eye" size={16} color="#fff" />
            <Text style={styles.reviewBtnText}>{reviewMode ? 'Study' : 'Review'}</Text>
          </TouchableOpacity>
        </View>
        {totalLessons > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>{completedLessons}/{totalLessons} lessons</Text>
              <Text style={styles.progressPct}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${progress}%` as any }]} /></View>
          </View>
        )}
      </LinearGradient>

      {/* Active lesson view */}
      {activeLesson && (
        <View style={[styles.lessonView, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
          <TouchableOpacity onPress={() => setActiveLessonId(null)} style={styles.backRow}>
            <Ionicons name="arrow-back" size={16} color={themeColor} />
            <Text style={[styles.backText, { color: themeColor }]}>Back to Chapter</Text>
          </TouchableOpacity>
          <View style={styles.lessonViewHeader}>
            <Text style={[styles.lessonViewTitle, { color: colors.foreground }]}>{activeLesson.title}</Text>
            <View style={styles.lessonViewMeta}>
              <Ionicons name="time" size={14} color={colors.mutedForeground} />
              <Text style={[styles.lessonViewMetaText, { color: colors.mutedForeground }]}>{activeLesson.estimatedMinutes} min</Text>
            </View>
          </View>
          <Text style={[styles.lessonExplanation, { color: colors.foreground }]}>{activeLesson.explanation || 'No content yet.'}</Text>
          {activeLesson.keyPoints.length > 0 && (
            <View>
              <Text style={[styles.keyPointsTitle, { color: colors.foreground }]}>🔑 Key Points</Text>
              {activeLesson.keyPoints.map((kp, i) => (
                <View key={i} style={styles.keyPoint}>
                  <View style={[styles.keyPointDot, { backgroundColor: themeColor }]} />
                  <Text style={[styles.keyPointText, { color: colors.foreground }]}>{kp}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Chapters */}
      {!activeLessonId && chapters.map(chapter => (
        <View key={chapter.id} style={[styles.chapterCard, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
          <TouchableOpacity onPress={() => setActiveChapterId(activeChapterId === chapter.id ? null : chapter.id)} style={styles.chapterHeader}>
            <View style={styles.chapterLeft}>
              <View style={[styles.levelBadge, { backgroundColor: `${LEVEL_COLORS[chapter.level]}20` }]}>
                <Text style={[styles.levelText, { color: LEVEL_COLORS[chapter.level] }]}>{chapter.level}</Text>
              </View>
              <View>
                <Text style={[styles.chapterTitle, { color: colors.foreground }]}>{chapter.title}</Text>
                <Text style={[styles.chapterMeta, { color: colors.mutedForeground }]}>
                  {chapter.lessons.length} lessons • {chapter.estimatedHours}h • {chapter.lessons.filter(l => l.completed).length}/{chapter.lessons.length} done
                </Text>
              </View>
            </View>
            <Ionicons name={activeChapterId === chapter.id ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          {activeChapterId === chapter.id && (
            <View style={styles.chapterBody}>
              {chapter.overview && <Text style={[styles.chapterOverview, { color: colors.mutedForeground }]}>{chapter.overview}</Text>}
              {chapter.lessons.map(lesson => (
                <TouchableOpacity key={lesson.id} onPress={() => { setActiveLessonId(lesson.id); }}
                  style={[styles.lessonRow, { borderColor: colors.border }]}>
                  <TouchableOpacity onPress={(e) => { e.stopPropagation?.(); toggleLesson(chapter.id, lesson.id); }}
                    style={[styles.lessonCheck, { borderColor: themeColor, backgroundColor: lesson.completed ? themeColor : 'transparent' }]}>
                    {lesson.completed && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.lessonTitle, { color: colors.foreground }, lesson.completed && { textDecorationLine: 'line-through', color: colors.mutedForeground }]}>
                      {lesson.title}
                    </Text>
                    <Text style={[styles.lessonMeta, { color: colors.mutedForeground }]}>{lesson.estimatedMinutes} min • {lesson.keyPoints.length} key points</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => { setActiveChapterId(chapter.id); setShowLessonForm(true); }}
                style={[styles.addLessonBtn, { borderColor: themeColor }]}>
                <Ionicons name="add" size={14} color={themeColor} />
                <Text style={[styles.addLessonBtnText, { color: themeColor }]}>Add Lesson</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={() => setShowChapterForm(true)} style={[styles.addChapterBtn, { borderColor: themeColor }]}>
        <Ionicons name="add-circle" size={20} color={themeColor} />
        <Text style={[styles.addChapterBtnText, { color: themeColor }]}>Add Chapter</Text>
      </TouchableOpacity>

      {/* Chapter Form */}
      <Modal visible={showChapterForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Chapter</Text>
            <TextInput value={chapterForm.title} onChangeText={v => setChapterForm(p => ({ ...p, title: v }))} placeholder="Chapter title"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={chapterForm.overview} onChangeText={v => setChapterForm(p => ({ ...p, overview: v }))} placeholder="Chapter overview" multiline
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={chapterForm.estimatedHours} onChangeText={v => setChapterForm(p => ({ ...p, estimatedHours: v }))} placeholder="Est. hours" keyboardType="numeric"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <View style={styles.levelRow}>
              {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                <TouchableOpacity key={l} onPress={() => setChapterForm(p => ({ ...p, level: l }))}
                  style={[styles.levelBtn, { backgroundColor: chapterForm.level === l ? LEVEL_COLORS[l] : (isDark ? '#292524' : '#f5f5f4') }]}>
                  <Text style={[styles.levelBtnText, { color: chapterForm.level === l ? '#fff' : colors.foreground }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowChapterForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}><Text style={{ color: colors.foreground }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={addChapter} style={[styles.submitBtn, { backgroundColor: themeColor }]}><Text style={styles.submitText}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lesson Form */}
      <Modal visible={showLessonForm} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Lesson</Text>
            <TextInput value={lessonForm.title} onChangeText={v => setLessonForm(p => ({ ...p, title: v }))} placeholder="Lesson title"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={lessonForm.estimatedMinutes} onChangeText={v => setLessonForm(p => ({ ...p, estimatedMinutes: v }))} placeholder="Est. minutes" keyboardType="numeric"
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
            <TextInput value={lessonForm.explanation} onChangeText={v => setLessonForm(p => ({ ...p, explanation: v }))} placeholder="Explanation/Content" multiline
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, minHeight: 80 }]} />
            <TextInput value={lessonForm.keyPoints} onChangeText={v => setLessonForm(p => ({ ...p, keyPoints: v }))} placeholder="Key points (one per line)" multiline
              placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border, minHeight: 60 }]} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowLessonForm(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}><Text style={{ color: colors.foreground }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={addLesson} style={[styles.submitBtn, { backgroundColor: themeColor }]}><Text style={styles.submitText}>Add</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  reviewBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  progressSection: { gap: 6 },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  progressPct: { color: '#fff', fontWeight: '700', fontSize: 13 },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  lessonView: { margin: 12, borderRadius: 12, padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 13, fontWeight: '600' },
  lessonViewHeader: { gap: 4 },
  lessonViewTitle: { fontSize: 20, fontWeight: '800' },
  lessonViewMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lessonViewMetaText: { fontSize: 13 },
  lessonExplanation: { fontSize: 15, lineHeight: 24 },
  keyPointsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  keyPoint: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  keyPointDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  keyPointText: { flex: 1, fontSize: 14, lineHeight: 20 },
  chapterCard: { margin: 12, marginBottom: 0, borderRadius: 12, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  chapterLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  levelText: { fontSize: 10, fontWeight: '700' },
  chapterTitle: { fontSize: 15, fontWeight: '700' },
  chapterMeta: { fontSize: 12, marginTop: 2 },
  chapterBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#00000010' },
  chapterOverview: { fontSize: 13, lineHeight: 18, paddingTop: 10, marginBottom: 10 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, gap: 10 },
  lessonCheck: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  lessonTitle: { fontSize: 14, fontWeight: '600' },
  lessonMeta: { fontSize: 12, marginTop: 2 },
  addLessonBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 8 },
  addLessonBtnText: { fontSize: 13, fontWeight: '600' },
  addChapterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 12, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed' },
  addChapterBtnText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e7e5e4', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 10 },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  levelBtnText: { fontSize: 12, fontWeight: '600' },
  cancelBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  submitBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
