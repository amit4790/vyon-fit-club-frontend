/**
 * Membership Selection Page (Step 2 of Onboarding)
 * Choose membership plan - Matches Landing Page design
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { Check, ArrowLeft } from 'lucide-react'
import { LandingNavbar } from '../Landing/components/Navbar'
import { LandingFooter } from '../Landing/components/Footer'

interface MembershipPlan {
  id: string
  name: string
  price: number
  billing: string
  features: string[]
  isPopular?: boolean
}

interface CustomerInfo {
  fullName: string
  email: string
  phone: string
  age: string
  gender: string
  emergencyContact: string
  password: string
  confirmPassword: string
}

interface LocationState {
  customerInfo?: CustomerInfo
}

export default function Memberships() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const customerInfo = state?.customerInfo

  const plans: MembershipPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: 1499,
      billing: '/month',
      features: [
        'Gym Access',
        'Locker Access',
        'Fitness Assessment',
        'Mobile App Access',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 2499,
      billing: '/month',
      features: [
        'Everything in Starter',
        'Group Classes',
        'Diet Consultation',
        'Priority Support',
        'Nutrition Plan',
      ],
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 3999,
      billing: '/month',
      features: [
        'Everything in Premium',
        'Personal Trainer',
        'Body Composition Analysis',
        'Unlimited Group Classes',
        'Monthly Progress Review',
        'VIP Lounge Access',
      ],
      isPopular: true,
    },
  ]

  const handleSelectPlan = (plan: MembershipPlan) => {
    navigate('/payment', {
      state: {
        customerInfo,
        selectedPlan: plan,
      },
    })
  }

  return (
    <div className="w-full bg-bg-primary">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Registration</span>
          </button>

          {/* Page Header */}
          <section className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 tracking-tight">
              Choose Your Membership
            </h1>
            <p className="text-base text-text-secondary max-w-2xl mx-auto">
              Select the membership that best matches your fitness goals.
            </p>
          </section>

          {/* Membership Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-bg-card rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary overflow-hidden ${
                  plan.isPopular
                    ? 'md:scale-105 ring-2 ring-primary'
                    : 'border-border-light'
                }`}
              >
                {/* Most Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-8 inline-block px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full text-xs font-semibold z-10">
                    Most Popular
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary">
                        ₹{plan.price}
                      </span>
                      <span className="text-text-secondary text-sm">
                        {plan.billing}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={16} className="text-success flex-shrink-0 mt-1" />
                        <span className="text-text-secondary text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Plan Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 uppercase tracking-wide text-sm ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:-translate-y-0.5'
                        : 'border border-primary text-primary hover:bg-primary/10'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
