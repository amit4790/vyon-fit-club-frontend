/**
 * CTA Banner Section
 * Call to action with banner image
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

export const CTABanner: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section className="relative h-80 w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/src/assets/images/gym/cta-banner.png)',
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            YOUR STRONGEST SELF STARTS TODAY.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="btn btn-primary px-8 py-3"
            >
              Become a Member
            </button>
            <button
              onClick={() => navigate('/memberships')}
              className="btn btn-outline px-8 py-3"
            >
              Book a Trial Session
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
