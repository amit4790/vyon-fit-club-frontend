export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TRAINER: 'TRAINER',
  MEMBER: 'MEMBER',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]
