'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Search, ListMusic, Disc3, Users, UserCircle2, Settings, LogOut, Moon, Sun, Music } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/songs', label: 'Songs', icon: Music },
  { href: '/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/playlists/custom', label: 'Custom Playlists', icon: ListMusic },
  { href: '/albums', label: 'Albums', icon: Disc3 },
  { href: '/artists', label: 'Artists', icon: Users },
  { href: '/karaoke', label: 'Karaoke', icon: Music },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
    // Pre-fill search input if on /search page with query param
    if (pathname.startsWith('/search')) {
      const q = searchParams?.get('query') || '';
      setSearch(q);
    }
  }, [pathname, searchParams]);

  const handleLogout = () => {
    // Simulate logout
    router.push('/auth');
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" aria-label="Go to Dashboard">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center space-x-2 md:flex">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant={pathname.startsWith(link.href) ? 'default' : 'ghost'}
              asChild
              className={cn(
                "font-headline text-sm",
                pathname.startsWith(link.href) ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-accent/20"
              )}
            >
              <Link href={link.href}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <form className="relative hidden sm:block" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search songs, artists..."
              className="pl-9 w-48 lg:w-64 font-body"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>

          {mounted && (
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="person portrait" />
                  <AvatarFallback className="font-headline bg-primary text-primary-foreground">UM</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none font-headline">User Mitra</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@musicmitra.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full">
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
       {/* Mobile navigation bar */}
       <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-2 flex justify-around">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={cn(
                "flex flex-col items-center p-2 rounded-md w-1/5",
                pathname.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
              )}>
              <link.icon className="h-6 w-6" />
              <span className="text-xs font-headline mt-1 text-center">{link.label}</span>
            </Link>
          ))}
        </nav>
    </header>
  );
}
