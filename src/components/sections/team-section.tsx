'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { Star, Award, Users, Clock, Calendar, Instagram, Facebook, ExternalLink, Loader2 } from '@/lib/icon-mapping'

interface Stylist {
  id: string
  name: string
  bio?: any
  profileImage?: any
  specializations?: any[]
  experience?: {
    yearsExperience?: number
    certifications?: any[]
    awards?: any[]
  }
  performance?: {
    rating?: number
    reviewCount?: number
    totalAppointments?: number
  }
  socialMedia?: {
    instagram?: string
    facebook?: string
    website?: string
  }
  featured?: boolean
  isActive?: boolean
  portfolio?: any[]
}

interface StylistResponse {
  stylists: Stylist[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function TeamSection() {
  const [stylists, setStylists] = useState<Stylist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStylists()
  }, [])

  const fetchStylists = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stylists?featured=true&limit=6')
      if (!response.ok) {
        throw new Error('Failed to fetch stylists')
      }
      const data: StylistResponse = await response.json()
      setStylists(data.stylists)
    } catch (err) {
      console.error('Error fetching stylists:', err)
      setError(err instanceof Error ? err.message : 'Failed to load team members')
      toast.error('Failed to load team information')
    } finally {
      setLoading(false)
    }
  }

  const formatBio = (bio: any) => {
    if (!bio) return 'Professional stylist dedicated to exceptional service.'
    if (typeof bio === 'string') return bio
    if (bio.root && bio.root.children) {
      return bio.root.children.map((child: any) => child.text || '').join(' ')
    }
    return 'Professional stylist dedicated to exceptional service.'
  }

  const getProfileImage = (stylist: Stylist) => {
    if (stylist.profileImage?.url) {
      return stylist.profileImage.url
    }
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }

  const getSpecializations = (stylist: Stylist) => {
    if (!stylist.specializations || stylist.specializations.length === 0) {
      return 'General Styling'
    }
    return stylist.specializations.map(spec => spec.name || spec.title).join(', ')
  }

  const handleBookAppointment = (stylist: Stylist) => {
    localStorage.setItem('selectedStylist', JSON.stringify({
      id: stylist.id,
      name: stylist.name
    }))
    window.location.href = '/booking'
  }

  const handleViewProfile = (stylist: Stylist) => {
    // Navigate to stylist profile page
    window.location.href = `/team/${stylist.id}`
  }

  return (
    <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Badge 
              variant="secondary" 
              className="bg-amber-500/20 text-amber-200 border-amber-400/30 px-4 py-2 text-sm font-medium mb-4 backdrop-blur-sm"
            >
              👥 Meet The Crew
            </Badge>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
              Our <span className="bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">Team</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Our team of incomparably talented stylists and barbers are passionate about
              delivering exceptional service and creating the perfect look for every client.
            </p>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6 text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-700 mx-auto mb-6 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
                    </div>
                    <div className="h-6 bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded mb-6 animate-pulse"></div>
                    <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button 
                onClick={fetchStylists}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Team Members Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stylists.map((stylist, index) => (
              <motion.div
                key={stylist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" />
                  
                  <CardContent className="p-6 text-center relative z-10">
                    <div className="mb-6 relative">
                      <img
                        src={getProfileImage(stylist)}
                        alt={stylist.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-amber-600 group-hover:border-amber-400 transition-all duration-300 group-hover:scale-105"
                      />
                      {stylist.performance?.rating && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full flex items-center shadow-lg">
                          <Star className="h-3 w-3 mr-1" />
                          {stylist.performance.rating.toFixed(1)}
                        </div>
                      )}
                      {stylist.featured && (
                        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                          ⭐ Featured
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">
                      {stylist.name}
                    </h3>
                    <p className="text-amber-400 font-medium mb-2">{getSpecializations(stylist)}</p>

                    {stylist.experience?.yearsExperience && (
                      <p className="text-gray-400 text-sm mb-2">
                        {stylist.experience.yearsExperience}+ years experience
                      </p>
                    )}

                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {formatBio(stylist.bio).length > 100
                        ? `${formatBio(stylist.bio).substring(0, 100)}...`
                        : formatBio(stylist.bio)
                      }
                    </p>

                    {stylist.performance?.totalAppointments && (
                      <p className="text-gray-400 text-xs mb-4">
                        {stylist.performance.totalAppointments} appointments completed
                      </p>
                    )}

                    <div className="flex flex-col gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => handleBookAppointment(stylist)}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book with {stylist.name.split(' ')[0]}
                        </Button>
                      </motion.div>
                      <Button
                        variant="outline"
                        onClick={() => handleViewProfile(stylist)}
                        className="w-full border-white/20 text-white hover:bg-white/10 transition-colors duration-200"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && !error && stylists.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Ready to experience the Modern Men difference? Book your appointment with one of our expert stylists today.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                asChild
              >
                <a href="/booking">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Appointment
                </a>
              </Button>
            </motion.div>
          </motion.div>
        )}

        {stylists.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No team members available at the moment.</p>
            <p className="text-sm text-gray-500">Please check back later or contact us directly.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            onClick={() => window.location.href = '/team'}
            variant="outline"
            className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-colors duration-200"
          >
            View All Team Members
          </Button>
        </div>
      </div>
    </section>
  )
}