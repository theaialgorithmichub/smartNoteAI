import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { SubscriptionAPI } from '../../services/api';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    color: '#6b7280',
    icon: '🌱',
    features: [
      '3 notebooks',
      '5 templates',
      '50 AI credits/month',
      'Basic sharing',
      '1 workspace',
    ],
    cta: 'Current Plan',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 9.99, yearly: 7.99 },
    color: '#f59e0b',
    icon: '⚡',
    popular: true,
    features: [
      'Unlimited notebooks',
      'All 48 templates',
      '500 AI credits/month',
      'Advanced sharing & collaboration',
      '5 workspaces',
      'Priority support',
      'Analytics',
    ],
    cta: 'Upgrade to Pro',
    disabled: false,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: { monthly: 19.99, yearly: 15.99 },
    color: '#a855f7',
    icon: '🚀',
    features: [
      'Everything in Pro',
      'Unlimited AI credits',
      'Team collaboration',
      'Unlimited workspaces',
      'Custom templates',
      'API access',
      'White-label options',
      'Dedicated support',
    ],
    cta: 'Go Ultra',
    disabled: false,
  },
];

export default function PricingScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await SubscriptionAPI.createCheckout(planId, billing);
      Alert.alert('Redirecting...', 'Opening payment page');
    } catch {
      Alert.alert('Error', 'Could not open payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Pricing</Text>
      </View>

      {/* Hero */}
      <LinearGradient
        colors={isDark ? ['#1c1917', '#0c0a09'] : ['#fffbeb', '#fff7ed']}
        style={styles.hero}
      >
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>
          Choose your plan
        </Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Unlock the full power of SmartNote AI
        </Text>

        {/* Billing toggle */}
        <View style={[styles.billingToggle, { backgroundColor: isDark ? '#292524' : '#f5f5f4' }]}>
          <TouchableOpacity
            onPress={() => setBilling('monthly')}
            style={[
              styles.billingOption,
              billing === 'monthly' && { backgroundColor: '#f59e0b' },
            ]}
          >
            <Text style={[styles.billingText, { color: billing === 'monthly' ? '#fff' : colors.foreground }]}>
              Monthly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBilling('yearly')}
            style={[
              styles.billingOption,
              billing === 'yearly' && { backgroundColor: '#f59e0b' },
            ]}
          >
            <Text style={[styles.billingText, { color: billing === 'yearly' ? '#fff' : colors.foreground }]}>
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 20%</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {PLANS.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: colors.card,
                borderColor: plan.popular ? plan.color : colors.border,
                borderWidth: plan.popular ? 2 : 1,
              },
            ]}
          >
            {plan.popular && (
              <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <Text style={styles.planIcon}>{plan.icon}</Text>
              <View>
                <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.priceAmount, { color: plan.color }]}>
                    ${billing === 'yearly' ? plan.price.yearly : plan.price.monthly}
                  </Text>
                  {plan.price.monthly > 0 && (
                    <Text style={[styles.pricePeriod, { color: colors.mutedForeground }]}>
                      /month
                    </Text>
                  )}
                  {plan.price.monthly === 0 && (
                    <Text style={[styles.pricePeriod, { color: colors.mutedForeground }]}>
                      forever
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Features */}
            <View style={styles.featuresList}>
              {plan.features.map((feature) => (
                <View key={feature} style={styles.featureItem}>
                  <View style={[styles.featureCheck, { backgroundColor: `${plan.color}20` }]}>
                    <Ionicons name="checkmark" size={12} color={plan.color} />
                  </View>
                  <Text style={[styles.featureText, { color: colors.foreground }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => handleSubscribe(plan.id)}
              disabled={plan.disabled || loading === plan.id}
              style={[
                styles.planCta,
                {
                  opacity: plan.disabled ? 0.6 : 1,
                },
              ]}
            >
              {plan.popular ? (
                <LinearGradient
                  colors={['#f59e0b', '#f97316']}
                  style={styles.planCtaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.planCtaTextWhite}>{plan.cta}</Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.planCtaOutline,
                    { borderColor: plan.color, backgroundColor: `${plan.color}10` },
                  ]}
                >
                  <Text style={[styles.planCtaText, { color: plan.color }]}>{plan.cta}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* FAQ */}
      <View style={styles.faqSection}>
        <Text style={[styles.faqTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
        {[
          { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime with no penalties.' },
          { q: 'What are AI credits?', a: 'Credits are used for AI features like completion, images, and chat.' },
          { q: 'Is there a free trial?', a: 'Start with our Free plan. Pro has a 7-day trial.' },
        ].map((faq) => (
          <View key={faq.q} style={[styles.faqItem, { borderColor: colors.border }]}>
            <Text style={[styles.faqQ, { color: colors.foreground }]}>{faq.q}</Text>
            <Text style={[styles.faqA, { color: colors.mutedForeground }]}>{faq.a}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
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
  hero: {
    padding: 24,
    paddingTop: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  billingOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  billingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  plansContainer: {
    padding: 16,
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  popularBadge: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  popularBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    paddingBottom: 8,
  },
  planIcon: {
    fontSize: 32,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
  },
  pricePeriod: {
    fontSize: 13,
  },
  featuresList: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
  },
  planCta: {
    paddingHorizontal: 16,
  },
  planCtaGradient: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  planCtaTextWhite: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  planCtaOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  planCtaText: {
    fontSize: 16,
    fontWeight: '700',
  },
  faqSection: {
    padding: 20,
    paddingBottom: 40,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  faqA: {
    fontSize: 13,
    lineHeight: 20,
  },
});
