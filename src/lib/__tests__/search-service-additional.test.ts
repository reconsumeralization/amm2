/* @ts-nocheck */
import { DocumentationSearchService } from '@/lib/search-service';
import { SearchConfig } from '@/types/search';

describe('DocumentationSearchService additional internal methods', () => {
  // Minimal config – the actual values are irrelevant for these internal method tests.
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

  test('generateTypoCorrections returns expected typo objects', () => {
    const query = 'autentication configration';
    const suggestions = (service as any).generateTypoCorrections(query);
    // Expect two corrections – one for each typo present.
    const expected = [
      {
        text: query.replace(/authentication|authentification|autentication/g, 'authentication'),
        type: 'correction',
        score: 0.8
      },
      {
        text: query.replace(/configration|configuraton/g, 'configuration'),
        type: 'correction',
        score: 0.8
      }
    ];
    expected.forEach(exp => {
      const found = suggestions.some(s => s.text === exp.text && s.type === exp.type && s.score === exp.score);
      expect(found).toBe(true);
    });
  });

  test('generateRelatedTerms returns appropriate related terms for known keywords', () => {
    const query = 'booking';
    const related = (service as any).generateRelatedTerms(query);
    // The mapping for "booking" includes three related terms.
    const expectedTerms = ['appointment', 'schedule', 'calendar'];
    expectedTerms.forEach(term => {
      const found = related.some(r => r.text === term && r.type === 'related' && r.score === 0.6);
      expect(found).toBe(true);
    });
  });

  test('generateQueryCompletions returns sensible completions for a prefix', () => {
    const prefix = 'api ';
    const completions = (service as any).generateQueryCompletions(prefix);
    // One of the common completions should be "api authentication".
    const expected = {
      text: 'api authentication',
      type: 'completion',
      score: 0.7
    };
    const found = completions.some(c => c.text === expected.text && c.type === expected.type && c.score === expected.score);
    expect(found).toBe(true);
  });

  test('getSearchPerformanceMetrics returns a correctly shaped object', () => {
    const metrics = (service as any).getSearchPerformanceMetrics();
    expect(metrics).toHaveProperty('averageResponseTime');
    expect(metrics).toHaveProperty('totalSearches');
    expect(metrics).toHaveProperty('successRate');
    expect(metrics).toHaveProperty('popularQueries');
    expect(metrics).toHaveProperty('slowQueries');
    // All numeric fields should be numbers.
    expect(typeof metrics.averageResponseTime).toBe('number');
    expect(typeof metrics.totalSearches).toBe('number');
    expect(typeof metrics.successRate).toBe('number');
    // popularQueries and slowQueries should be arrays.
    expect(Array.isArray(metrics.popularQueries)).toBe(true);
    expect(Array.isArray(metrics.slowQueries)).toBe(true);
  });

  test('getPopularSearchTerms returns an array of term objects', () => {
    const terms = (service as any).getPopularSearchTerms(5);
    expect(Array.isArray(terms)).toBe(true);
    // Each entry should have term, count, and trend properties.
    if (terms.length > 0) {
      const sample = terms[0];
      expect(sample).toHaveProperty('term');
      expect(sample).toHaveProperty('count');
      expect(sample).toHaveProperty('trend');
    }
  });
});
