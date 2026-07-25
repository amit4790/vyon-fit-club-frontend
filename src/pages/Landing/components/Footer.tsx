/**
 * Landing Page Footer
 * Footer with company info and links
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate()

  const handleNavClick = (target: string) => {
    if (target.startsWith('#')) {
      const element = document.getElementById(target.slice(1))
      element?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(target)
    }
  }

  const quickLinks = [
    { label: 'About', href: '#about' },
    { label: 'Memberships', href: '#memberships' },
    { label: 'Trainers', href: '#trainers' },
    { label: 'Blog', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ]

  const socials = [
    { icon: <Facebook size={20} />, label: 'Facebook' },
    { icon: <Instagram size={20} />, label: 'Instagram' },
    { icon: <Twitter size={20} />, label: 'Twitter' },
    { icon: <Linkedin size={20} />, label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-bg-secondary border-t border-border-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/src/assets/images/logo/vyon-logo.jpg"
                alt="VYON"
                className="h-8 w-8"
              />
              <span className="font-bold text-text-primary">VYON FIT CLUB</span>
            </div>
            <p className="body text-text-secondary text-sm">
              Premium fitness club for achieving your transformation goals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="body text-text-secondary hover:text-primary transition-colors text-sm bg-none border-none cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Operating Hours</h4>
            <ul className="space-y-2 text-sm">
              <li className="body text-text-secondary">Mon-Fri: 6 AM - 10 PM</li>
              <li className="body text-text-secondary">Sat: 7 AM - 9 PM</li>
              <li className="body text-text-secondary">Sun: 7 AM - 8 PM</li>
              <li className="body text-text-secondary text-primary font-semibold mt-2">
                24/7 for Ultimate Members
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Follow Us</h4>
            <div className="flex gap-3">
              {socials.map((social, i) => (
                <button
                  key={i}
                  className="p-2 bg-bg-card hover:bg-primary hover:text-text-secondary rounded-lg transition-all duration-300"
                  title={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border-light pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="caption text-text-secondary">
            &copy; 2026 VYON FIT CLUB. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleNavClick('#')}
              className="caption text-text-secondary hover:text-primary transition-colors bg-none border-none cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNavClick('#')}
              className="caption text-text-secondary hover:text-primary transition-colors bg-none border-none cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => handleNavClick('#contact')}
              className="caption text-text-secondary hover:text-primary transition-colors bg-none border-none cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

