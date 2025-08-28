'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
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

export default function StylistProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [stylist, setStylist] = useState<Stylist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any | null>(null)
  const [showPortfolioModal, setShowPortfolioModal] = useState(false)
  const [showTestimonialForm, setShowTestimonialForm] = useState(false)

  const fetchStylist = useCallback(async () => {
    try {
      setLoading(true)
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
      setError(err instanceof Error ? err.message : 'Failed to load stylist profile')
      toast.error('Failed to load stylist profile')
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
      return ['General Styling']
    }
    return stylist.specializations.map(spec => spec.name || spec.title || spec)
  }

  const handleBookAppointment = (stylist: Stylist) => {
    localStorage.setItem('selectedStylist', JSON.stringify({
      id: stylist.id,
      name: stylist.name
    }))
    toast.success(`Selected ${stylist.name} for booking`)
    router.push('/portal/book')
  }

  const handleViewPortfolioItem = (item: any) => {
    setSelectedPortfolioItem(item)
    setShowPortfolioModal(true)
  }

  const closePortfolioModal = () => {
    setShowPortfolioModal(false)
    setSelectedPortfolioItem(null)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400 text-lg">★</span>)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400 text-lg">☆</span>)
      } else {
        stars.push(<span key={i} className="text-gray-400 text-lg">☆</span>)
      }
    }
    return stars
  }

  const getPortfolioImage = (item: any) => {
    if (item?.image?.url) return item.image.url
    if (item?.url) return item.url
    return 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="h-12 w-12 animate-spin text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Profile</h2>
          <p className="text-gray-600">Please wait while we load the stylist profile...</p>
        </div>
      </div>
    )
  }

  if (error || !stylist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Icons.x className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested stylist profile could not be found.'}</p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => router.push('/team')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Back to Team
            </Button>
            <Button
              onClick={fetchStylist}
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
            >
              <Icons.refreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-amber-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/team')}
              className="text-white hover:bg-white/20"
            >
              <Icons.arrowLeft className="h-5 w-5 mr-2" />
              Back to Team
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Image
              src={getProfileImage(stylist)}
              alt={stylist.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-4 border-white object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{stylist.name}</h1>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(stylist.performance?.rating || 0)}
                </div>
                {stylist.performance?.reviewCount && (
                  <span className="text-blue-100">
                    ({stylist.performance.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>About {stylist.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {formatBio(stylist.bio)}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Experience</h4>
                      <p className="text-gray-600">
                        {stylist.experience?.yearsExperience || 0}+ years in the industry
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Appointments</h4>
                      <p className="text-gray-600">
                        {stylist.performance?.totalAppointments || 0} completed
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {getSpecializations(stylist).map((spec, i) => (
                      <Badge key={i} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleBookAppointment(stylist)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Book Appointment with {stylist.name}
                  </Button>
                </CardContent>
              </Card>

              {/* Portfolio Section */}
              {stylist.portfolio && stylist.portfolio.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stylist.portfolio.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer"
                          onClick={() => handleViewPortfolioItem(item)}
                        >
                          <Image
                            src={getPortfolioImage(item)}
                            alt={item.title || 'Portfolio item'}
                            width={300}
                            height={192}
                            className="w-full h-48 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                              <Icons.info className="h-8 w-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">{item.title || 'View Details'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center">
                      {renderStars(stylist.performance?.rating || 0)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold">{stylist.performance?.reviewCount || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold">{stylist.experience?.yearsExperience || 0} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Appointments</span>
                    <span className="font-semibold">{stylist.performance?.totalAppointments || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Certifications */}
            {stylist.experience?.certifications && stylist.experience.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stylist.experience.certifications.map((cert: any, i: number) => (
                        <div key={i} className="border-l-4 border-amber-600 pl-3">
                          <h4 className="font-medium text-gray-800">{cert.name}</h4>
                          {cert.issuingOrganization && (
                            <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                          )}
                          {cert.year && (
                            <p className="text-xs text-amber-600">{cert.year}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Awards */}
            {stylist.experience?.awards && stylist.experience.awards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Awards</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stylist.experience.awards.map((award: any, i: number) => (
                        <div key={i} className="bg-amber-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-800">{award.name}</h4>
                          {award.description && (
                            <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                          )}
                          {award.year && (
                            <p className="text-xs text-amber-600 mt-1">{award.year}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Instagram Feed */}
            {stylist.socialMedia?.instagram && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <InstagramFeed
                  stylistName={stylist.name}
                  username={stylist.socialMedia.instagram.split('/').pop()?.replace('@', '')}
                  className="mb-6"
                />
              </motion.div>
            )}

            {/* Testimonials */}
            {stylist.testimonials && stylist.testimonials.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-800">Client Reviews</h4>
                        <Button
                          onClick={() => setShowTestimonialForm(true)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-sm"
                        >
                          <Icons.info className="h-4 w-4 mr-2" />
                          Write Review
                        </Button>
                      </div>
                      <Testimonials
                        testimonials={stylist.testimonials}
                        stylistName={stylist.name}
                      />
                    </div>
              </motion.div>
            )}

            {/* Social Media */}
            {stylist.socialMedia && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Connect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      {stylist.socialMedia.instagram && (
                        <a
                          href={stylist.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
                        >
                          <Icons.phone className="h-6 w-6" />
                        </a>
                      )}
                      {stylist.socialMedia.facebook && (
                        <a
                          href={stylist.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                          <Icons.users className="h-6 w-6" />
                        </a>
                      )}
                      {stylist.socialMedia.website && (
                        <a
                          href={stylist.socialMedia.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                        >
                          <Icons.externalLink className="h-6 w-6" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {showPortfolioModal && selectedPortfolioItem && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedPortfolioItem.title || 'Portfolio Item'}
                </h3>
                <Button
                  variant="ghost"
                  onClick={closePortfolioModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Icons.x className="h-6 w-6" />
                </Button>
              </div>

              <Image
                src={getPortfolioImage(selectedPortfolioItem)}
                alt={selectedPortfolioItem.title || 'Portfolio item'}
                width={800}
                height={384}
                className="w-full h-96 object-cover rounded-lg mb-4"
              />

              {selectedPortfolioItem.description && (
                <p className="text-gray-700">{selectedPortfolioItem.description}</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Testimonial Form Modal */}
      {showTestimonialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Share Your Experience with {stylist?.name}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowTestimonialForm(false)}
                  className="text-gray-500 hover:text-gray-700"
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
                }}
                onCancel={() => setShowTestimonialForm(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
