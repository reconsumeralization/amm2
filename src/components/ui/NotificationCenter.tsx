'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '@/components/ui/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: string
  read: boolean
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  data?: any
}

interface NotificationCenterProps {
  userId: string
  className?: string
}

export function NotificationCenter({ userId, className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    connectToNotificationStream()
    loadNotificationHistory()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [userId])

  const connectToNotificationStream = () => {
    try {
      const eventSource = new EventSource(`/api/notifications/stream?history=true`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setIsConnected(true)
        console.log('Connected to notification stream')
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'connection') {
            console.log(data.message)
            return
          }

          if (data.type === 'notification') {
            handleNewNotification(data)
          }
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('Notification stream error:', error)
        setIsConnected(false)

        // Try to reconnect after 5 seconds
        setTimeout(() => {
          if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
            connectToNotificationStream()
          }
        }, 5000)
      }

    } catch (error) {
      console.error('Failed to connect to notification stream:', error)
      setIsConnected(false)
    }
  }

  const loadNotificationHistory = async () => {
    try {
      // In a real implementation, fetch notification history from API
      // For now, we'll use sample data
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'system_alert',
          title: 'Welcome!',
          message: 'You are now connected to the real-time notification system.',
          timestamp: new Date().toISOString(),
          read: false,
          priority: 'low'
        }
      ]

      setNotifications(sampleNotifications)
      updateUnreadCount(sampleNotifications)
    } catch (error) {
      console.error('Failed to load notification history:', error)
    }
  }

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev])

    // Show toast for high priority notifications
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast(notification.title, {
        description: notification.message,
        action: {
          label: 'View',
          onClick: () => setIsOpen(true)
        }
      })
    }

    updateUnreadCount([notification, ...notifications])
  }

  const updateUnreadCount = (notifs: Notification[]) => {
    const unread = notifs.filter(n => !n.read).length
    setUnreadCount(unread)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real implementation, call API to mark as read
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      updateUnreadCount(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // In a real implementation, call API to mark all as read
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      // In a real implementation, call API to delete notification
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      updateUnreadCount(notifications.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_created':
        return <Icons.users className="h-4 w-4" />
      case 'appointment_booked':
        return <Icons.calendar className="h-4 w-4" />
      case 'system_alert':
        return <Icons.info className="h-4 w-4" />
      case 'security_alert':
        return <Icons.x className="h-4 w-4" />
      default:
        return <Icons.info className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icons.info className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Connection Status */}
      <div className="absolute -top-1 -left-1">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-12 w-96 max-w-[90vw] z-50"
            >
              <Card className="shadow-2xl border-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Icons.info className="h-5 w-5" />
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          {unreadCount} new
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Icons.x className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-center p-4">
                        <Icons.info className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          You'll receive notifications here when important events occur.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center space-x-1">
                                    {notification.priority && notification.priority !== 'medium' && (
                                      <Badge
                                        className={`text-xs ${getPriorityColor(notification.priority)}`}
                                      >
                                        {notification.priority}
                                      </Badge>
                                    )}
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>

                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(notification.timestamp)}
                                  </span>

                                  <div className="flex items-center space-x-1">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs h-6 px-2"
                                      >
                                        Mark read
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                                    >
                                      <Icons.x className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
