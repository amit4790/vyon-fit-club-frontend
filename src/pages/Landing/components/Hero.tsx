/**
 * Hero Section
 * Full-screen hero with background image, premium typography and CTA
 * Refined for luxury brand aesthetic with visible background logo
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from 'lucide-react'
import { AuthService } from '../../../api/api'
import heroInteriorImage from '../../../assets/images/gym/hero-interior.png'

export const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()
  const role = AuthService.getUserRole()
  const hideLandingCtas = role === 'SUPER_ADMIN'

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section
      id="home"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Image with fade-in animation */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${heroInteriorImage})`,
          backgroundPosition: 'center',
        }}
      />

      {/* Premium Dark Overlay - allows logo to show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

      {/* Content Container - flex column fills from below logo to bottom edge */}
      {/* Content Container - flex column, scroll indicator removed */}
      <div
        className="absolute inset-x-0 mx-auto flex max-w-5xl flex-col items-center justify-center px-6"
        style={{
          top: '52%',
          bottom: '40px',
        }}
      >
        {/* Tagline */}
        <div
          className={`text-center transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: '200ms', marginBottom: '20px', maxWidth: '700px' }}
        >
          <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-light tracking-wide">
            Train smarter. Build stronger.<br />
            Become your best version.
          </p>
        </div>

        {!hideLandingCtas && (
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 ${
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: '400ms', marginBottom: '20px' }}
          >
            <button
              onClick={() => navigate('/register')}
              className="group relative px-8 py-4 md:px-10 md:py-5 bg-primary hover:bg-accent text-text-secondary font-semibold text-base rounded-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              Start Your Fitness Journey
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
            </button>
            <button
              onClick={() => navigate('/memberships')}
              className="group relative px-8 py-4 md:px-10 md:py-5 border-2 border-white text-text-secondary font-semibold text-base rounded-lg hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              Explore Memberships
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 rounded-lg transition-opacity" />
            </button>
          </div>
        )}

        {/* Trust Indicators */}
        <div
          className={`flex flex-col items-center gap-2 transform transition-all duration-1000 ${
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs md:text-sm text-gray-300 font-light">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-gray-200 font-light">4.9 Rating</span>
            <span className="hidden sm:inline text-gray-500">|</span>
            <span>500+ Active Members</span>
            <span className="hidden sm:inline text-gray-500">|</span>
            <span>Open Daily | 5 AM - 11 PM</span>
          </div>
        </div>
      </div>
    </section>
  )
}
