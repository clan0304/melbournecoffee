'use client';

import React, { createContext, useContext } from 'react';
import { User } from '@clerk/nextjs/server';
import { useUser } from '@clerk/nextjs';

// Define the shape of the context
interface UserContextType {
  user: User | null;
  isSignedIn: boolean;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  isSignedIn: false,
});

// Context Provider Component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isSignedIn } = useUser();
  return (
    <UserContext.Provider
      value={{ user: user as User | null, isSignedIn: isSignedIn ?? false }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUserContext = () => {
  return useContext(UserContext);
};
