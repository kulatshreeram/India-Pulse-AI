'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/nextjs';
import { useNewsStore } from '@/store/newsStore';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  interests: string[];
}

interface AuthContextType {
  user: AppUser | null;
  isSignedIn: boolean;
  isLoading: boolean;
  login: (email: string, name: string) => Promise<void>;
  signup: (email: string, name: string, interests: string[]) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string, interests: string[]) => Promise<void>;
  isClerk: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const hasClerkKeys = CLERK_PUBLISHABLE_KEY.trim().length > 0;

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  // If Clerk is configured, we let Clerk handle auth.
  // Otherwise, we use our local mock state.
  return hasClerkKeys ? (
    <ClerkWrapper>{children}</ClerkWrapper>
  ) : (
    <MockAuthProvider>{children}</MockAuthProvider>
  );
}

// ── Clerk Wrapper & Adapter ──────────────────────────────────────────────────
function ClerkWrapper({ children }: { children: React.ReactNode }) {
  const { ClerkProvider } = require('@clerk/nextjs');
  return <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>{children}</ClerkProvider>;
}

// ── Mock Auth Provider (Clerk Fallback) ──────────────────────────────────────
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync/load preferences from backend on load
  const syncPreferences = async (userId: string) => {
    try {
      const res = await fetch('/api/preferences', {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        return data.interests || [];
      }
    } catch (e) {
      console.error('Failed to load preferences on login:', e);
    }
    return [];
  };

  const syncBookmarks = async (userId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) {
        const data = await res.json();
        const bookmarkedIds = (data.bookmarks || []).map((art: any) => art.id);
        useNewsStore.getState().setBookmarks(bookmarkedIds);
      }
    } catch (e) {
      console.error('Failed to sync bookmarks:', e);
    }
  };

  useEffect(() => {
    const loadSavedUser = async () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mock_user_session');
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as AppUser;
            // Sync current interests from DB
            const dbInterests = await syncPreferences(parsed.id);
            await syncBookmarks(parsed.id);
            const updated = { ...parsed, interests: dbInterests };
            setUser(updated);
            localStorage.setItem('mock_user_session', JSON.stringify(updated));
          } catch (e) {
            localStorage.removeItem('mock_user_session');
          }
        }
      }
      setIsLoading(false);
    };
    loadSavedUser();
  }, []);

  const login = async (email: string, name: string) => {
    setIsLoading(true);
    // Generate simple ID based on email
    const userId = `mock_${btoa(email).substring(0, 8).toLowerCase()}`;
    const dbInterests = await syncPreferences(userId);
    await syncBookmarks(userId);
    
    const newUser: AppUser = {
      id: userId,
      name: name || 'Guest User',
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`,
      interests: dbInterests
    };
    
    setUser(newUser);
    localStorage.setItem('mock_user_session', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const signup = async (email: string, name: string, interests: string[]) => {
    setIsLoading(true);
    const userId = `mock_${btoa(email).substring(0, 8).toLowerCase()}`;
    
    // Save preferences in db
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ interests })
      });
    } catch (e) {
      console.error('Failed to save interests during signup:', e);
    }

    await syncBookmarks(userId);

    const newUser: AppUser = {
      id: userId,
      name: name,
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      interests: interests
    };

    setUser(newUser);
    localStorage.setItem('mock_user_session', JSON.stringify(newUser));
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('mock_user_session');
  };

  const updateProfile = async (name: string, interests: string[]) => {
    if (!user) return;
    setIsLoading(true);

    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ interests })
      });
    } catch (e) {
      console.error('Failed to save updated interests:', e);
    }

    const updatedUser = {
      ...user,
      name: name,
      interests: interests,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    setUser(updatedUser);
    localStorage.setItem('mock_user_session', JSON.stringify(updatedUser));
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        isClerk: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Unified useAppAuth() Hook ────────────────────────────────────────────────
export function useAppAuth() {
  // If Clerk keys are configured, we read from Clerk context.
  // Otherwise, we read from Mock context.
  if (hasClerkKeys) {
    return useClerkAuthAdapter();
  } else {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAppAuth must be used within an AppAuthProvider');
    }
    return context;
  }
}

// ── Clerk adapter mapping hook ──────────────────────────────────────────────
function useClerkAuthAdapter(): AuthContextType {
  const clerkUser = useClerkUser();
  const clerkAuth = useClerkAuth();
  const { signOut } = useClerk();
  
  const [interests, setInterests] = useState<string[]>([]);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(false);

  const userId = clerkAuth.userId;

  // Sync preferences from DB whenever clerk userId is resolved
  useEffect(() => {
    if (userId) {
      setIsLoadingPrefs(true);
      fetch('/api/preferences', {
        headers: { 'x-user-id': userId }
      })
        .then(res => res.json())
        .then(data => {
          setInterests(data.interests || []);
          setIsLoadingPrefs(false);
        })
        .catch(err => {
          console.error('Failed to fetch Clerk preferences:', err);
          setIsLoadingPrefs(false);
        });
    }
  }, [userId]);

  const isSignedIn = !!clerkAuth.isSignedIn;
  const isLoading = clerkAuth.isLoaded === false || clerkUser.isLoaded === false || isLoadingPrefs;

  const user: AppUser | null = isSignedIn && clerkUser.user ? {
    id: clerkUser.user.id,
    name: clerkUser.user.fullName || clerkUser.user.username || 'Clerk User',
    email: clerkUser.user.primaryEmailAddress?.emailAddress || '',
    avatarUrl: clerkUser.user.imageUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${clerkUser.user.id}`,
    interests: interests
  } : null;

  const login = async () => {
    // Under Clerk, redirects to Clerk sign-in page
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  };

  const signup = async () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-up';
    }
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (name: string, newInterests: string[]) => {
    if (!userId) return;
    // Update preferences in backend
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ interests: newInterests })
      });
      setInterests(newInterests);
    } catch (e) {
      console.error('Failed to update Clerk preferences:', e);
    }
  };

  return {
    user,
    isSignedIn,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    isClerk: true
  };
}
