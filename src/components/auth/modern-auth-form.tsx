"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, signUp, resetPassword, confirmResetPassword } from "@/lib/simple-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Loading } from "@/components/ui/loading"
import { useToast } from "@/hooks/use-toast"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthFormProps {
  mode?: 'signin' | 'signup' | 'reset' | 'confirm-reset'
  redirectTo?: string
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
  className?: string
}

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone: string
  acceptTerms: boolean
  acceptMarketing: boolean
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  phone?: string
  acceptTerms?: string
  general?: string
}

export function ModernAuthForm({
  mode = 'signin',
  redirectTo = '/dashboard',
  onSuccess,
  onError,
  className
}: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get mode from URL parameters or props
  const currentMode = searchParams.get('mode') as AuthFormProps['mode'] || mode

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(currentMode === 'signup' ? 'signup' : 'signin')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetConfirmed, setResetConfirmed] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptTerms: false,
    acceptMarketing: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Update active tab when mode changes
  useEffect(() => {
    if (currentMode === 'signup') {
      setActiveTab('signup')
    } else if (currentMode === 'signin') {
      setActiveTab('signin')
    }
  }, [currentMode])

  // Validate form fields
  const validateField = useCallback((name: keyof FormData, value: any): string | undefined => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address'
        break
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Password must contain uppercase, lowercase, and number'
        }
        break
      case 'confirmPassword':
        if (activeTab === 'signup' && value !== formData.password) {
          return 'Passwords do not match'
        }
        break
      case 'firstName':
        if (activeTab === 'signup' && !value) return 'First name is required'
        if (activeTab === 'signup' && value.length < 2) return 'First name too short'
        break
      case 'lastName':
        if (activeTab === 'signup' && !value) return 'Last name is required'
        if (activeTab === 'signup' && value.length < 2) return 'Last name too short'
        break
      case 'phone':
        if (activeTab === 'signup' && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
          return 'Invalid phone number format'
        }
        break
      case 'acceptTerms':
        if (activeTab === 'signup' && !value) return 'You must accept the terms and conditions'
        break
    }
    return undefined
  }, [activeTab, formData.password])

  // Handle input changes with validation
  const handleInputChange = useCallback((name: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Validate field
    const fieldError = validateField(name, value)
    if (fieldError) {
      setErrors(prev => ({ ...prev, [name]: fieldError }))
    }
  }, [errors, validateField])

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    // Required fields validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
      isValid = false
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
      isValid = false
    }

    if (activeTab === 'signup') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required'
        isValid = false
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required'
        isValid = false
      }

      if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match'
        isValid = false
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }, [formData, activeTab])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      if (activeTab === 'signin') {
        // Sign in
        const result = await signIn({
          email: formData.email,
          password: formData.password,
        })

        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        })

        onSuccess?.(result.user)
        router.push(redirectTo)

      } else if (activeTab === 'signup') {
        // Sign up
        const result = await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          acceptMarketing: formData.acceptMarketing,
        })

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        })

        onSuccess?.(result.user)
        // Don't redirect immediately for email verification
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred'
      setErrors({ general: errorMessage })
      onError?.(errorMessage)

      toast({
        title: "Authentication failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required for password reset' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Invalid email address' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await resetPassword(formData.email)
      setResetSent(true)

      toast({
        title: "Password reset sent",
        description: "Check your email for password reset instructions.",
      })
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send password reset email'
      setErrors({ general: errorMessage })

      toast({
        title: "Password reset failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social authentication
  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'instagram') => {
    setIsLoading(true)

    try {
      // This would integrate with your social auth provider
      toast({
        title: `${provider} authentication`,
        description: "Redirecting to authentication provider...",
      })

      // In a real implementation, this would redirect to OAuth provider
      // For now, we'll just show a placeholder
    } catch (error: any) {
      toast({
        title: "Social authentication failed",
        description: error.message || "Failed to authenticate with social provider",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password confirmation
  const handleConfirmReset = async (token: string, newPassword: string) => {
    setIsLoading(true)

    try {
      await confirmResetPassword(token, newPassword)
      setResetConfirmed(true)

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      })

      // Redirect to sign in
      setTimeout(() => {
        router.push('/auth?mode=signin')
      }, 2000)
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to reset password' })
    } finally {
      setIsLoading(false)
    }
  }

  // Render password reset form
  if (currentMode === 'reset') {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          {resetSent ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password reset email sent! Check your inbox and follow the instructions.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset() }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn("pl-10", errors.email && "border-red-500")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loading size="sm" /> : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/auth?mode=signin')}
              className="text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render password reset confirmation
  if (currentMode === 'confirm-reset') {
    const token = searchParams.get('token')

    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          {resetConfirmed ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Password updated successfully! Redirecting to sign in...
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault()
              const newPassword = formData.password
              if (token && newPassword) {
                handleConfirmReset(token, newPassword)
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn("pl-10 pr-10", errors.password && "border-red-500")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loading size="sm" /> : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    )
  }

  // Main authentication form
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Modern Men</CardTitle>
        <CardDescription>
          {activeTab === 'signin'
            ? "Sign in to your account to continue"
            : "Create your account to get started"
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn("pl-10", errors.email && "border-red-500")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn("pl-10 pr-10", errors.password && "border-red-500")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => router.push('/auth?mode=reset')}
                >
                  Forgot password?
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={cn("pl-10", errors.firstName && "border-red-500")}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={cn(errors.lastName && "border-red-500")}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={cn("pl-10", errors.email && "border-red-500")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={cn("pl-10", errors.phone && "border-red-500")}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={cn("pl-10 pr-10", errors.password && "border-red-500")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={cn("pl-10 pr-10", errors.confirmPassword && "border-red-500")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Privacy Policy
                    </Button>
                  </Label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.acceptTerms}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketing"
                    checked={formData.acceptMarketing}
                    onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked)}
                  />
                  <Label htmlFor="marketing" className="text-sm">
                    I agree to receive marketing communications
                  </Label>
                </div>
              </div>
            </TabsContent>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loading size="sm" />
              ) : activeTab === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </Tabs>

        {/* Social Authentication */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('google')}
              disabled={isLoading}
              className="w-full"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('facebook')}
              disabled={isLoading}
              className="w-full"
            >
              <Facebook className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('instagram')}
              disabled={isLoading}
              className="w-full"
            >
              <Instagram className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="text-center">
        <p className="text-sm text-muted-foreground">
          By signing up, you agree to our{" "}
          <Button variant="link" className="p-0 h-auto text-sm">
            Terms of Service
          </Button>{" "}
          and{" "}
          <Button variant="link" className="p-0 h-auto text-sm">
            Privacy Policy
          </Button>
        </p>
      </CardFooter>
    </Card>
  )
}
