'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContact: '',
    preferredStylist: '',
    hairType: '',
    skinSensitivity: '',
    specialNotes: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/portal/login')
    } else {
      // Load user profile data
      setFormData({
        name: session.user?.name || '',
        email: session.user?.email || '',
        phone: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
        preferredStylist: '',
        hairType: '',
        skinSensitivity: '',
        specialNotes: ''
      })
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success('Profile updated successfully!', {
        description: 'Your profile information has been saved.'
      })

      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin text-amber-600" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-amber-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl text-white font-bold">✂</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-amber-600 to-blue-800 bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/portal')}
              className="border-amber-200 hover:border-amber-300 hover:bg-amber-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-amber-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Icons.users className="h-5 w-5" />
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-amber-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                    <span className="text-3xl text-white font-bold">
                      {session.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {session.user?.name || 'User'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {session.user?.email}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Icons.calendar className="h-4 w-4" />
                      <span>Member since 2025</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Icons.scissors className="h-4 w-4" />
                      <span>5 appointments</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg mt-6">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="text-base">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Visits</span>
                    <span className="font-bold text-blue-600">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Loyalty Points</span>
                    <span className="font-bold text-amber-600">450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Next Visit</span>
                    <span className="font-bold text-green-600">Mar 15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Member Status</span>
                    <span className="font-bold text-blue-600">Gold</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-800 to-amber-700 text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription className="text-blue-100">
                      Keep your information up to date for better service
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-blue-800"
                    >
                      <Icons.edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-blue-800"
                    >
                      <Icons.x className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your phone number"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        disabled={!isEditing}
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your full address"
                      rows={3}
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {/* Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredStylist" className="text-sm font-medium text-gray-700">
                        Preferred Stylist
                      </Label>
                      <select
                        id="preferredStylist"
                        value={formData.preferredStylist}
                        onChange={(e) => handleInputChange('preferredStylist', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-amber-200 rounded-lg focus:border-amber-400 focus:ring-amber-400 bg-white"
                      >
                        <option value="">No preference</option>
                        <option value="alex">Alex Johnson</option>
                        <option value="sam">Sam Rodriguez</option>
                        <option value="chris">Chris Thompson</option>
                        <option value="mike">Mike Davis</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hairType" className="text-sm font-medium text-gray-700">
                        Hair Type
                      </Label>
                      <select
                        id="hairType"
                        value={formData.hairType}
                        onChange={(e) => handleInputChange('hairType', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-amber-200 rounded-lg focus:border-amber-400 focus:ring-amber-400 bg-white"
                      >
                        <option value="">Select hair type</option>
                        <option value="straight">Straight</option>
                        <option value="wavy">Wavy</option>
                        <option value="curly">Curly</option>
                        <option value="coily">Coily</option>
                        <option value="fine">Fine</option>
                        <option value="thick">Thick</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="skinSensitivity" className="text-sm font-medium text-gray-700">
                        Skin Sensitivity
                      </Label>
                      <select
                        id="skinSensitivity"
                        value={formData.skinSensitivity}
                        onChange={(e) => handleInputChange('skinSensitivity', e.target.value)}
                        disabled={!isEditing}
                        className="w-full p-3 border border-amber-200 rounded-lg focus:border-amber-400 focus:ring-amber-400 bg-white"
                      >
                        <option value="">Select sensitivity level</option>
                        <option value="low">Low Sensitivity</option>
                        <option value="medium">Medium Sensitivity</option>
                        <option value="high">High Sensitivity</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-sm font-medium text-gray-700">
                        Emergency Contact
                      </Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Name and phone number"
                        className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  {/* Special Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="specialNotes" className="text-sm font-medium text-gray-700">
                      Special Notes or Preferences
                    </Label>
                    <Textarea
                      id="specialNotes"
                      value={formData.specialNotes}
                      onChange={(e) => handleInputChange('specialNotes', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Any allergies, medical conditions, or special preferences..."
                      rows={4}
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-amber-600 hover:from-blue-700 hover:to-amber-700 text-white font-semibold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icons.save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 bg-white border-t border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 Modern Men Barbershop. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
