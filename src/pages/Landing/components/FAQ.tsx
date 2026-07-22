/**
 * FAQ Section
 * Accordion with frequently asked questions
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
    <div className="border-b border-border-light">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between hover:text-primary transition-colors"
      >
        <span className="card-title text-left">{question}</span>
        <ChevronDown
          size={24}
          className={`flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="pb-6 animate-slide-up">
          <p className="body text-text-secondary">{answer}</p>
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
    <section className="py-20 bg-bg-secondary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">FREQUENTLY ASKED QUESTIONS</h2>
          <p className="body text-text-secondary">
            Find answers to common questions about VYON FIT CLUB
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-0">
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
