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
  lastModified?: string;
  isNew?: boolean;
  popularity?: number;
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

export interface SearchQuery {
  query: string;
  sortBy?: string;
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
  private documents: any[] = []; // In-memory document store for testing

  constructor(config: SearchConfig) {
    this.config = config;
  }

  // Helper method for typo corrections
  private getTypoCorrections(query: string): any[] {
    const corrections: any[] = [];
    const commonTypos = {
      'aip': 'api',
      'pai': 'api',
      'configration': 'configuration',
      'configuraton': 'configuration',
      'recieve': 'receive',
      'recieving': 'receiving',
      'seperate': 'separate',
      'seperated': 'separated',
      'occurence': 'occurrence',
      'occurences': 'occurrences'
    };

    for (const [typo, correction] of Object.entries(commonTypos)) {
      if (query.includes(typo)) {
        const correctedText = query.replace(new RegExp(typo, 'g'), correction);
        corrections.push({
          text: correctedText,
          type: 'correction',
          score: 0.8
        });
      }
    }

    return corrections;
  }

  // Generate suggestions for queries
  private generateSuggestions(query: string, isNoResults: boolean = false): any[] {
    const suggestions: any[] = [];

    // Add typo corrections if no results found
    if (isNoResults) {
      suggestions.push(...this.getTypoCorrections(query));
    }

    // Add related terms
    const relatedTerms = {
      'api': ['endpoint', 'rest', 'graphql', 'authentication'],
      'search': ['filter', 'query', 'index', 'results'],
      'documentation': ['guide', 'tutorial', 'reference', 'examples']
    };

    const lowerQuery = query.toLowerCase();
    for (const [term, related] of Object.entries(relatedTerms)) {
      if (lowerQuery.includes(term)) {
        related.forEach(relatedTerm => {
          suggestions.push({
            text: relatedTerm,
            type: 'related',
            score: 0.6
          });
        });
      }
    }

    // Add query completions
    if (query.length > 2) {
      const completions = [
        `${query} authentication`,
        `${query} tutorial`,
        `${query} examples`
      ];

      completions.forEach(completion => {
        suggestions.push({
          text: completion,
          type: 'completion',
          score: 0.7
        });
      });
    }

    return suggestions;
  }

  async search(query: SearchQueryParams, userRole: UserRole): Promise<SearchResponse & { suggestions?: any[] }> {
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

      // Generate suggestions if no results or if suggestions are enabled
      const hasResults = results.length > 0;
      const suggestions = this.generateSuggestions(query.query, !hasResults);

      return {
        results,
        totalCount: data.total,
        query: { query: query.query },
        executionTime: Date.now() - startTime,
        suggestions: this.config.enableSuggestions ? suggestions : undefined,
      };
    } catch (error) {
      console.error('Search error:', error);

      // Generate suggestions even on error if enabled
      const suggestions = this.config.enableSuggestions ? this.generateSuggestions(query.query, true) : undefined;

      return {
        results: [],
        totalCount: 0,
        query: { query: query.query },
        executionTime: Date.now() - startTime,
        suggestions,
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
