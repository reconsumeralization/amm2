import {
  UserFeedback,
  DocumentationMetrics,
  ContentAnalytics,
  OptimizationRecommendations,
  ContentGap,
  PageViewMetric,
  UserJourneyMetric,
  rchBehaviorMetric,
  UserAction,
  DateRange,
  UserRole
} from '@/types/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private feedbackStorage: UserFeedback[] = [];
  private pageViews: PageViewMetric[] = [];
  private userJourneys: Map<string, UserJourneyMetric> = new Map();
  private rchBehavior: rchBehaviorMetric[] = [];

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Feedback Management
  async submitFeedback(feedback: UserFeedback): Promise<void> {
    this.feedbackStorage.push(feedback);

    // In a real implementation, this would send to a backend service
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('documentation_feedback') || '[]';
      const existing = JSON.parse(stored);
      existing.push(feedback);
      localStorage.setItem('documentation_feedback', JSON.stringify(existing));
    }

    // Trigger analytics processing
    this.processNewFeedback(feedback);
  }

  async getFeedback(contentId?: string): Promise<UserFeedback[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('documentation_feedback') || '[]';
      const feedback = JSON.parse(stored);
      return contentId
        ? feedback.filter((f: UserFeedback) => f.contentId === contentId)
        : feedback;
    }

    return contentId
      ? this.feedbackStorage.filter(f => f.contentId === contentId)
      : this.feedbackStorage;
  }

  // Page View Tracking
  trackPageView(contentId: string, userRole?: UserRole, sessionId?: string): void {
    const pageView: PageViewMetric = {
      contentId,
      timestamp: new Date(),
      userRole,
      sessionId: sessionId || this.generateSessionId(),
      timeSpent: 0,
      scrollDepth: 0
    };

    this.pageViews.push(pageView);
    this.updateUserJourney(pageView.sessionId, contentId, 'page_view');
  }

  trackTimeSpent(contentId: string, timeSpent: number, sessionId?: string): void {
    const sessionIdToUse = sessionId || this.getCurrentSessionId();
    const pageView = this.pageViews.find(
      pv => pv.contentId === contentId && pv.sessionId === sessionIdToUse
    );

    if (pageView) {
      pageView.timeSpent = timeSpent;
    }
  }

  trackScrollDepth(contentId: string, scrollDepth: number, sessionId?: string): void {
    const sessionIdToUse = sessionId || this.getCurrentSessionId();
    const pageView = this.pageViews.find(
      pv => pv.contentId === contentId && pv.sessionId === sessionIdToUse
    );

    if (pageView) {
      pageView.scrollDepth = Math.max(pageView.scrollDepth, scrollDepth);
    }
  }

  // rch Behavior Tracking
  trackrch(
    query: string,
    resultsCount: number,
    userRole?: UserRole
  ): string {
    const rchId = `rch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rchMetric: rchBehaviorMetric = {
      query,
      timestamp: new Date(),
      userRole,
      resultsCount,
      clickedResults: [],
      refinements: [],
      abandoned: false
    };

    this.rchBehavior.push(rchMetric);
    return rchId;
  }

  trackrchClick(query: string, resultId: string): void {
    const rchMetric = this.rchBehavior.find(
      s => s.query === query &&
        Math.abs(s.timestamp.getTime() - Date.now()) < 300000 // 5 minutes
    );

    if (rchMetric) {
      rchMetric.clickedResults.push(resultId);
    }
  }

  trackrchRefinement(originalQuery: string, refinedQuery: string): void {
    const rchMetric = this.rchBehavior.find(
      s => s.query === originalQuery &&
        Math.abs(s.timestamp.getTime() - Date.now()) < 300000
    );

    if (rchMetric) {
      rchMetric.refinements.push(refinedQuery);
    }
  }

  // User Journey Tracking
  private updateUserJourney(sessionId: string, contentId: string, actionType: string): void {
    let journey = this.userJourneys.get(sessionId);

    if (!journey) {
      journey = {
        sessionId,
        startTime: new Date(),
        endTime: new Date(),
        pages: [],
        actions: [],
        completed: false
      };
      this.userJourneys.set(sessionId, journey);
    }

    journey.endTime = new Date();
    if (!journey.pages.includes(contentId)) {
      journey.pages.push(contentId);
    }

    const action: UserAction = {
      type: actionType as any,
      target: contentId,
      timestamp: new Date()
    };
    journey.actions.push(action);
  }

  // Analytics Generation
  async getDocumentationMetrics(dateRange: DateRange): Promise<DocumentationMetrics> {
    const feedback = await this.getFeedback();
    const filteredFeedback = feedback.filter(
      f => f.timestamp >= dateRange.start && f.timestamp <= dateRange.end
    );

    const filteredPageViews = this.pageViews.filter(
      pv => pv.timestamp >= dateRange.start && pv.timestamp <= dateRange.end
    );

    const filteredrches = this.rchBehavior.filter(
      s => s.timestamp >= dateRange.start && s.timestamp <= dateRange.end
    );

    return {
      totalViews: filteredPageViews.length,
      uniqueUsers: new Set(filteredPageViews.map(pv => pv.sessionId)).size,
      rchQueries: this.generaterchMetrics(filteredrches),
      popularContent: this.generateContentMetrics(filteredPageViews, filteredFeedback),
      userSatisfaction: this.generateSatisfactionMetrics(filteredFeedback),
      contentGaps: await this.identifyContentGaps(filteredrches, filteredFeedback),
      timeRange: dateRange
    };
  }

  async getContentAnalytics(dateRange: DateRange): Promise<ContentAnalytics> {
    const filteredPageViews = this.pageViews.filter(
      pv => pv.timestamp >= dateRange.start && pv.timestamp <= dateRange.end
    );

    const journeys = Array.from(this.userJourneys.values()).filter(
      j => j.startTime >= dateRange.start && j.endTime <= dateRange.end
    );

    const filteredrches = this.rchBehavior.filter(
      s => s.timestamp >= dateRange.start && s.timestamp <= dateRange.end
    );

    return {
      pageViews: filteredPageViews,
      userJourneys: journeys,
      rchBehavior: filteredrches,
      contentEffectiveness: this.generateEffectivenessMetrics(filteredPageViews),
      userSatisfaction: this.generateSatisfactionMetrics(await this.getFeedback())
    };
  }

  async getOptimizationRecommendations(): Promise<OptimizationRecommendations> {
    const feedback = await this.getFeedback();
    const contentGaps = await this.identifyContentGaps(this.rchBehavior, feedback);

    return {
      contentGaps,
      improvementSuggestions: this.generateImprovementSuggestions(feedback),
      popularityTrends: this.generatePopularityTrends(),
      userFeedbackSummary: this.generateFeedbackSummary(feedback)
    };
  }

  // Private helper methods
  private processNewFeedback(feedback: UserFeedback): void {
    // Process feedback for real-time insights
    if (feedback.rating <= 2 || !feedback.helpful) {
      this.flagContentForReview(feedback.contentId, feedback);
    }
  }

  private flagContentForReview(contentId: string, _feedback: UserFeedback): void {
    // In a real implementation, this would trigger alerts or notifications
    console.log(`Content ${contentId} flagged for review based on negative feedback`);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = this.generateSessionId();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }
      return sessionId;
    }
    return this.generateSessionId();
  }

  private generaterchMetrics(rches: rchBehaviorMetric[]) {
    const queryMap = new Map<string, { count: number; results: number; clicks: number }>();

    rches.forEach(rch => {
      const existing = queryMap.get(rch.query) || { count: 0, results: 0, clicks: 0 };
      existing.count++;
      existing.results += rch.resultsCount;
      existing.clicks += rch.clickedResults.length;
      queryMap.set(rch.query, existing);
    });

    return Array.from(queryMap.entries()).map(([query, data]) => ({
      query,
      count: data.count,
      resultsFound: Math.round(data.results / data.count),
      clickThroughRate: data.count > 0 ? data.clicks / data.count : 0,
      timestamp: new Date()
    }));
  }

  private generateContentMetrics(pageViews: PageViewMetric[], feedback: UserFeedback[]) {
    const contentMap = new Map<string, {
      contentId: string;
      title: string;
      views: number;
      uniqueViews: Set<string>;
      totalTime: number;
      contentType: 'guide';
    }>();

    pageViews.forEach(pv => {
      const existing = contentMap.get(pv.contentId) || {
        contentId: pv.contentId,
        title: pv.contentId,
        views: 0,
        uniqueViews: new Set(),
        totalTime: 0,
        contentType: 'guide' as const
      };

      existing.views++;
      existing.uniqueViews.add(pv.sessionId);
      existing.totalTime += pv.timeSpent;
      contentMap.set(pv.contentId, existing);
    });

    return Array.from(contentMap.values()).map(content => {
      const contentFeedback = feedback.filter(f => f.contentId === content.contentId);
      const avgRating = contentFeedback.length > 0
        ? contentFeedback.reduce((sum, f) => sum + f.rating, 0) / contentFeedback.length
        : 0;

      return {
        ...content,
        uniqueViews: content.uniqueViews.size,
        averageTimeSpent: content.views > 0 ? content.totalTime / content.views : 0,
        completionRate: 0.8, // Placeholder - would be calculated based on scroll depth and time
        feedbackCount: contentFeedback.length,
        averageRating: avgRating
      };
    });
  }

  private generateSatisfactionMetrics(feedback: UserFeedback[]) {
    const contentMap = new Map<string, UserFeedback[]>();

    feedback.forEach(f => {
      const existing = contentMap.get(f.contentId) || [];
      existing.push(f);
      contentMap.set(f.contentId, existing);
    });

    return Array.from(contentMap.entries()).map(([contentId, contentFeedback]) => {
      const ratings = contentFeedback.filter(f => f.rating > 0);
      const helpfulVotes = contentFeedback.filter(f => f.helpful).length;

      return {
        contentId,
        averageRating: ratings.length > 0
          ? ratings.reduce((sum, f) => sum + f.rating, 0) / ratings.length
          : 0,
        totalRatings: ratings.length,
        helpfulVotes,
        totalVotes: contentFeedback.length,
        sentimentScore: this.calculateSentimentScore(contentFeedback),
        improvementSuggestions: contentFeedback
          .map(f => f.suggestions)
          .filter(Boolean) as string[]
      };
    });
  }

  private async identifyContentGaps(
    rches: rchBehaviorMetric[],
    feedback: UserFeedback[]
  ): Promise<ContentGap[]> {
    const gaps: ContentGap[] = [];

    // Identify gaps from rches with no results
    const noResultQueries = rches.filter(s => s.resultsCount === 0);
    const queryFrequency = new Map<string, number>();

    noResultQueries.forEach(s => {
      queryFrequency.set(s.query, (queryFrequency.get(s.query) || 0) + 1);
    });

    queryFrequency.forEach((frequency, query) => {
      if (frequency >= 3) { // Threshold for considering a gap
        gaps.push({
          id: `gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description: `Users are rching for "${query}" but no relevant content exists`,
          priority: frequency >= 10 ? 'high' : frequency >= 5 ? 'medium' : 'low',
          source: 'rch_queries',
          relatedQueries: [query],
          suggestedContent: this.generateContentSuggestions(query),
          userRoles: this.extractUserRolesFromrches(rches, query),
          frequency
        });
      }
    });

    // Identify gaps from negative feedback
    const negativeFeedback = feedback.filter(f => f.rating <= 2 || !f.helpful);
    const contentIssues = new Map<string, UserFeedback[]>();

    negativeFeedback.forEach(f => {
      const existing = contentIssues.get(f.contentId) || [];
      existing.push(f);
      contentIssues.set(f.contentId, existing);
    });

    contentIssues.forEach((issues, contentId) => {
      if (issues.length >= 3) {
        const commonThemes = this.extractCommonThemes(issues);
        gaps.push({
          id: `gap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description: `Content "${contentId}" has recurring issues: ${commonThemes.join(', ')}`,
          priority: issues.length >= 10 ? 'critical' : issues.length >= 5 ? 'high' : 'medium',
          source: 'user_feedback',
          relatedQueries: [],
          suggestedContent: [`Improve existing content: ${contentId}`],
          userRoles: [...new Set(issues.map(i => i.userRole))],
          frequency: issues.length
        });
      }
    });

    return gaps;
  }

  private generateEffectivenessMetrics(pageViews: PageViewMetric[]) {
    const contentMap = new Map<string, PageViewMetric[]>();

    pageViews.forEach(pv => {
      const existing = contentMap.get(pv.contentId) || [];
      existing.push(pv);
      contentMap.set(pv.contentId, existing);
    });

    return Array.from(contentMap.entries()).map(([contentId, views]) => ({
      contentId,
      taskCompletionRate: this.calculateCompletionRate(views),
      userSuccessRate: this.calculateSuccessRate(views),
      averageTaskTime: views.reduce((sum, v) => sum + v.timeSpent, 0) / views.length,
      errorRate: 0.05, // Placeholder
      supportTicketsGenerated: 0 // Placeholder
    }));
  }

  private generateImprovementSuggestions(feedback: UserFeedback[]) {
    const suggestions: Array<{
      contentId: string;
      type: 'clarity' | 'completeness' | 'accuracy' | 'performance';
      description: string;
      priority: 'low' | 'medium' | 'high';
      estimatedImpact: number;
      basedOn: 'user_feedback' | 'analytics' | 'automated_analysis';
    }> = [];

    const contentIssues = new Map<string, UserFeedback[]>();

    feedback.forEach(f => {
      const existing = contentIssues.get(f.contentId) || [];
      existing.push(f);
      contentIssues.set(f.contentId, existing);
    });

    contentIssues.forEach((issues, contentId) => {
      const avgRating = issues.reduce((sum, i) => sum + i.rating, 0) / issues.length;

      if (avgRating < 3) {
        suggestions.push({
          contentId,
          type: 'clarity',
          description: 'Content has low ratings and may need clarity improvements',
          priority: 'high',
          estimatedImpact: 8,
          basedOn: 'user_feedback'
        });
      }

      // Check for completeness issues
      const completenessIssues = issues.filter(i =>
        i.comment?.toLowerCase().includes('missing') ||
        i.comment?.toLowerCase().includes('incomplete')
      );

      if (completenessIssues.length > 0) {
        suggestions.push({
          contentId,
          type: 'completeness',
          description: 'Users report missing or incomplete information',
          priority: 'medium',
          estimatedImpact: 6,
          basedOn: 'user_feedback'
        });
      }

      // Check for accuracy issues
      const accuracyIssues = issues.filter(i =>
        i.comment?.toLowerCase().includes('wrong') ||
        i.comment?.toLowerCase().includes('incorrect') ||
        i.comment?.toLowerCase().includes('outdated')
      );

      if (accuracyIssues.length > 0) {
        suggestions.push({
          contentId,
          type: 'accuracy',
          description: 'Users report accuracy or outdated information issues',
          priority: 'high',
          estimatedImpact: 9,
          basedOn: 'user_feedback'
        });
      }
    });

    return suggestions;
  }

  private generatePopularityTrends() {
    // Placeholder implementation
    return [];
  }

  private generateFeedbackSummary(feedback: UserFeedback[]) {
    const contentMap = new Map<string, UserFeedback[]>();

    feedback.forEach(f => {
      const existing = contentMap.get(f.contentId) || [];
      existing.push(f);
      contentMap.set(f.contentId, existing);
    });

    return Array.from(contentMap.entries()).map(([contentId, contentFeedback]) => ({
      contentId,
      totalFeedback: contentFeedback.length,
      averageRating: contentFeedback.reduce((sum, f) => sum + f.rating, 0) / contentFeedback.length,
      commonThemes: this.extractCommonThemes(contentFeedback),
      sentimentTrend: this.calculateSentimentTrend(contentFeedback),
      actionableInsights: this.generateActionableInsights(contentFeedback)
    }));
  }

  private calculateSentimentScore(feedback: UserFeedback[]): number {
    if (feedback.length === 0) return 0;

    const sentimentSum = feedback.reduce((sum, f) => {
      let score = 0;
      if (f.rating > 0) {
        score += (f.rating - 3) / 2; // Convert 1-5 scale to -1 to 1
      }
      if (f.helpful !== undefined) {
        score += f.helpful ? 0.5 : -0.5;
      }
      return sum + score;
    }, 0);

    return Math.max(-1, Math.min(1, sentimentSum / feedback.length));
  }

  private generateContentSuggestions(query: string): string[] {
    // Simple keyword-based suggestions
    const suggestions: string[] = [];

    if (query.toLowerCase().includes('setup')) {
      suggestions.push('Setup and Installation Guide');
    }
    if (query.toLowerCase().includes('api')) {
      suggestions.push('API Documentation');
    }
    if (query.toLowerCase().includes('error')) {
      suggestions.push('Troubleshooting Guide');
    }

    return suggestions.length > 0 ? suggestions : [`Documentation for: ${query}`];
  }

  private extractUserRolesFromrches(rches: rchBehaviorMetric[], query: string): UserRole[] {
    const roles = rches
      .filter(s => s.query === query && s.userRole)
      .map(s => s.userRole!)
      .filter((role, index, arr) => arr.indexOf(role) === index);

    return roles.length > 0 ? roles : ['guest'];
  }

  private extractCommonThemes(feedback: UserFeedback[]): string[] {
    const themes = new Set<string>();

    feedback.forEach(f => {
      if (f.comment) {
        const comment = f.comment.toLowerCase();
        if (comment.includes('confusing')) themes.add('clarity');
        if (comment.includes('missing')) themes.add('completeness');
        if (comment.includes('error')) themes.add('accuracy');
        if (comment.includes('slow')) themes.add('performance');
      }

      f.tags?.forEach(tag => themes.add(tag));
    });

    return Array.from(themes);
  }

  private calculateSentimentTrend(feedback: UserFeedback[]): 'positive' | 'negative' | 'neutral' {
    const avgSentiment = this.calculateSentimentScore(feedback);
    if (avgSentiment > 0.2) return 'positive';
    if (avgSentiment < -0.2) return 'negative';
    return 'neutral';
  }

  private generateActionableInsights(feedback: UserFeedback[]): string[] {
    const insights: string[] = [];
    const themes = this.extractCommonThemes(feedback);

    if (themes.includes('clarity')) {
      insights.push('Consider rewriting sections for better clarity');
    }
    if (themes.includes('completeness')) {
      insights.push('Add missing information or examples');
    }
    if (themes.includes('accuracy')) {
      insights.push('Review and update for accuracy');
    }

    return insights;
  }

  private calculateCompletionRate(views: PageViewMetric[]): number {
    // Simple heuristic based on scroll depth and time spent
    const completed = views.filter(v => v.scrollDepth > 0.8 && v.timeSpent > 30);
    return views.length > 0 ? completed.length / views.length : 0;
  }

  private calculateSuccessRate(_views: PageViewMetric[]): number {
    // Placeholder implementation
    return 0.85;
  }
}
