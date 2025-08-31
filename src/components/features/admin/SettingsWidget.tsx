'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getIcon } from '@/lib/icon-mapping';

interface SettingsData {
  chatbot?: {
    enabled?: boolean;
  };
  clock?: {
    enabled?: boolean;
  };
  barbershop?: {
    simulator?: {
      enabled?: boolean;
    };
    events?: {
      enabled?: boolean;
    };
    retail?: {
      enabled?: boolean;
    };
  };
  notifications?: {
    email?: {
      enabled?: boolean;
    };
    sms?: {
      enabled?: boolean;
    };
  };
}

export default function SettingsWidget() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getFeatureStatus = (enabled?: boolean) => {
    return enabled ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Enabled
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
        Disabled
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(getIcon('settings'), { className: 'h-5 w-5' })}
            Settings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {React.createElement(getIcon('settings'), { className: 'h-5 w-5' })}
          Settings Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chatbot Settings */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(getIcon('messageSquare'), { className: 'h-4 w-4 text-blue-500' })}
              <span className="text-sm font-medium">Chatbot</span>
            </div>
            {getFeatureStatus(settings.chatbot?.enabled)}
          </div>

          {/* Clock-in/out Settings */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(getIcon('clock'), { className: 'h-4 w-4 text-green-500' })}
              <span className="text-sm font-medium">Clock System</span>
            </div>
            {getFeatureStatus(settings.clock?.enabled)}
          </div>

          {/* Hair Simulator */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(getIcon('palette'), { className: 'h-4 w-4 text-purple-500' })}
              <span className="text-sm font-medium">Hair Simulator</span>
            </div>
            {getFeatureStatus(settings.barbershop?.simulator?.enabled)}
          </div>

          {/* Events */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(getIcon('bell'), { className: 'h-4 w-4 text-orange-500' })}
              <span className="text-sm font-medium">Community Events</span>
            </div>
            {getFeatureStatus(settings.barbershop?.events?.enabled)}
          </div>

          {/* Retail */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(getIcon('settings'), { className: 'h-4 w-4 text-indigo-500' })}
              <span className="text-sm font-medium">Retail Corner</span>
            </div>
            {getFeatureStatus(settings.barbershop?.retail?.enabled)}
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(getIcon('bell'), { className: 'h-4 w-4 text-red-500' })}
              <span className="text-sm font-medium">Email Notifications</span>
            </div>
            {getFeatureStatus(settings.notifications?.email?.enabled)}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => router.push('/admin/payload/collections/settings')}
            className="flex-1"
            variant="outline"
          >
            {React.createElement(getIcon('settings'), { className: 'h-4 w-4 mr-2' })}
            Manage Settings
          </Button>
          <Button
            onClick={() => router.push('/admin/payload/collections/settings/create')}
            className="flex-1"
          >
            {React.createElement(getIcon('settings'), { className: 'h-4 w-4 mr-2' })}
            Create New
          </Button>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <p>Settings are applied globally or per tenant. Tenant-specific settings override global settings.</p>
        </div>
      </CardContent>
    </Card>
  );
}
