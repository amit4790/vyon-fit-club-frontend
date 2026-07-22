/**
 * Training Zones Gallery
 * Premium gallery of training areas
 */

import React from 'react'
import { Zap } from 'lucide-react'

interface ZoneCardProps {
  title: string
  description: string
  image: string
}

const ZoneCard: React.FC<ZoneCardProps> = ({ title, description, image }) => {
  return (
    <div className="group relative h-80 rounded-lg overflow-hidden cursor-pointer">
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent group-hover:via-black/50 transition-all duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
          {description}
        </p>
      </div>
    </div>
  )
}

export const TrainingZones: React.FC = () => {
  const zones = [
    {
      title: 'Strength Zone',
      description: 'Premium equipment for building muscle and power',
      image: '/src/assets/images/gym/strength-zone.png',
    },
    {
      title: 'Functional Zone',
      description: 'Specialized area for functional training programs',
      image: '/src/assets/images/gym/functional-zone.png',
    },
    {
      title: 'Cardio Zone',
      description: 'State-of-the-art cardio equipment and machines',
      image: '/src/assets/images/gym/cardio-zone.png',
    },
  ]

  return (
    <section id="gallery" className="py-20 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">TRAINING ZONES</h2>
          <p className="body text-text-secondary max-w-2xl mx-auto">
            Explore our premium training facilities
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {zones.map((zone, i) => (
            <ZoneCard key={i} {...zone} />
          ))}
        </div>
      </div>
    </section>
  )
}
