'use client'; // Add this since we're using hooks

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import React from 'react';

const Navbar = () => {
  const pathname = usePathname(); // Get current route

  return (
    <nav className="bg-white min-h-[60px] flex items-center">
      <div className="flex justify-end pr-3 w-full gap-3">
        <Link href="/">
          <button
            className={`font-semibold px-6 py-1 transition-all ${
              pathname === '/'
                ? 'text-[#01182F] border-b-2 border-[#01182F]'
                : 'text-[#01182F] hover:text-opacity-90'
            }`}
          >
            Chat
          </button>
        </Link>
        <Link href="/list">
          <button
            className={`font-semibold px-6 py-1 transition-all ${
              pathname === '/list'
                ? 'text-[#01182F] border-b-2 border-[#01182F]'
                : 'text-[#01182F] hover:text-opacity-90'
            }`}
          >
            Lists
          </button>
        </Link>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-[#01182F] text-white font-semibold rounded-lg px-6 py-1 hover:bg-opacity-90 transition-all">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
