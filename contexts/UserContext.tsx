"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { hasPermission as checkPermissionUtil, PERMISSIONS } from '@/utils/permissions';

type PermissionKey = keyof typeof PERMISSIONS;

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  // Updated to use the real permission checking logic
  hasPermission: (permission: PermissionKey) => boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Use the real permission logic from utils/permissions.ts
  const checkPermission = (permission: PermissionKey) => {
    if (!user) return false;
    return checkPermissionUtil(user.role, permission);
  };

  return (
    <UserContext.Provider value={{ user, setUser, hasPermission: checkPermission }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
