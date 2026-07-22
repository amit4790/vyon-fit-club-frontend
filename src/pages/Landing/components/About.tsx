/**
 * About Section
 * Facility overview with image and content
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
    <section id="about" className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">OUR FACILITY</h2>
          <p className="body text-text-secondary max-w-2xl mx-auto">
            Experience a world-class fitness environment designed for champions
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="/src/assets/images/gym/facility-overview.png"
              alt="Facility Overview"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-20" />
          </div>

          {/* Content */}
          <div>
            <h3 className="card-title mb-6">Premium Fitness Experience</h3>
            <p className="body mb-8 text-text-secondary">
              At VYON FIT CLUB, we believe exceptional fitness begins with exceptional
              facilities. Our state-of-the-art gym combines cutting-edge equipment
              with a welcoming, professional atmosphere.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check size={16} className="text-white" />
                  </div>
                  <span className="body">{feature}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-primary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
  )
}
