'use client';

import { useEffect } from 'react';
import { useMonitoring } from '@/hooks/useMonitoring';

interface TelemetryTrackerProps {
  eventName: string;
  properties?: Record<string, any>;
}

const TelemetryTracker = ({ eventName, properties }: TelemetryTrackerProps) => {
  const { trackEvent } = useMonitoring();

  useEffect(() => {
    trackEvent(eventName, properties);
  }, [eventName, properties, trackEvent]);

  return null;
};

export default TelemetryTracker;
