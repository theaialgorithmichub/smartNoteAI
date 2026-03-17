import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

type LandingNavProp = NativeStackNavigationProp<AuthStackParamList, 'Landing'>;

const FEATURES = [
  { icon: 'book-outline', title: '48+ Templates', desc: 'Simple to AI-powered notebooks' },
  { icon: 'flash-outline', title: 'AI Assistant', desc: 'Complete, improve, and generate content' },
  { icon: 'people-outline', title: 'Collaboration', desc: 'Real-time editing with your team' },
  { icon: 'share-social-outline', title: 'Easy Sharing', desc: 'Share with links, friends, or publicly' },
  { icon: 'analytics-outline', title: 'Analytics', desc: 'Track your writing streaks & insights' },
  { icon: 'cloud-outline', title: 'Always Synced', desc: 'Access anywhere, any device' },
];

export default function LandingScreen() {
  const navigation = useNavigation<LandingNavProp>();
  const { colors, isDark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={['#0f172a', '#1e3a5f', '#0f172a']}
        style={styles.hero}
      >
        {/* Animated stars */}
        <View style={styles.starsContainer}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: `${(i * 37) % 100}%` as any,
                  top: `${(i * 53) % 80}%` as any,
                  opacity: 0.3 + (i % 5) * 0.1,
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          style={[
            styles.heroContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#f59e0b', '#f97316']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="book" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>
              <Text style={styles.logoTextBold}>Smart</Text>
              <Text style={styles.logoTextLight}>Note</Text>
              <Text style={styles.logoTextAI}> AI</Text>
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            The AI-Powered{'\n'}
            <Text style={styles.heroTitleGradient}>Notebook Platform</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            50+ templates with AI assistance. From simple notes to complex research,
            collaborations, and more.
          </Text>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.ctaButton}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#f59e0b', '#f97316']}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.ctaButtonText}>Get Started Free</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('SignIn')}
              style={styles.signInButton}
              activeOpacity={0.85}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { value: '50+', label: 'Templates' },
              { value: '∞', label: 'Pages' },
              { value: 'AI', label: 'Powered' },
            ].map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Features Section */}
      <View style={[styles.section, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Everything You Need
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
          A complete note-taking platform with AI power
        </Text>

        <View style={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <View
              key={feature.title}
              style={[
                styles.featureCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.featureIconBg,
                  { backgroundColor: '#f59e0b20' },
                ]}
              >
                <Ionicons
                  name={feature.icon as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color="#f59e0b"
                />
              </View>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>
                {feature.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Templates Preview */}
      <LinearGradient
        colors={isDark ? ['#1c1917', '#0c0a09'] : ['#fafaf9', '#f5f5f4']}
        style={styles.templatesSection}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          48+ Notebook Templates
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateScrollContent}
        >
          {[
            { name: 'Simple', color: '#f59e0b' },
            { name: 'Diary', color: '#ec4899' },
            { name: 'Planner', color: '#3b82f6' },
            { name: 'Code', color: '#10b981' },
            { name: 'Research', color: '#8b5cf6' },
            { name: 'Recipe', color: '#f97316' },
            { name: 'Doodle', color: '#f43f5e' },
            { name: 'Todo', color: '#06b6d4' },
          ].map((t) => (
            <View
              key={t.name}
              style={[styles.templateChip, { borderColor: t.color }]}
            >
              <View style={[styles.templateDot, { backgroundColor: t.color }]} />
              <Text style={[styles.templateChipText, { color: colors.foreground }]}>
                {t.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { backgroundColor: colors.background }]}>
        <Text style={[styles.bottomCtaTitle, { color: colors.foreground }]}>
          Ready to start?
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.bottomCtaButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.bottomCtaButtonText}>Create Your First Notebook</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  hero: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 24,
    minHeight: 520,
    overflow: 'hidden',
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
  },
  logoTextBold: {
    color: '#fff',
    fontWeight: '800',
  },
  logoTextLight: {
    color: '#e2e8f0',
    fontWeight: '400',
  },
  logoTextAI: {
    color: '#f59e0b',
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  heroTitleGradient: {
    color: '#f59e0b',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  signInButton: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signInText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  templatesSection: {
    padding: 24,
    paddingBottom: 32,
  },
  templateScrollContent: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  templateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  templateChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomCta: {
    padding: 32,
    alignItems: 'center',
  },
  bottomCtaTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  bottomCtaButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  bottomCtaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
