"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { subscribeToAuthChanges, getCurrentUser } from '@/lib/firebase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      setLoading(false);

      // Set cookies for middleware
      if (user) {
        // Set auth token (you can use user.accessToken or create your own token)
        document.cookie = `auth-token=${user.uid}; path=/; max-age=86400; samesite=strict`;
        document.cookie = `user-email=${user.email}; path=/; max-age=86400; samesite=strict`;
      } else {
        // Clear cookies on logout
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'user-email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
      // Set cookies for already logged in user
      document.cookie = `auth-token=${currentUser.uid}; path=/; max-age=86400; samesite=strict`;
      document.cookie = `user-email=${currentUser.email}; path=/; max-age=86400; samesite=strict`;
    }

    return () => unsubscribe();
  }, []);

  const isAdmin = user?.email === 'admin@web.com';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}
