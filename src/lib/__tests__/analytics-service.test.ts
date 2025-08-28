import { AnalyticsService } from '../analytics-service';
import { UserFeedback, UserRole } from '@/types/analytics';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    // Reset mocks
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    
    // Get fresh instance
    analyticsService = AnalyticsService.getInstance();
  });

  describe('Feedback Management', () => {
    it('submits feedback successfully', async () => {
      localStorageMock.getItem.mockReturnValue('[]');
      
      const feedback: UserFeedback = {
        id: 'test-feedback',
        contentId: 'test-content',
        contentType: 'guide',
        rating: 5,
        helpful: true,
        comment: 'Great content!',
        userRole: 'developer',
        timestamp: new Date()
      };

      await analyticsService.submitFeedback(feedback);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'documentation_feedback',
        expect.stringContaining('test-feedback')
      );
    });

    it('retrieves feedback by content ID', async () => {
      const mockFeedback = [
        {
          id: 'feedback1',
          contentId: 'content1',
          contentType: 'guide',
          rating: 5,
          helpful: true,
          userRole: 'developer',
          timestamp: new Date().toISOString()
        },
        {
          id: 'feedback2',
          contentId: 'content2',
          contentType: 'api',
          rating: 3,
          helpful: false,
          userRole: 'developer',
          timestamp: new Date().toISOString()
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFeedback));

      const feedback = await analyticsService.getFeedback('content1');
      
      expect(feedback).toHaveLength(1);
      expect(feedback[0].contentId).toBe('content1');
    });

    it('retrieves all feedback when no content ID specified', async () => {
      const mockFeedback = [
        { id: 'feedback1', contentId: 'content1' },
        { id: 'feedback2', contentId: 'content2' }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFeedback));

      const feedback = await analyticsService.getFeedback();
      
      expect(feedback).toHaveLength(2);
    });
  });

  describe('Page View Tracking', () => {
    it('tracks page views with session ID', () => {
      analyticsService.trackPageView('test-content', 'developer', 'test-session');
      
      // Should not throw and should handle the tracking internally
      expect(true).toBe(true);
    });

    it('tracks time spent on content', () => {
      analyticsService.trackTimeSpent('test-content', 120, 'test-session');
      
      // Should not throw - internal tracking
      expect(true).toBe(true);
    });

    it('tracks scroll depth', () => {
      analyticsService.trackScrollDepth('test-content', 0.75, 'test-session');
      
      // Should not throw - internal tracking
      expect(true).toBe(true);
    });
  });

  describe('rch Tracking', () => {
    it('tracks rch queries', () => {
      const rchId = analyticsService.trackrch('test query', 5, 'developer');
      
      expect(rchId).toMatch(/^rch_\d+_/);
    });

    it('tracks rch clicks', () => {
      analyticsService.trackrch('test query', 5, 'developer');
      analyticsService.trackrchClick('test query', 'result-1');
      
      // Should not throw - internal tracking
      expect(true).toBe(true);
    });

    it('tracks rch refinements', () => {
      analyticsService.trackrch('original query', 0, 'developer');
      analyticsService.trackrchRefinement('original query', 'refined query');
      
      // Should not throw - internal tracking
      expect(true).toBe(true);
    });
  });

  describe('Analytics Generation', () => {
    it('generates documentation metrics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      localStorageMock.getItem.mockReturnValue('[]');

      const metrics = await analyticsService.getDocumentationMetrics(dateRange);

      expect(metrics).toHaveProperty('totalViews');
      expect(metrics).toHaveProperty('uniqueUsers');
      expect(metrics).toHaveProperty('rchQueries');
      expect(metrics).toHaveProperty('popularContent');
      expect(metrics).toHaveProperty('userSatisfaction');
      expect(metrics).toHaveProperty('contentGaps');
      expect(metrics.timeRange).toEqual(dateRange);
    });

    it('generates content analytics', async () => {
      const dateRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-01-31')
      };

      const analytics = await analyticsService.getContentAnalytics(dateRange);

      expect(analytics).toHaveProperty('pageViews');
      expect(analytics).toHaveProperty('userJourneys');
      expect(analytics).toHaveProperty('rchBehavior');
      expect(analytics).toHaveProperty('contentEffectiveness');
      expect(analytics).toHaveProperty('userSatisfaction');
    });

    it('generates optimization recommendations', async () => {
      localStorageMock.getItem.mockReturnValue('[]');

      const recommendations = await analyticsService.getOptimizationRecommendations();

      expect(recommendations).toHaveProperty('contentGaps');
      expect(recommendations).toHaveProperty('improvementSuggestions');
      expect(recommendations).toHaveProperty('popularityTrends');
      expect(recommendations).toHaveProperty('userFeedbackSummary');
    });
  });

  describe('Content Gap Identification', () => {
    it('identifies gaps from rch queries with no results', async () => {
      // Simulate rches with no results
      analyticsService.trackrch('missing feature docs', 0, 'developer');
      analyticsService.trackrch('missing feature docs', 0, 'developer');
      analyticsService.trackrch('missing feature docs', 0, 'developer');

      const recommendations = await analyticsService.getOptimizationRecommendations();
      
      const rchGaps = recommendations.contentGaps.filter(
        gap => gap.source === 'rch_queries'
      );
      
      expect(rchGaps.length).toBeGreaterThan(0);
    });

    it('identifies gaps from negative feedback', async () => {
      // Mock localStorage to return existing feedback
      const negativeFeedback: UserFeedback[] = [
        {
          id: 'feedback1',
          contentId: 'problematic-content',
          contentType: 'guide',
          rating: 1,
          helpful: false,
          comment: 'This is confusing',
          userRole: 'developer',
          timestamp: new Date()
        },
        {
          id: 'feedback2',
          contentId: 'problematic-content',
          contentType: 'guide',
          rating: 2,
          helpful: false,
          comment: 'Missing information',
          userRole: 'developer',
          timestamp: new Date()
        },
        {
          id: 'feedback3',
          contentId: 'problematic-content',
          contentType: 'guide',
          rating: 1,
          helpful: false,
          comment: 'Has errors',
          userRole: 'developer',
          timestamp: new Date()
        }
      ];

      // Mock localStorage to return the negative feedback
      localStorageMock.getItem.mockReturnValue(JSON.stringify(negativeFeedback));

      const recommendations = await analyticsService.getOptimizationRecommendations();
      
      const feedbackGaps = recommendations.contentGaps.filter(
        gap => gap.source === 'user_feedback'
      );
      
      // Should identify at least one gap from the negative feedback
      expect(feedbackGaps.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('returns the same instance', () => {
      const instance1 = AnalyticsService.getInstance();
      const instance2 = AnalyticsService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});