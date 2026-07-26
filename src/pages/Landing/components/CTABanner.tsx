/**
 * CTA Banner Section
 * Compact call to action with banner image overlay
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CTABanner: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section className="landing-section relative min-h-[22rem] sm:min-h-[24rem] w-full overflow-hidden bg-[#121214]">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/src/assets/images/gym/cta-banner.png)',
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-[#8B1E3F] hover:bg-[#8B1E3F]/90 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all shadow-md"
            >
              Become a Member
            </button>
            <button
              onClick={() => navigate('/memberships')}
              className="bg-transparent border border-white/30 hover:border-white/80 hover:bg-white/10 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Book a Trial Session
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}