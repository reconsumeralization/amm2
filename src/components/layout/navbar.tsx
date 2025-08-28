'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Menu, 
  X, 
  Phone, 
  Calendar, 
  Search, 
  User, 
  Bell,
  Settings,
  LogOut,
  Scissors,
  Star,
  Home,
  Camera,
  BookOpen,
  BarChart3
} from '@/lib/icon-mapping'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// LogOut icon will use a simple text fallback

const navigation = [
  { name: 'Home', href: '/', icon: Home, description: 'Return to homepage' },
  { name: 'Services', href: '/services', icon: Scissors, description: 'Our salon services' },
  { name: 'About', href: '/about', icon: Star, description: 'Learn about us' },
  { name: 'Our Team', href: '/team', icon: User, description: 'Meet our stylists' },
  { name: 'Gallery', href: '/gallery', icon: Camera, description: 'View our work' },
  { name: 'Contact', href: '/contact', icon: Phone, description: 'Get in touch' },
  { name: 'Privacy Policy', href: '/privacy-policy', icon: BookOpen, description: 'Our privacy policy' },
]

const quickActions = [
  { name: 'Search', href: '/search', icon: 'search', description: 'Find services & info' },
  { name: 'Book Now', href: '/booking', icon: 'calendar', description: 'Schedule appointment', primary: true },
  { name: 'Call Us', href: 'tel:(306)522-4111', icon: 'phone', description: 'Call (306) 522-4111' },
]

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: BarChart3 },
  { name: 'Documentation', href: '/documentation', icon: BookOpen },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

const userNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [notifications] = useState(2) // Mock notification count
  const [loyaltyPoints] = useState(1250) // Mock loyalty points
  const pathname = usePathname()
  const { data: session } = useSession()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside or on link
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileMenuOpen) setIsMobileMenuOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMobileMenuOpen])

  // Fix: TS18047 - 'pathname' is possibly 'null'
  const isActivePath = (href: string) => {
    if (!pathname?.startsWith) return false
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href) || (href.startsWith('#') && pathname === '/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-100' 
        : 'bg-white/95 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  Modern Men
                </span>
                <span className="text-xs text-slate-500 -mt-1">Premium Salon</span>
              </div>
            </Link>
          </motion.div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`relative group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePath(item.href)
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-slate-700 hover:text-amber-600 hover:bg-amber-50/50'
                  }`}
                  title={item.description}
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActivePath(item.href) && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-1 h-1 bg-amber-500 rounded-full"
                      layoutId="navbar-indicator"
                      style={{ x: '-50%' }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="relative hover:bg-amber-50"
            >
              <Link href="/search" title="Search services and info">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            {/* Notifications */}
            {session && (
              <Button 
                variant="ghost" 
                size="sm"
                className="relative hover:bg-amber-50"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu or Auth */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-amber-50">
                    <User className="h-4 w-4 mr-2" />
                    {session.user?.name?.split(' ')[0] || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">{loyaltyPoints} points</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href}>
                        {React.createElement(item.icon, { className: "mr-2 h-4 w-4" })}
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin?callbackUrl=/portal">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  asChild
                >
                  <Link href="/auth/signin?callbackUrl=/portal">
                    Get Started
                  </Link>
                </Button>
              </div>
            )}

            {/* Phone Button */}
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700"
            >
              <Link href="tel:(306)522-4111">
                <Phone className="h-4 w-4 mr-2" />
                (306) 522-4111
              </Link>
            </Button>

            {/* Book Now - Primary CTA */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md hover:shadow-lg transition-all duration-200"
                asChild
              >
                <Link href="/booking">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Search */}
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-amber-600 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
              whileTap={{ scale: 0.95 }}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="block h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="block h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 shadow-lg"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActivePath(item.href)
                          ? 'text-amber-600 bg-amber-50 border-l-4 border-amber-500'
                          : 'text-slate-700 hover:text-amber-600 hover:bg-amber-50/50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-br from-amber-100 to-amber-200">
                        {React.createElement(item.icon, { className: "h-4 w-4 text-amber-600" })}
                      </div>
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-slate-500">{item.description}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile User Section */}
              {session && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="border-t border-gray-100 pt-4"
                >
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{session.user?.name}</p>
                      <p className="text-xs text-slate-500">{session.user?.email}</p>
                    </div>
                    {notifications > 0 && (
                      <Badge variant="destructive" className="h-6 w-6 p-0 text-xs">
                        {notifications}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Mobile User Actions */}
                  <div className="mt-3 space-y-2">
                    {userNavigation.map((item) => (
                      <Button 
                        key={item.name} 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        asChild
                      >
                        <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                          {React.createElement(item.icon, { className: "mr-3 h-4 w-4" })}
                          {item.name}
                        </Link>
                      </Button>
                    ))}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Mobile Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <Link href="/search" onClick={() => setIsMobileMenuOpen(false)}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)}>
                      <Camera className="h-4 w-4 mr-2" />
                      Gallery
                    </Link>
                  </Button>
                </div>
              </motion.div>

              {/* Mobile Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="space-y-3"
              >
                {!session && (
                  <div className="space-y-2">
                    <Button variant="outline" size="lg" className="w-full justify-start" asChild>
                      <Link href="/auth/signin?callbackUrl=/portal" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="h-5 w-5 mr-3" />
                        Sign In to Your Account
                      </Link>
                    </Button>
                    <Button 
                      size="lg" 
                      className="w-full justify-start bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      asChild
                    >
                      <Link href="/auth/signin?callbackUrl=/portal" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="h-5 w-5 mr-3" />
                        Create Account
                      </Link>
                    </Button>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full justify-start border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700"
                  asChild
                >
                  <Link href="tel:(306)522-4111" onClick={() => setIsMobileMenuOpen(false)}>
                    <Phone className="h-5 w-5 mr-3" />
                    Call (306) 522-4111
                  </Link>
                </Button>

                <Button 
                  size="lg" 
                  className="w-full justify-start bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md"
                  asChild
                >
                  <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                    <Calendar className="h-5 w-5 mr-3" />
                    Book Your Appointment
                  </Link>
                </Button>
              </motion.div>

              {/* Mobile Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className="border-t border-gray-100 pt-4 text-center"
              >
                {session && (
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="h-3 w-3 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">{loyaltyPoints} loyalty points</span>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  © 2024 Modern Men • Premium Hair Salon
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}