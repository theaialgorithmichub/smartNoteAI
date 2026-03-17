import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { MarketplaceAPI } from '../../services/api';

interface MarketplaceTemplate {
  _id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  downloads: number;
  rating: number;
  reviews: number;
  price: number;
  tags: string[];
  previewColor?: string;
}

export default function MarketplaceScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const CATEGORIES = ['All', 'Productivity', 'Education', 'Creative', 'Business', 'Lifestyle'];

  useEffect(() => {
    loadTemplates();
  }, [activeCategory]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = activeCategory !== 'All' ? { category: activeCategory } : {};
      const res = await MarketplaceAPI.templates(params);
      setTemplates(res.data.templates || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (template: MarketplaceTemplate) => {
    try {
      await MarketplaceAPI.download(template._id);
      Alert.alert('Downloaded!', `"${template.name}" has been added to your templates.`);
    } catch {
      Alert.alert('Error', 'Could not download template');
    }
  };

  const filteredTemplates = templates.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Marketplace</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Community templates
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: isDark ? '#1c1917' : '#f5f5f4', borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search templates..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={styles.categoryBar}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveCategory(item)}
            style={[styles.categoryChip, {
              backgroundColor: activeCategory === item ? '#f59e0b' : (isDark ? '#292524' : '#f5f5f4'),
              borderColor: activeCategory === item ? '#f59e0b' : colors.border,
            }]}
          >
            <Text style={[styles.categoryChipText, { color: activeCategory === item ? '#fff' : colors.foreground }]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : filteredTemplates.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="storefront-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {search ? 'No results found' : 'No templates available'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            {search ? 'Try different keywords' : 'Check back later for community templates'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTemplates}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <LinearGradient
                  colors={[item.previewColor || '#f59e0b', `${item.previewColor || '#f59e0b'}88`]}
                  style={styles.templatePreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="book" size={28} color="rgba(255,255,255,0.8)" />
                </LinearGradient>
                <View style={styles.cardInfo}>
                  <Text style={[styles.templateName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.templateAuthor, { color: colors.mutedForeground }]}>by {item.author}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.stars}>{renderStars(item.rating)}</Text>
                    <Text style={[styles.ratingText, { color: colors.mutedForeground }]}>
                      {item.rating.toFixed(1)} ({item.reviews})
                    </Text>
                  </View>
                  <View style={styles.metaRow}>
                    <View style={[styles.categoryBadge, { backgroundColor: `${item.previewColor || '#f59e0b'}20` }]}>
                      <Text style={[styles.categoryBadgeText, { color: item.previewColor || '#f59e0b' }]}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={[styles.downloads, { color: colors.mutedForeground }]}>
                      {item.downloads} downloads
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.templateDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.cardBottom}>
                <Text style={[styles.price, { color: colors.foreground }]}>
                  {item.price === 0 ? 'Free' : `$${item.price}`}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDownload(item)}
                  style={[styles.downloadBtn, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b40' }]}
                >
                  <Ionicons name="download-outline" size={16} color="#f59e0b" />
                  <Text style={styles.downloadBtnText}>
                    {item.price === 0 ? 'Download Free' : `Buy $${item.price}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
  categoryBar: { maxHeight: 52 },
  categoryScroll: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  listContent: { padding: 16, gap: 12 },
  templateCard: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden', padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardTop: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  templatePreview: { width: 72, height: 72, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, gap: 3 },
  templateName: { fontSize: 15, fontWeight: '700' },
  templateAuthor: { fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stars: { fontSize: 11 },
  ratingText: { fontSize: 11 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryBadgeText: { fontSize: 11, fontWeight: '700' },
  downloads: { fontSize: 11 },
  templateDesc: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  downloadBtnText: { color: '#f59e0b', fontSize: 13, fontWeight: '600' },
});
