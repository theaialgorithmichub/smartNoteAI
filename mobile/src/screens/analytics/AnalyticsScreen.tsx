import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { AnalyticsAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [statsRes, insightsRes] = await Promise.all([
        AnalyticsAPI.stats(),
        AnalyticsAPI.insights(),
      ]);
      setStats(statsRes.data);
      setInsights(insightsRes.data.insights || []);
    } catch {
      setStats({
        totalNotebooks: 0,
        totalPages: 0,
        totalWords: 0,
        streak: 0,
        notebooksByCategory: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Notebooks', value: stats.totalNotebooks || 0, icon: 'book', color: '#f59e0b' },
    { label: 'Pages', value: stats.totalPages || 0, icon: 'document-text', color: '#3b82f6' },
    { label: 'Words', value: formatNumber(stats.totalWords || 0), icon: 'text', color: '#10b981' },
    { label: 'Day Streak', value: stats.streak || 0, icon: 'flame', color: '#ef4444' },
  ] : [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Analytics</Text>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <>
          {/* Hero */}
          <LinearGradient
            colors={isDark ? ['#1c1917', '#0c0a09'] : ['#fffbeb', '#fff7ed']}
            style={styles.hero}
          >
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>Your Writing Journey</Text>
            <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
              Keep up the great work! 📈
            </Text>
          </LinearGradient>

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            {statCards.map((stat) => (
              <LinearGradient
                key={stat.label}
                colors={[`${stat.color}20`, `${stat.color}08`]}
                style={[styles.statCard, { borderColor: `${stat.color}30` }]}
              >
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}25` }]}>
                  <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={22} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>

          {/* Category breakdown */}
          {stats?.notebooksByCategory && Object.keys(stats.notebooksByCategory).length > 0 && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>By Category</Text>
              {Object.entries(stats.notebooksByCategory).map(([cat, count]) => (
                <View key={cat} style={styles.categoryBar}>
                  <Text style={[styles.categoryBarLabel, { color: colors.foreground }]}>{cat}</Text>
                  <View style={[styles.barContainer, { backgroundColor: isDark ? '#292524' : '#f1f5f9' }]}>
                    <LinearGradient
                      colors={['#f59e0b', '#f97316']}
                      style={[styles.barFill, { width: `${Math.min(100, (count as number / (stats.totalNotebooks || 1)) * 100)}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={[styles.categoryBarCount, { color: colors.mutedForeground }]}>{count as number}</Text>
                </View>
              ))}
            </View>
          )}

          {/* AI Insights */}
          {insights.length > 0 && (
            <View style={[styles.section, { backgroundColor: isDark ? '#1c1917' : '#fff' }]}>
              <View style={styles.sectionHeaderRow}>
                <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.aiIcon}>
                  <Ionicons name="flash" size={14} color="#fff" />
                </LinearGradient>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Insights</Text>
              </View>
              {insights.map((insight, i) => (
                <View key={i} style={[styles.insightItem, { borderColor: colors.border }]}>
                  <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
                  <Text style={[styles.insightText, { color: colors.foreground }]}>{insight}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

function formatNumber(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  hero: {
    padding: 24,
    paddingTop: 28,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryBarLabel: {
    width: 70,
    fontSize: 13,
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryBarCount: {
    width: 24,
    textAlign: 'right',
    fontSize: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
