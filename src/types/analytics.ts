export interface UserFeedback {
  id: string;
  contentId: string;
  contentType: 'guide' | 'api' | 'component';
  rating: number; // 1-5 scale
  comment?: string;
  helpful: boolean;
  suggestions?: string;
  userRole: UserRole;
  timestamp: Date;
  userId?: string;
  tags?: string[];
}

export interface DocumentationMetrics {
  totalViews: number;
  uniqueUsers: number;
  rchQueries: rchMetric[];
  popularContent: ContentMetric[];
  userSatisfaction: SatisfactionMetric[];
  contentGaps: ContentGap[];
  timeRange: DateRange;
}

export interface rchMetric {
  query: string;
  count: number;
  resultsFound: number;
  clickThroughRate: number;
  timestamp: Date;
  userRole?: UserRole;
}

export interface ContentMetric {
  contentId: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTimeSpent: number;
  completionRate: number;
  feedbackCount: number;
  averageRating: number;
  contentType: 'guide' | 'api' | 'component';
}

export interface SatisfactionMetric {
  contentId: string;
  averageRating: number;
  totalRatings: number;
  helpfulVotes: number;
  totalVotes: number;
  sentimentScore: number; // -1 to 1
  improvementSuggestions: string[];
}

export interface ContentGap {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  source: 'rch_queries' | 'user_feedback' | 'behavioral_analytics';
  relatedQueries: string[];
  suggestedContent: string[];
  userRoles: UserRole[];
  frequency: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ContentAnalytics {
  pageViews: PageViewMetric[];
  userJourneys: UserJourneyMetric[];
  rchBehavior: rchBehaviorMetric[];
  contentEffectiveness: EffectivenessMetric[];
  userSatisfaction: SatisfactionMetric[];
}

export interface PageViewMetric {
  contentId: string;
  timestamp: Date;
  userRole?: UserRole;
  sessionId: string;
  referrer?: string;
  timeSpent: number;
  scrollDepth: number;
  exitPoint?: string;
}

export interface UserJourneyMetric {
  sessionId: string;
  userRole?: UserRole;
  startTime: Date;
  endTime: Date;
  pages: string[];
  actions: UserAction[];
  completed: boolean;
  dropOffPoint?: string;
}

export interface UserAction {
  type: 'click' | 'rch' | 'feedback' | 'download' | 'copy';
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface rchBehaviorMetric {
  query: string;
  timestamp: Date;
  userRole?: UserRole;
  resultsCount: number;
  clickedResults: string[];
  refinements: string[];
  abandoned: boolean;
}

export interface EffectivenessMetric {
  contentId: string;
  taskCompletionRate: number;
  userSuccessRate: number;
  averageTaskTime: number;
  errorRate: number;
  supportTicketsGenerated: number;
}

export interface OptimizationRecommendations {
  contentGaps: ContentGap[];
  improvementSuggestions: ImprovementSuggestion[];
  popularityTrends: PopularityTrend[];
  userFeedbackSummary: FeedbackSummary[];
}

export interface ImprovementSuggestion {
  contentId: string;
  type: 'clarity' | 'completeness' | 'accuracy' | 'accessibility' | 'performance';
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 1-10 scale
  basedOn: 'user_feedback' | 'analytics' | 'automated_analysis';
}

export interface PopularityTrend {
  contentId: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
  timeframe: DateRange;
  factors: string[];
}

export interface FeedbackSummary {
  contentId: string;
  totalFeedback: number;
  averageRating: number;
  commonThemes: string[];
  sentimentTrend: 'positive' | 'negative' | 'neutral';
  actionableInsights: string[];
}

export type UserRole = 
  | 'developer'
  | 'salon_owner' 
  | 'salon_employee'
  | 'salon_customer'
  | 'system_admin'
  | 'guest';