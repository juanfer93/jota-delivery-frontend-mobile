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
      console.log("🚀 Iniciando app...");
      
      await checkAdminStatus();
      console.log("✅ checkAdminStatus completado, hasAdmin =", hasAdmin);
      
      await checkAuth();
      console.log("✅ checkAuth completado, isAuthenticated =", isAuthenticated);
      
      setIsReady(true);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    
    console.log("🔍 Decisión de ruta:", { hasAdmin, isAuthenticated });
    
    if (hasAdmin === false) {
      console.log("👉 Redirigiendo a /create-admin");
      router.replace('/create-admin');
    } else if (isAuthenticated) {
      console.log("👉 Redirigiendo a /(app)/");
      router.replace('/(app)/');
    } else {
      console.log("👉 Redirigiendo a /login");
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