/**
 * Why Choose Section
 * Core value points for VYON Fit Club.
 */

import React from 'react'
import { Award, Dumbbell, ShieldCheck, Users } from 'lucide-react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="card h-full p-6 hover:shadow-card-hover transition-all duration-300">
      <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="card-title mb-2 text-lg">{title}</h3>
      <p className="body text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  )
}

export const WhyChoose: React.FC = () => {
  const features = [
    {
      icon: <Award size={20} />,
      title: 'Certified Coaches',
      description:
        'Train under experienced professionals who build plans around your goals, body type, and progress pace.',
    },
    {
      icon: <Dumbbell size={20} />,
      title: 'Premium Equipment',
      description:
        'Access modern strength and cardio zones designed for both beginners and advanced athletes.',
    },
    {
      icon: <Users size={20} />,
      title: 'Supportive Community',
      description:
        'Stay consistent with a motivating environment, group classes, and accountability from the VYON team.',
    },
    {
      icon: <ShieldCheck size={20} />,
      title: 'Clean & Safe Facility',
      description:
        'Train confidently in a hygienic, secure, and professionally maintained space every day.',
    },
  ]

  return (
    <section id="why-choose" className="landing-section bg-bg-secondary">
      <div className="landing-container">
        <div className="landing-header">
          <h2 className="section-title mb-3 tracking-wider">WHY CHOOSE VYON</h2>
          <p className="landing-subtitle">
            Everything you need in one place to build strength, confidence, and long-term fitness habits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}