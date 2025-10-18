'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Process session_id from URL fragment if present
  useEffect(() => {
    const processSessionId = async () => {
      if (typeof window !== 'undefined') {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const sessionId = hashParams.get('session_id');
        
        if (sessionId) {
          setLoading(true);
          try {
            // Exchange session_id for user data and set cookie
            const response = await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId })
            });
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData);
              
              // Clean URL fragment
              window.history.replaceState(
                null, 
                document.title, 
                window.location.pathname + window.location.search
              );
            } else {
              console.error('Failed to process session');
            }
          } catch (error) {
            console.error('Session processing error:', error);
          } finally {
            setLoading(false);
          }
        } else {
          // Check if user is already logged in
          checkAuth();
        }
      }
    };
    
    processSessionId();
  }, []);
  
  // Check if user is authenticated
  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Login function
  const login = () => {
    const redirectUrl = `${window.location.origin}/`;
    const authUrl = process.env.NEXT_PUBLIC_EMERGENT_AUTH_URL || 'https://auth.emergentagent.com';
    window.location.href = `${authUrl}/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  
  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/auth/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}