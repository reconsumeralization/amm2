import { MCPTool, MCPToolResult, MCPToolError } from './types'
import { UserRole } from './rbac-types'

// Security patterns for jailbreak detection
const JAILBREAK_PATTERNS = [
  /ignore.*previous.*instructions/i,
  /bypass.*security/i,
  /override.*rules/i,
  /system.*prompt/i,
  /reveal.*password/i,
  /show.*admin/i,
  /delete.*all/i,
  /drop.*table/i,
  /sql.*injection/i,
  /script.*alert/i,
  /javascript.*eval/i,
  /function.*\(\)/i,
  /console\.log/i,
  /\$\{.*\}/i,
  /<script/i,
  /on\w+\s*=/i,
  /sudo/i,
  /root/i,
  /admin.*password/i,
  /database.*config/i,
  /api.*key/i,
  /secret/i,
  /token/i
]

// Role-based command permissions
const COMMAND_PERMISSIONS: Record<string, UserRole[]> = {
  // User Management
  'users_list': ['manager', 'admin'],
  'users_get': ['manager', 'admin'],
  'users_create': ['manager', 'admin'],
  'users_update': ['manager', 'admin'],
  'users_delete': ['admin'],

  // Customer Management
  'customers_list': ['barber', 'manager', 'admin'],
  'customers_get': ['barber', 'manager', 'admin'],
  'customers_create': ['manager', 'admin'],
  'customers_update': ['manager', 'admin'],

  // Appointment Management
  'appointments_list': ['barber', 'manager', 'admin'],
  'appointments_get': ['customer', 'barber', 'manager', 'admin'],
  'appointments_book': ['customer', 'barber', 'manager', 'admin'],
  'appointments_cancel': ['customer', 'barber', 'manager', 'admin'],
  'appointments_update': ['barber', 'manager', 'admin'],

  // Services Management
  'services_list': ['customer', 'barber', 'manager', 'admin'],
  'services_get': ['customer', 'barber', 'manager', 'admin'],
  'services_create': ['manager', 'admin'],
  'services_update': ['manager', 'admin'],

  // Analytics
  'analytics_dashboard': ['manager', 'admin'],
  'analytics_users': ['manager', 'admin'],
  'analytics_appointments': ['manager', 'admin'],
  'analytics_revenue': ['manager', 'admin'],

  // System Management
  'system_config': ['admin'],
  'system_backup': ['admin'],
  'system_logs': ['admin'],

  // Security
  'security_events': ['admin'],
  'security_policies': ['admin']
}

interface ChatbotContext {
  userRole: UserRole
  userId?: string
  tenantId?: string
  sessionId: string
  currentPage: string
  userAgent?: string
  ip?: string
}

interface SecurityEvent {
  type: 'jailbreak_attempt' | 'suspicious_activity' | 'auth_failure' | 'permission_violation'
  risk: 'low' | 'medium' | 'high'
  message: string
  userId?: string
  sessionId?: string
  context: Record<string, any>
  timestamp: Date
}

class ChatbotSecurityMonitor {
  private securityEvents: SecurityEvent[] = []

  validateInput(input: string, context: ChatbotContext): { isValid: boolean; risk: string; actions: string[] } {
    // Check for jailbreak attempts
    for (const pattern of JAILBREAK_PATTERNS) {
      if (pattern.test(input)) {
        this.logSecurityEvent({
          type: 'jailbreak_attempt',
          risk: 'high',
          message: 'Jailbreak attempt detected',
          userId: context.userId,
          sessionId: context.sessionId,
          context: { input: input.substring(0, 100), pattern: pattern.toString() },
          timestamp: new Date()
        })

        return {
          isValid: false,
          risk: 'high',
          actions: ['block_request', 'log_incident', 'alert_admin']
        }
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /config/i
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input) && !this.isAuthorizedForSensitiveData(context.userRole)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          risk: 'medium',
          message: 'Suspicious data access attempt',
          userId: context.userId,
          sessionId: context.sessionId,
          context: { input: input.substring(0, 100) },
          timestamp: new Date()
        })

