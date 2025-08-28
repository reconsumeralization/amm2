import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, WifiOff, Monitor, Smartphone, Database, Cog, Settings, Globe } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Troubleshooting Guide - Documentation',
  description: 'Step-by-step solutions for common issues with the salon management system.',
}

export default function TroubleshootingPage() {
  const troubleshootingCategories = [
    {
      category: 'Login & Authentication',
      icon: <Settings className="h-6 w-6 text-red-400" />,
      issues: [
        {
          problem: 'Cannot log in to the system',
          severity: 'high',
          symptoms: ['Login page shows error message', 'Credentials not accepted', 'Page redirects back to login'],
          solutions: [
            'Verify your username and password are correct',
            'Check if Caps Lock is enabled',
            'Try resetting your password using "Forgot Password"',
            'Clear your browser cache and cookies',
            'Try logging in from an incognito/private browser window',
            'Contact your administrator if the issue persists'
          ],
          tags: ['login', 'authentication', 'password']
        },
        {
          problem: 'Session expires too quickly',
          severity: 'medium',
          symptoms: ['Frequent logout prompts', 'Need to re-login often', 'Session timeout messages'],
          solutions: [
            'Check if you have multiple browser tabs open with the system',
            'Ensure your browser accepts cookies',
            'Contact administrator to adjust session timeout settings',
            'Use "Remember Me" option if available'
          ],
          tags: ['session', 'timeout', 'cookies']
        }
      ]
    },
    {
      category: 'Performance Issues',
      icon: <Monitor className="h-6 w-6 text-yellow-400" />,
      issues: [
        {
          problem: 'System is running slowly',
          severity: 'medium',
          symptoms: ['Pages take long to load', 'Buttons are unresponsive', 'Timeouts when saving data'],
          solutions: [
            'Check your internet connection speed',
            'Close unnecessary browser tabs and applications',
            'Clear browser cache and temporary files',
            'Try using a different browser (Chrome, Firefox, Safari)',
            'Restart your browser or computer',
            'Check if other websites are also slow'
          ],
          tags: ['performance', 'speed', 'browser']
        },
        {
          problem: 'Mobile app is laggy or crashes',
          severity: 'high',
          symptoms: ['App freezes frequently', 'Slow response to touches', 'App closes unexpectedly'],
          solutions: [
            'Force close and restart the app',
            'Update the app to the latest version',
            'Restart your mobile device',
            'Free up storage space on your device',
            'Check for iOS/Android system updates',
            'Reinstall the app if issues persist'
          ],
          tags: ['mobile', 'app', 'performance']
        }
      ]
    },
    {
      category: 'Booking & Appointments',
      icon: <Database className="h-6 w-6 text-blue-400" />,
      issues: [
        {
          problem: 'Cannot book an appointment',
          severity: 'high',
          symptoms: ['Booking form shows errors', 'No available time slots', 'Payment processing fails'],
          solutions: [
            'Check if you\'re selecting a date in the future',
            'Verify the selected service and stylist are available',
            'Try selecting a different time or date',
            'Ensure your payment information is correct and up to date',
            'Try booking by phone if online booking fails',
            'Contact the salon directly for assistance'
          ],
          tags: ['booking', 'appointments', 'payment']
        },
        {
          problem: 'Appointment confirmation not received',
          severity: 'medium',
          symptoms: ['No confirmation email', 'No SMS notification', 'Appointment not in calendar'],
          solutions: [
            'Check your email spam/junk folder',
            'Verify your email address and phone number are correct',
            'Log into your account to confirm the appointment was saved',
            'Contact the salon to verify your appointment',
            'Update your notification preferences in settings'
          ],
          tags: ['confirmation', 'notifications', 'email']
        }
      ]
    },
    {
      category: 'Browser & Compatibility',
      icon: <Globe className="h-6 w-6 text-green-400" />,
      issues: [
        {
          problem: 'Website not displaying correctly',
          severity: 'medium',
          symptoms: ['Layout is broken', 'Missing buttons or text', 'Images not loading', 'Overlapping elements'],
          solutions: [
            'Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)',
            'Clear your browser cache and cookies',
            'Update your browser to the latest version',
            'Try a different browser (Chrome, Firefox, Safari, Edge)',
            'Disable browser extensions temporarily',
            'Check if JavaScript is enabled in your browser'
          ],
          tags: ['browser', 'display', 'compatibility']
        },
        {
          problem: 'Features not working on mobile',
          severity: 'medium',
          symptoms: ['Buttons not clickable', 'Forms not submitting', 'Menu not opening'],
          solutions: [
            'Try rotating your device to landscape mode',
            'Zoom out if the page appears too large',
            'Use the mobile app instead of the browser',
            'Try a different mobile browser',
            'Clear mobile browser cache',
            'Update your mobile browser'
          ],
          tags: ['mobile', 'browser', 'responsive']
        }
      ]
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />
      case 'low':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            Troubleshooting Guide
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Step-by-step solutions for common issues. Follow the solutions in order for the best results.
        </p>
      </div>

      {/* Quick Actions */}
      <Alert className="mb-8 border-blue-700/50 bg-blue-900/20">
        <RefreshCw className="h-4 w-4" />
        <AlertTitle>Quick Fixes</AlertTitle>
        <AlertDescription>
          Before diving into specific issues, try these common solutions:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Refresh the page (Ctrl+F5 or Cmd+Shift+R)</li>
            <li>Clear your browser cache and cookies</li>
            <li>Try using an incognito/private browser window</li>
            <li>Check your internet connection</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {troubleshootingCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <div className="flex items-center gap-3 mb-6">
              {category.icon}
              <h2 className="text-2xl font-semibold text-slate-100">
                {category.category}
              </h2>
            </div>
            
            <div className="space-y-6">
              {category.issues.map((issue, issueIndex) => (
                <Card key={issueIndex} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                        {getSeverityIcon(issue.severity)}
                        {issue.problem}
                      </CardTitle>
                      <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Symptoms */}
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">Symptoms:</h4>
                      <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                        {issue.symptoms.map((symptom, symptomIndex) => (
                          <li key={symptomIndex}>{symptom}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Solutions */}
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">Solutions:</h4>
                      <ol className="list-decimal list-inside text-slate-300 text-sm space-y-2">
                        {issue.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="leading-relaxed">{solution}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {issue.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mt-12 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-700/30 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          Still experiencing issues?
        </h3>
        <p className="text-slate-300 mb-4">
          If none of these solutions work, please contact our support team with the following information:
        </p>
        <ul className="list-disc list-inside text-slate-300 text-sm mb-4 space-y-1">
          <li>What you were trying to do when the issue occurred</li>
          <li>The exact error message (if any)</li>
          <li>Your browser and version</li>
          <li>Your operating system</li>
          <li>Screenshots of the issue</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/documentation/shared/support"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Contact Support
          </a>
          <a 
            href="/documentation/shared/faq"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
          >
            Check FAQ
          </a>
        </div>
      </div>
    </div>
  )
}