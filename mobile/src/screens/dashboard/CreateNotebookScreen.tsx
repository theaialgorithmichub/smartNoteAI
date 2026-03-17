import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { NotebooksAPI } from '../../services/api';
import { useNotebookStore } from '../../store/notebookStore';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../../constants/templates';
import { ThemeColors } from '../../theme/colors';
import { Notebook } from '../../types';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Personal', 'Work', 'School', 'Research'];

export default function CreateNotebookScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const { addNotebook } = useNotebookStore();

  const [step, setStep] = useState(0); // 0: details, 1: template, 2: appearance
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Personal');
  const [selectedTemplate, setSelectedTemplate] = useState('simple');
  const [themeColor, setThemeColor] = useState('#8B4513');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  const filteredTemplates = templateCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === templateCategory);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a notebook title');
      return;
    }

    setLoading(true);
    try {
      const res = await NotebooksAPI.create({
        title: title.trim(),
        category,
        template: selectedTemplate,
        appearance: {
          themeColor,
          pageColor: '#fffbeb',
          paperPattern: 'lined',
          fontStyle: 'sans',
        },
      });
      const notebook = res.data.notebook || res.data;
      addNotebook(notebook);
      navigation.goBack();
      (navigation as any).navigate('NotebookViewer', { notebookId: notebook._id });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Could not create notebook');
    } finally {
      setLoading(false);
    }
  };

  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>Notebook Details</Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
        Give your notebook a name and category
      </Text>

      <Input
        label="Notebook Title"
        value={title}
        onChangeText={setTitle}
        placeholder="My awesome notebook"
        leftIcon="book-outline"
        style={{ marginTop: 8 }}
      />

      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Category</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[
              styles.categoryOption,
              {
                backgroundColor: category === cat ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'),
                borderColor: category === cat ? '#f59e0b' : colors.border,
              },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(cat) as keyof typeof Ionicons.glyphMap}
              size={18}
              color={category === cat ? '#fff' : colors.mutedForeground}
            />
            <Text style={[styles.categoryOptionText, { color: category === cat ? '#fff' : colors.foreground }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Next: Choose Template"
        onPress={() => setStep(1)}
        variant="gradient"
        size="lg"
        style={{ marginTop: 24 }}
        disabled={!title.trim()}
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose Template</Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
        Select a template for your notebook
      </Text>

      {/* Template category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={{ marginBottom: 16 }}
      >
        {TEMPLATE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setTemplateCategory(cat)}
            style={[
              styles.filterChip,
              {
                backgroundColor: templateCategory === cat ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'),
                borderColor: templateCategory === cat ? '#f59e0b' : colors.border,
              },
            ]}
          >
            <Text style={[styles.filterChipText, { color: templateCategory === cat ? '#fff' : colors.foreground }]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedTemplate(item.id)}
            style={[
              styles.templateCard,
              {
                backgroundColor: selectedTemplate === item.id ? `${item.color}15` : (isDark ? '#1c1917' : '#fff'),
                borderColor: selectedTemplate === item.id ? item.color : colors.border,
                width: (width - 64) / 2,
              },
            ]}
          >
            {item.isPro && (
              <View style={[styles.proBadge, { backgroundColor: '#a855f7' }]}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
            <View style={[styles.templateIconBg, { backgroundColor: `${item.color}20` }]}>
              <Ionicons name="book-outline" size={20} color={item.color} />
            </View>
            <Text style={[styles.templateName, { color: colors.foreground }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.templateDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {item.description}
            </Text>
            {selectedTemplate === item.id && (
              <View style={[styles.selectedCheck, { backgroundColor: item.color }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        )}
      />

      <View style={styles.stepButtons}>
        <Button title="Back" onPress={() => setStep(0)} variant="outline" style={{ flex: 1 }} />
        <Button
          title="Next: Appearance"
          onPress={() => setStep(2)}
          variant="gradient"
          style={{ flex: 2 }}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>Appearance</Text>
      <Text style={[styles.stepSubtitle, { color: colors.mutedForeground }]}>
        Customize your notebook's look
      </Text>

      {/* Theme Color Preview */}
      <View style={styles.previewContainer}>
        <LinearGradient
          colors={[themeColor, adjustColor(themeColor, -30)]}
          style={styles.notebookPreview}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.previewSpine} />
          <Ionicons name="book" size={36} color="rgba(255,255,255,0.8)" />
          <Text style={styles.previewTitle} numberOfLines={1}>{title || 'My Notebook'}</Text>
        </LinearGradient>
      </View>

      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Theme Color</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.colorScrollContent}
      >
        {ThemeColors.map((tc) => (
          <TouchableOpacity
            key={tc.id}
            onPress={() => setThemeColor(tc.color)}
            style={styles.colorOption}
          >
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: tc.color },
                themeColor === tc.color && styles.colorCircleSelected,
              ]}
            >
              {themeColor === tc.color && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={[styles.colorLabel, { color: colors.mutedForeground }]} numberOfLines={1}>
              {tc.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.stepButtons}>
        <Button title="Back" onPress={() => setStep(1)} variant="outline" style={{ flex: 1 }} />
        <Button
          title="Create Notebook"
          onPress={handleCreate}
          variant="gradient"
          style={{ flex: 2 }}
          loading={loading}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => (step === 0 ? navigation.goBack() : setStep(step - 1))}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          New Notebook
        </Text>
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                {
                  backgroundColor: i <= step ? '#f59e0b' : colors.border,
                  width: i === step ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>
    </View>
  );
}

function getCategoryIcon(cat: string) {
  const icons: Record<string, string> = {
    Personal: 'person-outline',
    Work: 'briefcase-outline',
    School: 'school-outline',
    Research: 'flask-outline',
  };
  return icons[cat] || 'folder-outline';
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
    flex: 1,
    minWidth: 140,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  templateCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
    position: 'relative',
  },
  templateIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  proBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  selectedCheck: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  notebookPreview: {
    width: 160,
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    gap: 8,
  },
  previewSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  previewTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  colorScrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  colorOption: {
    alignItems: 'center',
    gap: 6,
    width: 52,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  colorLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
});
