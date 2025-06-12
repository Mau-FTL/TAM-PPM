
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordGate from '@/components/auth/PasswordGate';
import { Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Added Card imports
import { useAuth } from '@/context/AuthContext';


export default function HomePage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [currentIcon, setCurrentIcon] = useState<React.ReactNode>(null);
  const { user, isLoadingAuth, firebaseConfigError } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoadingAuth, router]);
  

  useEffect(() => {
    if (resolvedTheme) {
      setCurrentIcon(resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />);
    }
  }, [resolvedTheme]);
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (isLoadingAuth) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="absolute top-4 right-4">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="dark:hover:bg-white dark:hover:text-black hover:bg-black hover:text-white"
          >
            {currentIcon}
          </Button>
        </div>
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Initializing...</p>
      </div>
    );
  }

  if (firebaseConfigError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="absolute top-4 right-4">
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="dark:hover:bg-white dark:hover:text-black hover:bg-black hover:text-white">
            {currentIcon}
          </Button>
        </div>
        <Card className="w-full max-w-md shadow-xl bg-card">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl mt-4">Configuration Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive text-center">
                {firebaseConfigError}
                </p>
                <p className="text-muted-foreground text-sm text-center mt-2">
                Please ensure Firebase is correctly configured and the server has been restarted if using environment variables. Check console for more details.
                </p>
            </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already loaded and exists, AuthProvider's useEffect should redirect.
  // This gate is shown if not loading and no user (and no config error).
  if (!user) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="bg-card/80 dark:hover:bg-white dark:hover:text-black hover:bg-black hover:text-white" 
          >
            {currentIcon}
          </Button>
        </div>
        <PasswordGate onSuccess={() => router.replace('/dashboard')} />
      </div>
    );
  }
  
  // Fallback loader if somehow this state is reached before redirection
  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Loading TAM PPM...</p>
      </div>
  );
}
