// src/lib/rch-service.ts
// Service for documentation search functionality using Payload CMS

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'component' | 'guide' | 'api' | 'reference';
  score: number;
  url: string;
  priority?: number;
  excerpt?: string;
  tags?: string[];
  collection: string;
}

export interface RCHSearchOptions {
  query: string;
  limit?: number;
  type?: string[];
  tags?: string[];
  collections?: string[];
  sortBy?: 'relevance' | 'priority' | 'date';
}

export interface RelatedContentOptions {
  contentId: string;
  collection: string;
  limit?: number;
  excludeTypes?: string[];
}

export interface PopularContentOptions {
  limit?: number;
  timeframe?: 'week' | 'month' | 'all';
  collections?: string[];
}

export class RCHService {
  /**
   * Search across indexed collections using Payload CMS search plugin
   */
  static async search(options: RCHSearchOptions): Promise<SearchResult[]> {
    try {
      const searchParams = {
        query: options.query,
        limit: options.limit || 10,
        collections: options.collections || ['components', 'guides', 'apis', 'references'],
        type: options.type,
        tags: options.tags,
        sortBy: options.sortBy || 'relevance',
      };

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search request failed');
      }

      const results = await response.json();
      return this.transformSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Get related content based on content ID and collection
   */
  static async getRelatedContent(options: RelatedContentOptions): Promise<SearchResult[]> {
    try {
      const queryParams = new URLSearchParams({
        collection: options.collection,
        limit: (options.limit || 5).toString(),
        ...(options.excludeTypes && { excludeTypes: options.excludeTypes.join(',') }),
      });

      const response = await fetch(`/api/content/${options.contentId}/related?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch related content');
      }

      const results = await response.json();
      return this.transformSearchResults(results);
    } catch (error) {
      console.error('Related content error:', error);
      return [];
    }
  }

  /**
   * Get popular content based on views and interactions
   */
  static async getPopularContent(options: PopularContentOptions = {}): Promise<SearchResult[]> {
    try {
      const queryParams = new URLSearchParams({
        limit: (options.limit || 10).toString(),
        timeframe: options.timeframe || 'month',
        ...(options.collections && { collections: options.collections.join(',') }),
      });

      const response = await fetch(`/api/content/popular?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch popular content');
      }

      const results = await response.json();
      return this.transformSearchResults(results);
    } catch (error) {
      console.error('Popular content error:', error);
      return [];
    }
  }

  /**
   * Get content suggestions based on user behavior and preferences
   */
  static async getSuggestions(userId?: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/content/suggestions?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch suggestions');
      }

      const results = await response.json();
      return this.transformSearchResults(results);
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Search within a specific collection
   */
  static async searchCollection(
    collection: string, 
    query: string, 
    options: Partial<RCHSearchOptions> = {}
  ): Promise<SearchResult[]> {
    return this.search({
      ...options,
      query,
      collections: [collection],
    });
  }

  /**
   * Get autocomplete suggestions for search queries
   */
  static async getAutocompleteSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await fetch('/api/search/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!response.ok) {
        throw new Error('Autocomplete request failed');
      }

      const suggestions = await response.json();
      return suggestions;
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Transform Payload CMS search results to our SearchResult interface
   */
  private static transformSearchResults(payloadResults: any[]): SearchResult[] {
    if (!Array.isArray(payloadResults)) {
      return [];
    }

    return payloadResults.map((result) => ({
      id: result.id,
      title: result.title || result.name || 'Untitled',
      content: result.content || result.description || result.excerpt || '',
      type: this.mapCollectionToType(result.collection || result._collection),
      score: result.score || result.priority || 0,
      url: this.generateContentUrl(result),
      priority: result.priority,
      excerpt: result.excerpt,
      tags: result.tags || [],
      collection: result.collection || result._collection,
    }));
  }

  /**
   * Map Payload collection names to our content types
   */
  private static mapCollectionToType(collection: string): 'component' | 'guide' | 'api' | 'reference' {
    const typeMap: Record<string, 'component' | 'guide' | 'api' | 'reference'> = {
      components: 'component',
      guides: 'guide',
      apis: 'api',
      references: 'reference',
      'api-docs': 'api',
      documentation: 'guide',
    };

    return typeMap[collection] || 'reference';
  }

  /**
   * Generate URL for content based on type and slug
   */
  private static generateContentUrl(result: any): string {
    const baseUrl = '/docs';
    const type = this.mapCollectionToType(result.collection || result._collection);
    const slug = result.slug || result.id;

    const urlMap: Record<string, string> = {
      component: `${baseUrl}/components/${slug}`,
      guide: `${baseUrl}/guides/${slug}`,
      api: `${baseUrl}/api/${slug}`,
      reference: `${baseUrl}/reference/${slug}`,
    };

    return urlMap[type] || `${baseUrl}/${slug}`;
  }
}

export const rchService = new RCHService();
