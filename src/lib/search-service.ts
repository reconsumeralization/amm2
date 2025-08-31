import type { UserRole } from '../types/documentation';
import { commonTypos } from './common-typos';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  path: string;
  type: 'service' | 'stylist' | 'page' | 'faq' | 'customer' | 'documentation' | 'guide' | string;
  category: string;
  tags: string[];
  relevanceScore: number;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

export interface SearchQuery {
  query: string;
  filters?: {
    categories?: string[];
    types?: string[];
    tags?: string[];
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: any;
  executionTime: number;
  facets?: any;
  suggestions?: Array<{ text: string; type: 'correction' | 'related' | 'completion' | 'suggestion'; score: number }>;
  analytics?: any;
  pagination?: { page: number; limit: number; offset: number };
}

export interface SearchConfig {
  provider?: string;
  indexName?: string;
  maxResults?: number;
  enableFacets?: boolean;
  enableSuggestions?: boolean;
  enableAnalytics?: boolean;
  enableHighlighting?: boolean;
  enableTypoTolerance?: boolean;
  enableSynonyms?: boolean;
  rankingConfig: {
    roleBasedBoost: Record<string, number>;
    recencyBoost: number;
    popularityBoost: number;
    accuracyBoost?: number;
    completionRateBoost?: number;
    ratingBoost?: number;
    viewsBoost?: number;
    titleBoost: number;
    descriptionBoost: number;
    contentBoost: number;
    tagsBoost: number;
  };
}

export interface SearchQueryParams {
  query: string;
  filters?: {
    categories?: string[];
    contentTypes?: string[];
    tags?: string[];
    difficulty?: string[];
    authors?: string[];
    sections?: string[];
    roles?: string[];
  };
  pagination?: {
    page: number;
    limit: number;
    offset: number;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export class DocumentationSearchService {
  private config: SearchConfig;

  constructor(config: SearchConfig) {
    this.config = config;
  }

  private generateTypoCorrections(query: string) {
    const corrections: Array<{ text: string; type: 'correction'; score: number }> = [];
    Object.entries(commonTypos).forEach(([correct, typos]) => {
      const typoRegex = new RegExp(typos.join('|'), 'gi');
      if (typos.some(t => query.toLowerCase().includes(t))) {
        corrections.push({ text: query.replace(typoRegex, correct), type: 'correction', score: 0.8 });
      }
    });
    return corrections;
  }

  private generateRelatedTerms(query: string) {
    const map: Record<string, string[]> = {
      booking: ['appointment', 'schedule', 'calendar'],
      api: ['endpoint', 'rest', 'graphql', 'authentication'],
      authentication: ['login', 'token', 'oauth'],
    };
    const key = query.trim().toLowerCase();
    const related = map[key] || [];
    return related.map(text => ({ text, type: 'related' as const, score: 0.6 }));
  }

  private generateQueryCompletions(prefix: string) {
    const normals = ['api authentication', 'api documentation', 'api rate limits'];
    const p = prefix.trim().toLowerCase();
    return normals
      .filter(c => c.startsWith(p))
      .map(text => ({ text, type: 'completion' as const, score: 0.7 }));
  }

  private getSearchPerformanceMetrics() {
    return {
      averageResponseTime: 0,
      totalSearches: 0,
      successRate: 1,
      popularQueries: [],
      slowQueries: [],
    };
  }

  private getPopularSearchTerms(limit = 5) {
    return Array.from({ length: Math.max(0, limit) }).map((_, i) => ({
      term: `term-${i + 1}`,
      count: 100 - i * 5,
      trend: i % 2 === 0 ? 'up' : 'down',
    }));
  }

  private getTypoCorrections(query: string) {
    return this.generateTypoCorrections(query);
  }

  private generateSuggestions(query: string, isNoResults: boolean) {
    const suggestions: Array<{ text: string; type: 'correction' | 'related' | 'completion'; score: number }> = [];
    if (isNoResults) {
      suggestions.push(...this.getTypoCorrections(query));
    }
    suggestions.push(...this.generateRelatedTerms(query));
    suggestions.push(...this.generateQueryCompletions(query + ' '));
    return suggestions;
  }

  async search(query: SearchQueryParams, userRole: UserRole): Promise<SearchResponse> {
    const startTime = Date.now();
    try {
      const params = new URLSearchParams({
        q: query.query,
        limit: (query.pagination?.limit || 20).toString(),
        collections: query.filters?.contentTypes?.join(',') || 'services,stylists,customers,documentation',
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      const results = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.name || item.title || `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim(),
        description: item.description || item.bio || '',
        content: item.content || '',
        path: item.path || `/${item.type}/${item.id}`,
        type: item.type,
        category: item.category || '',
        tags: item.tags || [],
        relevanceScore: 0,
        highlights: [],
      }));

      const isNoResults = results.length === 0;

      return {
        results,
        totalCount: data.total ?? results.length,
        query,
        executionTime: Date.now() - startTime,
        suggestions: this.generateSuggestions(query.query, isNoResults),
        facets: { roles: [], categories: [], tags: [], contentTypes: [], difficulty: [], authors: [], sections: [] },
        analytics: { queryId: 'test', timestamp: new Date(), userRole, resultsCount: results.length, hasResults: !isNoResults, clickedResults: [], searchTime: Date.now() - startTime },
        pagination: { page: query.pagination?.page ?? 1, limit: query.pagination?.limit ?? 20, offset: query.pagination?.offset ?? 0 },
      };
    } catch (error) {
      return {
        results: [],
        totalCount: 0,
        query,
        executionTime: Date.now() - startTime,
        suggestions: this.generateSuggestions(query.query, true),
        facets: { roles: [], categories: [], tags: [], contentTypes: [], difficulty: [], authors: [], sections: [] },
        analytics: { queryId: 'error', timestamp: new Date(), userRole, resultsCount: 0, hasResults: false, clickedResults: [], searchTime: Date.now() - startTime },
        pagination: { page: query.pagination?.page ?? 1, limit: query.pagination?.limit ?? 20, offset: query.pagination?.offset ?? 0 },
      };
    }
  }

  async autocomplete(query: string, userRole: UserRole): Promise<{ suggestions: Array<{ text: string; type: 'completion' | 'suggestion'; score: number }>; recentQueries?: string[]; popularQueries?: string[]; categories?: string[]; }> {
    try {
      const suggestions = this.generateQueryCompletions(query + ' ');
      return { suggestions: suggestions.map(s => ({ text: s.text, type: 'completion', score: s.score })), recentQueries: [], popularQueries: [], categories: [] };
    } catch (error) {
      return { suggestions: [], recentQueries: [], popularQueries: [], categories: [] };
    }
  }
}

export class SearchService {
  async search(query: SearchQuery, userRole: UserRole): Promise<SearchResponse> {
    const startTime = Date.now();
    try {
      const { query: q, filters, pagination } = query;
      const params = new URLSearchParams({
        q,
        limit: (pagination?.limit || 20).toString(),
        collections: filters?.types?.join(',') || 'services,stylists,customers,documentation',
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      const results = data.results.map((item: any) => ({
        id: item.id,
        title: item.name || item.title || `${item.firstName} ${item.lastName}`,
        description: item.description || item.bio || '',
        content: item.content || '',
        path: `/${item.type}/${item.id}`,
        type: item.type,
        category: item.category || '',
        tags: item.tags || [],
        relevanceScore: 0, // will be calculated on the client
        highlights: [], // will be calculated on the client
      }));

      return {
        results,
        totalCount: data.total,
        query,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        results: [],
        totalCount: 0,
        query,
        executionTime: Date.now() - startTime,
      };
    }
  }
}

export const searchService = new SearchService();