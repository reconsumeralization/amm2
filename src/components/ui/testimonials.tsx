'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { motion } from 'framer-motion'

interface Testimonial {
  id: string
  clientName: string
  clientImage?: string
  service: string
  rating: number
  review: string
  date: string
  verified?: boolean
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  stylistName: string
  className?: string
}

export function Testimonials({ testimonials, stylistName, className = '' }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      )
    }
    return stars
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (testimonials.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Icons.info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No reviews yet</p>
        <p className="text-sm text-gray-500">Be the first to leave a review for {stylistName}!</p>
      </div>
    )
  }

  if (testimonials.length === 1) {
    const testimonial = testimonials[0]
    return (
      <div className={className}>
        <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {testimonial.clientImage ? (
                  <img
                    src={testimonial.clientImage}
                    alt={testimonial.clientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.clientName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.clientName}</h4>
                  <p className="text-sm text-gray-600">{testimonial.service}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center mb-1">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-xs text-gray-500">{testimonial.date}</p>
              </div>
            </div>

            {testimonial.verified && (
              <Badge variant="secondary" className="mb-3 bg-green-100 text-green-800">
                <Icons.info className="h-3 w-3 mr-1" />
                Verified Review
              </Badge>
            )}

            <blockquote className="text-gray-700 italic leading-relaxed">
              "{testimonial.review}"
            </blockquote>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-800">Client Reviews</h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTestimonial}
            className="p-1 h-8 w-8"
          >
            <Icons.arrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {testimonials.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTestimonial}
            className="p-1 h-8 w-8"
          >
            <Icons.phone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-white to-amber-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {currentTestimonial.clientImage ? (
                <img
                  src={currentTestimonial.clientImage}
                  alt={currentTestimonial.clientName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {currentTestimonial.clientName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-800">{currentTestimonial.clientName}</h4>
                <p className="text-sm text-gray-600">{currentTestimonial.service}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center mb-1">
                {renderStars(currentTestimonial.rating)}
              </div>
              <p className="text-xs text-gray-500">{currentTestimonial.date}</p>
            </div>
          </div>

          {currentTestimonial.verified && (
            <Badge variant="secondary" className="mb-3 bg-green-100 text-green-800">
              <Icons.info className="h-3 w-3 mr-1" />
              Verified Review
            </Badge>
          )}

          <blockquote className="text-gray-700 italic leading-relaxed">
            "{currentTestimonial.review}"
          </blockquote>
        </CardContent>
      </Card>

      {/* Review Summary */}
      {testimonials.length > 1 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-gray-800">Overall Rating</h5>
              <p className="text-sm text-gray-600">
                {testimonials.length} review{testimonials.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center">
                {renderStars(
                  testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length
                )}
              </div>
              <p className="text-sm font-medium text-gray-800">
                {(testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)} / 5
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
