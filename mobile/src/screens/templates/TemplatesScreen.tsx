import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { TEMPLATES, TEMPLATE_CATEGORIES, TemplateConfig } from '../../constants/templates';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DashboardStackParamList } from '../../navigation/types';

const { width } = Dimensions.get('window');

type TemplatesNavProp = NativeStackNavigationProp<DashboardStackParamList, 'DashboardHome'>;

export default function TemplatesScreen() {
  const navigation = useNavigation<TemplatesNavProp>();
  const { colors, isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    const matchesSearch = !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template: TemplateConfig) => {
    (navigation as any).navigate('CreateNotebook', { templateId: template.id });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Template Gallery
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {TEMPLATES.length}+ templates
        </Text>
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={[styles.categoryBar, { backgroundColor: colors.background }]}
      >
        {TEMPLATE_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: activeCategory === cat ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'),
                borderColor: activeCategory === cat ? '#f59e0b' : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: activeCategory === cat ? '#fff' : colors.foreground },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates grid */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleSelectTemplate(item)}
            style={[
              styles.templateCard,
              {
                backgroundColor: isDark ? '#1c1917' : '#fff',
                borderColor: colors.border,
                width: (width - 48) / 2,
              },
            ]}
            activeOpacity={0.85}
          >
            {/* Cover */}
            <LinearGradient
              colors={[item.color, `${item.color}88`]}
              style={styles.templateCover}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="book" size={28} color="rgba(255,255,255,0.8)" />
              {item.isPro && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
              {item.isNew && (
                <View style={[styles.proBadge, { backgroundColor: '#10b981' }]}>
                  <Text style={styles.proBadgeText}>NEW</Text>
                </View>
              )}
            </LinearGradient>

            {/* Info */}
            <View style={styles.templateInfo}>
              <View style={[styles.categoryTag, { backgroundColor: `${item.color}20` }]}>
                <Text style={[styles.categoryTagText, { color: item.color }]}>
                  {item.category}
                </Text>
              </View>
              <Text style={[styles.templateName, { color: colors.foreground }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.templateDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.description}
              </Text>
            </View>

            {/* Use button */}
            <TouchableOpacity
              onPress={() => handleSelectTemplate(item)}
              style={[styles.useButton, { backgroundColor: `${item.color}15`, borderColor: `${item.color}30` }]}
            >
              <Text style={[styles.useButtonText, { color: item.color }]}>Use Template</Text>
              <Ionicons name="arrow-forward" size={14} color={item.color} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No templates found
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  categoryBar: {
    borderBottomWidth: 0,
  },
  categoryScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  templateCover: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  proBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#a855f7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  templateInfo: {
    padding: 10,
    gap: 4,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  templateName: {
    fontSize: 13,
    fontWeight: '700',
  },
  templateDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    margin: 10,
    marginTop: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  useButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
  },
});
