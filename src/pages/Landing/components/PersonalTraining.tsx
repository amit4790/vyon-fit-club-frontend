/**
 * Personal Training Section
 * Personal coaching benefits
 */

import React from 'react'
import { Check } from 'lucide-react'

export const PersonalTraining: React.FC = () => {
  const benefits = [
    'Personalized workout plans',
    'One-to-one coaching sessions',
    'Progress tracking and adjustments',
    'Nutritional counseling',
    'Form correction and safety guidance',
  ]

  return (
    <section className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="section-title mb-6">PERSONAL TRAINING</h2>
            <p className="body mb-8 text-text-secondary">
              Transform your fitness with dedicated one-to-one coaching. Our certified
              trainers work with you to create personalized programs that deliver
              real results while keeping you motivated throughout your journey.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check size={14} className="text-text-secondary" />
                  </div>
                  <span className="body">{benefit}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary">Book Free Assessment</button>
          </div>

          {/* Image */}
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="/src/assets/images/gym/personal-training.png"
              alt="Personal Training"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-20" />
          </div>
        </div>
      </div>
    </section>
  )
}

