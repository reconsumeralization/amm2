'use client';

import React, { useState, useEffect } from 'react';
import { SimpleBarChart, SimplePieChart } from '@/components/ui/chart';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  rch, 
  MessageSquare, 
  AlertTriangle, 
  Star, 
  ThumbsUp 
} from '@/lib/icon-mapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DocumentationMetrics, 
  ContentAnalytics, 
  OptimizationRecommendations,
  DateRange,
  UserRole 
} from '@/types/analytics';
import { AnalyticsService } from '@/lib/analytics-service';

interface AnalyticsDashboardProps {
  timeRange: DateRange;
  userRole: 'admin' | 'content_manager';
  className?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsDashboard({ 
  timeRange, 
  userRole, 
  className = '' 
}: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DocumentationMetrics | null>(null);
  const [analytics, setAnalytics] = useState<ContentAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        const [metricsData, analyticsData, recommendationsData] = await Promise.all([
          analyticsService.getDocumentationMetrics(timeRange),
          analyticsService.getContentAnalytics(timeRange),
          analyticsService.getOptimizationRecommendations()
        ]);

        setMetrics(metricsData);
        setAnalytics(analyticsData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, [timeRange, analyticsService]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getMetricCards = () => {
    if (!metrics) return [];

    return [
      {
        title: 'Total Views',
        value: formatNumber(metrics.totalViews),
        icon: Eye,
        change: '+12%',
        changeType: 'positive' as const
      },
      {
        title: 'Unique Users',
        value: formatNumber(metrics.uniqueUsers),
        icon: Users,
        change: '+8%',
        changeType: 'positive' as const
      },
      {
        title: 'rch Queries',
        value: formatNumber(metrics.rchQueries.length),
        icon: rch,
        change: '+15%',
        changeType: 'positive' as const
      },
      {
        title: 'Avg Satisfaction',
        value: metrics.userSatisfaction.length > 0 
          ? metrics.userSatisfaction.reduce((sum, s) => sum + s.averageRating, 0) / metrics.userSatisfaction.length
          : 0,
        icon: Star,
        change: '+0.2',
        changeType: 'positive' as const,
        format: (val: number) => val.toFixed(1)
      }
    ];
  };

  const getPopularContentData = () => {
    if (!metrics) return [];
    
    return metrics.popularContent
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(content => ({
        name: content.title.length > 30 
          ? content.title.substring(0, 30) + '...' 
          : content.title,
        views: content.views,
        rating: content.averageRating
      }));
  };

  const getrchQueriesData = () => {
    if (!metrics) return [];
    
    return metrics.rchQueries
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(query => ({
        query: query.query.length > 20 
          ? query.query.substring(0, 20) + '...' 
          : query.query,
        count: query.count,
        ctr: query.clickThroughRate
      }));
  };

  const getUserSatisfactionData = () => {
    if (!metrics) return [];
    
    const satisfactionLevels = [
      { name: 'Very Satisfied (5)', value: 0, color: '#22C55E' },
      { name: 'Satisfied (4)', value: 0, color: '#84CC16' },
      { name: 'Neutral (3)', value: 0, color: '#EAB308' },
      { name: 'Dissatisfied (2)', value: 0, color: '#F97316' },
      { name: 'Very Dissatisfied (1)', value: 0, color: '#EF4444' }
    ];

    metrics.userSatisfaction.forEach(satisfaction => {
      const rating = Math.round(satisfaction.averageRating);
      if (rating >= 1 && rating <= 5) {
        satisfactionLevels[5 - rating].value += satisfaction.totalRatings;
      }
    });

    return satisfactionLevels.filter(level => level.value > 0);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metricCards = getMetricCards();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">
                    {metric.format ? metric.format(metric.value as number) : metric.value}
                  </p>
                  <p className={`text-sm ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change} from last period
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <metric.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="rch">rch</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={getPopularContentData()} 
                  dataKey="views"
                  width={400}
                  height={300}
                />
              </CardContent>
            </Card>

            {/* User Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  User Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart 
                  data={getUserSatisfactionData()}
                  width={300}
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.popularContent.slice(0, 10).map((content, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{content.title}</h4>
                      <p className="text-sm text-gray-600">
                        {content.views} views • {content.uniqueViews} unique • 
                        {content.averageRating.toFixed(1)} ⭐
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {(content.completionRate * 100).toFixed(1)}% completion
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(content.averageTimeSpent)}s avg time
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <rch className="h-5 w-5" />
                rch Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart 
                data={getrchQueriesData()} 
                dataKey="count"
                width={600}
                height={400}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          {/* Content Gaps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Content Gaps & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations?.contentGaps.slice(0, 5).map((gap, index) => (
                  <div key={index} className={`p-4 border-l-4 rounded-lg ${
                    gap.priority === 'critical' ? 'border-red-500 bg-red-50' :
                    gap.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                    gap.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{gap.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Source: {gap.source.replace('_', ' ')} • 
                          Frequency: {gap.frequency} • 
                          Priority: {gap.priority}
                        </p>
                        {gap.suggestedContent.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Suggested content:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {gap.suggestedContent.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        Address
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Improvement Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations?.improvementSuggestions.slice(0, 5).map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{suggestion.description}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Content: {suggestion.contentId} • 
                          Type: {suggestion.type} • 
                          Impact: {suggestion.estimatedImpact}/10
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {suggestion.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
