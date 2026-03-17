import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

interface CodeNotebookTemplateProps {
  notebook: Notebook;
  pages: Page[];
  currentPage: Page | null;
  pageIndex: number;
  onPageChange: (index: number) => void;
}

type BlockType = 'code' | 'text' | 'output';

interface Block {
  id: string;
  type: BlockType;
  language: string;
  content: string;
  output?: string;
}

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'SQL', 'Bash', 'JSON', 'HTML', 'CSS'];
const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f59e0b', TypeScript: '#3b82f6', Python: '#10b981',
  Go: '#06b6d4', Rust: '#f97316', SQL: '#8b5cf6',
  Bash: '#6b7280', JSON: '#ec4899', HTML: '#ef4444', CSS: '#a855f7',
};

export const CodeNotebookTemplate: React.FC<CodeNotebookTemplateProps> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#10b981';

  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'text', language: '', content: '# My Code Notebook\n\nDocument your code experiments here.' },
    { id: '2', type: 'code', language: 'JavaScript', content: 'const greeting = "Hello, World!";\nconsole.log(greeting);', output: '> Hello, World!' },
  ]);
  const [selectedLang, setSelectedLang] = useState('JavaScript');

  const addBlock = (type: BlockType) => {
    setBlocks((p) => [...p, {
      id: Date.now().toString(),
      type,
      language: selectedLang,
      content: '',
    }]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks((p) => p.map((b) => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks((p) => p.filter((b) => b.id !== id));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#f8fafc' }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="code-slash" size={20} color="#10b981" />
          <Text style={styles.headerTitle}>Code Notebook</Text>
        </View>
        <View style={styles.langSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setSelectedLang(lang)}
                style={[styles.langChip, {
                  backgroundColor: selectedLang === lang ? (LANG_COLORS[lang] || themeColor) : '#1e293b',
                }]}
              >
                <Text style={[styles.langChipText, { color: selectedLang === lang ? '#fff' : '#94a3b8' }]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Blocks */}
      {blocks.map((block, i) => (
        <View key={block.id} style={styles.blockContainer}>
          {block.type === 'text' ? (
            <View style={[styles.textBlock, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
              <TextInput
                value={block.content}
                onChangeText={(v) => updateBlock(block.id, v)}
                placeholder="Notes, documentation..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[styles.textBlockInput, { color: colors.foreground }]}
                textAlignVertical="top"
              />
              <TouchableOpacity onPress={() => deleteBlock(block.id)} style={styles.deleteBtn}>
                <Ionicons name="close" size={14} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.codeBlock}>
              {/* Code editor header */}
              <View style={[styles.codeHeader, { backgroundColor: '#1e293b' }]}>
                <View style={styles.codeHeaderLeft}>
                  <View style={styles.dotRed} />
                  <View style={styles.dotYellow} />
                  <View style={styles.dotGreen} />
                  <View style={[styles.langBadge, { backgroundColor: (LANG_COLORS[block.language] || themeColor) + '30' }]}>
                    <Text style={[styles.langBadgeText, { color: LANG_COLORS[block.language] || themeColor }]}>
                      {block.language}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteBlock(block.id)}>
                  <Ionicons name="close" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
              {/* Code input */}
              <TextInput
                value={block.content}
                onChangeText={(v) => updateBlock(block.id, v)}
                placeholder={`// Write ${block.language} code...`}
                placeholderTextColor="#475569"
                multiline
                style={styles.codeInput}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {/* Output */}
              {block.output && (
                <View style={styles.outputBlock}>
                  <Text style={styles.outputLabel}>OUTPUT</Text>
                  <Text style={styles.outputText}>{block.output}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* Add block buttons */}
      <View style={styles.addRow}>
        <TouchableOpacity
          onPress={() => addBlock('text')}
          style={[styles.addBlockBtn, { backgroundColor: isDark ? '#292524' : '#f1f5f9', borderColor: colors.border }]}
        >
          <Ionicons name="document-text-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.addBlockText, { color: colors.mutedForeground }]}>Add Text</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => addBlock('code')}
          style={[styles.addBlockBtn, { backgroundColor: '#1e293b', borderColor: '#334155' }]}
        >
          <Ionicons name="code-slash" size={16} color="#10b981" />
          <Text style={[styles.addBlockText, { color: '#10b981' }]}>Add Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, gap: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
  langSelector: { marginTop: 4 },
  langRow: { flexDirection: 'row', gap: 6 },
  langChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  langChipText: { fontSize: 11, fontWeight: '600' },
  blockContainer: { marginHorizontal: 12, marginBottom: 10 },
  textBlock: { borderRadius: 10, borderWidth: 1, padding: 12, position: 'relative' },
  textBlockInput: { fontSize: 14, lineHeight: 22, minHeight: 56 },
  deleteBtn: { position: 'absolute', top: 8, right: 8, padding: 4 },
  codeBlock: { borderRadius: 10, overflow: 'hidden' },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  codeHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dotRed: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  dotYellow: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f59e0b' },
  dotGreen: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981' },
  langBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 4 },
  langBadgeText: { fontSize: 11, fontWeight: '700' },
  codeInput: {
    backgroundColor: '#0f172a', color: '#e2e8f0', fontFamily: 'monospace',
    fontSize: 13, lineHeight: 22, padding: 14, minHeight: 100,
  },
  outputBlock: { backgroundColor: '#1e293b', padding: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  outputLabel: { color: '#10b981', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  outputText: { color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 },
  addRow: { flexDirection: 'row', gap: 10, margin: 12 },
  addBlockBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  addBlockText: { fontSize: 13, fontWeight: '600' },
});
