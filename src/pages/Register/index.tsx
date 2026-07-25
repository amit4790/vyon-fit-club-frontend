/**
 * Registration Page
 * User registration with selected membership plan
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LandingNavbar } from '../Landing/components/Navbar'
import { LandingFooter } from '../Landing/components/Footer'

interface MembershipPlan {
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

interface LocationState {
  selectedPlan?: MembershipPlan
}

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const selectedPlan = state?.selectedPlan

  return (
    <div className="w-full bg-bg-primary">
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/memberships')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Plans</span>
          </button>

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Create Your Account
            </h1>
            <p className="text-xl text-text-secondary">
              Join VYON Fit Club and start your transformation journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-border-light">
                <form className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 bg-gray-700 border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-gray-700 border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 bg-gray-700 border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 bg-gray-700 border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-text-primary font-medium mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 bg-gray-700 border border-border-light rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 accent-primary"
                    />
                    <label htmlFor="terms" className="text-text-secondary text-sm">
                      I agree to the Terms & Conditions and Privacy Policy
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary to-accent text-text-secondary font-semibold rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 uppercase tracking-wide"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            </div>

            {/* Selected Plan Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-primary h-fit sticky top-32">
                <h3 className="text-xl font-bold text-text-primary mb-6">
                  Order Summary
                </h3>

                {selectedPlan ? (
                  <>
                    {/* Plan Details */}
                    <div className="mb-6 pb-6 border-b border-border-light">
                      <p className="text-text-secondary text-sm mb-2">Selected Plan</p>
                      <h4 className="text-2xl font-bold text-primary mb-2">
                        {selectedPlan.name}
                      </h4>
                      <p className="text-text-secondary text-sm mb-2">
                        {selectedPlan.variant || selectedPlan.duration_label}
                      </p>
                      <p className="text-text-secondary text-sm">
                        {selectedPlan.features.length} features included
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 pb-6 border-b border-border-light">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">
                          INR {selectedPlan.base_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-text-secondary">/{selectedPlan.duration_label.toLowerCase()}</span>
                      </div>
                      <p className="text-text-secondary text-xs mt-2">GST {selectedPlan.tax_percent}% applies at checkout</p>
                    </div>

                    {/* Key Features */}
                    <div className="mb-6">
                      <p className="text-text-secondary text-sm mb-3 font-semibold">
                        Includes:
                      </p>
                      <ul className="space-y-2">
                        {selectedPlan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-text-secondary text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">+</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Change Plan Link */}
                    <button
                      onClick={() => navigate('/memberships')}
                      className="w-full py-2 px-4 text-primary hover:text-accent border border-primary hover:bg-primary/10 rounded-lg transition-all text-sm font-medium"
                    >
                      Change Plan
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">
                      No plan selected. Please choose a plan first.
                    </p>
                    <button
                      onClick={() => navigate('/memberships')}
                      className="w-full py-2 px-4 bg-primary text-text-secondary rounded-lg hover:bg-accent transition-all"
                    >
                      Select a Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}

