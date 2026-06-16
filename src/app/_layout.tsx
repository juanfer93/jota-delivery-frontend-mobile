import { useEffect, useState } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { ActivityIndicator, LogBox, View } from 'react-native';
import tw from '@/lib/tailwind';
import { NotificationCoordinator } from '@/features/notifications/presentation/NotificationCoordinator';

// Rutas que NO requieren autenticación (públicas especiales)
const PUBLIC_ROUTES = [
  '/login',
  '/create-admin',
  '/auth/domiciliario/set-password',
];

function isPublicRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string | null | undefined): boolean {
  return !!pathname && !isPublicRoute(pathname);
}

export default function RootLayout() {
  const { hasAdmin, isAuthenticated, checkAdminStatus, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs(['Cannot find single active touch']);

    const initializeApp = async () => {
      await checkAdminStatus();
      await checkAuth();
      setIsReady(true);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (pathname === '/') {
      if (!hasAdmin) {
        router.replace('/create-admin' as any);
        return;
      }
      if (!isAuthenticated) {
        router.replace('/login' as any);
        return;
      }
      router.replace('/(app)/' as any);
      return;
    }

    if (isPublicRoute(pathname)) {
      return;
    }

    if (!hasAdmin) {
      router.replace('/create-admin' as any);
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login' as any);
      return;
    }

    if (isProtectedRoute(pathname)) {
      return;
    }

    router.replace('/(app)/' as any);
  }, [isReady, hasAdmin, isAuthenticated, pathname]);

  if (!isReady) {
    return (
      <View testID="activity-indicator" style={tw`flex-1 justify-center items-center bg-jj-beigeSoft`}>
        <ActivityIndicator size="large" color="#174A8B" />
      </View>
    );
  }

  return (
    <NotificationCoordinator>
      <Slot />
    </NotificationCoordinator>
  );
}
