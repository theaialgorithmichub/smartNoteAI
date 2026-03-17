import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';
import { PagesAPI } from '../../services/api';
import { useNotebookStore } from '../../store/notebookStore';

interface SimpleTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

export const SimpleTemplate: React.FC<SimpleTemplateProps> = ({
  notebook,
  pages,
  currentPage,
  pageIndex,
  onPageChange,
}) => {
  const { colors, isDark } = useTheme();
  const { updatePage } = useNotebookStore();
  const [content, setContent] = useState(currentPage?.content || '');
  const [saving, setSaving] = useState(false);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const paperColor = notebook.appearance?.pageColor || '#fffbeb';
  const paperPattern = notebook.appearance?.paperPattern || 'lined';

  const getPaperStyle = () => {
    switch (paperPattern) {
      case 'lined':
        return { backgroundColor: paperColor };
      case 'grid':
        return { backgroundColor: paperColor };
      case 'dotted':
        return { backgroundColor: paperColor };
      default:
        return { backgroundColor: isDark ? '#1c1917' : paperColor };
    }
  };

  const autoSave = useCallback((text: string) => {
    if (saveTimer) clearTimeout(saveTimer);
    const timer = setTimeout(async () => {
      if (!currentPage) return;
      setSaving(true);
      try {
        await PagesAPI.update(notebook._id, currentPage._id, {
          content: text,
          contentPlainText: text.replace(/<[^>]*>/g, ''),
        });
        updatePage(currentPage._id, { content: text });
      } catch (err) {
        console.log('Auto-save failed', err);
      } finally {
        setSaving(false);
      }
    }, 2000);
    setSaveTimer(timer);
  }, [currentPage, notebook._id, saveTimer]);

  const handleContentChange = (text: string) => {
    setContent(text);
    autoSave(text);
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Paper background with pattern */}
      <ScrollView
        style={[styles.paper, getPaperStyle()]}
        contentContainerStyle={styles.paperContent}
        keyboardDismissMode="on-drag"
      >
        {/* Page number */}
        <View style={styles.pageNumber}>
          <Text style={[styles.pageNumberText, { color: '#78716c' }]}>
            {pageIndex + 1} / {pages.length || 1}
          </Text>
        </View>

        {/* Ruled lines for lined pattern */}
        {paperPattern === 'lined' && (
          <View style={styles.ruledLines}>
            {Array.from({ length: 30 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ruledLine,
                  { borderBottomColor: 'rgba(178, 161, 134, 0.4)' },
                  i === 0 && { borderBottomColor: 'rgba(178, 161, 134, 0.8)' },
                ]}
              />
            ))}
          </View>
        )}

        {/* Page title */}
        <Text style={[styles.pageTitle, { color: '#1c1917' }]}>
          {currentPage?.title || `Page ${pageIndex + 1}`}
        </Text>

        {/* Text editor */}
        <TextInput
          value={content}
          onChangeText={handleContentChange}
          placeholder="Start writing..."
          placeholderTextColor="#a8a29e"
          multiline
          style={[
            styles.textEditor,
            {
              color: '#1c1917',
              fontFamily: getFontFamily(notebook.appearance?.fontStyle),
            },
          ]}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? '#1c1917' : '#fff',
            borderTopColor: colors.border,
          },
        ]}
      >
        {/* Navigation arrows */}
        <View style={styles.navButtons}>
          <TouchableOpacity
            onPress={() => pageIndex > 0 && onPageChange(pageIndex - 1)}
            style={[styles.navBtn, { opacity: pageIndex === 0 ? 0.3 : 1 }]}
            disabled={pageIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pageIndex < pages.length - 1 && onPageChange(pageIndex + 1)}
            style={[styles.navBtn, { opacity: pageIndex >= pages.length - 1 ? 0.3 : 1 }]}
            disabled={pageIndex >= pages.length - 1}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Word count */}
        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {wordCount} words
        </Text>

        {/* Save indicator */}
        {saving && (
          <Text style={[styles.savingText, { color: colors.mutedForeground }]}>Saving...</Text>
        )}

        {/* Keyboard dismiss */}
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          style={styles.keyboardDismiss}
        >
          <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

function getFontFamily(style?: string): string {
  switch (style) {
    case 'serif':
      return 'serif';
    case 'handwritten':
      return 'cursive';
    default:
      return 'System';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  paper: {
    flex: 1,
    position: 'relative',
  },
  paperContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    minHeight: 600,
  },
  pageNumber: {
    position: 'absolute',
    top: 8,
    right: 16,
  },
  pageNumberText: {
    fontSize: 11,
  },
  ruledLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingTop: 48,
  },
  ruledLine: {
    borderBottomWidth: 1,
    height: 32,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginTop: 24,
  },
  textEditor: {
    fontSize: 16,
    lineHeight: 32,
    minHeight: 400,
    zIndex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  savingText: {
    fontSize: 12,
  },
  keyboardDismiss: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
