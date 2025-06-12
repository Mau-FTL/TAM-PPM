"use client";

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleEmailPasswordLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setError('');
  };

  return (
    <div className="relative flex min-h-screen items-end sm:items-center justify-center bg-background p-4 pb-12 sm:pb-4 overflow-hidden">
      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col items-start justify-center px-8 overflow-hidden pointer-events-none -z-1">
        <div className="flex flex-col items-start text-left">
          {backgroundTextLines.map((line, lineIndex) => (
            <p
              key={`line-${lineIndex}`}
              className="text-[12rem] font-black text-black dark:text-white whitespace-nowrap select-none leading-none tracking-tighter uppercase font-headline opacity-5"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-xl relative z-10 bg-card/95 backdrop-blur-sm border border-border">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl mt-4 text-foreground">TAM PPM</CardTitle>
          <CardDescription className="text-muted-foreground">
            Transportation & Mobility Project Portfolio Management
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="text-base"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="text-base pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
          <div className="w-full">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo Users - Click to auto-fill:
            </p>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('mbaquero@fortlauderdale.gov')}
                disabled={isLoading}
                className="text-xs justify-start"
              >
                <span className="font-semibold text-green-600 mr-2">Admin:</span>
                mbaquero@fortlauderdale.gov
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('MSanchez@fortlauderdale.gov')}
                disabled={isLoading}
                className="text-xs justify-start"
              >
                <span className="font-semibold text-blue-600 mr-2">Editor:</span>
                MSanchez@fortlauderdale.gov
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin('KrThompson@fortlauderdale.gov')}
                disabled={isLoading}
                className="text-xs justify-start"
              >
                <span className="font-semibold text-purple-600 mr-2">Viewer:</span>
                KrThompson@fortlauderdale.gov
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              All demo accounts use password: <code className="bg-muted px-1 rounded">demo123</code>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This application is for authorized users only.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}