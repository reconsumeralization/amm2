import React from 'react';
import { DocumentationLayoutClient } from '@/app/documentation/DocumentationLayoutClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Architecture',
  description: 'Overview of the Modern Men documentation system architecture and data flow.',
};

export default function ArchitecturePage() {
  return (
    <DocumentationLayoutClient>
      <section className="prose mx-auto py-8">
        <h1>System Architecture</h1>

        <p>
          The Modern Men documentation platform is built with a modular, extensible architecture
          that separates content management, rch, analytics, and presentation layers.
        </p>

        <h2>High‑Level Diagram</h2>
        <figure>
          <img src="/assets/architecture-diagram.png" alt="Architecture diagram" />
          <figcaption>Core components and their interactions.</figcaption>
        </figure>

        <h2>Key Components</h2>
        <ul>
          <li>
            <strong>Next.js Frontend</strong> – Serves documentation pages, handles routing,
            and provides client‑side interactivity.
          </li>
          <li>
            <strong>Payload CMS</strong> – Stores documentation content, version history, and
            approval workflow. Integrated via the Payload API.
          </li>
          <li>
            <strong>rch Service</strong> – Full‑text rch powered by Algolia (fallback to
            Elasticrch). Exposes <code>/api/documentation/rch</code>.
          </li>
          <li>
            <strong>Analytics Service</strong> – Collects page views, rch queries, and feedback.
            Data is stored in Supabase and visualized in the admin dashboard.
          </li>
          <li>
            <strong>Middleware Layer</strong> – Content validation, indexing, and analytics
            collection run on every request.
          </li>
          <li>
            <strong>CI/CD Pipeline</strong> – GitHub Actions validate docs, run tests, and deploy
            to Vercel on merge.
          </li>
        </ul>

        <h2>Data Flow</h2>
        <ol>
          <li>
            Author creates or updates documentation in Payload CMS (admin UI or API).
          </li>
          <li>
            <code>Content Validation Middleware</code> checks markdown, links, and accessibility.
          </li>
          <li>
            Upon successful validation, <code>rch Indexing Middleware</code> updates the Algolia
            index.
          </li>
          <li>
            Users request a page; Next.js renders the content and injects <code>Analytics
            Collection Middleware</code> to log the view.
          </li>
          <li>
            rch queries are sent to <code>/api/documentation/rch</code>, which forwards them
            to Algolia and returns ranked results.
          </li>
        </ol>

        <h2>Extensibility</h2>
        <p>
          New features (e.g., internationalization, content migration, interactive playgrounds) can
          be added by extending the respective service modules without affecting the core
          rendering pipeline.
        </p>

        <h2>References</h2>
        <ul>
          <li>
            <a href="https://nextjs.org/docs">Next.js Documentation</a>
          </li>
          <li>
            <a href="https://payloadcms.com/docs">Payload CMS Docs</a>
          </li>
          <li>
            <a href="https://www.algolia.com/doc/">Algolia API Reference</a>
          </li>
          <li>
            <a href="https://supabase.com/docs">Supabase Documentation</a>
          </li>
        </ul>
      </section>
    </DocumentationLayoutClient>
  );
}
