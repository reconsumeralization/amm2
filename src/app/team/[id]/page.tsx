'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { motion, AnimatePresence } from 'framer-motion'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { InstagramFeed } from '@/components/ui/instagram-feed'
import { Testimonials } from '@/components/ui/testimonials'
import { TestimonialForm } from '@/components/ui/testimonial-form'
import Image from 'next/image'

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
  schedule?: any
  pricing?: any
  testimonials?: Testimonial[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
}

export default function StylistProfilePage() {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [stylist, setStylist] = useState<Stylist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any | null>(null)
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})

  // Extract ID from URL on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathSegments = window.location.pathname.split('/')
      const stylistId = pathSegments[pathSegments.length - 1]
      setId(stylistId)
    }
  }, [])

  const fetchStylist = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/stylists/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Stylist not found')
        }
        throw new Error('Failed to fetch stylist')
      }
      const data = await response.json()
      setStylist(data)
    } catch (err) {
      console.error('Error fetching stylist:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stylist profile'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchStylist()
    }
  }, [id, fetchStylist])

  const formatBio = (bio: any) => {
    if (!bio) return 'Professional stylist dedicated to exceptional service and creating beautiful transformations.'
    if (typeof bio === 'string') return bio
    if (bio.root && bio.root.children) {
      return bio.root.children.map((child: any) => child.text || '').join(' ')
    }
    return 'Professional stylist dedicated to exceptional service and creating beautiful transformations.'
  }

  const getProfileImage = (stylist: Stylist) => {
    if (stylist.profileImage?.url) {
      return stylist.profileImage.url
    }
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }

  const getSpecializations = (stylist: Stylist) => {
    if (!stylist.specializations || stylist.specializations.length === 0) {
      return ['General Styling']
    }
    return stylist.specializations.map(spec => spec.name || spec.title || spec)
  }

  const handleBookAppointment = (stylist: Stylist) => {
    localStorage.setItem('selectedStylist', JSON.stringify({
      id: stylist.id,
      name: stylist.name
    }))
    toast.success(`Selected ${stylist.name} for booking`, {
      description: 'Redirecting to booking portal...',
      duration: 2000
    })
    router.push('/portal/book')
  }

  const handleViewPortfolioItem = (item: any) => {
    setSelectedPortfolioItem(item)
    setShowPortfolioModal(true)
  }

  const closePortfolioModal = () => {
    setShowPortfolioModal(false)
    setTimeout(() => setSelectedPortfolioItem(null), 200)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-yellow-400 text-lg"
          >
            ★
          </motion.span>
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-yellow-400 text-lg"
          >
            ☆
          </motion.span>
        )
      } else {
        stars.push(
          <motion.span
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-gray-400 text-lg"
          >
            ☆
          </motion.span>
        )
      }
    }
    return stars
  }

  const getPortfolioImage = (item: any) => {
    if (item?.image?.url) return item.image.url
    if (item?.url) return item.url
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }

  const handleImageLoad = (key: string) => {
    setImageLoading(prev => ({ ...prev, [key]: false }))
  }

  const handleImageLoadStart = (key: string) => {
    setImageLoading(prev => ({ ...prev, [key]: true }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Icons.spinner className="h-12 w-12 text-amber-600 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we load the stylist profile...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !stylist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Icons.x className="h-16 w-16 text-red-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested stylist profile could not be found.'}</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push('/team')}
              className="bg-amber-600 hover:bg-amber-700 text-white transition-all duration-200 hover:scale-105"
            >
              <Icons.arrowLeft className="h-4 w-4 mr-2" />
              Back to Team
            </Button>
            <Button
              onClick={fetchStylist}
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <Icons.refreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Enhanced Header with Parallax Effect */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-amber-600 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center space-x-4 mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/team')}
              className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
            >
              <Icons.arrowLeft className="h-5 w-5 mr-2" />
              Back to Team
            </Button>
          </motion.div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <Image
                src={getProfileImage(stylist)}
                alt={stylist.name}
                width={120}
                height={120}
                className="relative w-24 h-24 md:w-30 md:h-30 rounded-full border-4 border-white object-cover shadow-2xl"
                onLoadingComplete={() => handleImageLoad('profile')}
                onLoadStart={() => handleImageLoadStart('profile')}
              />
              {imageLoading.profile && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
                  <Icons.spinner className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {stylist.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(stylist.performance?.rating || 0)}
                  <span className="ml-2 text-lg font-semibold">
                    {(stylist.performance?.rating || 0).toFixed(1)}
                  </span>
                </div>
                {stylist.performance?.reviewCount && (
                  <span className="text-blue-100 text-sm">
                    ({stylist.performance.reviewCount} reviews)
                  </span>
                )}
                {stylist.featured && (
                  <Badge className="bg-amber-500 text-white border-0">
                    <span className="h-3 w-3 mr-1">★</span>
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
                {formatBio(stylist.bio).substring(0, 150)}...
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-gray-800 flex items-center">
                    <Icons.users className="h-6 w-6 mr-3 text-amber-600" />
                    About {stylist.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {formatBio(stylist.bio)}
                  </p>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg"
                    >
                      <Icons.calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800 mb-1">Experience</h4>
                      <p className="text-2xl font-bold text-amber-600">
                        {stylist.experience?.yearsExperience || 0}+
                      </p>
                      <p className="text-sm text-gray-600">years</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"
                    >
                      <Icons.users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800 mb-1">Appointments</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {stylist.performance?.totalAppointments || 0}
                      </p>
                      <p className="text-sm text-gray-600">completed</p>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg"
                    >
                      <span className="h-8 w-8 text-green-600 mx-auto mb-2 flex items-center justify-center text-2xl">★</span>
                      <h4 className="font-semibold text-gray-800 mb-1">Rating</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {(stylist.performance?.rating || 0).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">average</p>
                    </motion.div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="h-5 w-5 mr-2 text-amber-600 flex items-center justify-center">#</span>
                      Specializations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getSpecializations(stylist).map((spec, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-blue-100 text-gray-700 border-0">
                            {spec}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => handleBookAppointment(stylist)}
                      className="w-full bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-700 hover:to-blue-700 text-white text-lg py-6 shadow-lg transition-all duration-300"
                    >
                      <Icons.calendar className="h-5 w-5 mr-2" />
                      Book Appointment with {stylist.name}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Portfolio Section */}
            {stylist.portfolio && stylist.portfolio.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-800 flex items-center">
                      <span className="h-6 w-6 mr-3 text-amber-600 flex items-center justify-center">🖼</span>
                      Portfolio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stylist.portfolio.map((item: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -5 }}
                          className="relative group cursor-pointer"
                          onClick={() => handleViewPortfolioItem(item)}
                        >
                          <div className="relative overflow-hidden rounded-xl shadow-lg">
                            <Image
                              src={getPortfolioImage(item)}
                              alt={item.title || 'Portfolio item'}
                              width={300}
                              height={200}
                              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                              onLoadingComplete={() => handleImageLoad(`portfolio-${index}`)}
                              onLoadStart={() => handleImageLoadStart(`portfolio-${index}`)}
                            />
                            {imageLoading[`portfolio-${index}`] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <Icons.spinner className="h-6 w-6 animate-spin text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h4 className="font-semibold text-lg mb-1">
                                  {item.title || 'View Details'}
                                </h4>
                                {item.description && (
                                  <p className="text-sm opacity-90 line-clamp-2">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                <span className="h-5 w-5 text-white flex items-center justify-center">🔍</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Quick Stats */}
            <motion.div variants={itemVariants}>
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center">
                    <Icons.barChart3 className="h-5 w-5 mr-2 text-amber-600" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg">
                    <span className="text-gray-700 font-medium">Rating</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {renderStars(stylist.performance?.rating || 0)}
                      </div>
                      <span className="font-bold text-amber-600">
                        {(stylist.performance?.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <span className="text-gray-700 font-medium">Reviews</span>
                    <span className="font-bold text-blue-600">{stylist.performance?.reviewCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <span className="text-gray-700 font-medium">Experience</span>
                    <span className="font-bold text-green-600">{stylist.experience?.yearsExperience || 0} years</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <span className="text-gray-700 font-medium">Appointments</span>
                    <span className="font-bold text-purple-600">{stylist.performance?.totalAppointments || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Certifications */}
            {stylist.experience?.certifications && stylist.experience.certifications.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <span className="h-5 w-5 mr-2 text-amber-600 flex items-center justify-center">🏆</span>
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stylist.experience.certifications.map((cert: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ x: 5 }}
                          className="border-l-4 border-amber-600 pl-4 py-2 bg-gradient-to-r from-amber-50/50 to-transparent rounded-r-lg"
                        >
                          <h4 className="font-semibold text-gray-800">{cert.name}</h4>
                          {cert.issuingOrganization && (
                            <p className="text-sm text-gray-600 mt-1">{cert.issuingOrganization}</p>
                          )}
                          {cert.year && (
                            <p className="text-xs text-amber-600 font-medium mt-1">{cert.year}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Awards */}
            {stylist.experience?.awards && stylist.experience.awards.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <span className="h-5 w-5 mr-2 text-amber-600 flex items-center justify-center">🏆</span>
                      Awards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stylist.experience.awards.map((award: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0 flex items-center justify-center">🏆</span>
                            <div>
                              <h4 className="font-semibold text-gray-800">{award.name}</h4>
                              {award.description && (
                                <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                              )}
                              {award.year && (
                                <p className="text-xs text-amber-600 font-medium mt-2">{award.year}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Instagram Feed */}
            {stylist.socialMedia?.instagram && (
              <motion.div variants={itemVariants}>
                <InstagramFeed
                  stylistName={stylist.name}
                  username={stylist.socialMedia.instagram.split('/').pop()?.replace('@', '')}
                  className="shadow-lg"
                />
              </motion.div>
            )}

            {/* Enhanced Testimonials */}
            {stylist.testimonials && stylist.testimonials.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-gray-800 flex items-center">
                        <span className="h-5 w-5 mr-2 text-amber-600 flex items-center justify-center">💬</span>
                        Client Reviews
                      </CardTitle>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowTestimonialForm(true)}
                          size="sm"
                          className="bg-gradient-to-r from-amber-600 to-blue-600 hover:from-amber-700 hover:to-blue-700 text-white"
                        >
                          <span className="h-4 w-4 mr-1 flex items-center justify-center">+</span>
                          Write Review
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Testimonials
                      testimonials={stylist.testimonials}
                      stylistName={stylist.name}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Social Media */}
            {stylist.socialMedia && (
              <motion.div variants={itemVariants}>
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <span className="h-5 w-5 mr-2 text-amber-600 flex items-center justify-center">🔗</span>
                      Connect
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      {stylist.socialMedia.instagram && (
                        <motion.a
                          href={stylist.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <span className="h-6 w-6 flex items-center justify-center">📷</span>
                        </motion.a>
                      )}
                      {stylist.socialMedia.facebook && (
                        <motion.a
                          href={stylist.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <span className="h-6 w-6 flex items-center justify-center">f</span>
                        </motion.a>
                      )}
                      {stylist.socialMedia.website && (
                        <motion.a
                          href={stylist.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <Icons.externalLink className="h-6 w-6" />
                        </motion.a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Portfolio Modal */}
      <AnimatePresence>
        {showPortfolioModal && selectedPortfolioItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closePortfolioModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={getPortfolioImage(selectedPortfolioItem)}
                  alt={selectedPortfolioItem.title || 'Portfolio item'}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    onClick={closePortfolioModal}
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full p-2"
                  >
                    <Icons.x className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedPortfolioItem.title || 'Portfolio Item'}
                </h3>
                {selectedPortfolioItem.description && (
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {selectedPortfolioItem.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Testimonial Form Modal */}
      <AnimatePresence>
        {showTestimonialForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTestimonialForm(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Share Your Experience with {stylist?.name}
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowTestimonialForm(false)}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-2"
                  >
                    <Icons.x className="h-6 w-6" />
                  </Button>
                </div>

                <TestimonialForm
                  stylistId={stylist?.id || ''}
                  stylistName={stylist?.name || ''}
                  onSuccess={() => {
                    setShowTestimonialForm(false)
                    fetchStylist() // Refresh to show new testimonial
                    toast.success('Thank you for your review!', {
                      description: 'Your testimonial has been submitted successfully.'
                    })
                  }}
                  onCancel={() => setShowTestimonialForm(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
