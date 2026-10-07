import React, { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { Input } from './Input'
import { Button } from './Button'
import { ApiErrorHandler } from '../api/errors'
import { publicService, type EnquiryIntent } from '../services/publicService'

interface EnquiryModalProps {
  isOpen: boolean
  onClose: () => void
  intent: EnquiryIntent
  planInterest?: string
  title?: string
  subtitle?: string
}

const defaultCopy: Record<
  EnquiryIntent,
  { title: string; subtitle: string }
> = {
  membership: {
    title: 'Enquire about membership',
    subtitle: 'Share your details and our team will contact you with current plans and offers.',
  },
  personal_training: {
    title: 'Book a free assessment',
    subtitle: 'Tell us how to reach you and we will schedule your personal training consultation.',
  },
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  intent,
  planInterest,
  title,
  subtitle,
}) => {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setSuccess(null)
      setIsSubmitting(false)
      return
    }
    setFullName('')
    setPhone('')
    setEmail('')
    setError(null)
    setSuccess(null)
  }, [isOpen, intent, planInterest])

  const copy = defaultCopy[intent]
  const heading =
    title ||
    (planInterest ? `Enquire about ${planInterest}` : copy.title)
  const description = subtitle || copy.subtitle

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    const trimmedName = fullName.trim()
    const trimmedPhone = phone.replace(/\D/g, '')
    if (!trimmedName) {
      setError('Please enter your name.')
      return
    }
    if (trimmedPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await publicService.submitEnquiry({
        full_name: trimmedName,
        phone_number: trimmedPhone,
        email: email.trim() || undefined,
        intent,
        plan_interest: planInterest,
      })
      setSuccess(response.message)
    } catch (err) {
      const apiError = ApiErrorHandler.parse(err)
      setError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={heading}
      size="md"
      footer={
        success ? (
          <Button type="button" onClick={onClose}>Close</Button>
        ) : (
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" form="website-enquiry-form" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        )
      }
    >
      {success ? (
        <p className="text-text-secondary">{success}</p>
      ) : (
        <form id="website-enquiry-form" onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-text-secondary">{description}</p>
          <Input
            label="Full name"
            name="full_name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
          <Input
            label="Mobile number"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile"
          />
          <Input
            label="Email (optional)"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </Modal>
  )
}
