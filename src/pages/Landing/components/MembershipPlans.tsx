/**
 * Membership Plans Section — public marketing (no prices, enquire on card).
 */

import React from 'react'
import { isGymStaff } from '../../../auth/authorization'
import { useEnquiryModal } from '../../../contexts/EnquiryModalContext'
import { AuthService } from '../../../services/auth'
import { LANDING_MEMBERSHIP_PLANS } from '../../../data/landingMembershipPlans'

interface PlanCardProps {
  name: string
  tagline: string
  features: string[]
  highlighted?: boolean
  onEnquire: () => void
  showEnquire: boolean
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  tagline,
  features,
  highlighted = false,
  onEnquire,
  showEnquire,
}) => (
  <div
    className={`card flex flex-col justify-between transition-all duration-300 hover:shadow-card-hover ${
      highlighted ? 'ring-2 ring-primary scale-105' : ''
    }`}
  >
    <div>
      {highlighted ? (
        <div className="mb-4 inline-block px-3 py-1 bg-primary text-text-secondary rounded-full text-label">
          Most Popular
        </div>
      ) : (
        <div className="h-9" />
      )}

      <h3 className="card-title mb-2">{name}</h3>
      <p className="text-sm text-text-secondary mb-6">{tagline}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="body text-text-secondary text-sm">• {feature}</span>
          </li>
        ))}
      </ul>
    </div>

    {showEnquire ? (
      <button
        type="button"
        onClick={onEnquire}
        className={`w-full btn ${highlighted ? 'btn-primary' : 'btn-secondary'}`}
      >
        Enquire now
      </button>
    ) : null}
  </div>
)

export const MembershipPlans: React.FC = () => {
  const { openEnquiry } = useEnquiryModal()
  const showEnquire = !isGymStaff(AuthService.getUserRole())

  return (
    <section id="memberships" className="landing-section bg-bg-primary">
      <div className="landing-container">
        <div className="landing-header">
          <h2 className="section-title mb-3 tracking-wider">MEMBERSHIP PLANS</h2>
          <p className="landing-subtitle max-w-2xl mx-auto">
            Compare benefits and choose the level of guidance that fits your goals. Our team
            will share current offers when you enquire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {LANDING_MEMBERSHIP_PLANS.map((plan) => (
            <PlanCard
              key={plan.name}
              {...plan}
              showEnquire={showEnquire}
              onEnquire={() =>
                openEnquiry({
                  intent: 'membership',
                  planInterest: plan.name,
                })
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}
