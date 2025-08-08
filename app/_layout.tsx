// app/_layout.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/hooks/auth-store';
import { LanguageContext, useLanguage } from '@/hooks/language-store'; // <-- Import both
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

const AppInitializer = () => {
  // Get the loading state from BOTH stores
  const { initialized: isUserLoaded } = useAuthStore();
  const { isLoaded: isLanguageLoaded } = useLanguage();

  // If either is not loaded, show the loading screen
  if (!isUserLoaded || !isLanguageLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Once both are loaded, render the actual navigation logic
  return <RootLayoutNav />;
};

const RootLayoutNav = () => {
  const { user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    
    SplashScreen.hideAsync();
  }, [user, segments, router]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    // LanguageContext MUST wrap everything
    <LanguageContext>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppInitializer />
        </GestureHandlerRootView>
      </QueryClientProvider>
    </LanguageContext>
  );
}
