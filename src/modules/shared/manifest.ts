import { ModuleManifest } from '../module-registry'
import { Loading, Skeleton, PageLoading, CardSkeleton, TableSkeleton, FormSkeleton, InlineLoading } from './components/Loading'

const manifest: ModuleManifest = {
  name: 'Shared Module',
  version: '1.0.0',
  description: 'Shared components and utilities for the Modern Men application',
  author: 'Modern Men Development Team',
  dependencies: ['@nextjs', 'react', 'tailwindcss', 'lucide-react'],
  components: {
    Loading,
    Skeleton,
    PageLoading,
    CardSkeleton,
    TableSkeleton,
    FormSkeleton,
    InlineLoading
  },
  utils: {
    // Shared utilities will be added here
  },
  permissions: [
    'access_shared_components'
  ]
}

export default manifest
