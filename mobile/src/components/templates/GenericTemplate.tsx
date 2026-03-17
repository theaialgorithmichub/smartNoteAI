import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';
import { TEMPLATES } from '../../constants/templates';

interface GenericTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

export const GenericTemplate: React.FC<GenericTemplateProps> = ({
  notebook,
  pages,
  currentPage,
  pageIndex,
  onPageChange,
}) => {
  const { colors, isDark } = useTheme();
  const [content, setContent] = useState(currentPage?.content || '');
  const themeColor = notebook.appearance?.themeColor || '#6366f1';
  const paperColor = notebook.appearance?.pageColor || '#fffbeb';

  const templateConfig = TEMPLATES.find((t) => t.id === notebook.template);

  return (
    <View style={styles.container}>
      {/* Template header */}
      <LinearGradient
        colors={[themeColor, `${themeColor}aa`]}
        style={styles.templateHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.templateHeaderLeft}>
          <Ionicons name="book" size={18} color="rgba(255,255,255,0.8)" />
          <Text style={styles.templateName}>
            {templateConfig?.name || notebook.template}
          </Text>
        </View>
        <Text style={styles.pageCount}>
          Page {pageIndex + 1}/{pages.length}
        </Text>
      </LinearGradient>

      {/* Content area */}
      <ScrollView
        style={[styles.content, { backgroundColor: isDark ? '#1c1917' : paperColor }]}
        contentContainerStyle={styles.contentInner}
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.pageTitle, { color: isDark ? '#f5f5f4' : '#1c1917' }]}>
          {currentPage?.title || `Page ${pageIndex + 1}`}
        </Text>

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Start writing..."
          placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
          multiline
          style={[
            styles.editor,
            {
              color: isDark ? '#f5f5f4' : '#1c1917',
            },
          ]}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Bottom toolbar */}
      <View
        style={[
          styles.toolbar,
          {
            backgroundColor: isDark ? '#1c1917' : '#fff',
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => pageIndex > 0 && onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          style={[styles.toolbarBtn, { opacity: pageIndex === 0 ? 0.4 : 1 }]}
        >
          <Ionicons name="chevron-back" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {content.split(/\s+/).filter(Boolean).length} words
        </Text>

        <TouchableOpacity
          onPress={() => pageIndex < pages.length - 1 && onPageChange(pageIndex + 1)}
          disabled={pageIndex >= pages.length - 1}
          style={[styles.toolbarBtn, { opacity: pageIndex >= pages.length - 1 ? 0.4 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.toolbarBtn}>
          <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  templateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pageCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 20,
    paddingTop: 16,
    minHeight: 500,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  editor: {
    fontSize: 15,
    lineHeight: 26,
    minHeight: 400,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  toolbarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCount: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
});
