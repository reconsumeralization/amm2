import { UserRole } from '@/mcp/rbac-types'

export interface ChatbotRoleConfig {
  name: string
  capabilities: string[]
  restrictedCommands: string[]
  welcomeMessage: string
  contextPrompt: string
  maxMessageLength: number
  rateLimit: {
    messagesPerMinute: number
    messagesPerHour: number
  }
  securityLevel: 'low' | 'medium' | 'high'
  features: {
    booking: boolean
    analytics: boolean
    userManagement: boolean
    systemControl: boolean
    emergency: boolean
  }
}

export const CHATBOT_ROLE_CONFIGS: Record<UserRole, ChatbotRoleConfig> = {
  admin: {
    name: 'System Administrator',
    capabilities: [
      'Full system control',
      'User management',
      'Security monitoring',
      'System configuration',
      'Emergency controls',
      'Audit logs access',
      'Performance monitoring'
    ],
    restrictedCommands: [],
    welcomeMessage: 'Welcome back, Administrator. I have full system access available to assist you with any administrative tasks.',
    contextPrompt: `You are an AI assistant with full administrative access to the Modern Men barbershop management system.
You can perform any operation including user management, system configuration, security monitoring, and emergency controls.
Always verify critical operations and maintain detailed audit logs.`,
    maxMessageLength: 2000,
    rateLimit: {
      messagesPerMinute: 60,
      messagesPerHour: 1000
    },
    securityLevel: 'high',
    features: {
      booking: true,
      analytics: true,
      userManagement: true,
      systemControl: true,
      emergency: true
    }
  },

  manager: {
    name: 'Business Manager',
    capabilities: [
      'Staff scheduling',
      'Customer management',
      'Business analytics',
      'Appointment oversight',
      'Inventory management',
      'Financial reports'
    ],
    restrictedCommands: [
      'system_config',
      'user_delete',
      'security_bypass',
      'emergency_shutdown'
    ],
    welcomeMessage: 'Good day! I can help you manage your barbershop operations including staff, customers, and business analytics.',
    contextPrompt: `You are an AI assistant for barbershop managers with access to operational data and management tools.
You can help with staff scheduling, customer management, analytics, and business operations.
You cannot access system-level configurations or perform destructive operations.`,
    maxMessageLength: 1500,
    rateLimit: {
      messagesPerMinute: 30,
      messagesPerHour: 500
    },
    securityLevel: 'medium',
    features: {
      booking: true,
      analytics: true,
      userManagement: true,
      systemControl: false,
      emergency: false
    }
  },

  barber: {
    name: 'Staff Member',
    capabilities: [
      'Appointment management',
      'Customer service',
      'Schedule viewing',
      'Service recommendations',
      'Time tracking',
      'Customer communication'
    ],
    restrictedCommands: [
      'user_management',
      'analytics_full',
      'system_config',
      'financial_reports',
      'security_settings'
    ],
    welcomeMessage: 'Hi there! Ready to help you provide excellent service to our customers today.',
    contextPrompt: `You are an AI assistant for barbershop staff members focused on customer service and appointment management.
You can help with appointment scheduling, customer service, and daily operations.
You have limited access to sensitive business data and cannot perform administrative functions.`,
    maxMessageLength: 1000,
    rateLimit: {
      messagesPerMinute: 20,
      messagesPerHour: 200
    },
    securityLevel: 'medium',
    features: {
      booking: true,
      analytics: false,
      userManagement: false,
      systemControl: false,
      emergency: false
    }
  },

  customer: {
    name: 'Valued Customer',
    capabilities: [
      'Appointment booking',
      'Service information',
      'Profile management',
      'Business hours',
      'Service recommendations',
      'Loyalty program'
    ],
    restrictedCommands: [
      'staff_management',
      'analytics',
      'system_config',
      'user_management',
      'security',
      'financial'
    ],
    welcomeMessage: 'Hello! Welcome to Modern Men. I\'m here to help you book appointments and learn about our premium grooming services.',
    contextPrompt: `You are an AI assistant for barbershop customers focused on service information and appointment booking.
You can help customers learn about services, book appointments, and manage their profiles.
You have no access to business operations, staff data, or administrative functions.`,
    maxMessageLength: 500,
    rateLimit: {
      messagesPerMinute: 10,
      messagesPerHour: 50
    },
    securityLevel: 'low',
    features: {
      booking: true,
      analytics: false,
      userManagement: false,
      systemControl: false,
      emergency: false
    }
  },

  guest: {
    name: 'Visitor',
    capabilities: [
      'Service information',
      'Business hours',
      'Location details',
      'General inquiries',
      'Basic booking info'
    ],
    restrictedCommands: [
      'appointment_booking',
      'profile_access',
      'loyalty',
      'staff_actions',
      'analytics',
      'user_management',
      'system_config'
    ],
    welcomeMessage: 'Welcome to Modern Men! I\'m here to help you learn about our premium grooming services and get started.',
    contextPrompt: `You are an AI assistant for barbershop visitors with very limited access.
You can provide general information about services, hours, and location.
You cannot perform any actions that require authentication or access sensitive information.`,
    maxMessageLength: 300,
    rateLimit: {
      messagesPerMinute: 5,
      messagesPerHour: 20
    },
    securityLevel: 'low',
    features: {
      booking: false,
      analytics: false,
      userManagement: false,
      systemControl: false,
      emergency: false
    }
  }
}

export interface ChatbotSettings {
  enabled: boolean
  autoShow: boolean
  securityMode: 'strict' | 'normal' | 'permissive'
  rateLimiting: boolean
  logging: boolean
  emergencyMode: boolean
  maintenanceMode: boolean
}

export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  enabled: true,
  autoShow: true,
  securityMode: 'normal',
  rateLimiting: true,
  logging: true,
  emergencyMode: false,
  maintenanceMode: false
}

export function getRoleConfig(role: UserRole): ChatbotRoleConfig {
  return CHATBOT_ROLE_CONFIGS[role] || CHATBOT_ROLE_CONFIGS.guest
}

export function canExecuteCommand(role: UserRole, command: string): boolean {
  const config = getRoleConfig(role)
  return !config.restrictedCommands.includes(command)
}

export function getSecurityLevel(role: UserRole): 'low' | 'medium' | 'high' {
  return getRoleConfig(role).securityLevel
}

export function getRateLimit(role: UserRole): { messagesPerMinute: number; messagesPerHour: number } {
  return getRoleConfig(role).rateLimit
}

export function getMaxMessageLength(role: UserRole): number {
  return getRoleConfig(role).maxMessageLength
}
