'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  DollarSign,
  Settings,
  Trash2,
  MoreHorizontal
} from '@/lib/icon-mapping';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'appointment' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'appointments' | 'payments' | 'system' | 'customers' | 'content' | 'general';
}

interface NotificationCenterProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function NotificationCenter({ isOpen = false, onToggle }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [showPopover, setShowPopover] = useState(false);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Booked',
      message: 'John Doe has booked a haircut appointment for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      actionUrl: '/admin/collections/appointments',
      actionText: 'View Details',
      priority: 'medium',
      category: 'appointments'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $85.00 received from Jane Smith',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false,
      actionUrl: '/admin/collections/payments',
      actionText: 'View Transaction',
      priority: 'low',
      category: 'payments'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Low Inventory Alert',
      message: 'Shampoo stock is running low (5 bottles remaining)',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
      actionUrl: '/admin/collections/inventory',
      actionText: 'Manage Inventory',
      priority: 'high',
      category: 'system'
    },
    {
      id: '4',
      type: 'success',
      title: 'Service Completed',
      message: 'Haircut service completed for Mike Johnson',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: 'low',
      category: 'appointments'
    },
    {
      id: '5',
      type: 'error',
      title: 'System Error',
      message: 'Failed to sync with Google Calendar',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: false,
      actionUrl: '/admin/settings/integrations',
      actionText: 'Fix Integration',
      priority: 'urgent',
      category: 'system'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add new notifications for demo
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotification: Notification = {
          id: Date.now().toString(),
          type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)] as any,
          title: 'New System Update',
          message: 'System maintenance completed successfully',
          timestamp: new Date(),
          read: false,
          priority: 'low',
          category: 'system'
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only latest 20
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    toast.success('All notifications cleared');
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'appointment':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'urgent') return notification.priority === 'urgent' || notification.priority === 'high';
    return true;
  });

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    markAsRead(notification.id);
    setShowPopover(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowPopover(!showPopover)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showPopover && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <div className="flex space-x-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'urgent', label: 'Urgent' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(key as any)}
                  className="text-xs h-7"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="h-96">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No notifications</p>
                  {filter !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilter('all')}
                      className="mt-2 text-xs"
                    >
                      View all notifications
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium truncate ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.timestamp.toLocaleString()}
                            </span>
                            <div className="flex items-center space-x-1">
                              {notification.actionText && (
                                <Button size="sm" variant="outline" className="text-xs h-6">
                                  {notification.actionText}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-xs h-6 p-1"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </ScrollArea>

          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  window.location.href = '/admin/notifications';
                }}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}

      {showPopover && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPopover(false)}
        />
      )}
    </div>
  );
}

// Hook for using notifications in components
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  };
}