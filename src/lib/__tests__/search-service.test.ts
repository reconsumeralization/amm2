import { DocumentationrchService } from '@/lib/rch-service';
import { rchConfig } from '@/types/rch';
import { commonTypos } from '@/lib/common-typos';
import { expect } from '@jest/globals';

describe('DocumentationSearchService integration tests', () => {
  // Minimal config to satisfy the constructor – the actual values are not used in the
  // integration poinwe are testing (ranking, synonyms, etc.).
  const dummyConfig: SearchConfig = {
    rankingConfig: {
      titleBoost: 1,
      descriptionBoost: 1,
      contentBoost: 1,
      tagsBoost: 1,
      roleBasedBoost: { guest: 1 },
      recencyBoost: 0,
      popularityBoost: 0,
      ratingBoost: 0,
      completionRateBoost: 0
    }
  } as any;

  const service = new DocumentationSearchService(dummyConfig);

  test('getTypoCorrections returns expected corrections based on commonTypos', () => {
    const query = 'aip configration';
    const corrections = (service as any).getTypoCorrections(query);
    // Expect two corrections – one for each typo present in the query.
    // Verify that the expected correction objects are present.
    // Using a manual check to avoid TypeScript issues with expect.arrayContaining.
    const expectedTexts = [
      query.replace(/aip|pai/g, 'api'),
      query.replace(/configration|configuraton/g, 'configuration')
    ];
    expectedTexts.forEach(expectedText => {
    // Use a simple loop to verify each expected correction exists.
    const found = corrections.some(c => c.text === expectedText && c.type === 'correction' && c.score === 0.8);
    expect(found).toBe(true);
    });
  });

  test('generateSuggestions includes typo corrections when no results are found', async () => {
    // Ensure the index is empty so the search yields no results.
    // The service constructor already creates an empty index.
    const query = 'aip';
    const suggestions = (service as any).generateSuggestions(query, true);
    // The first suggestion should be a typo correction for "aip".
    // Ensure at least one correction fohe typo is present.
    // Verify that at least one suggestion matches the expected typo correction.
    const found = suggestions.some(s => s.text === query.replace(/aip|pai/g, 'api') && s.type === 'correction' && s.score === 0.8);
    expect(found).toBe(true);
  });

  test('search returns suggestions with typo corrections on no‑result queries', async () => {
    // Mock the internal methods that would normally find documents.
    // We force a no‑result scenario by providing a query that does not match any sample data.
    const result = await service.search({ query: 'aip', filters: {}, sorting: { field: 'relevance', direction: 'desc' }, pagination: { page: 1, limit: 10, offset: 0 } }, 'guest');
    // The suggestions array should contain at least one typo correction.
    // The suggestions should include a correction for "aip" → "api".
    // Verify that the suggestions contain the expected correction.
    const found = result.suggestions.some(s => s.text === 'api' && s.type === 'correction' && s.score === 0.8);
    expect(found).toBe(true);
    // Total count should be zero because no documents match.
    expect(result.totalCount).toBe(0);
  });

  test('generateSuggestions includes related terms and query completions', () => {
    const query = 'api';
    const suggestions = (service as any).generateSuggestions(query, false);
    // Should contain related terms for "api"
    // Verify related term suggestions are present.
    const relatedTerms = ['endpoint', 'rest', 'graphql', 'authentication'];
    relatedTerms.forEach(term => {
    // Verify each related term suggestion exists.
    const found = suggestions.some(s => s.text === term && s.type === 'related' && s.score === 0.6);
    expect(found).toBe(true);
    });
    // Should contain at least one query completion
    // Verify at least one query completion suggestion.
    // Verify that a query completion suggestion exists.
    // Accept either 'completion' or 'suggestion' type for query completions
    const found = suggestions.some(s => s.text === 'api authentication' && (s.type === 'completion' || s.type === 'suggestion') && s.score === 0.7);
    // Note: The type may be 'completion' depending on implementation; adjust accordingly.
    expect(found).toBe(true);
  });
});
