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
        <div className="mb-4 inline-block px-3 py-1 bg-primary text-text-secondary rounded-full text-label">
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
      name: 'VYON BASIC',
      price: 1800,
      currency: 'INR ',
      billing: '1 Month',
      features: [
        'Gym access during standard hours',
        'Cardio and strength zones',
        '1 onboarding session',
        'Locker support',
      ],
    },
    {
      name: 'VYON ADVANCE',
      price: 2800,
      currency: 'INR ',
      billing: '1 Month',
      features: [
        'Everything in BASIC',
        'Group classes',
        'Monthly body composition tracking',
        'Nutrition guidance',
      ],
    },
    {
      name: 'VYON PRO',
      price: 4200,
      currency: 'INR ',
      billing: '1 Month',
      features: [
        'Everything in ADVANCE',
        '2 personal training sessions/month',
        'Recovery consultation',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      name: 'Quarterly Variants',
      price: 5000,
      currency: 'INR ',
      billing: 'Starts from 3 Months',
      features: [
        'BASIC 3M, ADVANCE 3M, PRO 3M',
        'Lower effective monthly price',
        'Same benefits as monthly variants',
        'Best for continuity and consistency',
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
            Base prices shown below. GST at 5% is applied during checkout.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, i) => (
            <PlanCard
              key={i}
              {...plan}
              onJoinClick={() => navigate('/memberships')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

