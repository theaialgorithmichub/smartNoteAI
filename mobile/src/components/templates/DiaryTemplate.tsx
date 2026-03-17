import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface DiaryTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Angry' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '🥳', label: 'Excited' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤔', label: 'Thoughtful' },
];

export const DiaryTemplate: React.FC<DiaryTemplateProps> = ({
  notebook,
  pages,
  currentPage,
  pageIndex,
  onPageChange,
}) => {
  const { colors, isDark } = useTheme();
  const [content, setContent] = useState(currentPage?.content || '');
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [gratitude, setGratitude] = useState('');
  const [highlight, setHighlight] = useState('');

  const today = new Date();
  const pageColor = notebook.appearance?.pageColor || '#fffbeb';
  const themeColor = notebook.appearance?.themeColor || '#ec4899';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : pageColor }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Date Header */}
      <LinearGradient
        colors={[themeColor, `${themeColor}88`]}
        style={styles.dateHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          <Text style={styles.dateDay}>{format(today, 'EEEE')}</Text>
          <Text style={styles.dateNumber}>{format(today, 'MMMM d, yyyy')}</Text>
        </View>
        <View style={styles.dateRight}>
          <Text style={styles.entryNumber}>Entry #{pageIndex + 1}</Text>
        </View>
      </LinearGradient>

      {/* Mood Tracker */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          How are you feeling today?
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodRow}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.label}
              onPress={() => setSelectedMood(mood.label)}
              style={[
                styles.moodOption,
                {
                  backgroundColor:
                    selectedMood === mood.label
                      ? `${themeColor}20`
                      : isDark
                      ? '#292524'
                      : '#f5f5f4',
                  borderColor: selectedMood === mood.label ? themeColor : 'transparent',
                  borderWidth: 1.5,
                },
              ]}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodLabel, { color: colors.mutedForeground }]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Entry */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          📝 Dear Diary...
        </Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write about your day..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.mainEntry,
            {
              color: colors.foreground,
              borderColor: colors.border,
            },
          ]}
          textAlignVertical="top"
        />
      </View>

      {/* Gratitude & Highlights */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <View style={styles.twoColumn}>
          <View style={styles.halfSection}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 16 }}>🙏</Text>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Grateful For
              </Text>
            </View>
            <TextInput
              value={gratitude}
              onChangeText={setGratitude}
              placeholder="What are you grateful for?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              style={[
                styles.smallEntry,
                { color: colors.foreground, borderColor: colors.border },
              ]}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.halfSection}>
            <View style={styles.cardHeader}>
              <Text style={{ fontSize: 16 }}>⭐</Text>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                Today's Highlight
              </Text>
            </View>
            <TextInput
              value={highlight}
              onChangeText={setHighlight}
              placeholder="Best moment of today?"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              style={[
                styles.smallEntry,
                { color: colors.foreground, borderColor: colors.border },
              ]}
              textAlignVertical="top"
            />
          </View>
        </View>
      </View>

      {/* Page navigation */}
      <View style={styles.pageNav}>
        <TouchableOpacity
          onPress={() => pageIndex > 0 && onPageChange(pageIndex - 1)}
          style={[styles.navBtn, { borderColor: colors.border }]}
          disabled={pageIndex === 0}
        >
          <Ionicons name="chevron-back" size={18} color={pageIndex === 0 ? colors.mutedForeground : colors.foreground} />
          <Text style={[styles.navText, { color: pageIndex === 0 ? colors.mutedForeground : colors.foreground }]}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={[styles.pageIndicator, { color: colors.mutedForeground }]}>
          {pageIndex + 1} / {pages.length}
        </Text>

        <TouchableOpacity
          onPress={() => pageIndex < pages.length - 1 && onPageChange(pageIndex + 1)}
          style={[styles.navBtn, { borderColor: colors.border }]}
          disabled={pageIndex >= pages.length - 1}
        >
          <Text style={[styles.navText, { color: pageIndex >= pages.length - 1 ? colors.mutedForeground : colors.foreground }]}>
            Next
          </Text>
          <Ionicons name="chevron-forward" size={18} color={pageIndex >= pages.length - 1 ? colors.mutedForeground : colors.foreground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingBottom: 40,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
  },
  dateDay: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  dateNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  dateRight: {
    alignItems: 'flex-end',
  },
  entryNumber: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  section: {
    margin: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  moodOption: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
    minWidth: 56,
  },
  moodEmoji: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  mainEntry: {
    fontSize: 15,
    lineHeight: 24,
    minHeight: 160,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },
  halfSection: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  smallEntry: {
    fontSize: 13,
    lineHeight: 20,
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  pageNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  navText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pageIndicator: {
    fontSize: 13,
  },
});
