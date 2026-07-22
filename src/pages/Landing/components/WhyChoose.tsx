/**
 * Why Choose VYON Section
 * Six premium feature cards
 */

import React from 'react'
import { Dumbbell, Zap, Heart, UserCheck, Apple, Sliders } from 'lucide-react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="group card hover cursor-pointer">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="card-title mb-3">{title}</h3>
      <p className="body text-text-secondary">{description}</p>
    </div>
  )
}

export const WhyChoose: React.FC = () => {
  const features = [
    {
      icon: <Dumbbell size={32} />,
      title: 'Strength Training',
      description:
        'Build muscle and power with our comprehensive strength training programs and premium equipment.',
    },
    {
      icon: <Zap size={32} />,
      title: 'Functional Fitness',
      description:
        'Improve everyday movement patterns and functional capacity with specialized training methods.',
    },
    {
      icon: <Heart size={32} />,
      title: 'Cardio Programs',
      description:
        'Enhance cardiovascular health with diverse cardio zones and professional guidance.',
    },
    {
      icon: <UserCheck size={32} />,
      title: 'Personal Coaching',
      description:
        'Work with certified trainers who create personalized fitness plans tailored to your goals.',
    },
    {
      icon: <Apple size={32} />,
      title: 'Nutrition Guidance',
      description:
        'Receive expert nutritional advice to complement your fitness journey and maximize results.',
    },
    {
      icon: <Sliders size={32} />,
      title: 'Flexible Memberships',
      description:
        'Choose from flexible membership options that fit your lifestyle and fitness goals.',
    },
  ]

  return (
    <section className="py-20 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">WHY CHOOSE VYON</h2>
          <p className="body text-text-secondary max-w-2xl mx-auto">
            Experience a complete fitness ecosystem designed for your transformation
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
