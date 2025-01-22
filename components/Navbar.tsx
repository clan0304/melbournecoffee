import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="bg-slate-900 min-h-[60px] flex items-center">
      <div className="flex justify-end pr-3 w-full">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-white text-[#01182F] font-semibold rounded-lg px-6 py-1 hover:bg-opacity-90 transition-all">
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
