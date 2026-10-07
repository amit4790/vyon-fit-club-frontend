export interface LandingMembershipPlan {
  name: string
  tagline: string
  features: string[]
  highlighted?: boolean
}

export const LANDING_MEMBERSHIP_PLANS: LandingMembershipPlan[] = [
  {
    name: 'VYON BASIC',
    tagline: 'Essential access to train on your schedule.',
    features: [
      'Gym access during standard hours',
      'Cardio and strength zones',
      '1 onboarding session',
      'Locker support',
    ],
  },
  {
    name: 'VYON ADVANCE',
    tagline: 'More guidance, classes, and accountability.',
    highlighted: true,
    features: [
      'All Basic plan features +',
      'Group class access',
      'Monthly body composition tracking',
      'Nutrition guidance',
    ],
  },
  {
    name: 'VYON PRO',
    tagline: 'Premium coaching and recovery-focused perks.',
    features: [
      'All Advance plan features +',
      '1:1 personal training sessions',
      'Customized diet plan',
      'Green Tea / Black Coffee',
      'Passive Stretching',
      'Foot Reflexology',
    ],
  },
]
