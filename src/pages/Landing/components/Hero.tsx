/**
 * Hero Section
 * Full-screen hero with background image, premium typography and CTA
 * Refined for luxury brand aesthetic with visible background logo
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Star } from 'lucide-react'

export const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

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
          backgroundImage: 'url(/src/assets/images/gym/hero-interior.png)',
          backgroundPosition: 'center',
        }}
      />

      {/* Premium Dark Overlay - allows logo to show through */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

      {/* Content Container - absolute positioning below wall logo */}
      <div 
        className="absolute left-1/2 w-full px-4 md:px-6 flex flex-col items-center"
        style={{
          transform: 'translateX(-50%)',
          top: '62%',
        }}
      >
        {/* Tagline - positioned below logo space */}
        <div
          className={`text-center transform transition-all duration-1000 ${
            isLoaded
              ? 'translate-y-0 opacity-100'
              : 'translate-y-10 opacity-0'
          }`}
          style={{
            transitionDelay: '200ms',
            marginBottom: '40px',
            maxWidth: '700px',
          }}
        >
          <p className="text-xl md:text-2xl text-gray-100 leading-relaxed font-light tracking-wide">
            Train smarter. Build stronger.<br />
            Become your best version.
          </p>
        </div>

        {/* Premium CTA Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-8 justify-center transform transition-all duration-1000 ${
            isLoaded
              ? 'translate-y-0 opacity-100'
              : 'translate-y-8 opacity-0'
          }`}
          style={{
            transitionDelay: '400ms',
            marginBottom: '50px',
          }}
        >
          <button
            onClick={() => navigate('/register')}
            className="group relative px-8 py-4 md:px-10 md:py-5 bg-primary hover:bg-accent text-white font-semibold text-base rounded-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            Start Your Fitness Journey
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
          </button>
          <button
            onClick={() => navigate('/memberships')}
            className="group relative px-8 py-4 md:px-10 md:py-5 border-2 border-white text-white font-semibold text-base rounded-lg hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            Explore Memberships
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 rounded-lg transition-opacity" />
          </button>
        </div>

        {/* Trust Indicators - subtle, positioned below CTA */}
        <div
          className={`flex flex-col items-center gap-2 transform transition-all duration-1000 ${
            isLoaded
              ? 'translate-y-0 opacity-100'
              : 'translate-y-12 opacity-0'
          }`}
          style={{
            transitionDelay: '600ms',
            marginBottom: '40px',
          }}
        >
          {/* Rating and Stats in single line */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs md:text-sm text-gray-300 font-light">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-gray-200 font-light">4.9 Rating</span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span>500+ Active Members</span>
            <span className="hidden sm:inline text-gray-500">•</span>
            <span>Open Daily • 5 AM – 11 PM</span>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - absolute positioning at bottom of screen */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-1000 ${
          isLoaded ? 'opacity-70' : 'opacity-0'
        }`}
        style={{
          transitionDelay: '800ms',
        }}
      >
        <button
          onClick={() => scrollToSection('stats')}
          className="flex flex-col items-center gap-2 text-gray-300 hover:text-white transition-colors group"
        >
          <span className="text-xs caption opacity-70 group-hover:opacity-100 transition-opacity">
            Scroll to explore
          </span>
          <ChevronDown
            size={20}
            className="animate-bounce group-hover:text-accent transition-colors"
          />
        </button>
      </div>
    </section>
  )
}
