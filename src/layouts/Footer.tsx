/**
 * Footer Component
 * Standard footer for public layouts
 */

import React from 'react'

interface FooterProps {
  companyName?: string
  year?: number
}

export const Footer: React.FC<FooterProps> = ({
  companyName = 'VYON FIT CLUB',
  year = new Date().getFullYear(),
}) => {
  return (
    <footer className="bg-bg-secondary border-t border-border-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold text-text-primary mb-4">{companyName}</h3>
            <p className="body text-text-secondary text-sm">
              Premium gym management system for fitness professionals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="body text-text-secondary hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border-light pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="caption text-text-secondary">
            &copy; {year} {companyName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="caption text-text-secondary hover:text-text-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="caption text-text-secondary hover:text-text-primary transition-colors">
              LinkedIn
            </a>
            <a href="#" className="caption text-text-secondary hover:text-text-primary transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
