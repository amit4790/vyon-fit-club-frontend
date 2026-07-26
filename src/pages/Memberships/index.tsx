/**
 * Membership Selection Page (Step 2 of Onboarding)
 * Choose membership plan - Matches Landing Page design
 */

import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApiErrorHandler } from '../../api/errors'
import { LandingNavbar } from '../Landing/components/Navbar'
import { LandingFooter } from '../Landing/components/Footer'
import { adminService } from '../../services/adminService'
import { PlanFamilyRecord } from '../../types'
import { formatCurrency, formatPlanDurationSuffix } from '../../utils/format'

interface MembershipSelection {
  plan_id: number
  family: string
  name: string
  variant: string | null
  duration_label: string
  features: string[]
  base_price: number
  tax_percent: number
  tax_amount: number
  total_price: number
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
  const [plans, setPlans] = useState<PlanFamilyRecord[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoadingPlans(true)
        setLoadError(null)
        const response = await adminService.getPlanCatalog()
        setPlans(response.data)
      } catch (err: any) {
        const apiError = ApiErrorHandler.parse(err)
        setLoadError(apiError.message)
      } finally {
        setIsLoadingPlans(false)
      }
    }

    loadPlans()
  }, [])

  const getFamilyOrder = (name: string): number => {
    const normalized = name.toUpperCase()
    if (normalized.includes('BASIC')) return 1
    if (normalized.includes('ADVANCE')) return 2
    if (normalized.includes('PRO')) return 3
    return 99
  }

  const rewriteFeatures = (familyName: string, features: string[]): string[] => {
    const normalized = familyName.toUpperCase()
    if (normalized.includes('BASIC')) {
      return [
        'Gym access during standard hours',
        'Cardio and strength zones',
        '1 onboarding session',
        'Locker support',
      ]
    }
    if (normalized.includes('ADVANCE')) {
      return [
        'All Basic plan features +',
        'Group class access',
        'Monthly body composition tracking',
        'Nutrition guidance',
      ]
    }
    if (normalized.includes('PRO')) {
      return [
        'All Advance plan features +',
        '1:1 personal training sessions',
        'Customized diet plan',
        'Green Tea / Black Coffee',
        'Passive Stretching',
        'Foot Reflexology',
      ]
    }
    return features
  }

  const allOptions = useMemo(() => {
    const mapped: MembershipSelection[] = []
    const orderedFamilies = [...plans].sort((a, b) => getFamilyOrder(a.family) - getFamilyOrder(b.family))
    orderedFamilies.forEach((family, familyIndex) => {
      family.options.forEach((option, optionIndex) => {
        mapped.push({
          plan_id: option.id,
          family: family.family,
          name: family.family,
          variant: option.variant,
          duration_label: option.duration_label,
          features: rewriteFeatures(family.family, family.includes),
          base_price: option.base_price,
          tax_percent: option.tax_percent,
          tax_amount: option.tax_amount,
          total_price: option.total_price,
          isPopular: familyIndex === 1 && optionIndex === 1,
        })
      })
    })
    return mapped
  }, [plans])

  const handleSelectPlan = (plan: MembershipSelection) => {
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
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-6">
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
              Select a plan. Prices shown are tax-exclusive and GST is added at checkout.
            </p>
          </section>

          {isLoadingPlans && (
            <p className="text-center text-text-secondary py-10">Loading membership plans...</p>
          )}

          {loadError && !isLoadingPlans && (
            <div className="text-center py-10">
              <p className="text-red-600 mb-4">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoadingPlans && !loadError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allOptions.map((plan) => (
              <div
                key={plan.plan_id}
                className={`relative bg-bg-card rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-primary overflow-hidden ${
                  plan.isPopular
                    ? 'md:scale-[1.02] ring-2 ring-primary'
                    : 'border-border-light'
                }`}
              >
                {/* Most Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-8 inline-block px-3 py-1 bg-gradient-to-r from-primary to-accent text-text-secondary rounded-full text-xs font-semibold z-10">
                    Most Popular
                  </div>
                )}

                <div className="p-6 flex flex-col h-full">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-text-primary mb-3">
                    {plan.name}
                  </h3>
                  <p className="text-text-secondary text-sm mb-3">{plan.variant || plan.duration_label}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary">
                        {formatCurrency(plan.base_price)}
                      </span>
                      <span className="text-text-secondary text-sm">
                        {formatPlanDurationSuffix(plan.duration_label)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">
                      + GST {plan.tax_percent}% at checkout
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-text-secondary text-sm">
                          • {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Select Plan Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 uppercase tracking-wide text-sm ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-primary to-accent text-text-secondary hover:shadow-lg hover:-translate-y-0.5'
                        : 'border border-primary text-primary hover:bg-primary/10'
                    }`}
                  >
                    Select Plan
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}

