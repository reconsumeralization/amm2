import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  ExternalLink,
  FileText,
  Users,
  Settings
} from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Shared Resources - Modern Men Hair BarberShop',
  description: 'Shared resources including glossary, troubleshooting, and updates',
}

export default function SharedDocumentationPage() {
  const sharedResources = [
    {
      title: 'FAQ',
      description: 'Frequently asked questions and answers for common issues',
      href: '/documentation/shared/faq',
      icon: <HelpCircle className="h-5 w-5" />,
      badge: 'Updated',
      badgeVariant: 'default' as const
    },
    {
      title: 'Troubleshooting',
      description: 'Step-by-step guides to resolve common problems',
      href: '/documentation/shared/troubleshooting',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: 'Essential',
      badgeVariant: 'destructive' as const
    },
    {
      title: 'Changelog',
      description: 'Latest updates, features, and bug fixes',
      href: '/documentation/shared/changelog',
      icon: <Clock className="h-5 w-5" />,
      badge: 'New',
      badgeVariant: 'secondary' as const
    },
    {
      title: 'Support',
      description: 'Get help from our support team and community',
      href: '/documentation/shared/support',
      icon: <MessageSquare className="h-5 w-5" />,
      badge: '24/7',
      badgeVariant: 'outline' as const
    }
  ]

  const quickLinks = [
    {
      title: 'System Status',
      description: 'Check current system health and uptime',
      href: '/api/healthcheck',
      external: true
    },
    {
      title: 'API Documentation',
      description: 'Complete API reference and examples',
      href: '/documentation/developer/api'
    },
    {
      title: 'Business Guides',
      description: 'Comprehensive business user documentation',
      href: '/documentation/business'
    }
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Shared Resources
        </h1>
        <p className="text-slate-300 text-lg">
          Access common resources, troubleshooting guides, and support materials used across all user roles.
        </p>
      </div>

      {/* Main Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {sharedResources.map((resource) => (
          <Card key={resource.title} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    {resource.icon}
                  </div>
                  <CardTitle className="text-slate-200">{resource.title}</CardTitle>
                </div>
                <Badge variant={resource.badgeVariant} className="text-xs">
                  {resource.badge}
                </Badge>
              </div>
              <CardDescription className="text-slate-400">
                {resource.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild variant="outline" className="w-full">
                <Link href={resource.href} className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  View Resource
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-slate-200 flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Quick Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Card key={link.title} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-200">{link.title}</h3>
                  {link.external && <ExternalLink className="h-4 w-4 text-slate-400" />}
                </div>
                <p className="text-sm text-slate-400 mb-3">{link.description}</p>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link 
                    href={link.href} 
                    {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    Access
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Resources
          </CardTitle>
          <CardDescription className="text-slate-400">
            More helpful resources and documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-slate-300 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community
              </h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• User forums and discussions</li>
                <li>• Feature requests and feedback</li>
                <li>• Community-contributed guides</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-300 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System Resources
              </h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>• Configuration templates</li>
                <li>• Best practices guides</li>
                <li>• Performance optimization tips</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
