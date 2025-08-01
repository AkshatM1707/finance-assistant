'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Menu, X, LogOut, Wallet } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  /**
   * Handles user logout by clearing authentication and redirecting to login
   */
  const handleLogout = async () => {
    try {
      // Clear the auth token cookie by calling logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, redirect to login
      router.push('/login');
    }
  };

  return (
    <nav className="border-b shadow-sm" style={{ 
      backgroundColor: 'hsl(var(--navbar-bg))', 
      color: 'hsl(var(--navbar-foreground))' 
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold" style={{ color: 'hsl(var(--navbar-foreground))' }}>FinanceTracker</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-black/10" style={{ color: 'hsl(var(--navbar-foreground))' }}>
                Dashboard
              </Link>
              <Link href="/transactions" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-black/10" style={{ color: 'hsl(var(--navbar-foreground))' }}>
                Transactions
              </Link>
              <Link href="/analytics" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-black/10" style={{ color: 'hsl(var(--navbar-foreground))' }}>
                Analytics
              </Link>
              <Link href="/receipts" className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-black/10" style={{ color: 'hsl(var(--navbar-foreground))' }}>
                Receipts
              </Link>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="@user" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        user@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium">
              Dashboard
            </Link>
            <Link href="/transactions" className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium">
              Transactions
            </Link>
            <Link href="/analytics" className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium">
              Analytics
            </Link>
            <Link href="/receipts" className="text-muted-foreground hover:text-foreground block px-3 py-2 rounded-md text-base font-medium">
              Receipts
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 