/**
 * Card Component
 * Reusable card wrapper
 */

import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-bg-card border border-border-light rounded-lg p-6 shadow-card transition-all duration-200 ${
        hover && 'hover:shadow-card-hover hover:border-accent'
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface StatisticCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down'
  className?: string
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  label,
  value,
  icon,
  trend,
  className = '',
}) => {
  return (
    <Card className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="label text-text-secondary">{label}</span>
        {icon && <div className="text-accent">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-section-title font-bold text-text-primary">{value}</span>
        {trend && (
          <span className={`caption ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
            {trend === 'up' ? '↑' : '↓'} 12%
          </span>
        )}
      </div>
    </Card>
  )
}

interface DashboardCardProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  action,
  className = '',
}) => {
  return (
    <Card hover className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="card-title">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </Card>
  )
}
