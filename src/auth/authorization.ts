import { USER_ROLES, UserRole } from './roles'

const ADMIN_ACCESS_ROLES: UserRole[] = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]
const GYM_STAFF_ROLES: UserRole[] = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.TRAINER]

export function canAccessAdmin(role: string | null): boolean {
  if (!role) {
    return false
  }

  return ADMIN_ACCESS_ROLES.includes(role as UserRole)
}

export function isGymStaff(role: string | null): boolean {
  if (!role) {
    return false
  }

  return GYM_STAFF_ROLES.includes(role as UserRole)
}
