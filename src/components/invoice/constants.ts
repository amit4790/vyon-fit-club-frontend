import logoImage from '../../assets/images/logo/vyon-logo.jpg'
import { GymProfile } from './types'

export const DEFAULT_INVOICE_RULES: string[] = [
  'Fees once paid are non-refundable and are required to be paid in advance at the time of enrollment.',
  'Partial approval strictly requires prior management approval for the same billing cycle.',
  'Gym equipment must be used carefully. Any damage caused due to misuse may be charged to the member.',
  'Any behavior that affects staff, members, or gym property may result in temporary or permanent suspension.',
  'Members should consult a physician before joining and are responsible for disclosing relevant medical history.',
  'Membership can be paused only in approved cases with valid supporting documents.',
  'Discounted or complimentary months cannot be paused, carried forward, or converted to cash.',
  'Liability Disclaimer: By paying this invoice or utilizing our facilities, the client acknowledges the inherent risks of physical activity and agrees that Vyon Fit Club is not liable for any personal injuries, accidents, or health complications sustained on the premises.',
]

export const DEFAULT_GYM_PROFILE: GymProfile = {
  gymName: import.meta.env.VITE_GYM_NAME || 'VYON Fit Club',
  address: import.meta.env.VITE_GYM_ADDRESS || 'Address: Update from business profile',
  email: import.meta.env.VITE_GYM_EMAIL || 'Email: info@vyonfitclub.com',
  phone: import.meta.env.VITE_GYM_PHONE || 'Phone: +91 00000 00000',
  gstNumber: import.meta.env.VITE_GYM_GST_NUMBER || 'GST No.: Applied For',
  panNumber: import.meta.env.VITE_GYM_PAN_NUMBER || 'PAN No.: Applied For',
  logoUrl: import.meta.env.VITE_GYM_LOGO_URL || logoImage,
}
