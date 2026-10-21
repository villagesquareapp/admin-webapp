"use client";

import { useSession } from "next-auth/react";

/**
 * Staff permissions, as the Admin API sends them at login (user.permissions).
 * They only shape the UI: the Admin API checks every request itself.
 */
export type Permission = string;

export const STAFF_ROLES = [
  { value: "super_admin", label: "Super admin" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "support", label: "Support" },
  { value: "finance", label: "Finance" },
  { value: "content", label: "Content" },
] as const;

export const staffRoleLabel = (role?: string | null) =>
  STAFF_ROLES.find((r) => r.value === role)?.label ?? role ?? "—";

// Names used by the VFlix screens before roles shipped.
const ALIASES: Record<string, string> = {
  "vflix.view": "content.view",
  "vflix.moderate": "content.manage",
  "vflix.feature": "catalog.manage",
  "vflix.catalog.manage": "catalog.manage",
};

export function hasPermission(permissions: string[] | undefined, permission: Permission): boolean {
  // Sessions from before roles shipped carry no list; show everything.
  if (!permissions) return true;
  return permissions.includes(ALIASES[permission] ?? permission);
}

export function usePermissions() {
  const { data } = useSession();
  const permissions = data?.user?.permissions;
  return {
    role: data?.user?.role,
    can: (permission: Permission) => hasPermission(permissions, permission),
  };
}
