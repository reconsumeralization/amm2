'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, RefreshCw, Home, MessageCircle, Phone, Clock } from '@/lib/icon-mapping'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to our custom logger
    logger.error('Next.js Error Page triggered', {
      error: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    }, error)
  }, [error])

  const handleRetry = () => {
    logger.info('User clicked retry button on error page', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
    reset()
  }

  const handleGoHome = () => {
    logger.info('User clicked go home button on error page', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
    window.location.href = '/'
  }

  const handleContact = () => {
    logger.info('User clicked contact button on error page', {
      error: error.message,
      timestamp: new Date().toISOString()
    })
    // Scroll to contact section or navigate to contact page
    const contactSection = document.getElementById('contact')
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/#contact'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50/30 flex items-center justify-center p-4 relative overflow-hidden">
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
                  <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <AlertTriangle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
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
                  className="bg-red-100 text-red-800 px-4 py-2 text-sm font-medium mb-4"
                >
                  ⚠️ Technical Error
                </Badge>
                <CardTitle className="text-3xl font-bold text-slate-900 mb-4">
                  Oops! Something Went Wrong
                </CardTitle>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We're experiencing some technical difficulties. Our team has been notified and is working to fix the issue.
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Error Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-800 font-medium mb-2">Error Details:</p>
                  <p className="text-sm text-red-700 font-mono break-all mb-2">
                    {error.message || 'Unknown error occurred'}
                  </p>
                  <p className="text-xs text-red-600">
                    <strong>Error ID:</strong> {error.digest || 'Unknown'}
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleRetry}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGoHome}
                    className="w-full border-amber-200 text-amber-600 hover:bg-amber-50"
                    variant="outline"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleContact}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </motion.div>
              </motion.div>

              {/* Support Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="bg-gradient-to-r from-slate-50 to-amber-50/30 rounded-lg p-6 border border-slate-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
                  Need Help?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Call Us</p>
                    <p className="text-xs text-gray-600">(306) 522-4111</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Email Support</p>
                    <p className="text-xs text-gray-600">info@modernmen.ca</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Business Hours</p>
                    <p className="text-xs text-gray-600">Mon-Sat: 9am-8pm</p>
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
