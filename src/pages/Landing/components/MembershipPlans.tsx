/**
 * Membership Plans Section
 * Premium "Starting From" pricing using original card layout
 */

import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { ApiErrorHandler } from '../../../api/errors'
import { adminService } from '../../../services/adminService'
import { PlanFamilyRecord } from '../../../types'

interface PlanProps {
  name: string
  price: string
  billing: string
  features: string[]
  highlighted?: boolean
  onJoinClick?: () => void
}

const PlanCard: React.FC<PlanProps> = ({
  name,
  price,
  billing,
  features,
  highlighted = false,
  onJoinClick,
}) => {
  return (
    <div
      className={`card flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover ${
        highlighted ? 'ring-2 ring-primary scale-105' : ''
      }`}
    >
      <div>
        {/* Highlight Badge */}
        {highlighted ? (
          <div className="mb-4 inline-block px-3 py-1 bg-primary text-text-secondary rounded-full text-label">
            Most Popular
          </div>
        ) : (
          <div className="h-9" /> /* Spacer to align card tops */
        )}

        {/* Plan Name */}
        <h3 className="card-title mb-2">{name}</h3>

        {/* Starting Price Header */}
        <p className="text-xs text-text-secondary uppercase font-medium mb-1">
          Starts From
        </p>
        {/* Price Block */}
        <div className="mb-6">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-text-primary">{price}</span>
            <span className="text-text-secondary caption ml-2">{billing}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1.5 font-medium">+ GST</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check size={18} className="text-success flex-shrink-0 mt-0.5" />
              <span className="body text-text-secondary text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
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
  const [families, setFamilies] = useState<PlanFamilyRecord[]>([])

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await adminService.getPlanCatalog()
        setFamilies(response.data)
      } catch (err) {
        // Keep this section resilient; hide cards only when API fails.
        ApiErrorHandler.parse(err)
        setFamilies([])
      }
    }

    loadPlans()
  }, [])

  const plans = useMemo(() => {
    return families.map((family, index) => {
      const sortedOptions = [...family.options].sort((a, b) => a.base_price - b.base_price)
      const cheapest = sortedOptions[0]

      return {
        name: family.family,
        price: cheapest ? `INR ${Math.round(cheapest.base_price).toLocaleString('en-IN')}` : 'INR 0',
        billing: cheapest ? ` per ${cheapest.duration_label.toLowerCase()}` : '',
        features: family.includes,
        highlighted: index === 1,
      }
    })
  }, [families])

  return (
    <section id="memberships" className="landing-section bg-bg-primary">
      <div className="landing-container">
        {/* Title Header */}
        <div className="landing-header">
          <h2 className="section-title mb-3 tracking-wider">MEMBERSHIP PLANS</h2>
          <p className="landing-subtitle">
            Choose the level of guidance and luxury suited for your fitness journey.
          </p>
        </div>

        {/* 3-Column Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
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