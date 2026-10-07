/**
 * CTA Banner Section
 * Compact call to action with banner image overlay
 */

import React from 'react'
import ctaBannerImage from '../../../assets/images/gym/cta-banner.png'
import { isGymStaff } from '../../../auth/authorization'
import { useEnquiryModal } from '../../../contexts/EnquiryModalContext'
import { AuthService } from '../../../services/auth'

export const CTABanner: React.FC = () => {
  const { openEnquiry } = useEnquiryModal()
  const showLeadForm = !isGymStaff(AuthService.getUserRole())

  return (
    <section className="landing-section relative min-h-[22rem] sm:min-h-[24rem] w-full overflow-hidden bg-[#121214]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${ctaBannerImage})`,
        }}
      />

      {/* Dark Overlay for Contrast */}
      <div className="absolute inset-0 bg-black/75" />

      {/* Content Container */}
      <div className="relative h-full min-h-[22rem] sm:min-h-[24rem] flex items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          
          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 leading-tight">
            YOUR STRONGEST SELF STARTS TODAY.
          </h2>

          {/* Tagline Accent */}
          <p className="text-xs sm:text-sm font-bold text-[#8B1E3F] tracking-[0.2em] uppercase mb-8">
            ELEVATE YOUR LIMITS
          </p>

          {/* Action Buttons */}
          {showLeadForm ? (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              type="button"
              onClick={() => openEnquiry({ intent: 'membership' })}
              className="bg-[#8B1E3F] hover:bg-[#8B1E3F]/90 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all shadow-md"
            >
              Enquire now
            </button>
            <button
              type="button"
              onClick={() => openEnquiry({ intent: 'personal_training' })}
              className="bg-transparent border border-white/30 hover:border-white/80 hover:bg-white/10 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Book a free assessment
            </button>
          </div>
          ) : null}

        </div>
      </div>
    </section>
  )
}