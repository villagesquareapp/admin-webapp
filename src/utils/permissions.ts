/**
 * RBAC permission gate.
 *
 * Per the VFlix admin guide (§7): authorization is currently binary — any
 * valid admin JWT can call every admin route, and per-permission RBAC is
 * NOT enforced yet. This helper exists so action buttons can be wrapped now
 * and painlessly permission-gated later, once the backend ships scopes like
 * `vflix.moderate`, `vflix.feature`, `vflix.catalog.manage`.
 *
 * For now it always returns true. When RBAC enforcement lands, replace the
 * body with a real check against the admin's granted permissions (e.g. from
 * the session/JWT) without touching any call sites.
 */
export type Permission =
  | "vflix.view"
  | "vflix.moderate"
  | "vflix.feature"
  | "vflix.catalog.manage"
  | string;

export function can(_permission: Permission): boolean {
  // TODO: replace with real permission check when RBAC enforcement ships.
  return true;
}
