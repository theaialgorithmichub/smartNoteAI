import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Notebook, Page } from '../../types';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

interface Props { notebook: Notebook; pages: Page[]; currentPage: Page | null; pageIndex: number; onPageChange: (i: number) => void; }

export const TypewriterTemplate: React.FC<Props> = ({ notebook }) => {
  const { colors, isDark } = useTheme();
  const themeColor = notebook.appearance?.themeColor || '#78716c';
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [focusMode, setFocusMode] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showStats, setShowStats] = useState(true);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const sentenceCount = content.split(/[.!?]+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage)!;

  const paperBg = isDark ? '#1c1917' : notebook.appearance?.pageColor || '#fffbef';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0c0a09' : '#fafaf9' }]}>
      {/* Top bar */}
      {!focusMode && (
        <View style={[styles.topBar, { backgroundColor: isDark ? '#1c1917' : '#fff', borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setShowLangPicker(!showLangPicker)} style={[styles.langBtn, { borderColor: colors.border }]}>
            <Ionicons name="globe-outline" size={16} color={themeColor} />
            <Text style={[styles.langBtnText, { color: colors.foreground }]}>{currentLang.nativeName}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
          <View style={styles.topBarRight}>
            <TouchableOpacity onPress={() => setShowStats(!showStats)} style={styles.iconBtn}>
              <Ionicons name="bar-chart" size={18} color={showStats ? themeColor : colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFocusMode(true)} style={[styles.focusBtn, { backgroundColor: themeColor }]}>
              <Ionicons name="expand" size={16} color="#fff" />
              <Text style={styles.focusBtnText}>Focus</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Language picker */}
      {showLangPicker && (
        <View style={[styles.langPicker, { backgroundColor: isDark ? '#1c1917' : '#fff', borderColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langRow}>
            {LANGUAGES.map(lang => (
              <TouchableOpacity key={lang.code} onPress={() => { setSelectedLanguage(lang.code); setShowLangPicker(false); }}
                style={[styles.langOption, { backgroundColor: selectedLanguage === lang.code ? themeColor : (isDark ? '#292524' : '#f5f5f4') }]}>
                <Text style={[styles.langOptionNative, { color: selectedLanguage === lang.code ? '#fff' : colors.foreground }]}>{lang.nativeName}</Text>
                <Text style={[styles.langOptionName, { color: selectedLanguage === lang.code ? 'rgba(255,255,255,0.7)' : colors.mutedForeground }]}>{lang.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Stats bar */}
      {showStats && !focusMode && (
        <View style={[styles.statsBar, { backgroundColor: isDark ? '#292524' : '#f5f5f4' }]}>
          {[
            { label: 'Words', value: wordCount },
            { label: 'Chars', value: charCount },
            { label: 'Sentences', value: sentenceCount },
            { label: 'Read', value: `${readingTime}m` },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColor }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Paper */}
      <ScrollView style={[styles.paper, { backgroundColor: paperBg }]} contentContainerStyle={styles.paperInner} keyboardDismissMode="on-drag">
        {/* Ruled lines decoration */}
        <View style={styles.ruledLines}>
          {Array.from({ length: 40 }).map((_, i) => (
            <View key={i} style={[styles.ruledLine, { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(178,161,134,0.3)' }]} />
          ))}
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Document Title..."
          placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
          style={[styles.titleInput, { color: isDark ? '#f5f5f4' : '#1c1917' }]}
        />
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder={`Start writing in ${currentLang.name}...`}
          placeholderTextColor={isDark ? '#57534e' : '#a8a29e'}
          multiline
          style={[styles.contentInput, {
            color: isDark ? '#f5f5f4' : '#1c1917',
            fontFamily: notebook.appearance?.fontStyle === 'serif' ? 'serif' : notebook.appearance?.fontStyle === 'handwritten' ? 'cursive' : undefined,
          }]}
          textAlignVertical="top"
        />
      </ScrollView>

      {/* Focus mode exit */}
      {focusMode && (
        <TouchableOpacity onPress={() => setFocusMode(false)} style={styles.exitFocus}>
          <Ionicons name="contract" size={16} color="rgba(255,255,255,0.7)" />
          <Text style={styles.exitFocusText}>Exit Focus</Text>
        </TouchableOpacity>
      )}

      {/* Bottom toolbar */}
      {!focusMode && (
        <View style={[styles.bottomBar, { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border }]}>
          <TouchableOpacity onPress={() => Keyboard.dismiss()} style={styles.iconBtn}>
            <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={[styles.wordCountText, { color: colors.mutedForeground }]}>{wordCount} words</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="copy-outline" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="download-outline" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  langBtnText: { fontSize: 13, fontWeight: '600' },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18 },
  focusBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  focusBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  langPicker: { borderBottomWidth: 1, paddingVertical: 6 },
  langRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12 },
  langOption: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, minWidth: 70 },
  langOptionNative: { fontSize: 14, fontWeight: '700' },
  langOptionName: { fontSize: 10, marginTop: 2 },
  statsBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 1 },
  paper: { flex: 1, position: 'relative' },
  paperInner: { padding: 24, paddingTop: 20, minHeight: 600 },
  ruledLines: { position: 'absolute', left: 0, right: 0, top: 80, bottom: 0, paddingTop: 0 },
  ruledLine: { borderBottomWidth: 1, height: 30 },
  titleInput: { fontSize: 22, fontWeight: '800', marginBottom: 16, zIndex: 1 },
  contentInput: { fontSize: 16, lineHeight: 30, minHeight: 400, zIndex: 1 },
  exitFocus: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  exitFocusText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, gap: 4 },
  wordCountText: { flex: 1, textAlign: 'center', fontSize: 12 },
});
