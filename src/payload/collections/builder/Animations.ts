import { CollectionConfig } from 'payload/types'

const Animations: CollectionConfig = {
  slug: 'animations',
  admin: {
    useAsTitle: 'name',
    group: 'Builder'
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin'
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true
    },
    {
      name: 'description',
      type: 'textarea'
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Fade In', value: 'fade-in' },
        { label: 'Fade Out', value: 'fade-out' },
        { label: 'Slide In', value: 'slide-in' },
        { label: 'Slide Out', value: 'slide-out' },
        { label: 'Scale', value: 'scale' },
        { label: 'Rotate', value: 'rotate' },
        { label: 'Bounce', value: 'bounce' },
        { label: 'Pulse', value: 'pulse' }
      ]
    },
    {
      name: 'duration',
      type: 'number',
      defaultValue: 300,
      min: 0,
      max: 5000
    },
    {
      name: 'delay',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5000
    },
    {
      name: 'easing',
      type: 'select',
      defaultValue: 'ease-in-out',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'Ease In', value: 'ease-in' },
        { label: 'Ease Out', value: 'ease-out' },
        { label: 'Ease In Out', value: 'ease-in-out' },
        { label: 'Bounce', value: 'bounce' }
      ]
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true
    }
  ]
}

export { Animations }
