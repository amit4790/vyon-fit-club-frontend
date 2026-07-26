/**
 * Group Training Section
 * Compact layout with dark neutral cards & burgundy accents
 */

import React from 'react'
import { Users, TrendingUp, Zap, Calendar } from 'lucide-react'
import groupTrainingImage from '../../../assets/images/gym/group-training.png'

export const GroupTraining: React.FC = () => {
  const programs = [
    { icon: <Zap size={20} />, title: 'HIIT', description: 'High-intensity interval training' },
    { icon: <Users size={20} />, title: 'Strength Classes', description: 'Group strength training' },
    { icon: <TrendingUp size={20} />, title: 'Functional Circuits', description: 'Dynamic circuit workouts' },
    { icon: <Calendar size={20} />, title: 'Weekend Bootcamps', description: 'Intensive weekend sessions' },
  ]

  return (
    <section id="group-training" className="landing-section bg-[#161618] text-white">
      <div className="landing-container">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          
          {/* Image Container */}
          <div className="relative h-80 lg:h-[28rem] rounded-xl overflow-hidden border border-neutral-800">
            <img
              src={groupTrainingImage}
              alt="Group Training"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Text & Programs List */}
          <div>
            <h2 className="section-title tracking-wider uppercase mb-3">
              GROUP TRAINING
            </h2>
            <p className="body text-neutral-400 mb-7 leading-relaxed">
              Experience the energy and motivation of group fitness. Our dynamic classes
              are designed to push your limits while building a supportive community of
              like-minded fitness enthusiasts.
            </p>

            {/* Programs 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {programs.map((program, i) => (
                <div 
                  key={i} 
                  className="bg-[#161618] border border-neutral-800/80 rounded-lg p-4 min-h-[8.5rem] transition-all duration-300 hover:border-neutral-700"
                >
                  <div className="text-[#8B1E3F] mb-2">{program.icon}</div>
                  <h3 className="font-bold text-sm text-neutral-100 mb-1">
                    {program.title}
                  </h3>
                  <p className="caption text-neutral-400 leading-relaxed">
                    {program.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}