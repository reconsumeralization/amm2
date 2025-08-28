'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, MessageCircle } from '@/lib/icon-mapping';
import { Button } from './button';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
  service: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Michael Thompson',
    role: 'Software Engineer',
    content: 'Best haircut experience I\'ve ever had. The attention to detail and professional service is unmatched. My fade has never looked better!',
    rating: 5,
    service: 'Premium Haircut & Beard Trim'
  },
  {
    id: '2',
    name: 'David Rodriguez',
    role: 'Business Owner',
    content: 'As someone who values quality and precision, Modern Men delivers on both fronts. The straight razor shave is incredibly relaxing.',
    rating: 5,
    service: 'Executive Shave'
  },
  {
    id: '3',
    name: 'James Wilson',
    role: 'Marketing Director',
    content: 'The team here truly understands modern men\'s grooming needs. Professional, efficient, and the results speak for themselves.',
    rating: 5,
    service: 'Classic Haircut'
  },
  {
    id: '4',
    name: 'Robert Chen',
    role: 'Doctor',
    content: 'Outstanding service in a comfortable environment. The staff takes pride in their work and it shows in every detail.',
    rating: 5,
    service: 'Hot Towel Treatment'
  },
  {
    id: '5',
    name: 'Kevin Johnson',
    role: 'Teacher',
    content: 'From consultation to final styling, every step is handled with expertise. Highly recommend for anyone seeking premium grooming.',
    rating: 5,
    service: 'Scalp Treatment'
  }
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className="relative bg-black py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <MessageCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-light text-white mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900 rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-800"
            >
              <div className="flex flex-col items-center text-center">
                {/* Rating Stars */}
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonials[currentIndex].rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                {/* Client Info */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">
                      {testimonials[currentIndex].name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h4 className="text-white font-semibold text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-gray-400 text-sm mb-2">
                    {testimonials[currentIndex].role}
                  </p>
                  <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                    {testimonials[currentIndex].service}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-red-400 hover:bg-gray-800"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-red-400 hover:bg-gray-800"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-red-500 scale-125'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
