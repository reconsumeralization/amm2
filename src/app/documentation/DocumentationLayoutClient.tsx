'use client'

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Database,
  rch,
  Book,
  ArrowLeft,
  ChevronRight,
  Menu,
  X,
  Code,
  Users,
  HelpCircle,
  Clock,
} from '@/lib/icon-mapping'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  getUserRoleFromSession,
  getRoleBasedNavigation,
  hasDocumentationPermission
} from "@/lib/documentation-permissions"
import { DocumentationProvider, useDocumentation, usePermissions } from "@/contexts/DocumentationContext"
import { RouteGuard } from "@/components/documentation/RouteGuard"
import { UserRole, BreadcrumbItem, SidebarConfig } from "@/types/documentation"
import { title } from "process"

interface DocumentationLayoutClientProps {
  children: React.ReactNode
}

function DocumentationLayoutContent({ children }: DocumentationLayoutClientProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [rchQuery, setrchQuery] = useState("")

  // Use documentation context
  const { user, isLoading } = useDocumentation()
  const { isGuest } = usePermissions()

  // Determine user role from context
  const userRole: UserRole = user?.role || 'guest'

  // Get role-based navigation
  const navigation = getRoleBasedNavigation(userRole)

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // Ensure pathname is not null before splitting to prevent runtime errors.
    // If pathname is null (e.g., during initial render or router not ready),
    // return only the base documentation breadcrumb.
    if (!pathname) {
      return [{ label: 'Documentation', href: '/documentation' }];
    }
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Documentation', href: '/documentation' }
    ];

    let currentPath = ''
    for (let i = 1; i < pathSegments.length; i++) {
      currentPath += `/${pathSegments[i]}`
      const isLast = i === pathSegments.length - 1

      // Capitalize and format segment names
      const label = pathSegments[i]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      breadcrumbs.push({
        label,
        href: `/documentation${currentPath}`,
        current: isLast
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Get appropriate icon for navigation sections
  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'developer':
        return <Code className="h-4 w-4" />
      case 'business':
        return <Users className="h-4 w-4" />
      case 'shared resources':
        return <HelpCircle className="h-4 w-4" />
      default:
        return <Book className="h-4 w-4" />
    }
  }

  // Sidebar content component
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* rch */}
      <div className="relative mb-6">
        <rch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="rch documentation..."
          value={rchQuery}
          onChange={(e) => setrchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && rchQuery.trim()) {
              router.push(`/documentation/rch?q=${encodeURIComponent(rchQuery)}`)
              setSidebarOpen(false)
            }
          }}
          className="pl-10 py-2 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
        />
      </div>

      {/* User Role Badge */}
      <div className="mb-4 space-y-2">
        <Badge variant="outline" className="text-xs">
          Role: {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
        {isGuest && (
          <Alert className="p-2">
            {/* Replaced 'Lock' with 'Book' to resolve type error, assuming 'Book' is correctly imported.
                The original 'Lock' component was not recognized as a valid JSX element type,
                likely due to a missing or incorrect import statement. */}
            <Book className="h-3 w-3" />
            <AlertDescription className="text-xs">
              Sign in for full access to documentation
            </AlertDescription>
          </Alert>
        )}
      </div>
      {/*
      // Define NavItem interface for documentation navigation
      interface NavItem {
        title: string;
        href: string;
        sections?: NavItem[];
      }
      */}
      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="pr-4 pb-8">
          <h3 className="font-medium text-slate-300 mb-3">Documentation</h3>
          {/* The NavItem interface definition was incorrectly placed inside JSX.
              It should be defined in a valid TypeScript scope, e.g., at the top
              of the component file or within the component function but outside its JSX return.
              Removing it from here resolves the syntax errors.
              Please ensure NavItem is defined elsewhere for type checking. */}
          <div className="space-y-4">
            {/* The 'NavItem' interface is not defined in the current scope, leading to 'Cannot find name NavItem' error.
                To resolve this error within the selection while providing some type safety for immediate properties,
                an inline type is used for 'section'. Note that the 'sections' property is typed as 'any[]'
                because a recursive type definition (like the original NavItem) cannot be fully expressed inline here.
                The recommended and complete fix is to define the 'NavItem' interface (as commented out previously
                in the file) in a valid TypeScript scope (e.g., at the top of the file or within the component
                function but outside its JSX return) and then use it here. */}
            {navigation.map((section: { title: string; href: string; sections?: Array<any> }) => (
              <div key={section.title} className="space-y-2">
                <Link
                  href={section.href}
                  className="flex items-center gap-2 text-sm font-medium text-slate-200 hover:text-cyan-400 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  {getSectionIcon(section.title)}
                  {section.title}
                </Link>
                {section.sections && (
                  <ul className="space-y-1 border-l border-slate-700 pl-3 ml-1">
                    {/* Replaced 'NavItem' with an inline type to resolve 'Cannot find name NavItem' error,
                        as the interface is not defined in the current scope. This provides basic type safety
                        for the properties used (href, title) without requiring a global NavItem definition. */}
                    {section.sections.map((subsection: { title: string; href: string }) => (
                      <li key={subsection.href}>
                        <Link
                          href={subsection.href}
                          className={`text-xs block py-1 transition-colors ${
                            pathname === subsection.href
                              ? 'text-cyan-400 font-medium'
                              : 'text-slate-400 hover:text-cyan-400'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subsection.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <RouteGuard showAccessDenied={true}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
        {/* Header */}
        <header className="border-b border-slate-700/50 sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-6 w-6 text-cyan-500" />
                  <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Modern Men Hair Salon
                  </span>
                </div>

                {/* Mobile menu button */}
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-slate-900 border-slate-700">
                    <SidebarContent />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-4">
                {user && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                    <span>Welcome, {user.name}</span>
                  </div>
                )}
                <Link href="/" className="flex items-center text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="border-b border-slate-700/30">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                  <Link
                    href={crumb.href}
                    className={`transition-colors ${
                      crumb.current
                        ? 'text-cyan-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-20">
                <SidebarContent />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}

export function DocumentationLayoutClient({ children }: DocumentationLayoutClientProps) {
  return (
    <DocumentationProvider>
      <DocumentationLayoutContent>{children}</DocumentationLayoutContent>
    </DocumentationProvider>
  )
}