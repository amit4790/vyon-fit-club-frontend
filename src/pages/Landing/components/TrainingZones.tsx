/**
 * Training Zones Gallery
 * Premium gallery of training areas
 */

import React from 'react'
import cardioZoneImage from '../../../assets/images/gym/cardio-zone.png'
import functionalZoneImage from '../../../assets/images/gym/functional-zone.png'
import strengthZoneImage from '../../../assets/images/gym/strength-zone.png'

interface ZoneCardProps {
  title: string
  description: string
  image: string
}

const ZoneCard: React.FC<ZoneCardProps> = ({ title, description, image }) => {
  return (
    <div className="group relative h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer">
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent group-hover:via-black/50 transition-all duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-text-secondary">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-sm text-gray-300 group-hover:text-text-secondary transition-colors">
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
      image: strengthZoneImage,
    },
    {
      title: 'Functional Zone',
      description: 'Specialized area for functional training programs',
      image: functionalZoneImage,
    },
    {
      title: 'Cardio Zone',
      description: 'State-of-the-art cardio equipment and machines',
      image: cardioZoneImage,
    },
  ]

  return (
    <section id="gallery" className="landing-section bg-bg-secondary">
      <div className="landing-container">
        {/* Title */}
        <div className="landing-header">
          <h2 className="section-title mb-3 tracking-wider">TRAINING ZONES</h2>
          <p className="landing-subtitle">
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

