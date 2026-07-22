/**
 * Testimonials Section
 * Member reviews carousel
 */

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Avatar } from '../../../components/Avatar'

interface TestimonialProps {
  name: string
  membership: string
  text: string
  rating: number
  initials: string
}

const TestimonialCard: React.FC<TestimonialProps> = ({
  name,
  membership,
  text,
  rating,
  initials,
}) => {
  return (
    <div className="card text-center min-h-64 flex flex-col justify-between">
      {/* Rating */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-warning text-warning' : 'text-text-secondary'}
          />
        ))}
      </div>

      {/* Text */}
      <p className="body mb-6 text-text-secondary italic flex-1">"{text}"</p>

      {/* Author */}
      <div className="flex flex-col items-center gap-3">
        <Avatar initials={initials} size="md" />
        <div>
          <h4 className="font-semibold text-text-primary">{name}</h4>
          <p className="caption text-text-secondary">{membership}</p>
        </div>
      </div>
    </div>
  )
}

export const Testimonials: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials: TestimonialProps[] = [
    {
      name: 'Arjun Sharma',
      membership: 'Elite Member',
      text: 'VYON transformed my fitness journey. The trainers are incredibly knowledgeable and supportive. Best decision I made!',
      rating: 5,
      initials: 'AS',
    },
    {
      name: 'Priya Kapoor',
      membership: 'Ultimate Member',
      text: 'The facilities are world-class and the community is amazing. I love coming here every day.',
      rating: 5,
      initials: 'PK',
    },
    {
      name: 'Rahul Verma',
      membership: 'Pro Member',
      text: 'Personal training sessions have been game-changing. Highly recommend VYON to anyone serious about fitness.',
      rating: 5,
      initials: 'RV',
    },
    {
      name: 'Neha Patel',
      membership: 'Elite Member',
      text: 'The group classes are so motivating, and the nutrition guidance really helped me reach my goals faster.',
      rating: 5,
      initials: 'NP',
    },
    {
      name: 'Vikram Singh',
      membership: 'Ultimate Member',
      text: 'Premium experience from start to finish. The trainers customize everything to match my fitness goals perfectly.',
      rating: 5,
      initials: 'VS',
    },
  ]

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  return (
    <section className="py-20 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">MEMBER TESTIMONIALS</h2>
          <p className="body text-text-secondary">
            Hear from our satisfied members
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {testimonials
              .slice(activeIndex, activeIndex + 3)
              .map((testimonial, i) => (
                <TestimonialCard key={i} {...testimonial} />
              ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={prev}
              className="p-2 bg-bg-card hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i >= activeIndex && i < activeIndex + 3
                      ? 'bg-primary w-8'
                      : 'bg-border-light'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 bg-bg-card hover:bg-bg-secondary rounded-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
