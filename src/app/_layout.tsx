import { useEffect, useState } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/auth.store';
import { ActivityIndicator, LogBox, View } from 'react-native';
import tw from '@/lib/tailwind';

// Rutas que NO requieren autenticación (públicas especiales)
const PUBLIC_ROUTES = [
  '/login',
  '/create-admin',
  '/auth/domiciliario/set-password',
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  if (!pathname || pathname === '/') return false;
  return !isPublicRoute(pathname);
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
    
    if (isPublicRoute(pathname)) {
      console.log("🔓 Ruta pública detectada, permitiendo acceso:", pathname);
      return;
    }
    
    if (isProtectedRoute(pathname)) {
      console.log("✅ Ya estamos en una ruta protegida:", pathname);
      return;
    }

    console.log("🔍 Decisión de ruta:", { hasAdmin, isAuthenticated, pathname, user: user ? (user.email || (user as any).nombre) : null });

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

    // Si tenemos información del usuario, redirigimos según su rol
    if (user && (user as any).rol === 'ADMIN') {
      console.log('👉 Usuario admin detectado, redirigiendo a /(admin)/');
      router.replace('/(admin)/' as any);
      return;
    }

    // Por defecto, asumimos que es un domiciliario o usuario estándar
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

  return <Slot />;
}