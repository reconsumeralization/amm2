export interface DocumentationCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  articles: DocumentationArticle[];
}

export interface DocumentationArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
} 