/**
 * Stats Section
 * Animated counters for key statistics
 */

import React, { useState, useEffect, useRef } from 'react'
import { Users, Award, Zap, TrendingUp } from 'lucide-react'

interface StatProps {
  icon: React.ReactNode
  value: number
  suffix: string
  label: string
}

const Stat: React.FC<StatProps> = ({ icon, value, suffix, label }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const interval = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(interval)
  }, [isVisible, value])

  return (
    <div ref={ref} className="text-center">
      <div className="flex justify-center mb-3 text-primary">{icon}</div>
      <div className="section-title mb-2">
        {count}
        {suffix}
      </div>
      <p className="body text-text-secondary">{label}</p>
    </div>
  )
}

export const Stats: React.FC = () => {
  return (
    <section id="stats" className="py-20 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <Stat
            icon={<Users size={40} />}
            value={500}
            suffix="+"
            label="Active Members"
          />
          <Stat
            icon={<Award size={40} />}
            value={25}
            suffix="+"
            label="Certified Coaches"
          />
          <Stat
            icon={<Zap size={40} />}
            value={8}
            suffix="+"
            label="Years of Excellence"
          />
          <Stat
            icon={<TrendingUp size={40} />}
            value={15000}
            suffix="+"
            label="Training Sessions"
          />
        </div>
      </div>
    </section>
  )
}
