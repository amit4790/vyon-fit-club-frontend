/**
 * FAQ Section
 * Compact accordion with frequently asked questions
 */

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="bg-[#161618] border border-neutral-800/80 rounded-lg overflow-hidden transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full py-4 px-5 flex items-center justify-between text-left hover:text-[#8B1E3F] transition-colors gap-3"
      >
        <span className="font-semibold text-sm sm:text-base text-neutral-100">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-neutral-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-[#8B1E3F]' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-4 pt-1 caption text-neutral-400 leading-relaxed border-t border-neutral-800/50 mt-1">
          {answer}
        </div>
      )}
    </div>
  )
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Do you offer trial sessions?',
      answer:
        'Yes! We offer complimentary trial sessions for new members. Schedule a visit to experience our facilities and meet our trainers.',
    },
    {
      question: 'Do trainers prepare workout plans?',
      answer:
        'Absolutely. Our certified trainers create personalized workout plans based on your fitness level, goals, and preferences.',
    },
    {
      question: 'Are memberships transferable?',
      answer:
        'Memberships are personal and non-transferable, but we offer various membership options including family plans.',
    },
    {
      question: 'What are your operating hours?',
      answer:
        'We are open Monday-Friday 6 AM - 10 PM, Saturday 7 AM - 9 PM, and Sunday 7 AM - 8 PM. Ultimate members get 24/7 access.',
    },
    {
      question: 'Do you have group classes?',
      answer:
        'Yes, we offer various group classes including HIIT, strength training, functional circuits, and weekend bootcamps.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, bank transfers, and digital payment methods like UPI and wallets.',
    },
  ]

  return (
    <section id="faq" className="landing-section bg-[#161618] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="landing-header">
          <h2 className="section-title tracking-wider uppercase mb-3">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="landing-subtitle text-neutral-400">
            Find answers to common questions about VYON FIT CLUB
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

      </div>
    </section>
  )
}