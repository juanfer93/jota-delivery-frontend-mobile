// src/app/_layout.tsx
import { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { ActivityIndicator, View } from 'react-native';
import tw from '@/lib/tailwind';

export default function RootLayout() {
  const { hasAdmin, isAuthenticated, checkAdminStatus, checkAuth } = useAuthStore();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await checkAdminStatus();
      await checkAuth();
      
      setIsReady(true); 
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (hasAdmin === false) {
      router.replace('/create-admin');
    } else if (isAuthenticated) {
      router.replace('/(app)/');
    } else {
      router.replace('/login');
    }
  }, [isReady, hasAdmin, isAuthenticated]);

  if (!isReady) {
    return (
      <View testID="activity-indicator" style={tw`flex-1 justify-center items-center bg-jj-beigeSoft`}>
        <ActivityIndicator size="large" color="#174A8B" />
      </View>
    );
  }

  return <Slot />;
}