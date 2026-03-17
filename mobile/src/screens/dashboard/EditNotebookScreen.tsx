import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { NotebooksAPI } from '../../services/api';
import { useNotebookStore } from '../../store/notebookStore';
import { ThemeColors } from '../../theme/colors';
import { DashboardStackParamList } from '../../navigation/types';

type EditNotebookRouteProp = RouteProp<DashboardStackParamList, 'EditNotebook'>;

export default function EditNotebookScreen() {
  const navigation = useNavigation();
  const route = useRoute<EditNotebookRouteProp>();
  const { notebookId } = route.params;
  const { colors, isDark } = useTheme();
  const { notebooks, updateNotebook } = useNotebookStore();

  const notebook = notebooks.find((n) => n._id === notebookId);

  const [title, setTitle] = useState(notebook?.title || '');
  const [category, setCategory] = useState(notebook?.category || 'Personal');
  const [themeColor, setThemeColor] = useState(notebook?.appearance?.themeColor || '#8B4513');
  const [pageColor, setPageColor] = useState(notebook?.appearance?.pageColor || '#fffbeb');
  const [paperPattern, setPaperPattern] = useState(notebook?.appearance?.paperPattern || 'lined');
  const [fontStyle, setFontStyle] = useState(notebook?.appearance?.fontStyle || 'sans');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    setLoading(true);
    try {
      await NotebooksAPI.update(notebookId, {
        title: title.trim(),
        category,
        appearance: { themeColor, pageColor, paperPattern, fontStyle },
      });
      updateNotebook(notebookId, {
        title: title.trim(),
        category,
        appearance: { themeColor, pageColor, paperPattern, fontStyle },
      } as any);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not update notebook');
    } finally {
      setLoading(false);
    }
  };

  if (!notebook) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[{ color: colors.foreground }]}>Notebook not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Notebook</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preview */}
        <View style={styles.preview}>
          <LinearGradient
            colors={[themeColor, `${themeColor}88`]}
            style={styles.previewBook}
          >
            <View style={[styles.previewSpine, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
            <Ionicons name="book" size={32} color="rgba(255,255,255,0.8)" />
            <Text style={styles.previewTitle} numberOfLines={1}>{title}</Text>
          </LinearGradient>
        </View>

        <Input label="Title" value={title} onChangeText={setTitle} placeholder="Notebook title" leftIcon="book-outline" />

        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {['Personal', 'Work', 'School', 'Research'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.catOption, { backgroundColor: category === cat ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'), borderColor: category === cat ? '#f59e0b' : colors.border }]}
            >
              <Text style={[styles.catText, { color: category === cat ? '#fff' : colors.foreground }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Theme Color</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
          {ThemeColors.map((tc) => (
            <TouchableOpacity key={tc.id} onPress={() => setThemeColor(tc.color)} style={styles.colorOpt}>
              <View style={[styles.colorCircle, { backgroundColor: tc.color }, themeColor === tc.color && styles.colorSelected]}>
                {themeColor === tc.color && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[styles.colorLabel, { color: colors.mutedForeground }]} numberOfLines={1}>{tc.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Paper Pattern</Text>
        <View style={styles.patternRow}>
          {['blank', 'lined', 'grid', 'dotted'].map((p) => (
            <TouchableOpacity key={p} onPress={() => setPaperPattern(p as any)}
              style={[styles.patternOpt, { backgroundColor: paperPattern === p ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'), borderColor: paperPattern === p ? '#f59e0b' : colors.border }]}>
              <Text style={[styles.patternText, { color: paperPattern === p ? '#fff' : colors.foreground }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Font Style</Text>
        <View style={styles.patternRow}>
          {['sans', 'serif', 'handwritten'].map((f) => (
            <TouchableOpacity key={f} onPress={() => setFontStyle(f as any)}
              style={[styles.patternOpt, { backgroundColor: fontStyle === f ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'), borderColor: fontStyle === f ? '#f59e0b' : colors.border }]}>
              <Text style={[styles.patternText, { color: fontStyle === f ? '#fff' : colors.foreground }]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Save Changes" onPress={handleSave} variant="gradient" size="lg" loading={loading} style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  preview: { alignItems: 'center', marginBottom: 20 },
  previewBook: { width: 120, height: 160, borderRadius: 8, justifyContent: 'center', alignItems: 'center', gap: 8 },
  previewSpine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
  previewTitle: { color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 12, textAlign: 'center', paddingHorizontal: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catOption: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  catText: { fontSize: 13, fontWeight: '600' },
  colorRow: { flexDirection: 'row', gap: 10, paddingVertical: 8 },
  colorOpt: { alignItems: 'center', gap: 6, width: 52 },
  colorCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  colorSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  colorLabel: { fontSize: 10, textAlign: 'center' },
  patternRow: { flexDirection: 'row', gap: 8 },
  patternOpt: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  patternText: { fontSize: 13, fontWeight: '600' },
});
