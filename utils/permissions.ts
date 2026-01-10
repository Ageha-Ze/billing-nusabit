// utils/permissions.ts

import { User } from "@/types";

// Define all possible permissions in the application
export const PERMISSIONS = {
  // Global/System Permissions
  SUPER_ADMIN: 'system.super_admin', // Bypass all checks
  VIEW_DASHBOARD: 'dashboard.view',

  // Master Data Management
  MASTER_USER_VIEW: 'master.user.view',
  MASTER_USER_MANAGE: 'master.user.manage', // Create, Edit, Delete users
  MASTER_CLIENT_VIEW: 'master.client.view',
  MASTER_CLIENT_MANAGE: 'master.client.manage',
  MASTER_PRODUCT_VIEW: 'master.product.view',
  MASTER_PRODUCT_MANAGE: 'master.product.manage',
  MASTER_KAS_VIEW: 'master.kas.view',
  MASTER_KAS_MANAGE: 'master.kas.manage',

  // Keuangan (Financial) Management
  KEUANGAN_SUBSCRIPTION_VIEW: 'keuangan.subscription.view',
  KEUANGAN_SUBSCRIPTION_MANAGE: 'keuangan.subscription.manage',
  KEUANGAN_INVOICE_VIEW: 'keuangan.invoice.view',
  KEUANGAN_INVOICE_MANAGE: 'keuangan.invoice.manage',
  KEUANGAN_PAYMENT_VIEW: 'keuangan.payment.view',
  KEUANGAN_PAYMENT_MANAGE: 'keuangan.payment.manage',
  KEUANGAN_CASHFLOW_VIEW: 'keuangan.cashflow.view',
  KEUANGAN_CASHFLOW_MANAGE: 'keuangan.cashflow.manage',

  // Laporan (Reports)
  LAPORAN_INVOICE_VIEW: 'laporan.invoice.view',
  LAPORAN_INVOICE_EXPORT: 'laporan.invoice.export',
  LAPORAN_CASHFLOW_VIEW: 'laporan.cashflow.view',
  LAPORAN_CASHFLOW_EXPORT: 'laporan.cashflow.export',
};

export type PermissionKey = keyof typeof PERMISSIONS;

// Map roles to their assigned permissions
// For simplicity, we'll assume database roles are 'ADMIN' and 'USER'
// 'ADMIN' in DB maps to 'ADMIN' role here, 'USER' in DB maps to 'USER' role here.
// If specific roles like 'keuangan', 'kasir' are needed, the User type/DB schema needs extension.
const ROLE_PERMISSIONS: Record<User['role'], string[]> = {
  ADMIN: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MASTER_USER_VIEW, PERMISSIONS.MASTER_USER_MANAGE,
    PERMISSIONS.MASTER_CLIENT_VIEW, PERMISSIONS.MASTER_CLIENT_MANAGE,
    PERMISSIONS.MASTER_PRODUCT_VIEW, PERMISSIONS.MASTER_PRODUCT_MANAGE,
    PERMISSIONS.MASTER_KAS_VIEW, PERMISSIONS.MASTER_KAS_MANAGE,
    PERMISSIONS.KEUANGAN_SUBSCRIPTION_VIEW, PERMISSIONS.KEUANGAN_SUBSCRIPTION_MANAGE,
    PERMISSIONS.KEUANGAN_INVOICE_VIEW, PERMISSIONS.KEUANGAN_INVOICE_MANAGE,
    PERMISSIONS.KEUANGAN_PAYMENT_VIEW, PERMISSIONS.KEUANGAN_PAYMENT_MANAGE,
    PERMISSIONS.KEUANGAN_CASHFLOW_VIEW, PERMISSIONS.KEUANGAN_CASHFLOW_MANAGE,
    PERMISSIONS.LAPORAN_INVOICE_VIEW, PERMISSIONS.LAPORAN_INVOICE_EXPORT,
    PERMISSIONS.LAPORAN_CASHFLOW_VIEW, PERMISSIONS.LAPORAN_CASHFLOW_EXPORT,
  ],
  KEUANGAN: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.KEUANGAN_SUBSCRIPTION_VIEW, PERMISSIONS.KEUANGAN_SUBSCRIPTION_MANAGE,
    PERMISSIONS.KEUANGAN_INVOICE_VIEW, PERMISSIONS.KEUANGAN_INVOICE_MANAGE,
    PERMISSIONS.KEUANGAN_PAYMENT_VIEW, PERMISSIONS.KEUANGAN_PAYMENT_MANAGE,
    PERMISSIONS.KEUANGAN_CASHFLOW_VIEW, PERMISSIONS.KEUANGAN_CASHFLOW_MANAGE,
    PERMISSIONS.LAPORAN_INVOICE_VIEW, PERMISSIONS.LAPORAN_INVOICE_EXPORT,
    PERMISSIONS.LAPORAN_CASHFLOW_VIEW, PERMISSIONS.LAPORAN_CASHFLOW_EXPORT,
  ],
  KASIR: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MASTER_CLIENT_VIEW,
    PERMISSIONS.KEUANGAN_SUBSCRIPTION_VIEW,
    PERMISSIONS.KEUANGAN_INVOICE_VIEW,
    PERMISSIONS.KEUANGAN_PAYMENT_VIEW,
    PERMISSIONS.KEUANGAN_CASHFLOW_VIEW,
    PERMISSIONS.LAPORAN_INVOICE_VIEW,
    PERMISSIONS.LAPORAN_CASHFLOW_VIEW,
  ],
  USER: [ // Limited permissions for a general user
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MASTER_CLIENT_VIEW,
    PERMISSIONS.KEUANGAN_SUBSCRIPTION_VIEW,
    PERMISSIONS.KEUANGAN_INVOICE_VIEW,
    PERMISSIONS.KEUANGAN_PAYMENT_VIEW,
    PERMISSIONS.KEUANGAN_CASHFLOW_VIEW,
    PERMISSIONS.LAPORAN_INVOICE_VIEW,
    PERMISSIONS.LAPORAN_CASHFLOW_VIEW,
  ],
};

/**
 * Checks if a user with a given role has a specific permission.
 * Super Admin bypasses all checks.
 * @param userRole The role of the user (e.g., 'ADMIN', 'USER').
 * @param permission The permission to check (e.g., PERMISSIONS.MASTER_CLIENT_VIEW).
 * @returns True if the user has the permission, false otherwise.
 */
export function hasPermission(userRole: User['role'] | undefined, permission: string): boolean {
  if (!userRole) {
    return false;
  }

  // Super Admin (or highest level ADMIN) always has all permissions
  // For now, if role is 'ADMIN' from DB, it's considered super admin for all app permissions.
  if (userRole === 'ADMIN') {
    return true; // ADMIN role from DB has all permissions in this setup
  }

  const allowedPermissions = ROLE_PERMISSIONS[userRole];
  if (!allowedPermissions) {
    return false;
  }

  return allowedPermissions.includes(permission);
}