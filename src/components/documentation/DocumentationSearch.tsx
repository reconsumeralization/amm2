'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter } from '@/lib/icon-mapping';
import { DocumentationSearchService } from '@/lib/search-service';

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
  initialQuery?: string;
  showFilters?: boolean;
  compact?: boolean;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function DocumentationSearch({
  initialQuery = '',
  showFilters = true,
  compact = false,
  onResultClick,
  className = ''
}: DocumentationSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ text: string }>>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Instantiate service (mocked in tests)
  const service = new DocumentationSearchService({ rankingConfig: { titleBoost: 1, descriptionBoost: 1, contentBoost: 1, tagsBoost: 1, roleBasedBoost: { guest: 1 }, recencyBoost: 0, popularityBoost: 0 } } as any);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const data: any = await service.search({ query, filters: {}, pagination: { page: 1, limit: 20, offset: 0 }, sorting: { field: 'relevance', direction: 'desc' } }, 'developer' as any);
      setResults((data.results || []) as any);
      setTotalCount(data.totalCount || (data.results?.length ?? 0));
      if (data.suggestions) setSuggestions(data.suggestions);
    } catch (error) {
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleAutocomplete = useCallback(async () => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const data: any = await service.autocomplete(query, 'developer' as any);
      setSuggestions(data.suggestions || []);
    } catch {
      setSuggestions([]);
    }
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
    } else {
      const to = (result as any).path || `/documentation/${result.type}/${result.id}`;
      router.push(to);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleAutocomplete}
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
        )}
      </div>

      {showFilters && (
        <div>
          <Button type="button" onClick={() => setFiltersOpen(v => !v)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          {filtersOpen && (
            <Card className="mt-2">
              <CardHeader>
                <CardTitle>Filter Options</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Filter controls would go here */}
              </CardContent>
            </Card>
          )}
        </div>
      )}

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