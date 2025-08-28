# Documentation Analytics System

This analytics system provides comprehensive user feedback collection and content optimization insights for the documentation portal.

## Features Implemented

### ✅ User Feedback Collection
- **FeedbackWidget Component**: Interactive widget for collecting user ratings, helpful/not helpful votes, and detailed comments
- **Structured Feedback Data**: Comprehensive UserFeedback interface with metadata, tags, and user role tracking
- **Automatic Tagging**: Smart tagging based on feedback content (clarity-issue, accuracy-issue, etc.)

### ✅ Analytics Tracking
- **Page View Tracking**: Automatic tracking of page views, time spent, and scroll depth
- **rch Behavior**: Track rch queries, results, clicks, and refinements
- **User Journey Mapping**: Session-based tracking of user navigation patterns
- **Custom Event Tracking**: Flexible system for tracking specific interactions

### ✅ Content Gap Identification
- **rch-Based Gaps**: Identify missing content from rches with no results
- **Feedback-Based Gaps**: Detect problematic content from negative user feedback
- **Priority Classification**: Automatic priority assignment (critical, high, medium, low)
- **Actionable Recommendations**: Specific suggestions for content improvements

### ✅ Analytics Dashboard
- **Comprehensive Metrics**: Total views, unique users, rch queries, satisfaction scores
- **Visual Charts**: Bar charts for popular content, pie charts for satisfaction distribution
- **Content Performance**: Detailed metrics for each piece of content
- **Optimization Insights**: Data-driven recommendations for content improvements

### ✅ Real-time Processing
- **Instant Feedback Processing**: Immediate analysis of user feedback for quality issues
- **Content Flagging**: Automatic flagging of content with negative feedback patterns
- **Live Analytics**: Real-time updates to analytics data and recommendations

## Components

### FeedbackWidget
Interactive component for collecting user feedback with ratings, comments, and suggestions.

```tsx
<FeedbackWidget
  contentId="my-content-id"
  contentType="guide"
  onFeedback={handleFeedback}
  showRating={true}
  showComments={true}
  userRole="developer"
/>
```

### AnalyticsDashboard
Comprehensive dashboard for viewing analytics data and insights.

```tsx
<AnalyticsDashboard
  timeRange={{ start: startDate, end: endDate }}
  userRole="admin"
/>
```

### ContentGapAnalyzer
Component for identifying and analyzing content gaps.

```tsx
<ContentGapAnalyzer
  onGapSelect={(gap) => handleGapSelection(gap)}
  showFilters={true}
/>
```

## Services

### AnalyticsService
Singleton service for managing all analytics data collection and processing.

```typescript
const analytics = AnalyticsService.getInstance();

// Submit feedback
await analytics.submitFeedback(feedback);

// Track page views
analytics.trackPageView(contentId, userRole, sessionId);

// Track rches
const rchId = analytics.trackrch(query, resultsCount, userRole);

// Get metrics
const metrics = await analytics.getDocumentationMetrics(timeRange);
```

## Hooks

### unalytics
React hook for easy integration of analytics tracking in components.

```typescript
const analytics = unalytics({
  contentId: 'my-page',
  contentType: 'guide',
  userRole: 'developer',
  trackPageView: true,
  trackScrollDepth: true,
  trackTimeSpent: true
});
```

## Data Models

### UserFeedback
```typescript
interface UserFeedback {
  id: string;
  contentId: string;
  contentType: 'guide' | 'api' | 'component';
  rating: number; // 1-5 scale
  helpful: boolean;
  comment?: string;
  suggestions?: string;
  userRole: UserRole;
  timestamp: Date;
  tags?: string[];
}
```

### ContentGap
```typescript
interface ContentGap {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'rch_queries' | 'user_feedback' | 'behavioral_analytics';
  relatedQueries: string[];
  suggestedContent: string[];
  userRoles: UserRole[];
  frequency: number;
}
```

### DocumentationMetrics
```typescript
interface DocumentationMetrics {
  totalViews: number;
  uniqueUsers: number;
  rchQueries: rchMetric[];
  popularContent: ContentMetric[];
  userSatisfaction: SatisfactionMetric[];
  contentGaps: ContentGap[];
  timeRange: DateRange;
}
```

## Integration Guide

### 1. Basic Page Tracking
Add the analytics hook to any documentation page:

```typescript
import { unalytics } from '@/hooks/unalytics';

export default function MyDocPage() {
  const analytics = unalytics({
    contentId: 'my-doc-page',
    contentType: 'guide',
    userRole: 'developer'
  });

  return (
    <div>
      {/* Your content */}
      <FeedbackWidget
        contentId="my-doc-page"
        contentType="guide"
        onFeedback={analytics.submitFeedback}
      />
    </div>
  );
}
```

### 2. rch Integration
Track rch behavior in your rch components:

```typescript
const handlerch = (query: string) => {
  const results = performrch(query);
  const rchId = analytics.trackrch(query, results.length);
  
  // Track clicks on results
  results.forEach(result => {
    result.onClick = () => analytics.trackrchClick(query, result.id);
  });
};
```

### 3. Admin Dashboard
Create an admin page with the analytics dashboard:

```typescript
import { AnalyticsDashboard } from '@/components/documentation/AnalyticsDashboard';

export default function AdminAnalytics() {
  const timeRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  };

  return (
    <AnalyticsDashboard
      timeRange={timeRange}
      userRole="admin"
    />
  );
}
```

## Data Storage

Currently uses localStorage for demo purposes. For production:

1. **Backend Integration**: Replace localStorage calls with API calls to your analytics service
2. **Database Storage**: Store analytics data in a time-series database like InfluxDB or PostgreSQL
3. **Real-time Processing**: Use event streaming (Kafka, Redis) for real-time analytics
4. **Data Warehouse**: Export data to analytics platforms like Google Analytics, Mixpanel, or custom solutions

## Testing

Comprehensive test coverage includes:

- **Unit Tests**: All components and services have unit tests
- **Integration Tests**: End-to-end user flows are tested
- **Mock Data**: Sample data generation for testing and demos
- **Error Handling**: Graceful handling of network errors and edge cases

Run tests:
```bash
npm test -- --testPathPattern="FeedbackWidget|analytics-service"
```

## Performance Considerations

- **Debounced Tracking**: Scroll depth and time tracking are debounced to avoid excessive calls
- **Batch Processing**: Multiple analytics events can be batched for efficient processing
- **Local Storage**: Uses localStorage for offline capability and reduced server load
- **Lazy Loading**: Dashboard components load data on demand

## Privacy & Compliance

- **User Consent**: Implement consent management for analytics tracking
- **Data Anonymization**: Remove or hash personally identifiable information
- **GDPR Compliance**: Provide data export and deletion capabilities
- **Retention Policies**: Implement data retention and cleanup policies

## Future Enhancements

- **A/B Testing**: Framework for testing different content versions
- **Predictive Analytics**: ML-based content recommendations
- **Real-time Alerts**: Notifications for critical content issues
- **Advanced Visualizations**: More sophisticated charts and dashboards
- **API Integration**: RESTful API for external analytics tools
- **Mobile Analytics**: Enhanced tracking for mobile users

## Demo

Visit `/documentation/analytics-demo` to see the analytics system in action with:
- Interactive feedback widgets
- Live analytics dashboard
- Content gap analysis
- Integration examples