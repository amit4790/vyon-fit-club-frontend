/**
 * About Section
 * Facility overview with image and content styled to match dark charcoal theme
 */

import React from 'react'
import { Check } from 'lucide-react'

export const About: React.FC = () => {
  const features = [
    'Premium Equipment',
    'Spacious Workout Areas',
    'Certified Trainers',
    'Functional Training Zone',
    'Cardio Zone',
    '24/7 Access Available',
  ]

  return (
    <section id="about" className="landing-section bg-bg-primary text-white">
      <div className="landing-container">
        
        {/* Title */}
        <div className="landing-header">
          <h2 className="section-title tracking-wider uppercase text-neutral-100 mb-3">
            OUR FACILITY
          </h2>
          <p className="landing-subtitle text-neutral-400 max-w-3xl">
            Experience a world-class fitness environment designed for champions.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Image Column */}
          <div className="relative h-80 lg:h-[28rem] rounded-xl overflow-hidden border border-neutral-800 shadow-lg">
            <img
              src="/src/assets/images/gym/facility-overview.png"
              alt="Facility Overview"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F11]/60 via-transparent to-transparent opacity-40" />
          </div>

          {/* Content Column */}
          <div>
            <h3 className="card-title text-neutral-100 mb-3">
              Premium Fitness Experience
            </h3>
            <p className="body text-neutral-400 mb-7 leading-relaxed">
              At VYON FIT CLUB, we believe exceptional fitness begins with exceptional
              facilities. Our state-of-the-art gym combines cutting-edge equipment
              with a welcoming, professional atmosphere.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
              {features.map((feature) => (
                <div 
                  key={feature} 
                  className="flex items-center gap-2.5 p-3 bg-[#1F1F22] border border-neutral-800/80 rounded-lg min-h-[3.25rem]"
                >
                  <div className="w-4 h-4 rounded-full bg-[#8B1E3F]/20 border border-[#8B1E3F] flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-[#8B1E3F]" />
                  </div>
                  <span className="caption text-neutral-300 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className="px-5 py-2.5 bg-[#8B1E3F] hover:bg-[#a3234a] text-white text-sm font-semibold rounded-lg transition-colors duration-300 shadow-md">
              Learn More
            </button>
          </div>

        </div>

      </div>
    </section>
  )
}