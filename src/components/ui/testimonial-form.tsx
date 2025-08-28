'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface TestimonialFormProps {
  stylistId: string
  stylistName: string
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function TestimonialForm({ stylistId, stylistName, onSuccess, onCancel, className = '' }: TestimonialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [formData, setFormData] = useState({
    clientName: '',
    service: '',
    review: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.clientName || !formData.service || !formData.review) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.review.length < 10) {
      toast.error('Please write at least 10 characters for your review')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          service: formData.service,
          rating,
          review: formData.review,
          stylistId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      toast.success('Thank you for your review! It will be published after verification.')

      // Reset form
      setFormData({ clientName: '', service: '', review: '' })
      setRating(5)

      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className={`text-2xl transition-colors ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400`}
        >
          ★
        </button>
      )
    }
    return stars
  }

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icons.info className="h-5 w-5" />
          <span>Write a Review for {stylistName}</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Share your experience and help other clients make informed decisions
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="clientName" className="text-sm font-medium">
              Your Name *
            </Label>
            <Input
              id="clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Label htmlFor="service" className="text-sm font-medium">
              Service Received *
            </Label>
            <Input
              id="service"
              type="text"
              value={formData.service}
              onChange={(e) => handleInputChange('service', e.target.value)}
              placeholder="e.g., Hair Cut & Style, Beard Trim, Color Treatment"
              className="mt-1"
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Label className="text-sm font-medium">
              Rating *
            </Label>
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                {renderStars()}
              </div>
              <span className="text-sm text-gray-600">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Label htmlFor="review" className="text-sm font-medium">
              Your Review *
            </Label>
            <Textarea
              id="review"
              value={formData.review}
              onChange={(e) => handleInputChange('review', e.target.value)}
              placeholder="Tell others about your experience..."
              className="mt-1 min-h-[100px]"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.review.length}/500 characters (minimum 10)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 pt-4"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Icons.info className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            )}
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <Icons.info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Review Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Be honest and specific about your experience</li>
                <li>Focus on the service quality and results</li>
                <li>Keep it respectful and constructive</li>
                <li>Your review will be verified before publishing</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  )
}
