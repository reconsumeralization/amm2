import { ModuleManifest } from '../module-registry'
import DemoPage from './components/DemoPage'

const manifest: ModuleManifest = {
  name: 'Demo Module',
  version: '1.0.0',
  description: 'Demo and user account management for the Modern Men application',
  author: 'Modern Men Development Team',
  dependencies: ['@nextjs', 'react', 'tailwindcss', '@auth/nextjs'],
  components: {
    DemoPage
  },
  permissions: [
    'view_demo_accounts',
    'access_admin_demo',
    'access_customer_demo',
    'access_stylist_demo',
    'switch_user_roles'
  ],
  navigation: [
    {
      path: '/demo',
      label: 'Demo Accounts',
      icon: '👤',
      component: DemoPage,
      permissions: ['view_demo_accounts']
    }
  ]
}

export default manifest
