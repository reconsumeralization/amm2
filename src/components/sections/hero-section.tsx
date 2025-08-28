"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

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
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-800 to-black"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="nav-premium relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-display font-bold text-black">
                MODERN MEN
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="font-body text-gray-700 hover:text-black transition-colors duration-200">
                Services
              </a>
              <a href="#about" className="font-body text-gray-700 hover:text-black transition-colors duration-200">
                About
              </a>
              <a href="#team" className="font-body text-gray-700 hover:text-black transition-colors duration-200">
                Team
              </a>
              <a href="#contact" className="font-body text-gray-700 hover:text-black transition-colors duration-200">
                Contact
              </a>
            </div>
            <Button 
              className="btn-premium bg-black text-white hover:bg-gray-800 border-0"
              onClick={onBookNow}
            >
              Book Now
            </Button>
          </div>
        </div>
      </nav>

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
                className="btn-premium bg-black text-white hover:bg-gray-800 border-0 px-8 py-4 text-lg font-medium"
                onClick={onBookNow}
              >
                Book Appointment
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="btn-premium border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 text-lg font-medium"
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