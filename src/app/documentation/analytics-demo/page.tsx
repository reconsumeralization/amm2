'use client';

import React, { useState } from 'react';
import { FeedbackWidget } from '@/components/documentation/FeedbackWidget';
import { AnalyticsDashboard } from '@/components/documentation/AnalyticsDashboard';
import { ContentGapAnalyzer } from '@/components/documentation/ContentGapAnalyzer';
import { unalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserFeedback, ContentGap } from '@/types/analytics';

export default function AnalyticsDemoPage() {
  const [selectedGap, setSelectedGap] = useState<ContentGap | null>(null);
  const [demoFeedback, setDemoFeedback] = useState<UserFeedback[]>([]);
  
  const analytics = unalytics({
    contentId: 'analytics-demo-page',
    contentType: 'guide',
    userRole: 'developer',
    trackPageView: true,
    trackScrollDepth: true,
    trackTimeSpent: true
  });

  const handleFeedback = async (feedback: UserFeedback) => {
    console.log('Feedback received:', feedback);
    setDemoFeedback(prev => [...prev, feedback]);
    await analytics.submitFeedback(feedback);
  };

  const handleGapSelect = (gap: ContentGap) => {
    setSelectedGap(gap);
    analytics.trackCustomEvent('gap_selected', gap.id, { priority: gap.priority });
  };

  const generateSampleData = async () => {
    // Generate some sample feedback
    const sampleFeedback: Omit<UserFeedback, 'id' | 'timestamp'>[] = [
      {
        contentId: 'sample-guide-1',
        contentType: 'guide',
        rating: 5,
        helpful: true,
        comment: 'Very clear and helpful!',
        userRole: 'developer'
      },
      {
        contentId: 'sample-guide-2',
        contentType: 'guide',
        rating: 2,
        helpful: false,
        comment: 'This is confusing and missing examples',
        userRole: 'salon_owner'
      },
      {
        contentId: 'sample-api-1',
        contentType: 'api',
        rating: 4,
        helpful: true,
        comment: 'Good documentation but could use more examples',
        userRole: 'developer'
      }
    ];

    for (const feedback of sampleFeedback) {
      await analytics.submitFeedback(feedback);
    }

    // Generate some sample rches
    analytics.trackrch('setup guide', 5);
    analytics.trackrch('api authentication', 3);
    analytics.trackrch('missing feature documentation', 0); // No results
    analytics.trackrch('troubleshooting errors', 2);
    analytics.trackrch('deployment guide', 0); // No results

    alert('Sample data generated! Check the analytics dashboard.');
  };

  const timeRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Analytics System Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This page demonstrates the user feedback and analytics system. 
          It tracks your interactions and provides insights for content optimization.
        </p>
        <Button onClick={generateSampleData} className="mb-6">
          Generate Sample Data
        </Button>
      </div>

      <Tabs defaultValue="feedback" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback">Feedback Widget</TabsTrigger>
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="gaps">Content Gaps</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Widget Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3>Sample Documentation Content</h3>
                <p>
                  This is a sample piece of documentation content. The feedback widget below 
                  allows users to rate the content, indicate if it was helpful, and provide 
                  detailed comments and suggestions.
                </p>
                <p>
                  The analytics system tracks all interactions including:
                </p>
                <ul>
                  <li>Page views and time spent</li>
                  <li>Scroll depth and engagement</li>
                  <li>User feedback and ratings</li>
                  <li>rch queries and results</li>
                </ul>
              </div>

              <FeedbackWidget
                contentId="analytics-demo-content"
                contentType="guide"
                onFeedback={handleFeedback}
                showRating={true}
                showComments={true}
                userRole="developer"
              />

              {demoFeedback.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Feedback:</h4>
                  <div className="space-y-2">
                    {demoFeedback.slice(-3).map((feedback, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Rating: {feedback.rating}/5</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            feedback.helpful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {feedback.helpful ? 'Helpful' : 'Not Helpful'}
                          </span>
                        </div>
                        {feedback.comment && (
                          <p className="text-gray-600">{feedback.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <AnalyticsDashboard
            timeRange={timeRange}
            userRole="admin"
          />
        </TabsContent>

        <TabsContent value="gaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContentGapAnalyzer
              onGapSelect={handleGapSelect}
              showFilters={true}
            />
            
            {selectedGap && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Content Gap</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Description:</h4>
                      <p className="text-gray-600">{selectedGap.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Priority:</h4>
                      <span className={`px-2 py-1 rounded text-sm ${
                        selectedGap.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        selectedGap.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        selectedGap.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedGap.priority.toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Source:</h4>
                      <p className="text-gray-600">{selectedGap.source.replace('_', ' ')}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Frequency:</h4>
                      <p className="text-gray-600">{selectedGap.frequency} occurrences</p>
                    </div>
                    
                    {selectedGap.suggestedContent.length > 0 && (
                      <div>
                        <h4 className="font-medium">Suggested Content:</h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {selectedGap.suggestedContent.map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3>How to Integrate Analytics</h3>
                
                <h4>1. Add Analytics Hook to Your Page</h4>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`import { unalytics } from '@/hooks/unalytics';

export default function MyDocumentationPage() {
  const analytics = unalytics({
    contentId: 'my-page-id',
    contentType: 'guide',
    userRole: 'developer',
    trackPageView: true,
    trackScrollDepth: true,
    trackTimeSpent: true
  });

  // Your page content...
}`}
                </pre>

                <h4>2. Add Feedback Widget</h4>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`import { FeedbackWidget } from '@/components/documentation/FeedbackWidget';

<FeedbackWidget
  contentId="my-content-id"
  contentType="guide"
  onFeedback={analytics.submitFeedback}
  showRating={true}
  showComments={true}
  userRole="developer"
/>`}
                </pre>

                <h4>3. Track rch Interactions</h4>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`// Track rch queries
const rchId = analytics.trackrch(query, resultsCount);

// Track rch result clicks
analytics.trackrchClick(query, resultId);

// Track rch refinements
analytics.trackrchRefinement(originalQuery, refinedQuery);`}
                </pre>

                <h4>4. View Analytics Dashboard</h4>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`import { AnalyticsDashboard } from '@/components/documentation/AnalyticsDashboard';

<AnalyticsDashboard
  timeRange={{ start: startDate, end: endDate }}
  userRole="admin"
/>`}
                </pre>

                <h4>5. Analyze Content Gaps</h4>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
{`import { ContentGapAnalyzer } from '@/components/documentation/ContentGapAnalyzer';

<ContentGapAnalyzer
  onGapSelect={(gap) => console.log('Address gap:', gap)}
  showFilters={true}
/>`}
                </pre>

                <h3>Features Implemented</h3>
                <ul>
                  <li>✅ User feedback collection with ratings and comments</li>
                  <li>✅ Page view and engagement tracking</li>
                  <li>✅ rch behavior analytics</li>
                  <li>✅ Content gap identification</li>
                  <li>✅ Analytics dashboard with visualizations</li>
                  <li>✅ Optimization recommendations</li>
                  <li>✅ User satisfaction metrics</li>
                  <li>✅ Automated content tagging</li>
                </ul>

                <h3>Data Storage</h3>
                <p>
                  Currently using localStorage for demo purposes. In production, 
                  you would integrate with your backend analytics service or database.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}