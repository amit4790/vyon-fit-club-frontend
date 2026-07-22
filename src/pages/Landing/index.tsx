/**
 * Landing Page
 * Main landing page component that combines all sections
 */

import React from 'react'
import { LandingNavbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Stats } from './components/Stats'
import { About } from './components/About'
import { WhyChoose } from './components/WhyChoose'
import { MembershipPlans } from './components/MembershipPlans'
import { TrainingZones } from './components/TrainingZones'
import { PersonalTraining } from './components/PersonalTraining'
import { GroupTraining } from './components/GroupTraining'
import { CTABanner } from './components/CTABanner'
import { Testimonials } from './components/Testimonials'
import { FAQ } from './components/FAQ'
import { Contact } from './components/Contact'
import { LandingFooter } from './components/Footer'

const Landing: React.FC = () => {
  return (
    <div className="w-full bg-bg-primary overflow-hidden">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <Hero />

      {/* Statistics Section */}
      <Stats />

      {/* About Section */}
      <About />

      {/* Why Choose VYON */}
      <WhyChoose />

      {/* Membership Plans */}
      <MembershipPlans />

      {/* Training Zones */}
      <TrainingZones />

      {/* Personal Training */}
      <PersonalTraining />

      {/* Group Training */}
      <GroupTraining />

      {/* CTA Banner */}
      <CTABanner />

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Contact */}
      <Contact />

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}

export default Landing
