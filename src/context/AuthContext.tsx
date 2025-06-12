
'use client';

import type { User as FirebaseUser } from 'firebase/auth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { app } from '@/lib/firebaseInit'; // Firebase app instance
import { Loader2 } from 'lucide-react';

// Initialize auth only if app is available
const firebaseAuth = app ? getAuth(app) : undefined;

interface AuthContextType {
  user: FirebaseUser | null;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  firebaseConfigError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [firebaseConfigError, setFirebaseConfigError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!firebaseAuth) {
      console.warn("AuthContext: Firebase Auth is not configured. Authentication will be unavailable.");
      setFirebaseConfigError("Firebase Auth is not configured. Admin checks and user sessions may not work correctly.");
      setIsLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setIsLoadingAuth(true);
      if (currentUser) {
        setUser(currentUser);
        // Prototype admin check: In production, use custom claims.
        const checkAdmin = currentUser.email === 'mbaquero@fortlauderdale.gov';
        setIsAdmin(checkAdmin);
        sessionStorage.setItem('isAuthenticated', 'true'); // Keep for simple checks if needed elsewhere, but context is primary
        if (pathname === '/') { // If on login page and user is found, redirect
          router.replace('/dashboard');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        sessionStorage.removeItem('isAuthenticated');
        // If not on the login page and user becomes null (e.g. logged out), redirect to login
        if (pathname !== '/') {
          router.replace('/');
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoadingAuth, firebaseConfigError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Optional: A wrapper component for protected routes
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoadingAuth, firebaseConfigError } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoadingAuth && !user && !firebaseConfigError && pathname !== '/') {
      router.replace('/');
    }
  }, [user, isLoadingAuth, router, firebaseConfigError, pathname]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading authentication...</p>
      </div>
    );
  }

  if (firebaseConfigError && pathname !== '/') {
     // This case should ideally be handled by a global error boundary or specific error page
     // For now, if config error and not on login page, show simple error or redirect
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <p className="text-lg font-medium text-destructive">Firebase Configuration Error.</p>
            <p className="text-sm text-muted-foreground">Please check the console.</p>
            <Button onClick={() => router.push('/')} variant="outline" className="mt-4">Go to Login</Button>
        </div>
    );
  }


  if (!user && pathname !== '/') {
    // Should have been redirected by useEffect, but as a fallback
    return (
         <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
            <p className="text-lg font-medium">Redirecting to login...</p>
        </div>
    );
  }
  
  return <>{children}</>;
}
