// Core documentation types for the Modern Men Hair Salon documentation system

export type UserRole =
  | "developer"
  | "salon_owner"
  | "salon_employee"
  | "salon_customer"
  | "system_admin"
  | "guest";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

export interface DocumentationPermissions {
  [key: string]: {
    read: UserRole[];
    edit: UserRole[];
    admin: UserRole[];
  };
}

export interface Prerequisite {
  id: string;
  title: string;
  description: string;
  required: boolean;
  link?: string;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  content: string;
  codeSnippets?: CodeSnippet[];
  interactiveExamples?: InteractiveExample[];
  estimatedTime?: number;
  prerequisites?: string[];
}

export interface TroubleshootingItem {
  id: string;
  problem: string;
  solution: string;
  tags: string[];
}

export interface RelatedContent {
  id: string;
  title: string;
  type: "guide" | "api" | "component" | "reference";
  url: string;
  relevanceScore: number;
}

export interface InteractiveExample {
  id: string;
  title: string;
  description: string;
  type: "api-test" | "component-playground" | "code-editor";
  configuration: Record<string, any>;
}

export interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  description: string;
  runnable: boolean;
  dependencies?: string[];
  filename?: string;
}

export interface ChangeHistoryItem {
  version: SemanticVersion;
  date: Date;
  author: string;
  changes: string[];
  type: "major" | "minor" | "patch";
}

export interface GuideContent {
  metadata: {
    id: string;
    title: string;
    description: string;
    author: string;
    lastUpdated: Date;
    version: SemanticVersion;
    targetAudience: UserRole[];
    difficulty: DifficultyLevel;
    estimatedTime: number;
    tags: string[];
    locale: string;
    deprecated: boolean;
    replacedBy?: string;
  };
  content: {
    introduction: string;
    prerequisites: Prerequisite[];
    steps: GuideStep[];
    troubleshooting: TroubleshootingItem[];
    relatedContent: RelatedContent[];
    interactiveExamples?: InteractiveExample[];
    codeSnippets: CodeSnippet[];
  };
  validation: {
    reviewed: boolean;
    reviewedBy: string;
    reviewDate: Date;
    accuracy: number;
    accessibilityCompliant: boolean;
    lastValidated: Date;
  };
  analytics: {
    viewCount: number;
    completionRate: number;
    averageRating: number;
    feedbackCount: number;
    rchRanking: number;
  };
  versioning: {
    changeHistory: ChangeHistoryItem[];
    previousVersions: string[];
    migrationNotes?: string;
  };
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: any;
  enum?: string[];
}

export interface ContentType {
  mediaType: string;
  schema?: any;
  examples?: Example[];
}

export interface Example {
  name: string;
  summary?: string;
  description?: string;
  value: any;
}

export interface SecurityRequirement {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  scheme?: string;
  bearerFormat?: string;
  flows?: any;
  openIdConnectUrl?: string;
}

export interface APIDocumentationModel {
  endpoint: {
    path: string;
    method: HTTPMethod;
    summary: string;
    description: string;
    operationId: string;
    tags: string[];
  };
  parameters: {
    path: Parameter[];
    query: Parameter[];
    header: Parameter[];
    cookie: Parameter[];
  };
  requestBody: {
    required: boolean;
    content: ContentType[];
    examples: Example[];
  };
  responses: {
    [statusCode: string]: {
      description: string;
      content: ContentType[];
      examples: Example[];
    };
  };
  security: SecurityRequirement[];
}

export interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  userRoles: UserRole[];
  subsections: DocumentationSubsection[];
  lastUpdated: Date;
  version: string;
}

export interface DocumentationSubsection {
  id: string;
  title: string;
  description: string;
  path: string;
  userRoles: UserRole[];
  guides: UserGuide[];
}

export interface UserGuide {
  id: string;
  title: string;
  description: string;
  targetRole: UserRole;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  prerequisites: string[];
  steps: GuideStep[];
  relatedGuides: string[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface NavigationItem {
  title: string;
  href: string;
  sections?: NavigationSection[];
}

export interface NavigationSection {
  title: string;
  href: string;
}

export interface SidebarConfig {
  sections: SidebarSection[];
  userRole: UserRole;
  collapsed?: boolean;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  userRoles: UserRole[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface SidebarItem {
  id: string;
  title: string;
  href: string;
  icon?: string;
  userRoles: UserRole[];
  badge?: string;
  children?: SidebarItem[];
}

export interface rchFilter {
  key: string;
  label: string;
  options: rchFilterOption[];
}

export interface rchFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface rchRankingConfig {
  roleBasedBoost: Record<UserRole, number>;
  recencyBoost: number;
  popularityBoost: number;
  accuracyBoost: number;
}

export interface rchAnalytics {
  trackQuery: (query: string, results: number) => void;
  trackClick: (query: string, resultId: string) => void;
  trackNoResults: (query: string) => void;
}

export interface UserFeedback {
  rating: number;
  comment?: string;
  helpful: boolean;
  suggestions?: string;
  userRole: UserRole;
}

export interface DocumentationMetrics {
  totalViews: number;
  uniqueUsers: number;
  rchQueries: rchMetric[];
  popularContent: ContentMetric[];
  userSatisfaction: SatisfactionMetric[];
  contentGaps: ContentGap[];
}

export interface rchMetric {
  query: string;
  count: number;
  resultsFound: number;
  clickThroughRate: number;
}

export interface ContentMetric {
  contentId: string;
  title: string;
  views: number;
  completionRate: number;
  averageRating: number;
}

export interface SatisfactionMetric {
  contentId: string;
  rating: number;
  feedbackCount: number;
  helpfulVotes: number;
}

export interface ContentGap {
  query: string;
  frequency: number;
  suggestedContent: string;
  priority: "high" | "medium" | "low";
}

export interface DocumentationVersion {
  version: SemanticVersion;
  releaseDate: Date;
  changes: ChangeItem[];
  author: string;
  migrationGuide?: string;
}

export interface ChangeItem {
  type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
  description: string;
  breaking: boolean;
}
export interface ValidationError {
  message: string;
  severity: 'error' | 'warning' | 'info';
  type: 'content' | 'markdown' | 'link' | 'code' | 'accessibility';
  line?: number;
  column?: number;
  field?: string;
  code?: string;
  context?: string;
}

export interface ValidationWarning {
  message: string;
  severity: 'warning' | 'info';
  type: 'content' | 'markdown' | 'link' | 'code' | 'accessibility';
  line?: number;
  column?: number;
  context?: string;
}

export interface ValidationSuggestion {
  message: string;
  type: 'improvement' | 'optimization' | 'best-practice';
  priority: 'high' | 'medium' | 'low';
  context?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions?: ValidationSuggestion[];
  score?: number;
  lastValidated?: Date;
}
