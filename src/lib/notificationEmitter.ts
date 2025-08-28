import { EventEmitter } from 'events'

// Global event emitter for notifications
export const notificationEmitter = new EventEmitter()
notificationEmitter.setMaxListeners(1000)

// Store active connections
export const activeConnections = new Map<string, WritableStreamDefaultWriter>()

export interface NotificationData {
  id: string
  userId: string
  type: 'user_created' | 'user_updated' | 'employee_created' | 'appointment_booked' | 'system_alert'
  title: string
  message: string
  data?: any
}
