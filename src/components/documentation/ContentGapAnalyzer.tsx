'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, rch, MessageSquare, TrendingUp, Users, ChevronRight, Filter, RefreshCw } from '@/lib/icon-mapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ContentGap, 
  UserRole, 
  OptimizationRecommendations 
} from '@/types/analytics';
import { AnalyticsService } from '@/lib/analytics-service';

interface ContentGapAnalyzerProps {
  className?: string;
  onGapSelect?: (gap: ContentGap) => void;
  showFilters?: boolean;
}

export function ContentGapAnalyzer({ 
  className = '', 
  onGapSelect,
  showFilters = true 
}: ContentGapAnalyzerProps) {
  const [gaps, setGaps] = useState<ContentGap[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadContentGaps();
  }, []);

  const loadContentGaps = async () => {
    setLoading(true);
    try {
      const recommendationsData = await analyticsService.getOptimizationRecommendations();
      setRecommendations(recommendationsData);
      setGaps(recommendationsData.contentGaps);
    } catch (error) {
      console.error('Failed to load content gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredGaps = () => {
    return gaps.filter(gap => {
      if (selectedPriority !== 'all' && gap.priority !== selectedPriority) return false;
      if (selectedSource !== 'all' && gap.source !== selectedSource) return false;
      if (selectedRole !== 'all' && !gap.userRoles.includes(selectedRole as UserRole)) return false;
      return true;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'rch_queries': return rch;
      case 'user_feedback': return MessageSquare;
      case 'behavioral_analytics': return TrendingUp;
      default: return AlertTriangle;
    }
  };

  const formatSource = (source: string) => {
    return source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getGapStats = () => {
    const filteredGaps = getFilteredGaps();
    return {
      total: filteredGaps.length,
      critical: filteredGaps.filter(g => g.priority === 'critical').length,
      high: filteredGaps.filter(g => g.priority === 'high').length,
      medium: filteredGaps.filter(g => g.priority === 'medium').length,
      low: filteredGaps.filter(g => g.priority === 'low').length
    };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Content Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getGapStats();
  const filteredGaps = getFilteredGaps();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Content Gap Analysis
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadContentGaps}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Gaps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
            <div className="text-sm text-gray-600">High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.low}</div>
            <div className="text-sm text-gray-600">Low</div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select 
              value={selectedPriority} 
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select 
              value={selectedSource} 
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Sources</option>
              <option value="rch_queries">rch Queries</option>
              <option value="user_feedback">User Feedback</option>
              <option value="behavioral_analytics">Behavioral Analytics</option>
            </select>

            <select 
              value={selectedRole} 
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Roles</option>
              <option value="developer">Developer</option>
              <option value="salon_owner">Salon Owner</option>
              <option value="salon_employee">Salon Employee</option>
              <option value="salon_customer">Salon Customer</option>
              <option value="system_admin">System Admin</option>
            </select>
          </div>
        )}

        {/* Content Gaps List */}
        <div className="space-y-4">
          {filteredGaps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content gaps found matching your filters.</p>
              <p className="text-sm">This is good news - your documentation seems comprehensive!</p>
            </div>
          ) : (
            filteredGaps.map((gap, index) => {
              const SourceIcon = getSourceIcon(gap.source);
              
              return (
                <div 
                  key={gap.id} 
                  className={`p-4 border-l-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${
                    gap.priority === 'critical' ? 'border-red-500 bg-red-50' :
                    gap.priority === 'high' ? 'border-orange-500 bg-orange-50' :
                    gap.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                  onClick={() => onGapSelect?.(gap)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <SourceIcon className="h-4 w-4" />
                        <Badge className={getPriorityColor(gap.priority)}>
                          {gap.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {formatSource(gap.source)}
                        </Badge>
                        <Badge variant="outline">
                          {gap.frequency} occurrences
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium mb-2">{gap.description}</h4>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {gap.relatedQueries.length > 0 && (
                          <div>
                            <span className="font-medium">Related queries: </span>
                            {gap.relatedQueries.join(', ')}
                          </div>
                        )}
                        
                        {gap.userRoles.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">Affected roles: </span>
                            {gap.userRoles.map(role => role.replace('_', ' ')).join(', ')}
                          </div>
                        )}
                        
                        {gap.suggestedContent.length > 0 && (
                          <div>
                            <span className="font-medium">Suggested content:</span>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              {gap.suggestedContent.map((suggestion, i) => (
                                <li key={i}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {onGapSelect && (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Actions */}
        {filteredGaps.length > 0 && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const criticalGaps = filteredGaps.filter(g => g.priority === 'critical');
                if (criticalGaps.length > 0 && onGapSelect) {
                  onGapSelect(criticalGaps[0]);
                }
              }}
              disabled={stats.critical === 0}
            >
              Address Critical Issues ({stats.critical})
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const rchGaps = filteredGaps.filter(g => g.source === 'rch_queries');
                console.log('Export rch gaps for content planning:', rchGaps);
              }}
            >
              Export for Content Planning
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}