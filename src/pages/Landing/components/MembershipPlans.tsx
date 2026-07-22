/**
 * Membership Plans Section
 * Four premium pricing tiers
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'

interface PlanProps {
  name: string
  price: number
  currency: string
  billing: string
  features: string[]
  highlighted?: boolean
  onJoinClick?: () => void
}

const PlanCard: React.FC<PlanProps> = ({
  name,
  price,
  currency,
  billing,
  features,
  highlighted = false,
  onJoinClick,
}) => {
  return (
    <div
      className={`card transition-all duration-300 hover:shadow-card-hover ${
        highlighted ? 'ring-2 ring-primary scale-105' : ''
      }`}
    >
      {/* Highlight Badge */}
      {highlighted && (
        <div className="mb-4 inline-block px-3 py-1 bg-primary text-white rounded-full text-label">
          Most Popular
        </div>
      )}

      {/* Plan Name */}
      <h3 className="card-title mb-2">{name}</h3>

      {/* Price */}
      <div className="mb-6">
        <span className="text-3xl font-bold text-text-primary">
          {currency}
          {price}
        </span>
        <span className="text-text-secondary caption ml-2">{billing}</span>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check size={18} className="text-success flex-shrink-0 mt-1" />
            <span className="body text-text-secondary text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button
        onClick={onJoinClick}
        className={`w-full btn ${highlighted ? 'btn-primary' : 'btn-secondary'}`}
      >
        Join Now
      </button>
    </div>
  )
}

export const MembershipPlans: React.FC = () => {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Starter',
      price: 1499,
      currency: '₹',
      billing: 'Monthly',
      features: [
        'Gym access',
        'Basic equipment',
        'Member community',
        'Mobile app access',
      ],
    },
    {
      name: 'Pro',
      price: 3999,
      currency: '₹',
      billing: 'Quarterly',
      features: [
        'Everything in Starter',
        'Group classes',
        'Nutrition guidance',
        'Trainer consultation',
      ],
    },
    {
      name: 'Elite',
      price: 7499,
      currency: '₹',
      billing: 'Half Year',
      features: [
        'Everything in Pro',
        'Personal training (4/month)',
        'Fitness assessment',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      name: 'Ultimate',
      price: 13999,
      currency: '₹',
      billing: 'Annual',
      features: [
        'Everything in Elite',
        'Unlimited personal training',
        'Nutrition plan',
        'VIP lounge access',
      ],
    },
  ]

  return (
    <section id="memberships" className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">MEMBERSHIP PLANS</h2>
          <p className="body text-text-secondary max-w-2xl mx-auto">
            Choose the perfect plan for your fitness journey
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, i) => (
            <PlanCard
              key={i}
              {...plan}
              onJoinClick={() => navigate('/register')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
