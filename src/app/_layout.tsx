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
  const { hasAdmin, isAuthenticated, user, checkAdminStatus, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs(['Cannot find single active touch']);

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

    console.log("🔍 Decisión de ruta:", { hasAdmin, isAuthenticated, pathname, user: user ? (user.email || (user as any).nombre) : null });

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
      console.log("🔓 Ruta pública detectada, permitiendo acceso:", pathname);
      return;
    }

    if (!hasAdmin) {
      console.log("👉 Redirigiendo a /create-admin");
      router.replace('/create-admin' as any);
      return;
    }

    if (!isAuthenticated) {
      console.log("👉 Usuario no autenticado, redirigiendo a /login");
      router.replace('/login' as any);
      return;
    }

    if (isProtectedRoute(pathname)) {
      console.log("✅ Ruta protegida con sesión válida:", pathname);
      return;
    }

    console.log("👉 Redirigiendo a /(app)/ por defecto");
    router.replace('/(app)/' as any);
  }, [isReady, hasAdmin, isAuthenticated, pathname, user]);

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
