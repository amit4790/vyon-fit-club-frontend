/**
 * Payment Page (Step 3 of Onboarding)
 * Order summary and payment method selection - Matches Landing Page design
 */

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { ApiErrorHandler } from '../../api/errors'
import { adminService } from '../../services/adminService'
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
  selectedPlan?: MembershipPlan
}

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const customerInfo = state?.customerInfo
  const selectedPlan = state?.selectedPlan

  const [paymentMethod, setPaymentMethod] = useState<string>('card')
  const [paymentSuccessful, setPaymentSuccessful] = useState(false)
  const [transactionId, setTransactionId] = useState<string>('')
  const [invoiceId, setInvoiceId] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [checkoutNote, setCheckoutNote] = useState<string | null>(null)

  // Redirect to register if no data
  useEffect(() => {
    if (!customerInfo || !selectedPlan) {
      navigate('/register')
    }
  }, [customerInfo, selectedPlan, navigate])

  const gst = selectedPlan?.tax_amount || 0
  const totalAmount = selectedPlan?.total_price || 0

  const buildDateOfBirth = (ageText: string): string | undefined => {
    const age = Number(ageText)
    if (!Number.isFinite(age) || age <= 0) {
      return undefined
    }

    const today = new Date()
    const dob = new Date(today.getFullYear() - age, today.getMonth(), today.getDate())
    return dob.toISOString().slice(0, 10)
  }

  const handlePayNow = async () => {
    if (!customerInfo || !selectedPlan) {
      return
    }

    try {
      setIsProcessing(true)
      setPaymentError(null)
      let memberId: number

      try {
        const memberResponse = await adminService.createMember({
          full_name: customerInfo.fullName,
          mobile_number: customerInfo.phone,
          joining_date: new Date().toISOString().slice(0, 10),
          status: 'active',
          email: customerInfo.email,
          gender:
            customerInfo.gender === 'male' ||
            customerInfo.gender === 'female' ||
            customerInfo.gender === 'other'
              ? customerInfo.gender
              : undefined,
          date_of_birth: buildDateOfBirth(customerInfo.age),
          emergency_contact: customerInfo.emergencyContact,
          emergency_phone: customerInfo.emergencyContact,
          notes: `Registered via public flow using ${paymentMethod} payment option (demo).`,
        })
        memberId = memberResponse.data.id
      } catch (createErr: any) {
        const createApiError = ApiErrorHandler.parse(createErr)
        if (createApiError.status !== 409) {
          throw createErr
        }

        const existingMembers = await adminService.getMembers({
          page: 1,
          pageSize: 20,
          search: customerInfo.phone,
        })
        const existingMember = existingMembers.data.find(
          (member) => member.mobile_number === customerInfo.phone
        )

        if (!existingMember) {
          throw createErr
        }

        memberId = existingMember.id
        setCheckoutNote('Existing member profile reused for this checkout.')
      }

      try {
        await adminService.assignSubscription(memberId, {
          plan_id: selectedPlan.plan_id,
          start_date: new Date().toISOString().slice(0, 10),
        })
      } catch (assignErr: any) {
        const assignApiError = ApiErrorHandler.parse(assignErr)
        if (assignApiError.status !== 409) {
          throw assignErr
        }
        setCheckoutNote('An active subscription already existed, so payment was applied to the latest invoice.')
      }

      const subscriptionsResponse = await adminService.getMemberSubscriptions(memberId)
      const latestSubscription = subscriptionsResponse.data[0]

      const invoiceResponse = await adminService.getInvoices({
        page: 1,
        pageSize: 20,
        memberId,
      })

      const targetInvoice = invoiceResponse.data.find(
        (invoice) =>
          invoice.status !== 'paid' &&
          (!latestSubscription || invoice.subscription_id === latestSubscription.id)
      ) || invoiceResponse.data[0]

      if (targetInvoice) {
        await adminService.updateInvoiceStatus(targetInvoice.id, 'paid')
        setInvoiceId(targetInvoice.id)
      }

      const generatedTxnId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`
      setTransactionId(generatedTxnId)
      setPaymentSuccessful(true)

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setPaymentError(apiError.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!customerInfo || !selectedPlan) {
    return null
  }

  if (paymentSuccessful) {
    return (
      <div className="w-full bg-bg-primary min-h-screen flex flex-col">
        <LandingNavbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-md mx-auto px-4">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-pulse">
                <Check size={40} className="text-text-secondary" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-text-primary mb-3">
                Payment Successful
              </h1>
              <p className="text-base text-text-secondary mb-6">
                Welcome to VYON Fit Club!
              </p>

              {/* Transaction Details */}
              <div className="bg-bg-card rounded-xl p-6 border border-border-light space-y-4">
                <div className="border-b border-border-light pb-3">
                  <p className="text-text-secondary text-xs mb-1">Transaction ID</p>
                  <p className="text-primary font-mono text-sm font-semibold break-all">
                    {transactionId}
                  </p>
                </div>

                {invoiceId && (
                  <div className="border-b border-border-light pb-3">
                    <p className="text-text-secondary text-xs mb-1">Invoice ID</p>
                    <p className="text-primary font-mono text-sm font-semibold break-all">
                      #{invoiceId}
                    </p>
                  </div>
                )}

                {checkoutNote && (
                  <div className="border-b border-border-light pb-3">
                    <p className="text-text-secondary text-xs mb-1">Checkout Note</p>
                    <p className="text-text-secondary text-xs">{checkoutNote}</p>
                  </div>
                )}

                <div className="border-b border-border-light pb-3">
                  <p className="text-text-secondary text-xs mb-1">Membership</p>
                  <p className="text-text-primary font-semibold text-base">
                    {selectedPlan.name}
                  </p>
                  <p className="text-text-secondary text-xs mt-1">
                    {selectedPlan.variant || selectedPlan.duration_label}
                  </p>
                </div>

                <div className="pb-3">
                  <p className="text-text-secondary text-xs mb-1">Amount Paid</p>
                  <p className="text-primary font-semibold text-lg">
                    INR {totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Redirecting Message */}
              <p className="text-text-secondary text-xs mt-6 animate-pulse">
                Redirecting to login in 2 seconds...
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="w-full bg-bg-primary">
      <LandingNavbar />

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/memberships', { state: { customerInfo } })}
            className="flex items-center gap-2 text-primary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Membership</span>
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
              Complete Your Payment
            </h1>
            <p className="text-base text-text-secondary">
              Review your order and choose a payment method
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods and Customer Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-bg-card rounded-xl p-6 border border-border-light">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Full Name</p>
                    <p className="text-text-primary font-semibold">
                      {customerInfo.fullName}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Email</p>
                    <p className="text-text-primary font-semibold">
                      {customerInfo.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Phone</p>
                    <p className="text-text-primary font-semibold">
                      {customerInfo.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs mb-1">Age</p>
                    <p className="text-text-primary font-semibold">
                      {customerInfo.age} years
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-bg-card rounded-xl p-6 border border-border-light">
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {[
                    { id: 'card', label: 'Credit or Debit Card' },
                    { id: 'upi', label: 'UPI' },
                    { id: 'netbanking', label: 'Net Banking' },
                    { id: 'cash', label: 'Cash at Gym' },
                  ].map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-3 border border-border-light rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-text-primary font-medium flex-1 text-sm">
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-bg-card rounded-xl p-6 border-2 border-primary h-fit sticky top-24">
                <h3 className="text-lg font-bold text-text-primary mb-5">
                  Order Summary
                </h3>

                {/* Plan Details */}
                <div className="mb-4 pb-4 border-b border-border-light">
                  <p className="text-text-secondary text-xs mb-1">Plan</p>
                  <h4 className="text-xl font-bold text-primary mb-1">
                    {selectedPlan.name}
                  </h4>
                  <p className="text-text-secondary text-xs mb-1">
                    {selectedPlan.variant || selectedPlan.duration_label}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {selectedPlan.features.length} features included
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4 pb-4 border-b border-border-light">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">Price</span>
                    <span className="text-text-primary font-semibold">
                      INR {selectedPlan.base_price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary">GST ({selectedPlan.tax_percent}%)</span>
                    <span className="text-text-primary font-semibold">
                      INR {gst.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6 pb-6 border-b border-border-light">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-primary">
                      Total Amount
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      INR {totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {paymentError && (
                  <p className="text-red-600 text-xs mb-3">{paymentError}</p>
                )}

                {/* Pay Now Button */}
                <button
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-primary to-accent text-text-secondary font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wide text-sm"
                >
                  {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>

                {/* Info Text */}
                <p className="text-text-secondary text-xs text-center mt-3">
                  This is a demo. Payment won't be charged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

