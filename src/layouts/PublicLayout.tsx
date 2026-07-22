/**
 * Public Layout
 * Layout for public pages (landing, login, etc)
 */

import React from 'react'
import { Footer } from './Footer'

interface PublicLayoutProps {
  children: React.ReactNode
  navbar?: React.ReactNode
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, navbar }) => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      {navbar && <nav>{navbar}</nav>}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
