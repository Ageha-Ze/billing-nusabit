"use client";

import { useUser } from '@/contexts/UserContext';
import { hasPermission, type PermissionKey } from '@/utils/permissions';
import React from 'react';

interface PermissionGuardProps {
  permission: PermissionKey;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const { user } = useUser();

  if (user && hasPermission(user.role, permission)) {
    return <>{children}</>;
  }

  // You can return null or a placeholder/error component
  return null;
}
