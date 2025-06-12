
'use client';
import { Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LayoutDashboard, ParkingSquare, ListChecks, LogOut, Sun, Moon, Truck, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '@/lib/firebaseInit';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Initialize Firebase Auth only if app is available
const firebaseAuth = app ? getAuth(app) : undefined;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
}

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [currentIcon, setCurrentIcon] = useState<React.ReactNode>(null); 
  const { user, isAdmin, firebaseConfigError } = useAuth(); 

  useEffect(() => {
    if (resolvedTheme) {
      setCurrentIcon(resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />);
    }
  }, [resolvedTheme]);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: '/dashboard/properties', label: 'Parking Portfolio', icon: <ParkingSquare className="h-5 w-5" /> },
    { href: '/dashboard/projects', label: 'All Projects', icon: <ListChecks className="h-5 w-5" /> },
    { href: '#', label: 'Transportation Portfolio (Coming Soon)', icon: <Truck className="h-5 w-5" />, isComingSoon: true },
  ];

  const handleExit = async () => {
    if (!firebaseAuth) {
      console.error("Firebase Auth not initialized, cannot sign out.");
      sessionStorage.removeItem('isAuthenticated'); 
      router.push('/');
      return;
    }
    try {
      await signOut(firebaseAuth);
      sessionStorage.removeItem('isAuthenticated');
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      sessionStorage.removeItem('isAuthenticated');
      router.push('/');
    }
  };
  
  const getUserInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split(/[.\-_]/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };


  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" passHref>
            <div className="flex items-center cursor-pointer" aria-label="TAM PPM Home">
              <h1 className="font-doto text-3xl font-black text-foreground">
                TAM PPM
              </h1>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              {navItems.map((item) => (
                item.isComingSoon ? (
                  <span
                    key={item.href}
                    className={cn(
                      "flex items-center px-2 py-2 sm:px-3 rounded-md text-sm font-semibold",
                      "text-muted-foreground opacity-70 cursor-not-allowed"
                    )}
                    aria-disabled="true"
                    title={item.label}
                  >
                    {item.icon}
                    <span className="ml-2 hidden sm:inline">{item.label}</span>
                  </span>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-2 py-2 sm:px-3 rounded-md text-sm transition-colors font-semibold",
                      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                        ? "bg-background text-foreground border border-input"
                        : "text-foreground dark:hover:bg-white dark:hover:text-black hover:bg-black hover:text-white"
                    )}
                    aria-current={pathname === item.href ? "page" : undefined}
                    title={item.label}
                  >
                    {item.icon}
                    <span className="ml-2 hidden sm:inline">{item.label}</span>
                  </Link>
                )
              ))}
            </nav>

            {/* Mobile Navigation - Icon Only */}
            <nav className="flex items-center space-x-1 md:hidden">
              {navItems.map((item) => (
                item.isComingSoon ? (
                  <span
                    key={`mobile-${item.label}`}
                    className={cn(
                      "flex items-center justify-center h-9 w-9 p-2 rounded-md",
                      "text-muted-foreground opacity-70 cursor-not-allowed"
                    )}
                    aria-disabled="true"
                    title={`${item.label} (Coming Soon)`}
                  >
                    {item.icon}
                  </span>
                ) : (
                  <Link
                    key={`mobile-${item.label}`}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-center h-9 w-9 p-2 rounded-md text-sm transition-colors font-semibold",
                      pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                        ? "bg-background text-foreground border border-input"
                        : "text-foreground hover:bg-muted"
                    )}
                    aria-label={item.label}
                    title={item.label}
                  >
                    {item.icon}
                  </Link>
                )
              ))}
            </nav>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="dark:hover:bg-white dark:hover:text-black hover:bg-black hover:text-white"
              aria-label="Toggle theme"
            >
              {currentIcon}
            </Button>

            {user && !firebaseConfigError && (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.email || "User"} />
                      <AvatarFallback className="text-primary-foreground">{getUserInitials(user.email)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName || user.email?.split('@')[0] || "User"}
                         {isAdmin && <Badge variant="pastel-purple" className="ml-2 text-xs">Admin</Badge>}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                   {isAdmin && (
                     <>
                      <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" /><span>Settings</span></DropdownMenuItem>
                     </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExit} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
             {(!user || firebaseConfigError) && ( 
                <Button
                variant="outline"
                size="sm"
                onClick={handleExit}
                className="dark:hover:bg-white dark:hover:text-black hover:bg-black hover:text-white"
                aria-label="Exit Application"
                >
                <LogOut className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Exit</span>
                </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
