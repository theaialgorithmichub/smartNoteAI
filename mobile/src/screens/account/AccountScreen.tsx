import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { SubscriptionAPI } from '../../services/api';

export default function AccountScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const { mode, setMode } = useThemeStore();
  const [subscription, setSubscription] = useState<{ planType: string; credits: number } | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const res = await SubscriptionAPI.status();
      setSubscription(res.data);
    } catch {
      setSubscription({ planType: 'free', credits: 0 });
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      free: '#6b7280',
      pro: '#f59e0b',
      ultra: '#a855f7',
    };
    return colors[plan] || '#6b7280';
  };

  const menuItems = [
    {
      section: 'Settings',
      items: [
        {
          icon: 'moon-outline',
          label: 'Dark Mode',
          onPress: () => setMode(isDark ? 'light' : 'dark'),
          rightElement: (
            <Switch
              value={isDark}
              onValueChange={(v) => setMode(v ? 'dark' : 'light')}
              trackColor={{ false: '#e7e5e4', true: '#f59e0b' }}
              thumbColor="#fff"
            />
          ),
        },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
        { icon: 'language-outline', label: 'Language', onPress: () => {} },
        { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => {} },
      ],
    },
    {
      section: 'Notebooks',
      items: [
        { icon: 'download-outline', label: 'Export Data', onPress: () => {} },
        { icon: 'cloud-upload-outline', label: 'Import', onPress: () => {} },
        { icon: 'key-outline', label: 'API Keys', onPress: () => {} },
      ],
    },
    {
      section: 'Social',
      items: [
        { icon: 'people-outline', label: 'Friends', onPress: () => (navigation as any).navigate('Friends') },
        { icon: 'share-social-outline', label: 'Shared Notebooks', onPress: () => (navigation as any).navigate('SharedNotebooks') },
        { icon: 'business-outline', label: 'Workspaces', onPress: () => (navigation as any).navigate('Workspaces') },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', onPress: () => {} },
        { icon: 'chatbubble-outline', label: 'Send Feedback', onPress: () => {} },
        { icon: 'star-outline', label: 'Rate App', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Account</Text>
      </View>

      {/* Profile Card */}
      <LinearGradient
        colors={isDark ? ['#1c1917', '#0c0a09'] : ['#fffbeb', '#fff7ed']}
        style={styles.profileCard}
      >
        {/* Avatar */}
        <LinearGradient
          colors={['#f59e0b', '#f97316']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {(user?.firstName || 'U')[0].toUpperCase()}
          </Text>
        </LinearGradient>

        <Text style={[styles.profileName, { color: colors.foreground }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
          {user?.emailAddresses?.[0]?.emailAddress}
        </Text>

        {/* Plan badge */}
        {subscription && (
          <View
            style={[
              styles.planBadge,
              { backgroundColor: `${getPlanBadge(subscription.planType)}20`, borderColor: getPlanBadge(subscription.planType) },
            ]}
          >
            <Ionicons name="star" size={12} color={getPlanBadge(subscription.planType)} />
            <Text style={[styles.planBadgeText, { color: getPlanBadge(subscription.planType) }]}>
              {subscription.planType.toUpperCase()} Plan
            </Text>
          </View>
        )}

        {subscription?.planType === 'free' && (
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('Pricing')}
            style={styles.upgradeButton}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#f59e0b', '#f97316']}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flash" size={14} color="#fff" />
              <Text style={styles.upgradeText}>Upgrade to Pro</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Credits */}
        {subscription && (
          <View style={styles.creditsRow}>
            <View style={[styles.creditBadge, { backgroundColor: isDark ? '#292524' : '#fff' }]}>
              <Ionicons name="flash-outline" size={14} color="#f59e0b" />
              <Text style={[styles.creditText, { color: colors.foreground }]}>
                {subscription.credits} AI Credits
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Menu sections */}
      {menuItems.map((section) => (
        <View key={section.section} style={styles.menuSection}>
          <Text style={[styles.menuSectionTitle, { color: colors.mutedForeground }]}>
            {section.section}
          </Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={[
                  styles.menuItem,
                  index < section.items.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.menuItemIcon, { backgroundColor: '#f59e0b15' }]}>
                  <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color="#f59e0b" />
                </View>
                <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>
                  {item.label}
                </Text>
                {item.rightElement ? (
                  item.rightElement
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutButton, { borderColor: colors.destructive }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
          <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App version */}
      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        SmartNote AI v1.0.0
      </Text>
    </ScrollView>
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
  profileCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
    paddingBottom: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  upgradeButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  upgradeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  creditsRow: {
    marginTop: 4,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  creditText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
  },
  signOutSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    paddingBottom: 32,
  },
});
