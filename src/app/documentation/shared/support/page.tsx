import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Bell, Phone, MessageSquare, Clock, AlertTriangle, CheckCircle, Users, Headphones, FileText, ExternalLink } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Contact Support - Documentation',
  description: 'Get help and support for the Modern Men Hair Salon management system.',
}

export default function SupportPage() {
  const supportChannels = [
    {
      title: 'Email Support',
      description: 'Get detailed help via email. Best for complex issues or when you need to share screenshots.',
      icon: <Mail className="h-6 w-6 text-blue-400" />,
      contact: 'support@modernmenhairsalon.com',
      responseTime: '24-48 hours',
      availability: '24/7',
      bestFor: ['Complex technical issues', 'Account problems', 'Feature requests', 'Bug reports'],
      priority: 'standard'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our support team for urgent issues.',
      icon: <Phone className="h-6 w-6 text-green-400" />,
      contact: '+1 (555) 123-4567',
      responseTime: 'Immediate',
      availability: 'Mon-Fri 9AM-6PM EST',
      bestFor: ['Urgent issues', 'System outages', 'Payment problems', 'Account lockouts'],
      priority: 'urgent'
    },
    {
      title: 'Live Chat',
      description: 'Quick help through our live chat system during business hours.',
      icon: <MessageCircle className="h-6 w-6 text-purple-400" />,
      contact: 'Available in-app',
      responseTime: '5-10 minutes',
      availability: 'Mon-Fri 9AM-6PM EST',
      bestFor: ['Quick questions', 'How-to guidance', 'General inquiries', 'Navigation help'],
      priority: 'standard'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and get help from the community.',
      icon: <Users className="h-6 w-6 text-orange-400" />,
      contact: 'forum.modernmenhairsalon.com',
      responseTime: 'Varies',
      availability: '24/7',
      bestFor: ['Best practices', 'Tips and tricks', 'Feature discussions', 'User experiences'],
      priority: 'community'
    }
  ]

  const supportCategories = [
    {
      category: 'Technical Issues',
      icon: <AlertCircle className="h-5 w-5 text-red-400" />,
      description: 'System errors, performance problems, or technical difficulties',
      examples: ['Login problems', 'System crashes', 'Data not saving', 'Performance issues'],
      recommendedChannel: 'Email or Phone',
      urgency: 'High'
    },
    {
      category: 'Account & Billing',
      icon: <FileText className="h-5 w-5 text-blue-400" />,
      description: 'Account management, billing questions, or subscription issues',
      examples: ['Password reset', 'Billing inquiries', 'Account upgrades', 'User permissions'],
      recommendedChannel: 'Email or Phone',
      urgency: 'Medium'
    },
    {
      category: 'How-to & Training',
      icon: <Headphones className="h-5 w-5 text-green-400" />,
      description: 'Learning how to use features or need guidance on best practices',
      examples: ['Feature tutorials', 'Best practices', 'Training requests', 'Workflow guidance'],
      recommendedChannel: 'Live Chat or Community',
      urgency: 'Low'
    },
    {
      category: 'Feature Requests',
      icon: <CheckCircle className="h-5 w-5 text-purple-400" />,
      description: 'Suggestions for new features or improvements to existing ones',
      examples: ['New feature ideas', 'UI improvements', 'Integration requests', 'Workflow enhancements'],
      recommendedChannel: 'Email or Community',
      urgency: 'Low'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive'
      case 'standard':
        return 'default'
      case 'community':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Headphones className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            Contact Support
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Get help when you need it. Choose the best support channel for your situation.
        </p>
      </div>

      {/* Emergency Alert */}
      <Alert className="mb-8 border-red-700/50 bg-red-900/20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>System Emergency?</AlertTitle>
        <AlertDescription>
          For critical system outages or security issues, call our emergency hotline: 
          <strong className="text-red-300 ml-1">+1 (555) 911-HELP</strong> (available 24/7)
        </AlertDescription>
      </Alert>

      {/* Support Channels */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6">Support Channels</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {supportChannels.map((channel, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {channel.icon}
                    <CardTitle className="text-lg text-slate-100">
                      {channel.title}
                    </CardTitle>
                  </div>
                  <Badge variant={getPriorityColor(channel.priority)} className="text-xs">
                    {channel.priority.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="text-slate-300">
                  {channel.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-200">Contact:</span>
                    <span className="text-slate-300">{channel.contact}</span>
                    {channel.contact.includes('http') && (
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-300">Response: {channel.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-slate-200">Available:</span>
                    <span className="text-slate-300">{channel.availability}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-200 mb-2 text-sm">Best for:</h4>
                  <ul className="list-disc list-inside text-slate-300 text-xs space-y-1">
                    {channel.bestFor.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Support Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-100 mb-6">What type of help do you need?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportCategories.map((category, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  {category.icon}
                  {category.category}
                </CardTitle>
                <CardDescription className="text-slate-300 text-sm">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <h4 className="font-medium text-slate-200 mb-1 text-sm">Examples:</h4>
                  <div className="flex flex-wrap gap-1">
                    {category.examples.map((example, exampleIndex) => (
                      <Badge key={exampleIndex} variant="outline" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">
                    <strong>Recommended:</strong> {category.recommendedChannel}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {category.urgency}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Before Contacting Support */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-100 mb-4">Before contacting support</h2>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg text-slate-100">Help us help you faster</CardTitle>
            <CardDescription>
              Having this information ready will help us resolve your issue more quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-200 mb-2">For Technical Issues:</h4>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  <li>What were you trying to do?</li>
                  <li>What happened instead?</li>
                  <li>Any error messages (exact text)</li>
                  <li>Your browser and version</li>
                  <li>Screenshots of the issue</li>
                  <li>Steps to reproduce the problem</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-200 mb-2">For Account Issues:</h4>
                <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                  <li>Your account email address</li>
                  <li>Your user role in the system</li>
                  <li>When the issue started</li>
                  <li>What you were trying to access</li>
                  <li>Any recent changes to your account</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Self-Help Resources */}
      <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Try these self-help resources first
        </h3>
        <p className="text-slate-300 mb-4">
          You might find a quick solution in our documentation.
        </p>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/documentation/shared/faq"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            FAQ
          </a>
          <a 
            href="/documentation/shared/troubleshooting"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
          >
            Troubleshooting Guide
          </a>
          <a 
            href="/documentation"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
          >
            Documentation Home
          </a>
        </div>
      </div>
    </div>
  )
}