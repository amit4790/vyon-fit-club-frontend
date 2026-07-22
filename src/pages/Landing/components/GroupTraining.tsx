/**
 * Group Training Section
 * Group fitness programs
 */

import React from 'react'
import { Users, TrendingUp, Zap, Calendar } from 'lucide-react'

export const GroupTraining: React.FC = () => {
  const programs = [
    { icon: <Zap size={24} />, title: 'HIIT', description: 'High-intensity interval training' },
    { icon: <Users size={24} />, title: 'Strength Classes', description: 'Group strength training' },
    { icon: <TrendingUp size={24} />, title: 'Functional Circuits', description: 'Dynamic circuit workouts' },
    { icon: <Calendar size={24} />, title: 'Weekend Bootcamps', description: 'Intensive weekend sessions' },
  ]

  return (
    <section className="py-20 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="/src/assets/images/gym/group-training.png"
              alt="Group Training"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-20" />
          </div>

          {/* Content */}
          <div>
            <h2 className="section-title mb-6">GROUP TRAINING</h2>
            <p className="body mb-8 text-text-secondary">
              Experience the energy and motivation of group fitness. Our dynamic classes
              are designed to push your limits while building a supportive community of
              like-minded fitness enthusiasts.
            </p>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programs.map((program, i) => (
                <div key={i} className="card">
                  <div className="text-primary mb-2">{program.icon}</div>
                  <h4 className="font-semibold text-text-primary mb-1">{program.title}</h4>
                  <p className="text-sm text-text-secondary">{program.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
