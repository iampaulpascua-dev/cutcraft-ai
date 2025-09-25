import React, { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Payment } from './components/Payment';
import { Settings } from './components/Settings';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { useAuth } from './hooks/useAuth';
import type { Page } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const {
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
  } = useAuth();

  // Check for existing session on app load
  useEffect(() => {
    const initializeApp = async () => {
      const initialPage = await checkSession();
      if (initialPage) {
        setCurrentPage(initialPage);
      }
    };
    
    initializeApp();
    
    // Setup auth state listener
    const subscription = setupAuthListener(
      () => setCurrentPage('dashboard'),
      () => setCurrentPage('landing')
    );

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const onUpgrade = async () => {
    const redirectPage = await handleUpgrade();
    setCurrentPage(redirectPage);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={navigateTo} />;
      case 'auth':
        return (
          <Auth 
            onNavigate={navigateTo} 
            onLogin={handleLogin}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={navigateTo} 
            onLogout={handleLogout} 
            user={user}
            onUserUpdate={loadUserProfile}
          />
        );
      case 'payment':
        return (
          <Payment 
            onNavigate={navigateTo} 
            onUpgrade={onUpgrade}
          />
        );
      case 'settings':
        return (
          <Settings 
            onNavigate={navigateTo} 
            onLogout={handleLogout} 
            user={user} 
            onUpgrade={onUpgrade}
            onUserUpdate={loadUserProfile}
          />
        );
      default:
        return <Landing onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentPage()}
    </div>
  );
}