import React from 'react';
import { DocumentationLayoutClient } from '@/app/documentation/DocumentationLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contribution Guidelines',
  description: 'How to contribute to the Modern Men documentation system.',
};

export default function ContributingPage() {
  return (
    <DocumentationLayoutClient>
      <section className="prose mx-auto py-8">
        <h1>Contribution Guidelines</h1>

        <p>
          Thank you for considering a contribution! This guide explains the workflow,
          coding standards, and review process for adding or improving documentation.
        </p>

        <h2>Getting Started</h2>
        <ol>
          <li>Fork the repository and clone your fork.</li>
          <li>Run <code>npm install</code> to install dependencies.</li>
          <li>Create a new branch for your work: <code>git checkout -b docs/your-feature</code>.</li>
        </ol>

        <h2>Code Style</h2>
        <ul>
          <li>Use TypeScript and React functional components.</li>
          <li>Follow the existing folder structure under <code>src/app/documentation</code>.</li>
          <li>Run <code>npm run lint</code> and <code>npm run format</code> before committing.</li>
        </ul>

        <h2>Documentation Standards</h2>
        <ul>
          <li>All pages should use the <code>DocumentationLayoutClient</code> wrapper.</li>
          <li>Provide a <code>metadata</code> export with <code>title</code> and <code>description</code>.</li>
          <li>Write content using semantic HTML and Tailwind CSS utility classes.</li>
          <li>Include a table of contents if the page exceeds 800 words.</li>
        </ul>

        <h2>Pull Request Process</h2>
        <ol>
          <li>Push your branch to your fork.</li>
          <li>Open a PR against the <code>main</code> branch.</li>
          <li>Ensure all CI checks pass (tests, lint, type‑check).</li>
          <li>Request reviews from at least one maintainer.</li>
          <li>Address review feedback and squash commits before merging.</li>
        </ol>

        <h2>Helpful Links</h2>
        <ul>
          <li><a href="https://github.com/your-org/modernmen/blob/main/CONTRIBUTING.md">Project CONTRIBUTING.md</a></li>
          <li><a href="https://nextjs.org/docs">Next.js Documentation</a></li>
          <li><a href="https://tailwindcss.com/docs">Tailwind CSS Docs</a></li>
        </ul>
      </section>
    </DocumentationLayoutClient>
  );
}
