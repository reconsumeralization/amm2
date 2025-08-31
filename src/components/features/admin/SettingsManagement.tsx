'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Palette,
  Database,
  Clock,
  Users,
  Bell,
  Zap,
  Smartphone,
  Calendar,
  BarChart3,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from 'sonner';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    businessHours: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
    timezone: string;
    currency: string;
    language: string;
  };
  booking: {
    enabled: boolean;
    requireApproval: boolean;
    allowCancellations: boolean;
    cancellationHours: number;
    maxAdvanceBooking: number;
    minAdvanceBooking: number;
    slotDuration: number;
    bufferTime: number;
    maxBookingsPerDay: number;
    autoConfirm: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    appointmentReminders: boolean;
    reminderHours: number;
    marketingEmails: boolean;
    systemAlerts: boolean;
    adminNotifications: boolean;
  };
  payments: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
    allowPartialPayments: boolean;
    refundPolicy: string;
    paymentMethods: string[];
  };
  security: {
    requireStrongPasswords: boolean;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordExpiry: number;
    ipWhitelist: string[];
    auditLogging: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    customCss: string;
  };
  integrations: {
    googleCalendar: {
      enabled: boolean;
      calendarId: string;
      serviceAccountKey: string;
    };
    zoom: {
      enabled: boolean;
      apiKey: string;
      apiSecret: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channel: string;
    };
  };
  advanced: {
    cacheEnabled: boolean;
    cacheExpiry: number;
    debugMode: boolean;
    maintenanceMode: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    apiRateLimit: number;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  general: {
    siteName: 'Modern Men Hair Studio',
    siteDescription: 'Premium grooming services for the modern gentleman',
    contactEmail: 'info@modernmen.com',
    contactPhone: '+1 (555) 123-4567',
    businessHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '14:00', closed: false }
    },
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en'
  },
  booking: {
    enabled: true,
    requireApproval: false,
    allowCancellations: true,
    cancellationHours: 24,
    maxAdvanceBooking: 90,
    minAdvanceBooking: 1,
    slotDuration: 60,
    bufferTime: 15,
    maxBookingsPerDay: 20,
    autoConfirm: true
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    appointmentReminders: true,
    reminderHours: 24,
    marketingEmails: false,
    systemAlerts: true,
    adminNotifications: true
  },
  payments: {
    stripeEnabled: true,
    paypalEnabled: false,
    requireDeposit: false,
    depositPercentage: 50,
    allowPartialPayments: true,
    refundPolicy: 'Refunds available up to 24 hours before appointment',
    paymentMethods: ['card', 'cash']
  },
  security: {
    requireStrongPasswords: true,
    twoFactorEnabled: false,
    sessionTimeout: 480,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    ipWhitelist: [],
    auditLogging: true
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3b82f6',
    logoUrl: '',
    faviconUrl: '',
    customCss: ''
  },
  integrations: {
    googleCalendar: {
      enabled: false,
      calendarId: '',
      serviceAccountKey: ''
    },
    zoom: {
      enabled: false,
      apiKey: '',
      apiSecret: ''
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channel: ''
    }
  },
  advanced: {
    cacheEnabled: true,
    cacheExpiry: 3600,
    debugMode: false,
    maintenanceMode: false,
    backupFrequency: 'daily',
    logLevel: 'info',
    apiRateLimit: 100
  }
};

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Simulate loading settings from API
    setTimeout(() => {
      setSettings(DEFAULT_SETTINGS);
      setOriginalSettings(DEFAULT_SETTINGS);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChanged);
  }, [settings, originalSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    toast.info('Settings reset to last saved version');
  };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current: any = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const renderBusinessHours = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
      <div className="space-y-4">
        {days.map(day => {
          const daySettings = settings.general.businessHours[day as keyof typeof settings.general.businessHours];
          return (
            <div key={day} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24">
                <Label className="capitalize font-medium">{day}</Label>
              </div>
              <Switch
                checked={!daySettings.closed}
                onCheckedChange={(checked) => updateSetting(`general.businessHours.${day}.closed`, !checked)}
              />
              {!daySettings.closed && (
                <>
                  <Input
                    type="time"
                    value={daySettings.open}
                    onChange={(e) => updateSetting(`general.businessHours.${day}.open`, e.target.value)}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={daySettings.close}
                    onChange={(e) => updateSetting(`general.businessHours.${day}.close`, e.target.value)}
                    className="w-32"
                  />
                </>
              )}
              {daySettings.closed && (
                <Badge variant="secondary">Closed</Badge>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your business settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <Alert className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have unsaved changes
              </AlertDescription>
            </Alert>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Booking</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Business Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general.siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general.contactEmail', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Business Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general.siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSetting('general.contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general.timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.general.currency} onValueChange={(value) => updateSetting('general.currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {renderBusinessHours()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bookingEnabled">Enable Online Booking</Label>
                  <p className="text-sm text-gray-600">Allow customers to book appointments online</p>
                </div>
                <Switch
                  id="bookingEnabled"
                  checked={settings.booking.enabled}
                  onCheckedChange={(checked) => updateSetting('booking.enabled', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="slotDuration">Appointment Duration (minutes)</Label>
                  <Input
                    id="slotDuration"
                    type="number"
                    value={settings.booking.slotDuration}
                    onChange={(e) => updateSetting('booking.slotDuration', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="bufferTime">Buffer Time (minutes)</Label>
                  <Input
                    id="bufferTime"
                    type="number"
                    value={settings.booking.bufferTime}
                    onChange={(e) => updateSetting('booking.bufferTime', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxAdvanceBooking">Max Advance Booking (days)</Label>
                  <Input
                    id="maxAdvanceBooking"
                    type="number"
                    value={settings.booking.maxAdvanceBooking}
                    onChange={(e) => updateSetting('booking.maxAdvanceBooking', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxBookingsPerDay">Max Bookings Per Day</Label>
                  <Input
                    id="maxBookingsPerDay"
                    type="number"
                    value={settings.booking.maxBookingsPerDay}
                    onChange={(e) => updateSetting('booking.maxBookingsPerDay', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Approval</Label>
                    <p className="text-sm text-gray-600">New bookings require admin approval</p>
                  </div>
                  <Switch
                    checked={settings.booking.requireApproval}
                    onCheckedChange={(checked) => updateSetting('booking.requireApproval', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Cancellations</Label>
                    <p className="text-sm text-gray-600">Customers can cancel their appointments</p>
                  </div>
                  <Switch
                    checked={settings.booking.allowCancellations}
                    onCheckedChange={(checked) => updateSetting('booking.allowCancellations', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Confirm</Label>
                    <p className="text-sm text-gray-600">Automatically confirm new bookings</p>
                  </div>
                  <Switch
                    checked={settings.booking.autoConfirm}
                    onCheckedChange={(checked) => updateSetting('booking.autoConfirm', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">Send email notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications.emailEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-600">Send SMS notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications.smsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">Send push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(checked) => updateSetting('notifications.pushEnabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-gray-600">Send reminders before appointments</p>
                  </div>
                  <Switch
                    checked={settings.notifications.appointmentReminders}
                    onCheckedChange={(checked) => updateSetting('notifications.appointmentReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-600">Send promotional emails to customers</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => updateSetting('notifications.marketingEmails', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-gray-600">Send alerts for system events</p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => updateSetting('notifications.systemAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Admin Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications to administrators</p>
                  </div>
                  <Switch
                    checked={settings.notifications.adminNotifications}
                    onCheckedChange={(checked) => updateSetting('notifications.adminNotifications', checked)}
                  />
                </div>
              </div>

              {settings.notifications.appointmentReminders && (
                <div>
                  <Label htmlFor="reminderHours">Reminder Time (hours before)</Label>
                  <Input
                    id="reminderHours"
                    type="number"
                    value={settings.notifications.reminderHours}
                    onChange={(e) => updateSetting('notifications.reminderHours', parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stripe Payments</Label>
                    <p className="text-sm text-gray-600">Accept credit card payments</p>
                  </div>
                  <Switch
                    checked={settings.payments.stripeEnabled}
                    onCheckedChange={(checked) => updateSetting('payments.stripeEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>PayPal Payments</Label>
                    <p className="text-sm text-gray-600">Accept PayPal payments</p>
                  </div>
                  <Switch
                    checked={settings.payments.paypalEnabled}
                    onCheckedChange={(checked) => updateSetting('payments.paypalEnabled', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Deposit</Label>
                    <p className="text-sm text-gray-600">Require deposit for bookings</p>
                  </div>
                  <Switch
                    checked={settings.payments.requireDeposit}
                    onCheckedChange={(checked) => updateSetting('payments.requireDeposit', checked)}
                  />
                </div>

                {settings.payments.requireDeposit && (
                  <div>
                    <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                    <Input
                      id="depositPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={settings.payments.depositPercentage}
                      onChange={(e) => updateSetting('payments.depositPercentage', parseInt(e.target.value))}
                      className="max-w-xs"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Partial Payments</Label>
                    <p className="text-sm text-gray-600">Allow customers to pay in installments</p>
                  </div>
                  <Switch
                    checked={settings.payments.allowPartialPayments}
                    onCheckedChange={(checked) => updateSetting('payments.allowPartialPayments', checked)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="refundPolicy">Refund Policy</Label>
                <Textarea
                  id="refundPolicy"
                  value={settings.payments.refundPolicy}
                  onChange={(e) => updateSetting('payments.refundPolicy', e.target.value)}
                  rows={3}
                  placeholder="Describe your refund policy..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Strong Passwords</Label>
                    <p className="text-sm text-gray-600">Enforce password complexity rules</p>
                  </div>
                  <Switch
                    checked={settings.security.requireStrongPasswords}
                    onCheckedChange={(checked) => updateSetting('security.requireStrongPasswords', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                  </div>
                  <Switch
                    checked={settings.security.twoFactorEnabled}
                    onCheckedChange={(checked) => updateSetting('security.twoFactorEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-gray-600">Log all system activities</p>
                  </div>
                  <Switch
                    checked={settings.security.auditLogging}
                    onCheckedChange={(checked) => updateSetting('security.auditLogging', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security.maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => updateSetting('security.passwordExpiry', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.appearance.theme} onValueChange={(value: any) => updateSetting('appearance.theme', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance.primaryColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.appearance.primaryColor}
                      onChange={(e) => updateSetting('appearance.primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={settings.appearance.logoUrl}
                    onChange={(e) => updateSetting('appearance.logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={settings.appearance.customCss}
                  onChange={(e) => updateSetting('appearance.customCss', e.target.value)}
                  rows={6}
                  placeholder="/* Add your custom CSS here */"
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Google Calendar Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Google Calendar Sync</Label>
                  <p className="text-sm text-gray-600">Sync appointments with Google Calendar</p>
                </div>
                <Switch
                  checked={settings.integrations.googleCalendar.enabled}
                  onCheckedChange={(checked) => updateSetting('integrations.googleCalendar.enabled', checked)}
                />
              </div>

              {settings.integrations.googleCalendar.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="calendarId">Calendar ID</Label>
                    <Input
                      id="calendarId"
                      value={settings.integrations.googleCalendar.calendarId}
                      onChange={(e) => updateSetting('integrations.googleCalendar.calendarId', e.target.value)}
                      placeholder="your-calendar@group.calendar.google.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceAccountKey">Service Account Key</Label>
                    <Textarea
                      id="serviceAccountKey"
                      value={settings.integrations.googleCalendar.serviceAccountKey}
                      onChange={(e) => updateSetting('integrations.googleCalendar.serviceAccountKey', e.target.value)}
                      rows={4}
                      placeholder="Paste your service account JSON key here"
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slack Integration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Slack Notifications</Label>
                  <p className="text-sm text-gray-600">Send notifications to Slack channels</p>
                </div>
                <Switch
                  checked={settings.integrations.slack.enabled}
                  onCheckedChange={(checked) => updateSetting('integrations.slack.enabled', checked)}
                />
              </div>

              {settings.integrations.slack.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={settings.integrations.slack.webhookUrl}
                      onChange={(e) => updateSetting('integrations.slack.webhookUrl', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="slackChannel">Channel</Label>
                    <Input
                      id="slackChannel"
                      value={settings.integrations.slack.channel}
                      onChange={(e) => updateSetting('integrations.slack.channel', e.target.value)}
                      placeholder="#appointments"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance & Caching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Caching</Label>
                  <p className="text-sm text-gray-600">Cache frequently accessed data</p>
                </div>
                <Switch
                  checked={settings.advanced.cacheEnabled}
                  onCheckedChange={(checked) => updateSetting('advanced.cacheEnabled', checked)}
                />
              </div>

              {settings.advanced.cacheEnabled && (
                <div>
                  <Label htmlFor="cacheExpiry">Cache Expiry (seconds)</Label>
                  <Input
                    id="cacheExpiry"
                    type="number"
                    value={settings.advanced.cacheExpiry}
                    onChange={(e) => updateSetting('advanced.cacheExpiry', parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="logLevel">Log Level</Label>
                  <Select value={settings.advanced.logLevel} onValueChange={(value: any) => updateSetting('advanced.logLevel', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests/minute)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={settings.advanced.apiRateLimit}
                    onChange={(e) => updateSetting('advanced.apiRateLimit', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Backups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-600">Put the site in maintenance mode</p>
                </div>
                <Switch
                  checked={settings.advanced.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('advanced.maintenanceMode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Debug Mode</Label>
                  <p className="text-sm text-gray-600">Enable detailed error reporting</p>
                </div>
                <Switch
                  checked={settings.advanced.debugMode}
                  onCheckedChange={(checked) => updateSetting('advanced.debugMode', checked)}
                />
              </div>

              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={settings.advanced.backupFrequency} onValueChange={(value: any) => updateSetting('advanced.backupFrequency', value)}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
