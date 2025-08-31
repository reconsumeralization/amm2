import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, GitCommit, Tag, Calendar, ArrowRight } from '@/lib/icon-mapping'

export const metadata: Metadata = {
  title: 'Changelog - Documentation',
  description: 'Latest updates, features, and bug fixes for the Modern Men Hair BarberShop management system.',
}

export default function ChangelogPage() {
  const changelogEntries = [
    {
      version: '2.1.0',
      date: '2024-01-15',
      type: 'feature',
      title: 'Enhanced Documentation System',
      description: 'Major improvements to the documentation platform with new features and better user experience.',
      changes: [
        'Added interactive API documentation with live testing capabilities',
        'Implemented role-based content filtering for different user types',
        'Enhanced search functionality with autocomplete and filters',
        'Added version control system for documentation content',
        'Improved mobile responsiveness across all documentation pages',
        'Added dark mode support for better accessibility'
      ],
      breaking: false
    },
    {
      version: '2.0.5',
      date: '2024-01-10',
      type: 'bugfix',
      title: 'Bug Fixes and Performance Improvements',
      description: 'Critical bug fixes and performance optimizations.',
      changes: [
        'Fixed search indexing issues causing incomplete results',
        'Resolved navigation menu collapse on mobile devices',
        'Improved page load times by optimizing image assets',
        'Fixed broken links in troubleshooting guides',
        'Corrected formatting issues in code examples'
      ],
      breaking: false
    },
    {
      version: '2.0.0',
      date: '2024-01-01',
      type: 'major',
      title: 'Documentation Platform Redesign',
      description: 'Complete redesign of the documentation platform with modern UI and enhanced functionality.',
      changes: [
        'Completely redesigned user interface with modern styling',
        'Restructured content organization for better navigation',
        'Added comprehensive business workflow documentation',
        'Implemented advanced search with semantic matching',
        'Added interactive examples and code playgrounds',
        'Enhanced accessibility features and keyboard navigation',
        'Added multi-language support framework'
      ],
      breaking: true
    },
    {
      version: '1.5.2',
      date: '2023-12-20',
      type: 'feature',
      title: 'Content Management Enhancements',
      description: 'New features for content creation and management.',
      changes: [
        'Added content templates for faster documentation creation',
        'Implemented collaborative editing features',
        'Added content analytics and usage tracking',
        'Enhanced media management with better organization',
        'Added automated content validation and quality checks'
      ],
      breaking: false
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'destructive'
      case 'feature':
        return 'default'
      case 'bugfix':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'major':
        return <Tag className="h-4 w-4" />
      case 'feature':
        return <GitCommit className="h-4 w-4" />
      case 'bugfix':
        return <ArrowRight className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-8 w-8 text-blue-400" />
          Changelog
        </h1>
        <p className="text-muted-foreground text-lg">
          Stay up to date with the latest changes, improvements, and new features in our documentation system.
        </p>
      </div>

      <div className="space-y-6">
        {changelogEntries.map((entry) => (
          <Card key={entry.version} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">
                    Version {entry.version}
                  </CardTitle>
                  <Badge variant={getTypeColor(entry.type)} className="flex items-center gap-1">
                    {getTypeIcon(entry.type)}
                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                  </Badge>
                  {entry.breaking && (
                    <Badge variant="destructive" className="text-xs">
                      Breaking Changes
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <CardDescription className="text-base mt-2">
                <strong>{entry.title}</strong>
                <br />
                {entry.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  What's Changed
                </h4>
                <ul className="space-y-2">
                  {entry.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <GitCommit className="h-5 w-5" />
          Stay Updated
        </h3>
        <p className="text-sm text-muted-foreground">
          Want to be notified about new releases? Follow our development progress and get notified about important updates through our support channels.
        </p>
      </div>
    </div>
  )
}
