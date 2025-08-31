"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  onBookNow: () => void
}

const HeroSection = ({ onBookNow }: HeroSectionProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const texts = [
    "Regina's Premier Men's Grooming",
    "Where Style Meets Precision",
    "Crafting Confidence, One Cut at a Time"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % texts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(/hero-bg.jpg)` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-premium-lg"
          >
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light text-black leading-tight">
              MODERN
              <br />
              <span className="text-gradient">MEN</span>
            </h1>

            {/* Dynamic Subtitle */}
            <motion.div
              key={currentTextIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <p className="text-xl md:text-2xl font-body text-gray-600 max-w-3xl mx-auto">
                {texts[currentTextIndex]}
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white border-0 px-8 py-4 text-lg font-medium transition-all duration-200"
                onClick={onBookNow}
              >
                Book Appointment
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-8 py-4 text-lg font-medium transition-all duration-200"
              >
                View Services
              </Button>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-black mb-2">
                500+
              </div>
              <div className="text-gray-600 font-body">
                Happy Clients
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-black mb-2">
                15+
              </div>
              <div className="text-gray-600 font-body">
                Years Experience
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-black mb-2">
                4.9★
              </div>
              <div className="text-gray-600 font-body">
                Average Rating
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm font-body text-gray-500">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroSection