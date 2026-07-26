/**
 * Personal Training Section
 * Compact layout with refined colors and typography
 */

import React from 'react'
import { Check } from 'lucide-react'
import personalTrainingImage from '../../../assets/images/gym/personal-training.png'

export const PersonalTraining: React.FC = () => {
  const benefits = [
    'Personalized workout plans',
    'One-to-one coaching sessions',
    'Progress tracking and adjustments',
    'Nutritional counseling',
    'Form correction and safety guidance',
  ]

  return (
    <section id="trainers" className="landing-section bg-[#161618] text-white">
      <div className="landing-container">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Content Column */}
          <div>
            <h2 className="section-title tracking-wider uppercase text-neutral-100 mb-3">
              PERSONAL TRAINING
            </h2>
            <p className="body text-neutral-400 mb-6 leading-relaxed max-w-xl">
              Transform your fitness with dedicated one-to-one coaching. Our certified
              trainers work with you to create personalized programs that deliver
              real results while keeping you motivated throughout your journey.
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-7">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2.5 min-h-[2rem]">
                  <div className="w-4 h-4 rounded-full bg-[#8B1E3F]/20 border border-[#8B1E3F] flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-[#8B1E3F]" />
                  </div>
                  <span className="caption text-neutral-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button className="px-5 py-2.5 bg-[#8B1E3F] hover:bg-[#a3234a] text-white text-sm font-semibold rounded-lg transition-colors duration-300 shadow-md">
              Book Free Assessment
            </button>
          </div>

          {/* Image Column */}
          <div className="relative h-80 lg:h-[28rem] rounded-xl overflow-hidden border border-neutral-800 shadow-lg">
            <img
              src={personalTrainingImage}
              alt="Personal Training"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161618]/60 via-transparent to-transparent" />
          </div>

        </div>
      </div>
    </section>
  )
}