        return {
          isValid: false,
          risk: 'medium',
          actions: ['require_auth', 'log_activity']
        }
      }
    }

    return {
      isValid: true,
      risk: 'low',
      actions: ['allow_request', 'log_normal']
    }
  }

  checkPermission(command: string, userRole: UserRole): boolean {
    const allowedRoles = COMMAND_PERMISSIONS[command]
    if (!allowedRoles) return false

    return allowedRoles.includes(userRole)
  }

  logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event)
    console.warn('Security Event:', event)

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-500)
    }

    // Trigger alerts for high-risk events
    if (event.risk === 'high') {
      this.triggerSecurityAlert(event)
    }
  }

  getSecurityEvents(limit = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit)
  }

  getSecurityMetrics(): {
    totalEvents: number
    highRiskEvents: number
    recentEvents: number
  } {
    const now = Date.now()
    const lastHour = now - (60 * 60 * 1000)

    return {
      totalEvents: this.securityEvents.length,
      highRiskEvents: this.securityEvents.filter(e => e.risk === 'high').length,
      recentEvents: this.securityEvents.filter(e => e.timestamp.getTime() > lastHour).length
    }
  }

  private isAuthorizedForSensitiveData(role: UserRole): boolean {
    return ['manager', 'admin'].includes(role)
  }

  private triggerSecurityAlert(event: SecurityEvent): void {
    // In a real implementation, this would send alerts to administrators
    console.error('🚨 CRITICAL SECURITY ALERT:', event)

    // Could integrate with external monitoring systems
    // sendEmailAlert(event)
    // sendSlackAlert(event)
    // triggerPagerDuty(event)
  }
}

export class ChatbotMCPTools {
  private securityMonitor = new ChatbotSecurityMonitor()

