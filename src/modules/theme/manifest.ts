import { ModuleManifest } from '../module-registry'
import { MonitoringExample } from './components/MonitoringExample'
import { ComponentPlayground } from './components/ComponentPlayground'
import { ResponsiveImageTest } from './components/ResponsiveImageTest'
import { InteractiveExample } from './components/InteractiveExample'
import { ThemeShowcaseWidget } from './widgets/ThemeShowcaseWidget'

const manifest: ModuleManifest = {
  name: 'Theme Module',
  version: '1.0.0',
  description: 'Theme and demo showcase components for the Modern Men application',
  author: 'Modern Men Development Team',
  dependencies: ['@nextjs', 'react', 'tailwindcss'],
  widgets: {
    ThemeShowcaseWidget
  },
  components: {
    MonitoringExample,
    ComponentPlayground,
    ResponsiveImageTest,
    InteractiveExample
  },
  permissions: [
    'view_theme_examples',
    'access_monitoring_demo',
    'use_component_playground',
    'view_responsive_images',
    'interact_with_examples'
  ],
  navigation: [
    {
      path: '/theme/monitoring',
      label: 'Monitoring Demo',
      icon: '📊',
      component: MonitoringExample,
      permissions: ['view_theme_examples', 'access_monitoring_demo']
    },
    {
      path: '/theme/playground',
      label: 'Component Playground',
      icon: '🎮',
      component: ComponentPlayground,
      permissions: ['view_theme_examples', 'use_component_playground']
    },
    {
      path: '/theme/responsive-images',
      label: 'Responsive Images',
      icon: '🖼️',
      component: ResponsiveImageTest,
      permissions: ['view_theme_examples', 'view_responsive_images']
    }
  ]
}

export default manifest
