/**
 * Avatar Component
 * Display user avatar with initials fallback
 */

import React from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  initials?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-bg-card border border-border-light ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-text-primary">{initials}</span>
      )}
    </div>
  )
}

interface AvatarGroupProps {
  avatars: Array<{ initials?: string; src?: string; alt?: string }>
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, max = 3, size = 'md' }) => {
  const displayed = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className="flex -space-x-2">
      {displayed.map((avatar, i) => (
        <Avatar key={i} {...avatar} size={size} />
      ))}
      {remaining > 0 && (
        <div className={`rounded-full flex items-center justify-center bg-bg-card border border-border-light text-text-secondary font-semibold ${
          size === 'sm' ? 'h-8 w-8 text-xs' : size === 'md' ? 'h-10 w-10 text-sm' : 'h-12 w-12 text-base'
        }`}>
          +{remaining}
        </div>
      )}
    </div>
  )
}
