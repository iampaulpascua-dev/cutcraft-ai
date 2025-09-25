import { useState, useEffect } from 'react';
import { authHelpers, userApi } from '../utils/supabase/client';
import type { User, Page } from '../types';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = async () => {
    try {
      const session = await authHelpers.getSession();
      if (session) {
        await loadUserProfile();
        setIsLoggedIn(true);
        return 'dashboard' as Page;
      }
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const loadUserProfile = async () => {
    try {
      const { profile } = await userApi.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleLogin = async (email: string, password: string, isSignUp: boolean = false) => {
    try {
      if (isSignUp) {
        await authHelpers.signUp(email, password);
      } else {
        await authHelpers.signIn(email, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authHelpers.signInWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authHelpers.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpgrade = async () => {
    try {
      await userApi.upgradeSubscription('pro');
      await loadUserProfile();
      return 'dashboard' as Page;
    } catch (error) {
      console.error('Upgrade error:', error);
      throw error;
    }
  };

  const setupAuthListener = (onSignIn: () => void, onSignOut: () => void) => {
    const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile();
        setIsLoggedIn(true);
        onSignIn();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUser(null);
        onSignOut();
      }
    });

    return subscription;
  };

  return {
    isLoggedIn,
    user,
    isLoading,
    checkSession,
    loadUserProfile,
    handleLogin,
    handleGoogleLogin,
    handleLogout,
    handleUpgrade,
    setupAuthListener
  };
}