
"use client";

import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  type UserCredential,
  type Auth
} from 'firebase/auth';
import { app } from '@/lib/firebaseInit'; 

interface PasswordGateProps {
  onSuccess: () => void;
}

const backgroundTextLines = [
  "TRANSPORTATION",
  "& MOBILITY",
  "PROJECT",
  "PORTFOLIO",
  "MANAGEMENT",
];

// Initialize auth only if app is available
const auth: Auth | undefined = app ? getAuth(app) : undefined;

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (!auth) {
      setError("Firebase is not properly configured. Login is unavailable.");
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onSuccess();
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [onSuccess]);


  const handleEmailPasswordLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth) {
      setError("Firebase is not configured. Cannot log in.");
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the onSuccess call
    } catch (err: any) {
      setError(`Login failed: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <p className="text-lg font-medium">Processing authentication...</p>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    );
  }

  if (!auth && !isLoading) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-md shadow-xl relative z-10 bg-transparent backdrop-blur-[20px] border border-white/30">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl mt-4 text-black dark:text-white">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive text-center">
              Firebase is not properly configured. Login is unavailable. Please contact support or check the environment setup.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="relative flex min-h-screen items-end sm:items-center justify-center bg-background p-4 pb-12 sm:pb-4 overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-start justify-center px-8 overflow-hidden pointer-events-none -z-1">
        <div className="flex flex-col items-start text-left">
          {backgroundTextLines.map((line, lineIndex) => (
            <p
              key={`line-${lineIndex}`}
              className="text-[12rem] font-black text-black dark:text-white whitespace-nowrap select-none leading-none tracking-tighter uppercase font-headline"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl relative z-10 bg-transparent backdrop-blur-[20px] border border-white/30">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl mt-4 text-black dark:text-white">TAM PPM</CardTitle>
          <CardDescription className="text-black dark:text-white">
            {/* Text "Login with your email and password." removed */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-password">Email</Label>
              <Input
                id="email-password"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-neutral-200" disabled={isLoading || !auth}>
               {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <p className="text-xs text-black dark:text-white text-center w-full">
            This application is for authorized users only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

