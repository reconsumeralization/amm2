'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, ArrowLeft, Search, MessageCircle, MapPin, Phone, Clock } from '@/lib/icon-mapping'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    // Log the 404 event
    logger.warn('404 Page Not Found', {
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      timestamp: new Date().toISOString()
    })
  }, [])

  const handleGoHome = () => {
    logger.info('User clicked go home from 404 page', {
      from: typeof window !== 'undefined' ? window.location.href : 'unknown'
    })
    router.push('/')
  }

  const handleGoBack = () => {
    logger.info('User clicked go back from 404 page', {
      from: typeof window !== 'undefined' ? window.location.href : 'unknown'
    })
    router.back()
  }

  const handleSearch = () => {
    logger.info('User clicked search from 404 page')
    router.push('/search')
  }

  const handleContact = () => {
    logger.info('User clicked contact from 404 page')
    // Scroll to contact section or navigate to contact page
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/#contact')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="w-full border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="text-8xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                    404
                  </div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-amber-100 text-amber-800 px-4 py-2 text-sm font-medium mb-4"
                >
                  🚫 Page Not Found
                </Badge>
                <CardTitle className="text-3xl font-bold text-slate-900 mb-4">
                  Oops! We've Lost That Page
                </CardTitle>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  The page you're looking for doesn't exist or has been moved. 
                  Don't worry though - we're here to help you find what you need!
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* URL Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg p-4 border border-amber-200">
                  <p className="text-sm text-amber-800 font-medium mb-2">Attempted URL:</p>
                  <p className="text-sm text-amber-700 font-mono break-all">
                    {typeof window !== 'undefined' ? window.location.pathname : 'unknown'}
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGoHome}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGoBack}
                    className="w-full border-amber-200 text-amber-600 hover:bg-amber-50"
                    variant="outline"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSearch}
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                    variant="outline"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search Site
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleContact}
                    className="w-full border-green-200 text-green-600 hover:bg-green-50"
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                </motion.div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="bg-gradient-to-r from-slate-50 to-amber-50/30 rounded-lg p-6 border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
                  Popular Pages
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Book Appointment</p>
                    <p className="text-xs text-gray-600">Schedule your visit</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Our Location</p>
                    <p className="text-xs text-gray-600">Find us in Regina</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Business Hours</p>
                    <p className="text-xs text-gray-600">When we're open</p>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
