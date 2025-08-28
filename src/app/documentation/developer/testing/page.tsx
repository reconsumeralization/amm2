import React from 'react';
import { DocumentationLayoutClient } from '@/app/documentation/DocumentationLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Testing Documentation',
  description: 'Guidelines, frameworks, and best practices for testing the Modern Men documentation system.',
};

export default function TestingPage() {
  return (
    <DocumentationLayoutClient>
      <section className="prose mx-auto py-8">
        <h1>Testing Documentation</h1>

        <p>
          This page outlines the testing strategy for the Modern Men documentation platform,
          covering unit, integration, end‑to‑end, and visual regression testing.
        </p>

        <h2>Testing Frameworks</h2>
        <ul>
          <li>
            <strong>Jest</strong> – Core test runner for unit and integration tests.
          </li>
          <li>
            <strong>React Testing Library</strong> – For component rendering and interaction tests.
          </li>
          <li>
            <strong>Playwright</strong> – End‑to‑end testing of the documentation UI.
          </li>
          <li>
            <strong>Storybook</strong> – Visual regression testing via Storybook’s test runner.
          </li>
        </ul>

        <h2>Project Structure</h2>
        <pre>
{`src/
  __tests__/          # Jest unit & integration tests
  e2e/               # Playwright tests
  stories/           # Storybook component stories
  test-guide/        # Guides for running tests`}
        </pre>

        <h2>Running Tests</h2>
        <pre>
{`# Unit & integration tests
npm run test

# Watch mode
npm run test:watch

# Playwright end‑to‑end tests
npm run test:e2e

# Storybook visual tests
npm run test:storybook`}
        </pre>

        <h2>Best Practices</h2>
        <ul>
          <li>Write tests for every new component and utility.</li>
          <li>Keep tests fast; aim for <code>&lt;200ms</code> per test.</li>
          <li>Mock external services (Supabase, Payload) using Jest mocks.</li>
          <li>Use <code>screen</code> queries from React Testing Library for accessibility.</li>
          <li>Run the full test suite in CI on every pull request.</li>
        </ul>

        <h2>Continuous Integration</h2>
        <p>
          The GitHub Actions workflow <code>.github/workflows/docs-validation.yml</code> runs
          <code>npm run test</code> and <code>npm run test:e2e</code> on each push.
        </p>

        <h2>Further Reading</h2>
        <ul>
          <li>
            <a href="https://jestjs.io/">Jest Documentation</a>
          </li>
          <li>
            <a href="https://testing-library.com/docs/react-testing-library/intro">
              React Testing Library Docs
            </a>
          </li>
          <li>
            <a href="https://playwright.dev/">Playwright Documentation</a>
          </li>
          <li>
            <a href="https://storybook.js.org/docs/react/writing-tests/introduction">
              Storybook Testing Docs
            </a>
          </li>
        </ul>
      </section>
    </DocumentationLayoutClient>
  );
}
