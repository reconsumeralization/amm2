'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import * as SearchModule from '@/lib/search-service';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  tags: string[];
  path?: string;
}

interface DocumentationSearchProps {
  compact?: boolean;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function DocumentationSearch({
  compact = false,
  onResultClick,
  className = ''
}: DocumentationSearchProps) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string }>>([]);

  const query = searchParams.get('q') || '';
  const filters = {
    category: searchParams.get('category')?.split(',') || [],
    type: searchParams.get('type')?.split(',') || [],
    difficulty: searchParams.get('difficulty')?.split(',') || [],
    tags: searchParams.get('tags')?.split(',') || [],
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  const serviceRef = React.useRef<any>(null);
  if (!serviceRef.current) {
    const { DocumentationSearchService } = SearchModule as any;
    serviceRef.current = new DocumentationSearchService({ rankingConfig: { titleBoost: 1, descriptionBoost: 1, contentBoost: 1, tagsBoost: 1, roleBasedBoost: { guest: 1 }, recencyBoost: 0, popularityBoost: 0 } });
  }

  const handleSearch = useCallback(async (searchQuery: string, searchFilters: any) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalCount(0);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const data: any = await serviceRef.current.search({ query: searchQuery, filters: searchFilters, pagination: { page: 1, limit: 20, offset: 0 }, sorting: { field: 'relevance', direction: 'desc' } }, 'developer' as any);
      const nextResults = (data.results || []) as any[];
      const nextSuggestions = (data.suggestions || []) as Array<{ text: string }>;

      const hasDidYouMean = nextSuggestions.some(s => typeof s.text === 'string' && s.text.toLowerCase().includes('did you mean'));

      setSuggestions(nextSuggestions);
      if (hasDidYouMean) {
        setResults([]);
        setTotalCount(0);
      } else {
        const hasAnySuggestions = nextSuggestions && nextSuggestions.length > 0;
        const hasResults = Array.isArray(nextResults) && nextResults.length > 0;
        if (hasAnySuggestions && !hasResults) {
          setResults([]);
          setTotalCount(0);
        } else {
          setResults(nextResults as any);
          setTotalCount(data.totalCount || (nextResults?.length ?? 0));
        }
      }
    } catch (error) {
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      const to = (result as any).path || `/documentation/${result.type}/${result.id}`;
      router.push(to);
    }
  };

  useEffect(() => {
    handleSearch(query, filters);
  }, [query, filters, handleSearch]);

  return (
    <div className={`space-y-4 ${className}`}>
      <SearchInput 
        initialQuery={query}
        isLoading={loading}
      />

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Found {totalCount} result{totalCount === 1 ? '' : 's'} for "{query}"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{result.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.category && (
                          <Badge variant="outline" className="text-xs">
                            {result.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <div key={i}>{s.text}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!loading && query.trim() && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No results found</p>
            <p className="text-gray-500">for "{query}"</p>
            <p className="text-sm text-gray-400 mt-2">
              Try different keywords or check your spelling
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
