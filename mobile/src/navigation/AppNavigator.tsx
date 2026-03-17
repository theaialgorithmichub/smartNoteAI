import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

// Auth screens
import LandingScreen from '../screens/auth/LandingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Main screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CreateNotebookScreen from '../screens/dashboard/CreateNotebookScreen';
import NotebookViewerScreen from '../screens/notebook/NotebookViewerScreen';
import TemplatesScreen from '../screens/templates/TemplatesScreen';
import SearchScreen from '../screens/search/SearchScreen';
import AccountScreen from '../screens/account/AccountScreen';
import AIChatScreen from '../screens/ai/AIChatScreen';
import TrashScreen from '../screens/dashboard/TrashScreen';
import PricingScreen from '../screens/pricing/PricingScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import WorkspacesScreen from '../screens/workspaces/WorkspacesScreen';
import FriendsScreen from '../screens/friends/FriendsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SharedNotebooksScreen from '../screens/dashboard/SharedNotebooksScreen';
import EditNotebookScreen from '../screens/dashboard/EditNotebookScreen';
import MarketplaceScreen from '../screens/marketplace/MarketplaceScreen';
import SharedViewScreen from '../screens/share/SharedViewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="NotebookViewer" component={NotebookViewerScreen} />
      <Stack.Screen name="CreateNotebook" component={CreateNotebookScreen} />
      <Stack.Screen name="EditNotebook" component={EditNotebookScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Trash" component={TrashScreen} />
      <Stack.Screen name="Workspaces" component={WorkspacesScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      <Stack.Screen name="Settings" component={AccountScreen} />
      <Stack.Screen name="Pricing" component={PricingScreen} />
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SharedNotebooks" component={SharedNotebooksScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
    </Stack.Navigator>
  );
}

function TemplatesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TemplatesHome" component={TemplatesScreen} />
      <Stack.Screen name="CreateNotebook" component={CreateNotebookScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1c1917' : '#ffffff',
          borderTopColor: isDark ? '#292524' : '#e7e5e4',
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: 6,
          height: 62,
        },
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: isDark ? '#78716c' : '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
            Dashboard: { active: 'home', inactive: 'home-outline' },
            Templates: { active: 'grid', inactive: 'grid-outline' },
            SearchTab: { active: 'search', inactive: 'search-outline' },
            AccountTab: { active: 'person', inactive: 'person-outline' },
          };
          const icon = icons[route.name];
          if (!icon) return null;
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Templates" component={TemplatesStack} options={{ tabBarLabel: 'Templates' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="AccountTab" component={AccountScreen} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

function RootStack() {
  const { isSignedIn } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="SharedView" component={SharedViewScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isLoaded } = useAuth();
  const { isDark } = useTheme();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? '#0c0a09' : '#fff' }}>
        <LinearGradient colors={['#f59e0b', '#f97316']} style={{ width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Ionicons name="book" size={28} color="#fff" />
        </LinearGradient>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={{ marginTop: 12, color: isDark ? '#78716c' : '#9ca3af', fontSize: 14 }}>Loading SmartNote AI...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
