import { USER_ROLES, UserRole } from './roles'

const ADMIN_ACCESS_ROLES: UserRole[] = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]

export function canAccessAdmin(role: string | null): boolean {
  if (!role) {
    return false
  }

  return ADMIN_ACCESS_ROLES.includes(role as UserRole)
}
