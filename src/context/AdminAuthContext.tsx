import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL } from '../services/firebase';

interface AdminAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthorizedAdmin: boolean;
  unauthorizedEmail: string | null;
  isLoading: boolean;
  authError: string | null;
  adminEmail: string;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  // Backwards compatibility helper
  login: (user: string, pass: string) => { success: boolean; error?: string };
  failedAttempts: number;
  lockoutRemainingSeconds: number;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      if (currentUser) {
        const email = currentUser.email?.toLowerCase();
        if (email === ADMIN_EMAIL.toLowerCase()) {
          setUnauthorizedEmail(null);
          setAuthError(null);
        } else {
          setUnauthorizedEmail(currentUser.email || 'unknown');
          setAuthError(
            `Access Denied: ${currentUser.email} is not authorized. Only ${ADMIN_EMAIL} is granted administrator access.`
          );
        }
      } else {
        setUnauthorizedEmail(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAuthorizedAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setUnauthorizedEmail(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;
      const email = signedInUser.email?.toLowerCase();

      if (email === ADMIN_EMAIL.toLowerCase()) {
        return { success: true };
      } else {
        setUnauthorizedEmail(signedInUser.email || 'unknown');
        const err = `Access Denied: Account (${signedInUser.email}) is not authorized. Only ${ADMIN_EMAIL} has admin privileges.`;
        setAuthError(err);
        return { success: false, error: err };
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      const msg = err.message || 'Google sign-in could not be completed.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUnauthorizedEmail(null);
      setAuthError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Backwards compatibility fallback notice for legacy login calls
  const login = (_user: string, _pass: string) => {
    loginWithGoogle();
    return {
      success: false,
      error: 'Password login is disabled. Please authenticate with Google via Firebase.',
    };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: isAuthorizedAdmin,
        isAuthorizedAdmin,
        unauthorizedEmail,
        isLoading,
        authError,
        adminEmail: ADMIN_EMAIL,
        loginWithGoogle,
        logout,
        login,
        failedAttempts: 0,
        lockoutRemainingSeconds: 0,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
