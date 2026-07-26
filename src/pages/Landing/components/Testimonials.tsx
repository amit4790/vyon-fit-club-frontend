/**
 * Testimonials Section
 * Compact member reviews carousel with seamless loop
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
    <div className="bg-[#161618] border border-neutral-800 rounded-xl p-6 text-center flex flex-col justify-between h-full min-h-[17rem] transition-all duration-300 hover:border-neutral-700">
      <div>
        {/* Rating Stars */}
        <div className="flex items-center justify-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < rating
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-neutral-700'
              }
            />
          ))}
        </div>

        {/* Review Text */}
        <p className="caption text-neutral-300 italic leading-relaxed mb-6">
          "{text}"
        </p>
      </div>

      {/* Author */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <Avatar initials={initials} size="sm" />
        <div>
          <h4 className="font-bold text-sm text-neutral-100">{name}</h4>
          <p className="caption text-neutral-400">{membership}</p>
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
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  // Always gets 3 items wrapping around cleanly
  const visibleTestimonials = [0, 1, 2].map((offset) => {
    return testimonials[(activeIndex + offset) % testimonials.length]
  })

  return (
    <section className="landing-section bg-[#161618] text-white">
      <div className="landing-container">
        
        {/* Title */}
        <div className="landing-header">
          <h2 className="section-title tracking-wider uppercase mb-3">
            MEMBER TESTIMONIALS
          </h2>
          <p className="landing-subtitle text-neutral-400">
            Hear from our satisfied members
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
            {visibleTestimonials.map((testimonial, i) => (
              <TestimonialCard key={i} {...testimonial} />
            ))}
          </div>

          {/* Controls & Indicator Dots */}
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={prev}
              className="p-1.5 bg-[#161618] border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 transition-colors"
              aria-label="Previous testimonials"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? 'bg-[#8B1E3F] w-6'
                      : 'bg-neutral-800 w-1.5 hover:bg-neutral-700'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-1.5 bg-[#161618] border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-300 transition-colors"
              aria-label="Next testimonials"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}