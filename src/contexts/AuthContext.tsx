import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/config/api';

// Session token lives in the device secure store while signed in. It is cleared
// on every cold start so a fresh launch always requires login again.
const TOKEN_KEY = 'wattwise_session_token';

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
};

export type AuthUser = UserProfile & {
  username: string;
  role: 'admin';
};

type ChangePasswordResult = { ok: boolean; error?: string };
type LoginResult = { ok: boolean; error?: string };

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  /** True when the backend has no administrator account yet (first run). */
  setupRequired: boolean;
  currentUser: AuthUser | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  setup: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<ChangePasswordResult>;
  /** Authorization header for authenticated API calls. */
  getAuthHeader: () => Promise<Record<string, string>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const EMPTY_PROFILE: UserProfile = { name: '', email: '', phone: '' };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const tokenRef = useRef<string | null>(null);

  // Cold start: always require a fresh login and clear any persisted token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch {
        // Nothing to clear.
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/status`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setSetupRequired(!!data.setupRequired);
        }
      } catch {
        // Backend unreachable: leave setupRequired false; login will surface it.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyUser = useCallback((user: any) => {
    setUsername(typeof user?.username === 'string' ? user.username : null);
    setProfile({
      name: typeof user?.name === 'string' ? user.name : '',
      email: typeof user?.email === 'string' ? user.email : '',
      phone: typeof user?.phone === 'string' ? user.phone : '',
    });
  }, []);

  const login = useCallback(async (u: string, p: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 429) {
          return { ok: false, error: 'Too many attempts. Please wait a minute and try again.' };
        }
        if (res.status >= 500) {
          return { ok: false, error: 'Could not sign in right now. Please try again.' };
        }
        // Single generic message: never reveal whether username or password failed.
        return { ok: false, error: 'Invalid username or password.' };
      }
      if (!data?.token) return { ok: false, error: 'Invalid username or password.' };
      tokenRef.current = data.token;
      applyUser(data.user);
      setIsLoggedIn(true);
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      } catch {
        // Non-fatal: the in-memory token still authorizes this session.
      }
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: 'Could not reach the WattWise server. Make sure the backend is running.',
      };
    }
  }, [applyUser]);

  const setup = useCallback(async (password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data?.error || 'Could not create the password.' };
      setSetupRequired(false);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not reach the WattWise server.' };
    }
  }, []);

  const logout = useCallback(async () => {
    const token = tokenRef.current;
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Best effort: clear locally regardless.
    }
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Ignore.
    }
    tokenRef.current = null;
    setUsername(null);
    setProfile(EMPTY_PROFILE);
    setIsLoggedIn(false);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<UserProfile>) => {
      const token = tokenRef.current;
      if (!token) throw new Error('Not signed in');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Could not save your profile.');
      }
      const data = await res.json();
      applyUser(data.user);
    },
    [applyUser]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<ChangePasswordResult> => {
      const token = tokenRef.current;
      if (!token) return { ok: false, error: 'You are not signed in.' };
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data?.error || 'Could not update the password.' };
        return { ok: true };
      } catch {
        return { ok: false, error: 'Could not reach the WattWise server.' };
      }
    },
    []
  );

  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    let token = tokenRef.current;
    if (!token) {
      try {
        token = await SecureStore.getItemAsync(TOKEN_KEY);
      } catch {
        token = null;
      }
      if (token) tokenRef.current = token;
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const currentUser: AuthUser | null =
    isLoggedIn && username ? { username, role: 'admin', ...profile } : null;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        setupRequired,
        currentUser,
        login,
        setup,
        logout,
        updateProfile,
        changePassword,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}