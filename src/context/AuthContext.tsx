'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import the new data service based on sampleData.ts
import { dataService } from '@/lib/dataService';

interface User {
  email: string;
  displayName?: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is admin based on sampleData
  const isAdmin = user ? dataService.isAdmin(user.email) : false;

  // Simple demo authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get valid users from sampleData
      const validUsers = dataService.getUsers();
      const foundUser = validUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser && password === 'demo123') { // Simple demo password
        const newUser: User = {
          email: foundUser.email,
          displayName: foundUser.email.split('@')[0], // Use email prefix as display name
          id: foundUser.id,
        };
        
        setUser(newUser);
        localStorage.setItem('tamppm_currentUser', JSON.stringify(newUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tamppm_currentUser');
    router.push('/');
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      setIsLoadingAuth(true);
      
      try {
        const savedUser = localStorage.getItem('tamppm_currentUser');
        if (savedUser) {
          const parsedUser: User = JSON.parse(savedUser);
          
          // Verify the user still exists in sampleData
          const validUsers = dataService.getUsers();
          const userExists = validUsers.some(u => u.email === parsedUser.email);
          
          if (userExists) {
            setUser(parsedUser);
            if (pathname === '/') {
              router.replace('/dashboard');
            }
          } else {
            // User no longer exists in sampleData, clear localStorage
            localStorage.removeItem('tamppm_currentUser');
          }
        } else if (pathname !== '/') {
          // No saved user and not on login page, redirect to login
          router.replace('/');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('tamppm_currentUser');
        if (pathname !== '/') {
          router.replace('/');
        }
      } finally {
        setIsLoadingAuth(false);
      }
    };

    // Small delay to prevent flash
    const timeoutId = setTimeout(initializeAuth, 100);
    return () => clearTimeout(timeoutId);
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isLoadingAuth, login, logout }}>
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

// Protected route wrapper component
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoadingAuth && !user && pathname !== '/') {
      router.replace('/');
    }
  }, [user, isLoadingAuth, router, pathname]);

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading authentication...</p>
      </div>
    );
  }

  if (!user && pathname !== '/') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Redirecting to login...</p>
      </div>
    );
  }
  
  return <>{children}</>;
}