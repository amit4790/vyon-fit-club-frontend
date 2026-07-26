/**
 * Registration Page (Step 1 of Onboarding)
 * Collect customer information only
 * Matches Landing Page design system
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { LandingNavbar } from '../Landing/components/Navbar'
import { LandingFooter } from '../Landing/components/Footer'

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

export default function Registration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CustomerInfo>({
    fullName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    emergencyContact: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name as keyof CustomerInfo]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
    if (!formData.age.trim()) newErrors.age = 'Age is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.emergencyContact.trim())
      newErrors.emergencyContact = 'Emergency contact is required'
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (validateForm()) {
      navigate('/memberships', {
        state: { customerInfo: formData },
      })
    }
  }

  return (
    <div className="relative w-full bg-bg-primary overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute top-32 right-[-7rem] h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      {/* Navigation */}
      <LandingNavbar />

      {/* Main Content */}
      <main className="relative pt-20 pb-12">
        <div className="max-w-lg mx-auto px-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              Create Your Account
            </h1>
            <p className="text-base text-text-secondary">
              Join VYON Fit Club and begin your fitness journey.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-bg-card/95 backdrop-blur-sm rounded-xl p-5 border border-border-light shadow-card">
            <form className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-text-primary font-medium text-sm mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full px-3 py-2 bg-bg-secondary border ${
                    errors.fullName ? 'border-red-500' : 'border-border-light'
                  } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-text-primary font-medium text-sm mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={`w-full px-3 py-2 bg-bg-secondary border ${
                    errors.email ? 'border-red-500' : 'border-border-light'
                  } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-text-primary font-medium text-sm mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`w-full px-3 py-2 bg-bg-secondary border ${
                    errors.phone ? 'border-red-500' : 'border-border-light'
                  } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.phone}</p>
                )}
              </div>

              {/* Age and Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <label className="block text-text-primary font-medium text-sm mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    min="13"
                    max="120"
                    className={`w-full px-3 py-2 bg-bg-secondary border ${
                      errors.age ? 'border-red-500' : 'border-border-light'
                    } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                  />
                  {errors.age && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.age}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-text-primary font-medium text-sm mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 bg-bg-secondary border ${
                      errors.gender ? 'border-red-500' : 'border-border-light'
                    } h-10 rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.gender}</p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-text-primary font-medium text-sm mb-1.5">
                  Emergency Contact (Name & Number)
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="John Doe - 98765 43210"
                  className={`w-full px-3 py-2 bg-bg-secondary border ${
                    errors.emergencyContact
                      ? 'border-red-500'
                      : 'border-border-light'
                  } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                />
                {errors.emergencyContact && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.emergencyContact}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-text-primary font-medium text-sm mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`w-full px-3 py-2 bg-bg-secondary border ${
                    errors.password ? 'border-red-500' : 'border-border-light'
                  } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-0.5">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-text-primary font-medium text-sm mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`w-full px-3 py-2 bg-bg-secondary border ${
                    errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-border-light'
                  } h-10 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-0.5">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-accent text-text-secondary font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide text-sm mt-4"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}