  // Process chatbot message with security and context
  processChatMessage(params: {
    message: string
    context: string
    userContext: ChatbotContext
    securityLevel: 'low' | 'medium' | 'high'
  }): MCPToolResult {
    try {
      const { message, context, userContext } = params

      // Security validation
      const securityCheck = this.securityMonitor.validateInput(message, userContext)
      if (!securityCheck.isValid) {
        return {
          success: false,
          error: {
            code: 'SECURITY_VIOLATION',
            message: 'Request blocked due to security policy violation',
            details: { risk: securityCheck.risk, actions: securityCheck.actions }
          }
        }
      }

      // Process message with AI (simplified for this example)
      const response = this.generateResponse(message, userContext, context)

      return {
        success: true,
        data: {
          message: response.message,
          intent: response.intent,
          confidence: response.confidence,
          action: response.action,
          actionParams: response.actionParams,
          securityLevel: securityCheck.risk
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PROCESSING_ERROR',
          message: 'Failed to process chat message',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }
  }

  // Execute chatbot command with full MCP control
  executeChatbotCommand(params: {
    command: string
    params: Record<string, any>
    context: ChatbotContext
  }): MCPToolResult {
    try {
      const { command, params: commandParams, context } = params

      // Security validation
      const securityCheck = this.securityMonitor.validateInput(
        command + JSON.stringify(commandParams),
        context
      )

      if (!securityCheck.isValid) {
        return {
          success: false,
          error: {
            code: 'SECURITY_VIOLATION',
            message: 'Command blocked due to security policy violation',
            details: { risk: securityCheck.risk }
          }
        }
      }

      // Permission check
      if (!this.securityMonitor.checkPermission(command, context.userRole)) {
        return {
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: 'Insufficient permissions for this command',
            details: { requiredRole: COMMAND_PERMISSIONS[command] }
          }
        }
      }

      // Execute command based on type
      const result = this.executeCommand(command, commandParams, context)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: 'Failed to execute command',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }
  }

  // Get security events and metrics
  getSecurityEvents(params: { limit?: number; since?: number }): MCPToolResult {
    try {
      const { limit = 50, since } = params

      let events = this.securityMonitor.getSecurityEvents(limit)

      if (since) {
        events = events.filter(e => e.timestamp.getTime() > since)
      }

      const metrics = this.securityMonitor.getSecurityMetrics()

      return {
        success: true,
        data: {
          events,
          metrics,
          totalEvents: events.length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch security events',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }
  }

  // Log security incident
  logSecurityIncident(params: {
    type: SecurityEvent['type']
    risk: SecurityEvent['risk']
    message: string
    userId?: string
    sessionId?: string
    context?: Record<string, any>
  }): MCPToolResult {
    try {
      const event: SecurityEvent = {
        type: params.type,
        risk: params.risk,
        message: params.message,
        userId: params.userId,
        sessionId: params.sessionId,
        context: params.context || {},
        timestamp: new Date()
      }

      this.securityMonitor.logSecurityEvent(event)

      return {
        success: true,
        data: {
          eventId: `event_${Date.now()}`,
          logged: true
        }
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LOGGING_ERROR',
          message: 'Failed to log security incident',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }
    }
  }

  private generateResponse(message: string, userContext: ChatbotContext, context: string): {
    message: string
    intent: string
    confidence: number
    action?: string
    actionParams?: any
  } {
    const lowerMessage = message.toLowerCase()

    // Simple intent detection (in a real implementation, this would use ML/AI)
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      return {
        message: `I'd be happy to help you book an appointment! As a ${userContext.userRole}, you can book appointments directly. Would you like me to show you available time slots?`,
        intent: 'booking_request',
        confidence: 0.9,
        action: 'show_booking_form'
      }
    }

    if (lowerMessage.includes('cancel')) {
      return {
        message: `I can help you cancel an appointment. Please provide the appointment ID or date, and I'll assist you with the cancellation process.`,
        intent: 'cancellation_request',
        confidence: 0.8,
        action: 'show_cancellation_form'
      }
    }

    if (lowerMessage.includes('services') || lowerMessage.includes('haircut')) {
      return {
        message: `We offer a variety of premium services including haircuts, styling, beard grooming, and more. Would you like me to show you our complete service menu with pricing?`,
        intent: 'services_inquiry',
        confidence: 0.85,
        action: 'show_services'
      }
    }

    if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
      return {
        message: `Our current hours are:\n• Monday-Friday: 9am-8pm\n• Saturday: 9am-5pm\n• Sunday: Closed\n\nWould you like to book an appointment during our open hours?`,
        intent: 'hours_inquiry',
        confidence: 0.9
      }
    }

    // Default response based on user role
    const roleResponses = {
      admin: "How can I assist you with managing the Modern Men system today? I can help with user management, analytics, security monitoring, or system configuration.",
      manager: "Hello! I can help you with staff scheduling, customer management, analytics, and business operations. What would you like to focus on?",
      barber: "Hi there! Ready to help you serve our customers today. I can assist with appointment management, customer service, and schedule coordination.",
      customer: "Welcome to Modern Men! I'm here to help you book appointments, learn about our services, or answer any questions about our barbershop.",
      guest: "Welcome to Modern Men! I'd be happy to tell you about our services, show you our hours, or help you get started with booking an appointment."
    }

    return {
      message: roleResponses[userContext.userRole] || roleResponses.guest,
      intent: 'general_inquiry',
      confidence: 0.7
    }
  }

  private executeCommand(command: string, params: Record<string, any>, context: ChatbotContext): any {
    // In a real implementation, this would execute actual business logic
    // For now, we'll return mock responses

    switch (command) {
      case 'appointments_list':
        return {
          appointments: [
            { id: '1', date: '2024-01-15', time: '10:00', service: 'Haircut', status: 'confirmed' }
          ],
          total: 1
        }

      case 'services_list':
        return {
          services: [
            { id: '1', name: 'Haircut', price: 25, duration: 30 },
            { id: '2', name: 'Beard Trim', price: 15, duration: 15 }
          ],
          total: 2
        }

      case 'analytics_dashboard':
        return {
          totalAppointments: 150,
          totalRevenue: 3750,
          totalCustomers: 89,
          averageRating: 4.8
        }

      default:
        return { message: `Command '${command}' executed successfully` }
    }
  }
}

// Export singleton instance
export const chatbotMCPTools = new ChatbotMCPTools()
