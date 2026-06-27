import type { Role } from "@prisma/client";

/**
 * Permissions are coarse-grained capabilities checked at the org boundary.
 * Keep this list small and meaningful; map UI/actions to these.
 */
export type Permission =
  | "org:view"
  | "org:update"
  | "org:delete"
  | "members:view"
  | "members:invite"
  | "members:remove"
  | "members:change_role"
  | "billing:view"
  | "billing:manage"
  | "projects:view"
  | "projects:create"
  | "projects:delete";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  OWNER: new Set<Permission>([
    "org:view",
    "org:update",
    "org:delete",
    "members:view",
    "members:invite",
    "members:remove",
    "members:change_role",
    "billing:view",
    "billing:manage",
    "projects:view",
    "projects:create",
    "projects:delete",
  ]),
  ADMIN: new Set<Permission>([
    "org:view",
    "org:update",
    "members:view",
    "members:invite",
    "members:remove",
    "billing:view",
    "projects:view",
    "projects:create",
    "projects:delete",
  ]),
  MEMBER: new Set<Permission>([
    "org:view",
    "members:view",
    "projects:view",
    "projects:create",
  ]),
};

/** True if the role grants the permission. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

/** Throwing variant for use in server actions / route handlers. */
export class ForbiddenError extends Error {
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export function assertCan(role: Role, permission: Permission): void {
  if (!can(role, permission)) throw new ForbiddenError(permission);
}

const ROLE_RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, MEMBER: 1 };

/** True if `actor` outranks `target` (used to prevent privilege escalation). */
export function outranks(actor: Role, target: Role): boolean {
  return ROLE_RANK[actor] > ROLE_RANK[target];
}

export function isAtLeast(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
