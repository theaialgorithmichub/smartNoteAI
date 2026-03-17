import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Alert, TextInput, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import { ShareAPI } from '../../services/api';
import { Notebook, Page } from '../../types';

type SharedViewRouteProp = RouteProp<{ SharedView: { shareId: string } }, 'SharedView'>;

export default function SharedViewScreen() {
  const navigation = useNavigation();
  const route = useRoute<SharedViewRouteProp>();
  const { shareId } = route.params;
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadShare();
  }, []);

  const loadShare = async (pwd?: string) => {
    try {
      setLoading(true);
      const shareRes = await ShareAPI.getByShareId(shareId, pwd);
      setShareInfo(shareRes.data);

      const notebookRes = await ShareAPI.getNotebook(shareId);
      const data = notebookRes.data;
      setNotebook(data.notebook);
      setPages(data.pages || []);
      setNeedsPassword(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setNeedsPassword(true);
        setPasswordError(pwd ? 'Incorrect password. Try again.' : '');
      } else if (err.response?.status === 404) {
        Alert.alert('Not Found', 'This shared notebook could not be found.', [
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'Could not load shared notebook.', [
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) return;
    loadShare(password);
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.loadingIcon}>
          <Ionicons name="book" size={28} color="#fff" />
        </LinearGradient>
        <ActivityIndicator size="large" color="#f59e0b" style={{ marginTop: 16 }} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading shared notebook...</Text>
      </View>
    );
  }

  if (needsPassword) {
    return (
      <View style={[styles.passwordScreen, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnTop}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.passwordContent}>
          <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.passwordTitle, { color: colors.foreground }]}>Password Protected</Text>
          <Text style={[styles.passwordSubtitle, { color: colors.mutedForeground }]}>
            This notebook is password protected. Enter the password to view it.
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            style={[styles.passwordInput, { color: colors.foreground, borderColor: passwordError ? '#ef4444' : colors.border, backgroundColor: isDark ? '#1c1917' : '#f5f5f4' }]}
          />
          {passwordError ? (
            <Text style={styles.passwordError}>{passwordError}</Text>
          ) : null}
          <TouchableOpacity onPress={handlePasswordSubmit} style={styles.passwordBtn} activeOpacity={0.9}>
            <LinearGradient colors={['#f59e0b', '#f97316']} style={styles.passwordBtnGradient}>
              <Text style={styles.passwordBtnText}>Unlock Notebook</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!notebook) return null;

  const currentPage = pages[currentPageIndex];
  const themeColor = notebook.appearance?.themeColor || '#8B4513';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1c1917' : '#fff', borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.spine, { backgroundColor: themeColor }]} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {notebook.title}
          </Text>
        </View>
        {/* Read-only badge */}
        <View style={[styles.readOnlyBadge, { backgroundColor: `${themeColor}20` }]}>
          <Ionicons name="eye-outline" size={12} color={themeColor} />
          <Text style={[styles.readOnlyText, { color: themeColor }]}>View Only</Text>
        </View>
      </View>

      {/* Shared by info */}
      {shareInfo && (
        <View style={[styles.sharedBanner, { backgroundColor: isDark ? '#1c1917' : '#fffbeb', borderColor: '#f59e0b40' }]}>
          <Ionicons name="share-social" size={14} color="#f59e0b" />
          <Text style={[styles.sharedBannerText, { color: colors.mutedForeground }]}>
            Shared notebook • {shareInfo.accessType || 'view'} access
            {shareInfo.allowDownload ? ' • Download allowed' : ''}
          </Text>
        </View>
      )}

      {/* Page tabs */}
      {pages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.pageTabs, { borderBottomColor: colors.border }]}
          contentContainerStyle={styles.pageTabsContent}
        >
          {pages.map((page, i) => (
            <TouchableOpacity
              key={page._id}
              onPress={() => setCurrentPageIndex(i)}
              style={[styles.pageTab, { borderBottomColor: i === currentPageIndex ? themeColor : 'transparent', borderBottomWidth: 2 }]}
            >
              <Text style={[styles.pageTabText, { color: i === currentPageIndex ? themeColor : colors.mutedForeground }]}>
                {page.title || `Page ${i + 1}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <ScrollView style={[styles.content, { backgroundColor: notebook.appearance?.pageColor || (isDark ? '#1c1917' : '#fffbeb') }]}>
        <View style={styles.contentInner}>
          <Text style={[styles.pageTitle, { color: isDark ? '#f5f5f4' : '#1c1917' }]}>
            {currentPage?.title || `Page ${currentPageIndex + 1}`}
          </Text>
          {/* Render HTML content as plain text for read-only view */}
          <Text style={[styles.pageContent, { color: isDark ? '#d6d3d1' : '#292524' }]}>
            {currentPage?.contentPlainText || currentPage?.content?.replace(/<[^>]*>/g, '') || 'No content'}
          </Text>
        </View>
      </ScrollView>

      {/* Navigation */}
      {pages.length > 1 && (
        <View style={[styles.navBar, { backgroundColor: isDark ? '#1c1917' : '#fff', borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => setCurrentPageIndex((i) => Math.max(0, i - 1))}
            disabled={currentPageIndex === 0}
            style={[styles.navBtn, { opacity: currentPageIndex === 0 ? 0.4 : 1, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.navInfo, { color: colors.mutedForeground }]}>
            {currentPageIndex + 1} / {pages.length}
          </Text>
          <TouchableOpacity
            onPress={() => setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1))}
            disabled={currentPageIndex === pages.length - 1}
            style={[styles.navBtn, { opacity: currentPageIndex === pages.length - 1 ? 0.4 : 1, borderColor: colors.border }]}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingIcon: { width: 64, height: 64, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 14, marginTop: 4 },
  passwordScreen: { flex: 1 },
  backBtnTop: { paddingTop: 56, paddingLeft: 16, paddingBottom: 8, width: 60 },
  passwordContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockIcon: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  passwordTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  passwordSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  passwordInput: { width: '100%', borderWidth: 1.5, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 8 },
  passwordError: { color: '#ef4444', fontSize: 13, marginBottom: 12 },
  passwordBtn: { width: '100%', borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  passwordBtnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  passwordBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 10,
    paddingHorizontal: 12, borderBottomWidth: 1, gap: 8,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, overflow: 'hidden' },
  spine: { width: 4, height: 22, borderRadius: 2 },
  headerTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  readOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  readOnlyText: { fontSize: 11, fontWeight: '700' },
  sharedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sharedBannerText: { fontSize: 12 },
  pageTabs: { borderBottomWidth: 1, maxHeight: 44 },
  pageTabsContent: { flexDirection: 'row', paddingHorizontal: 12 },
  pageTab: { paddingHorizontal: 12, paddingVertical: 10, minWidth: 80 },
  pageTabText: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingTop: 16 },
  pageTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  pageContent: { fontSize: 15, lineHeight: 26 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingVertical: 10, borderTopWidth: 1,
  },
  navBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  navInfo: { fontSize: 14, fontWeight: '500' },
});
