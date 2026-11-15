import React, { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Routes that may be visited while signed out. Everything else is protected and
 * will bounce back to the login screen.
 */
const PUBLIC_ROOTS = new Set(['index', 'login', 'register', 'forgot-password']);
const AUTH_ROOTS = new Set(['login', 'register', 'forgot-password']);

/**
 * Keeps the session honest:
 * - a signed-out user can never stay on a protected screen;
 * - a signed-in user is sent straight to the dashboard from the auth screens;
 * - the session lives in memory only, so a fresh launch always starts at Login.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const root = segments[0];
  const pathKey = segments.join('/');

  useEffect(() => {
    if (isLoading) return;

    const isPublic = root === undefined || PUBLIC_ROOTS.has(root as string);
    const isAuthScreen = root !== undefined && AUTH_ROOTS.has(root as string);

    if (!isLoggedIn && !isPublic) {
      router.replace('/login');
      return;
    }
    if (isLoggedIn && isAuthScreen) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isLoggedIn, isLoading, root, pathKey, router]);

  return <>{children}</>;
}
