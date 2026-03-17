import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface JournalTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

const JOURNAL_PROMPTS = [
  'What am I most grateful for today?',
  'What challenge did I overcome recently?',
  'What is one thing I want to improve?',
  'How am I feeling and why?',
  'What made me smile today?',
  'What did I learn today?',
  'What would make tomorrow better?',
  'What am I proud of this week?',
];

export const JournalTemplate: React.FC<JournalTemplateProps> = ({
  notebook,
  pages,
  currentPage,
  pageIndex,
  onPageChange,
}) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#f97316';
  const [entry, setEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fff7ed' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[themeColor, `${themeColor}88`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Journal</Text>
            <Text style={styles.headerDate}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 32 }}>📖</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Prompt Section */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          ✨ Writing Prompt
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
          {JOURNAL_PROMPTS.map((prompt, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedPrompt(selectedPrompt === prompt ? '' : prompt)}
              style={[
                styles.promptChip,
                {
                  backgroundColor: selectedPrompt === prompt
                    ? `${themeColor}20`
                    : isDark ? '#292524' : '#fef3c7',
                  borderColor: selectedPrompt === prompt ? themeColor : 'transparent',
                },
              ]}
            >
              <Text style={[styles.promptText, { color: selectedPrompt === prompt ? themeColor : colors.foreground }]}>
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedPrompt && (
          <View style={[styles.selectedPrompt, { backgroundColor: `${themeColor}10`, borderColor: `${themeColor}30` }]}>
            <Ionicons name="bulb-outline" size={16} color={themeColor} />
            <Text style={[styles.selectedPromptText, { color: colors.foreground }]}>
              {selectedPrompt}
            </Text>
          </View>
        )}
      </View>

      {/* Main Entry */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          📝 Today's Entry
        </Text>
        <TextInput
          value={entry}
          onChangeText={setEntry}
          placeholder={selectedPrompt || 'Write freely, no judgments...'}
          placeholderTextColor={colors.mutedForeground}
          multiline
          style={[
            styles.entryInput,
            { color: colors.foreground, borderColor: colors.border },
          ]}
          textAlignVertical="top"
        />
        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {entry.split(/\s+/).filter(Boolean).length} words
        </Text>
      </View>

      {/* Gratitude Log */}
      <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          🙏 3 Things I'm Grateful For
        </Text>
        {[1, 2, 3].map((n) => (
          <View key={n} style={styles.gratitudeItem}>
            <View style={[styles.gratitudeNumber, { backgroundColor: `${themeColor}20` }]}>
              <Text style={[styles.gratitudeNumberText, { color: themeColor }]}>{n}</Text>
            </View>
            <TextInput
              placeholder={`Gratitude #${n}`}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.gratitudeInput, { color: colors.foreground, borderColor: colors.border }]}
            />
          </View>
        ))}
      </View>

      {/* Page Navigation */}
      <View style={styles.pageNav}>
        <TouchableOpacity
          onPress={() => pageIndex > 0 && onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          style={[styles.navBtn, { borderColor: colors.border, opacity: pageIndex === 0 ? 0.4 : 1 }]}
        >
          <Ionicons name="chevron-back" size={16} color={colors.foreground} />
          <Text style={[styles.navText, { color: colors.foreground }]}>Previous</Text>
        </TouchableOpacity>
        <Text style={[styles.pageCount, { color: colors.mutedForeground }]}>
          {pageIndex + 1} / {pages.length}
        </Text>
        <TouchableOpacity
          onPress={() => pageIndex < pages.length - 1 && onPageChange(pageIndex + 1)}
          disabled={pageIndex >= pages.length - 1}
          style={[styles.navBtn, { borderColor: colors.border, opacity: pageIndex >= pages.length - 1 ? 0.4 : 1 }]}
        >
          <Text style={[styles.navText, { color: colors.foreground }]}>Next</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  headerDate: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 4,
  },
  headerIcon: {},
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  promptScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  promptChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    maxWidth: 200,
  },
  promptText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedPrompt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  selectedPromptText: {
    fontSize: 14,
    flex: 1,
    fontStyle: 'italic',
  },
  entryInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 160,
  },
  wordCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  gratitudeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  gratitudeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gratitudeNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  gratitudeInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 6,
    fontSize: 14,
  },
  pageNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
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
  pageCount: {
    fontSize: 13,
  },
});
