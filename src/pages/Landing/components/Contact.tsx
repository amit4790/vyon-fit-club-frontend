/**
 * Contact Section
 * Contact information and map with updated background and styled icon badges
 */

import React from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: <MapPin size={18} />,
      title: 'Address',
      value: '301-D, 2nd Floor, Sushant Lok Phase 1, Sector 43, Gurugram – 122002',
    },
    {
      icon: <Phone size={18} />,
      title: 'Phone',
      value: '+91 9625 2266 53',
    },
    {
      icon: <Mail size={18} />,
      title: 'Email',
      value: 'hello@vyonfitclub.com',
    },
    {
      icon: <Clock size={18} />,
      title: 'Hours',
      value: 'Mon-Sat: 6 AM - 11 PM, Sun: 11 AM - 11 PM',
    },
  ]

  return (
    <section id="contact" className="landing-section bg-[#161618] text-white">
      <div className="landing-container">
        
        {/* Title Header */}
        <div className="landing-header">
          <h2 className="section-title tracking-wider uppercase mb-3">
            GET IN TOUCH
          </h2>
          <p className="landing-subtitle text-neutral-400">
            We'd love to hear from you. Reach out anytime.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-stretch">
          
          {/* Contact Details Column */}
          <div className="space-y-4">
            {contactInfo.map((info, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3.5 p-4 rounded-xl bg-[#1F1F22] border border-neutral-800/80 transition-all duration-300 hover:border-neutral-700"
              >
                {/* Styled Icon Badge */}
                <div className="p-2.5 bg-[#161618] rounded-lg border border-neutral-800 text-[#8B1E3F] flex-shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-100 text-sm uppercase tracking-wide">
                    {info.title}
                  </h4>
                  <p className="caption text-neutral-400 mt-1 leading-relaxed">
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Map Container */}
          <div className="bg-[#1F1F22] rounded-xl overflow-hidden h-full min-h-[24rem] flex items-center justify-center border border-neutral-800 shadow-inner">
            <div className="text-center p-4">
              <div className="w-12 h-12 mx-auto mb-2.5 bg-[#161618] border border-neutral-800 rounded-full flex items-center justify-center text-[#8B1E3F]">
                <MapPin size={24} />
              </div>
              <p className="text-sm font-semibold text-neutral-200">
                Google Maps Integration
              </p>
              <p className="caption text-neutral-400 mt-1">
                Sector 43C, Gurgaon, Haryana
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}