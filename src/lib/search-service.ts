import type { UserRole } from '../types/documentation';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  content: string;
  path: string;
  type: 'service' | 'stylist' | 'page' | 'faq' | 'customer' | 'documentation';
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
  query: SearchQuery;
  executionTime: number;
}

export interface SearchConfig {
  provider: string;
  indexName: string;
  maxResults: number;
  enableFacets: boolean;
  enableSuggestions: boolean;
  enableAnalytics: boolean;
  enableHighlighting: boolean;
  enableTypoTolerance: boolean;
  enableSynonyms: boolean;
  rankingConfig: {
    roleBasedBoost: Record<string, number>;
    recencyBoost: number;
    popularityBoost: number;
    accuracyBoost: number;
    completionRateBoost: number;
    ratingBoost: number;
    viewsBoost: number;
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

      const results = data.results.map((item: any) => ({
        id: item.id,
        title: item.name || item.title || `${item.firstName} ${item.lastName}`,
        description: item.description || item.bio || '',
        content: item.content || '',
        path: `/${item.type}/${item.id}`,
        type: item.type,
        category: item.category || '',
        tags: item.tags || [],
        relevanceScore: 0,
        highlights: [],
      }));

      return {
        results,
        totalCount: data.total,
        query: { query: query.query },
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        totalCount: 0,
        query: { query: query.query },
        executionTime: Date.now() - startTime,
      };
    }
  }

  async autocomplete(query: string, userRole: UserRole): Promise<{ suggestions: string[] }> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '10',
        collections: 'documentation,services',
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      const suggestions = data.results.map((item: any) => 
        item.name || item.title || `${item.firstName} ${item.lastName}`
      );

      return { suggestions };
    } catch (error) {
      console.error('Autocomplete error:', error);
      return { suggestions: [] };
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
      console.error('Search error:', error);
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