'use client';

import { useEffect, useCallback, useRef } from 'react';
import { AnalyticsService } from '@/lib/analytics-service';
import { UserFeedback, UserRole } from '@/types/analytics';

interface UnalyticsOptions {
  contentId?: string;
  contentType?: 'guide' | 'api' | 'component';
  userRole?: UserRole;
  trackPageView?: boolean;
  trackScrollDepth?: boolean;
  trackTimeSpent?: boolean;
}

export function unalytics(options: UnalyticsOptions = {}) {
  const {
    contentId,
    contentType = 'guide',
    userRole = 'guest',
    trackPageView = true,
    trackScrollDepth = true,
    trackTimeSpent = true
  } = options;

  const analyticsService = AnalyticsService.getInstance();
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const sessionIdRef = useRef<string>();

  // Initialize session ID
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      sessionIdRef.current = sessionId;
    }
  }, []);

  // Track page view on mount
  useEffect(() => {
    if (trackPageView && contentId && sessionIdRef.current) {
      analyticsService.trackPageView(contentId, userRole, sessionIdRef.current);
      startTimeRef.current = Date.now();
    }
  }, [contentId, userRole, trackPageView, analyticsService]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScrollDepth || !contentId) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      if (scrollDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = scrollDepth;
        analyticsService.trackScrollDepth(contentId, scrollDepth, sessionIdRef.current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentId, trackScrollDepth, analyticsService]);

  // Track time spent on unmount
  useEffect(() => {
    return () => {
      if (trackTimeSpent && contentId && sessionIdRef.current) {
        const timeSpent = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
        analyticsService.trackTimeSpent(contentId, timeSpent, sessionIdRef.current);
      }
    };
  }, [contentId, trackTimeSpent, analyticsService]);

  // Analytics methods
  const submitFeedback = useCallback(async (feedback: Omit<UserFeedback, 'id' | 'timestamp'>) => {
    const fullFeedback: UserFeedback = {
      ...feedback,
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      contentId: feedback.contentId || contentId || '',
      contentType: feedback.contentType || contentType,
      userRole: feedback.userRole || userRole
    };

    await analyticsService.submitFeedback(fullFeedback);
  }, [contentId, contentType, userRole, analyticsService]);

  const trackrch = useCallback((query: string, resultsCount: number) => {
    return analyticsService.trackrch(query, resultsCount, userRole);
  }, [userRole, analyticsService]);

  const trackrchClick = useCallback((query: string, resultId: string) => {
    analyticsService.trackrchClick(query, resultId);
  }, [analyticsService]);

  const trackrchRefinement = useCallback((originalQuery: string, refinedQuery: string) => {
    analyticsService.trackrchRefinement(originalQuery, refinedQuery);
  }, [analyticsService]);

  const trackCustomEvent = useCallback((eventType: string, target: string, metadata?: Record<string, any>) => {
    // Custom event tracking for specific interactions
    if (sessionIdRef.current) {
      // This would be implemented based on specific needs
      console.log('Custom event tracked:', { eventType, target, metadata, sessionId: sessionIdRef.current });
    }
  }, []);

  return {
    submitFeedback,
    trackrch,
    trackrchClick,
    trackrchRefinement,
    trackCustomEvent,
    sessionId: sessionIdRef.current
  };
}

// Hook for analytics dashboard data
export function unalyticsDashboard(timeRange: { start: Date; end: Date }) {
  const analyticsService = AnalyticsService.getInstance();

  const getMetrics = useCallback(async () => {
    return await analyticsService.getDocumentationMetrics(timeRange);
  }, [timeRange, analyticsService]);

  const getContentAnalytics = useCallback(async () => {
    return await analyticsService.getContentAnalytics(timeRange);
  }, [timeRange, analyticsService]);

  const getOptimizationRecommendations = useCallback(async () => {
    return await analyticsService.getOptimizationRecommendations();
  }, [analyticsService]);

  return {
    getMetrics,
    getContentAnalytics,
    getOptimizationRecommendations
  };
}