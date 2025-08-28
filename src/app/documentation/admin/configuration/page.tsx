import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'System Configuration - Admin Documentation',
  description: 'Complete guide for configuring and managing the salon management system.',
}

function ConfigurationPage() {
  const configurationSections = [
    {
      title: 'Environment Configuration',
      icon: <database className="h-6 w-6 text-blue-400" />,
      description: 'Set up and configure different environments (development, staging, production)',
      items: [
        {
          name: 'Environment Variables',
          description: 'Configure essential environment variables for different deployment environments',
          configFile: '.env.local, .env.production',
          importance: 'critical',
          steps: [
            'Copy .env.example to .env.local for development',
            'Set DATABASE_URL to your database connection string',
            'Configure NEXTAUTH_SECRET with a secure random string',
            'Set NEXTAUTH_URL to your application URL',
            'Configure email provider settings (SMTP)',
            'Set up payment gateway credentials if applicable'
          ]
        },
        {
          name: 'Database Configuration',
          description: 'Set up and configure the database connection and settings',
          configFile: 'prisma/schema.prisma, database.config.js',
          importance: 'critical',
          steps: [
            'Install and configure PostgreSQL or your preferred database',
            'Update DATABASE_URL in environment variables',
            'Run database migrations: npx prisma migrate deploy',
            'Seed initial data: npx prisma db seed',
            'Configure database connection pooling',
            'Set up database backups and monitoring'
          ]
        }
      ]
    },
    {
      title: 'Authentication & Security',
      icon: <lock className="h-6 w-6 text-red-400" />,
      description: 'Configure authentication providers and security settings',
      items: [
        {
          name: 'NextAuth Configuration',
          description: 'Set up authentication providers and session management',
          configFile: 'pages/api/auth/[...nextauth].ts',
          importance: 'critical',
          steps: [
            'Configure OAuth providers (Google, Facebook, etc.)',
            'Set up email provider for magic links',
            'Configure session strategy and expiration',
            'Set up custom sign-in pages',
            'Configure role-based access control',
            'Enable two-factor authentication if required'
          ]
        },
        {
          name: 'Security Headers',
          description: 'Configure security headers and CORS policies',
          configFile: 'next.config.js, middleware.ts',
          importance: 'high',
          steps: [
            'Configure Content Security Policy (CSP)',
            'Set up CORS headers for API routes',
            'Enable HTTPS redirects',
            'Configure rate limiting',
            'Set up security monitoring',
            'Enable audit logging'
          ]
        }
      ]
    },
    {
      title: 'Email & Notifications',
      icon: <bell className="h-6 w-6 text-green-400" />,
      description: 'Configure email services and notification systems',
      items: [
        {
          name: 'Email Provider Setup',
          description: 'Configure SMTP or email service provider',
          configFile: 'lib/email.config.ts',
          importance: 'high',
          steps: [
            'Choose email provider (SendGrid, AWS SES, etc.)',
            'Configure SMTP settings in environment variables',
            'Set up email templates for notifications',
            'Configure sender domains and authentication',
            'Test email delivery and bounce handling',
            'Set up email analytics and monitoring'
          ]
        },
        {
          name: 'Push Notifications',
          description: 'Configure push notification services',
          configFile: 'lib/notifications.config.ts',
          importance: 'medium',
          steps: [
            'Set up Firebase Cloud Messaging (FCM)',
            'Configure service worker for web push',
            'Set up notification templates',
            'Configure notification scheduling',
            'Test notification delivery',
            'Set up notification analytics'
          ]
        }
      ]
    },
    {
      title: 'API & Integrations',
      icon: <database className="h-6 w-6 text-purple-400" />,
      description: 'Configure external API integrations and webhooks',
      items: [
        {
          name: 'Payment Gateway',
          description: 'Configure payment processing integration',
          configFile: 'lib/payment.config.ts',
          importance: 'critical',
          steps: [
            'Set up Stripe or preferred payment provider',
            'Configure webhook endpoints',
            'Set up payment methods and currencies',
            'Configure subscription billing if applicable',
            'Test payment flows in sandbox mode',
            'Set up payment monitoring and alerts'
          ]
        },
        {
          name: 'Third-party APIs',
          description: 'Configure external service integrations',
          configFile: 'lib/integrations/',
          importance: 'medium',
          steps: [
            'Configure calendar integration (Google Calendar)',
            'Set up SMS provider (Twilio, etc.)',
            'Configure analytics services (Google Analytics)',
            'Set up monitoring services (Sentry, LogRocket)',
            'Configure backup services',
            'Test all integrations'
          ]
        }
      ]
    }
  ]

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <alertTriangle className="h-4 w-4" />
      case 'high':
        return <alertTriangle className="h-4 w-4" />
      case 'medium':
        return <checkCircle className="h-4 w-4" />
      default:
        return <checkCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <cog className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-100">
            System Configuration
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          Complete guide for configuring and managing the salon management system infrastructure.
        </p>
      </div>

      {/* Security Warning */}
      <Alert className="mb-8 border-red-700/50 bg-red-900/20">
        <alertTriangle className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          Always use secure, randomly generated secrets for production environments. 
          Never commit sensitive configuration to version control.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {configurationSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="flex items-center gap-3 mb-6">
              {section.icon}
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">
                  {section.title}
                </h2>
                <p className="text-slate-400 text-sm">{section.description}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {section.items.map((item, itemIndex) => (
                <Card key={itemIndex} className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-slate-100 flex items-center gap-2">
                          <code className="h-5 w-5 text-slate-400" />
                          {item.name}
                        </CardTitle>
                        <CardDescription className="text-slate-300 mt-1">
                          {item.description}
                        </CardDescription>
                      </div>
                      <Badge variant={getImportanceColor(item.importance)} className="text-xs flex items-center gap-1">
                        {getImportanceIcon(item.importance)}
                        {item.importance.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2 text-sm">Configuration Files:</h4>
                      <code className="text-xs bg-slate-900 text-cyan-300 px-2 py-1 rounded">
                        {item.configFile}
                      </code>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-200 mb-3 text-sm">Configuration Steps:</h4>
                      <ol className="list-decimal list-inside text-slate-300 text-sm space-y-2">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="leading-relaxed">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Checklist */}
      <div className="mt-12 p-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/30 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <checkCircle className="h-5 w-5 text-green-400" />
          Pre-deployment Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Security:</h4>
            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
              <li>All secrets are properly configured</li>
              <li>HTTPS is enabled and enforced</li>
              <li>Security headers are configured</li>
              <li>Rate limiting is enabled</li>
              <li>Audit logging is active</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Functionality:</h4>
            <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
              <li>Database connection is working</li>
              <li>Email delivery is tested</li>
              <li>Payment processing is configured</li>
              <li>All integrations are tested</li>
              <li>Monitoring is set up</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Additional Resources</h3>
        <div className="flex flex-wrap gap-3">
          <a 
            href="/documentation/admin/monitoring"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Monitoring Setup
          </a>
          <a 
            href="/documentation/shared/troubleshooting"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
          >
            Troubleshooting
          </a>
          <a 
            href="/documentation/admin"
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded transition-colors"
          >
            Admin Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

export default ConfigurationPage;