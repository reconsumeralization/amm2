'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonitoringExample } from '../components/MonitoringExample'
import { ComponentPlayground } from '../components/ComponentPlayground'
import { ResponsiveImageTest } from '../components/ResponsiveImageTest'
import { InteractiveExample } from '../components/InteractiveExample'

interface ThemeShowcaseWidgetProps {
  className?: string
  showHeader?: boolean
  defaultTab?: string
}

const demoComponents = [
  {
    id: 'monitoring',
    label: 'Monitoring Demo',
    description: 'Interactive monitoring and analytics examples',
    component: MonitoringExample,
    icon: '📊',
    category: 'Development'
  },
  {
    id: 'playground',
    label: 'Component Playground',
    description: 'Interactive component testing and exploration',
    component: ComponentPlayground,
    icon: '🎮',
    category: 'Development'
  },
  {
    id: 'responsive-images',
    label: 'Responsive Images',
    description: 'Image optimization and responsive loading examples',
    component: ResponsiveImageTest,
    icon: '🖼️',
    category: 'UI/UX'
  },
  {
    id: 'interactive-examples',
    label: 'Interactive Examples',
    description: 'Dynamic code execution and API testing',
    component: InteractiveExample,
    icon: '⚡',
    category: 'Development'
  }
]

export function ThemeShowcaseWidget({
  className = '',
  showHeader = true,
  defaultTab = 'overview'
}: ThemeShowcaseWidgetProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const categories = Array.from(new Set(demoComponents.map(comp => comp.category)))

  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Theme Showcase
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore interactive demos and examples showcasing the Modern Men application features
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoComponents.map((component) => (
              <Card key={component.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{component.label}</CardTitle>
                    <span className="text-2xl">{component.icon}</span>
                  </div>
                  <CardDescription className="text-sm">
                    {component.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {component.category}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedComponent(component.id)
                        setActiveTab('interactive')
                      }}
                    >
                      Try It
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">About This Showcase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Features Demonstrated:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Real-time monitoring and analytics</li>
                  <li>• Interactive component testing</li>
                  <li>• Responsive image optimization</li>
                  <li>• API testing and code execution</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technologies Used:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Next.js 15 with App Router</li>
                  <li>• React 19 with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Payload CMS integration</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
                <div className="space-y-3">
                  {demoComponents
                    .filter(comp => comp.category === category)
                    .map((component) => (
                      <Card key={component.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{component.icon}</span>
                              <div>
                                <h4 className="font-medium">{component.label}</h4>
                                <p className="text-sm text-gray-600">{component.description}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedComponent(component.id)
                                setActiveTab('interactive')
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          {selectedComponent ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {demoComponents.find(c => c.id === selectedComponent)?.icon}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {demoComponents.find(c => c.id === selectedComponent)?.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {demoComponents.find(c => c.id === selectedComponent)?.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedComponent(null)}
                >
                  Back to Overview
                </Button>
              </div>

              <Card className="p-6">
                {(() => {
                  const Component = demoComponents.find(c => c.id === selectedComponent)?.component
                  return Component ? <Component /> : <div>Component not found</div>
                })()}
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a Component to Explore
              </h3>
              <p className="text-gray-600 mb-6">
                Choose a component from the overview tab to see it in action
              </p>
              <Button onClick={() => setActiveTab('overview')}>
                Browse Components
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
