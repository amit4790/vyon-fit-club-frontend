/**
 * Landing Page Footer
 * Streamlined footer with Programs replace for Operating Hours
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'
import vyonLogo from '../../../assets/images/logo/vyon-logo.jpg'

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
    { label: 'About Us', href: '#about' },
    { label: 'Memberships', href: '#memberships' },
    { label: 'Trainers', href: '#trainers' },
    { label: 'Blog', href: '#' },
    { label: 'FAQ', href: '#faq' },
  ]

  const programs = [
    { label: 'HIIT Training', href: '#group-training' },
    { label: 'Group Strength', href: '#group-training' },
    { label: 'Functional Circuits', href: '#group-training' },
    { label: 'Personal Training', href: '#trainers' },
  ]

  const socials = [
    { icon: <Facebook size={16} />, label: 'Facebook' },
    { icon: <Instagram size={16} />, label: 'Instagram' },
    { icon: <Twitter size={16} />, label: 'Twitter' },
    { icon: <Linkedin size={16} />, label: 'LinkedIn' },
  ]

  return (
    <footer className="bg-[#161618] border-t border-neutral-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img
                src={vyonLogo}
                alt="VYON"
                className="h-6 w-6 rounded-md object-cover"
              />
              <span className="font-bold text-sm tracking-wider text-neutral-100">
                VYON FIT CLUB
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Premium fitness club dedicated to helping you achieve your ultimate transformation goals.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-2.5">
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-xs text-neutral-400 hover:text-[#8B1E3F] transition-colors bg-none border-none cursor-pointer p-0"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Column (Replaces Operating Hours) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-2.5">
              Programs
            </h4>
            <ul className="space-y-1.5">
              {programs.map((program) => (
                <li key={program.label}>
                  <button
                    onClick={() => handleNavClick(program.href)}
                    className="text-xs text-neutral-400 hover:text-[#8B1E3F] transition-colors bg-none border-none cursor-pointer p-0"
                  >
                    {program.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200 mb-2.5">
              Follow Us
            </h4>
            <p className="text-xs text-neutral-400 mb-3">
              Stay connected with our fitness community.
            </p>
            <div className="flex gap-2">
              {socials.map((social, i) => (
                <button
                  key={i}
                  className="p-2 bg-[#1F1F22] border border-neutral-800 hover:border-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white rounded-lg text-neutral-300 transition-all duration-300"
                  title={social.label}
                  aria-label={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} VYON FIT CLUB. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick('#')}
              className="hover:text-neutral-300 transition-colors bg-none border-none cursor-pointer p-0"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => handleNavClick('#')}
              className="hover:text-neutral-300 transition-colors bg-none border-none cursor-pointer p-0"
            >
              Terms of Service
            </button>
            <button
              onClick={() => handleNavClick('#contact')}
              className="hover:text-neutral-300 transition-colors bg-none border-none cursor-pointer p-0"
            >
              Contact
            </button>
          </div>
        </div>

      </div>
    </footer>
  )
}