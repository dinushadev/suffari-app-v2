import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/data/apiConfig";
import Link from 'next/link';
import { User } from '@supabase/supabase-js'; // Import User type
import { useRouter } from 'next/navigation';

const Header = () => {
  const [user, setUser] = useState<User | null>(null); // Use User type
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      authListener.subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/'); // Redirect to root page after logout
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background text-foreground shadow-md p-4 border-b border-border">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-lg font-semibold">RAAHI</h1>
        <div className="relative" ref={dropdownRef}>
          {user ? (
            <>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-foreground hover:text-primary transition-colors duration-300 focus:outline-none"
              >
                {/* Profile Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-20 border border-border">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                    Profile
                  </Link>
                  <Link href="/booking/history" className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground">
                    Bookings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link href="/auth" className="bg-primary text-primary-foreground py-2 px-4 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-300">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
