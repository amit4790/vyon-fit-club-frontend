/**
 * Contact Section
 * Contact information and map
 */

import React from 'react'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

export const Contact: React.FC = () => {
  const contactInfo = [
    {
      icon: <MapPin size={24} />,
      title: 'Address',
      value: 'MG Road, Downtown Premium Complex, City Center',
    },
    {
      icon: <Phone size={24} />,
      title: 'Phone',
      value: '+91 8000 1234 56',
    },
    {
      icon: <Mail size={24} />,
      title: 'Email',
      value: 'hello@vyonfitclub.com',
    },
    {
      icon: <Clock size={24} />,
      title: 'Hours',
      value: 'Mon-Fri: 6 AM - 10 PM, Sat-Sun: 7 AM - 9 PM',
    },
  ]

  const socials = [
    { icon: <Facebook size={24} />, label: 'Facebook' },
    { icon: <Instagram size={24} />, label: 'Instagram' },
    { icon: <Twitter size={24} />, label: 'Twitter' },
    { icon: <Linkedin size={24} />, label: 'LinkedIn' },
  ]

  return (
    <section id="contact" className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">GET IN TOUCH</h2>
          <p className="body text-text-secondary">
            We'd love to hear from you. Reach out anytime.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-primary flex-shrink-0 mt-1">{info.icon}</div>
                <div>
                  <h4 className="font-semibold text-text-primary mb-1">
                    {info.title}
                  </h4>
                  <p className="body text-text-secondary">{info.value}</p>
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="pt-8 border-t border-border-light">
              <h4 className="font-semibold text-text-primary mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {socials.map((social, i) => (
                  <button
                    key={i}
                    className="p-3 bg-bg-secondary hover:bg-primary hover:text-text-secondary rounded-lg transition-all duration-300"
                    title={social.label}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-bg-secondary rounded-lg overflow-hidden h-96 flex items-center justify-center border border-border-light">
            <div className="text-center">
              <MapPin size={48} className="mx-auto mb-4 text-text-secondary" />
              <p className="body text-text-secondary">
                Google Maps Integration Here
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

