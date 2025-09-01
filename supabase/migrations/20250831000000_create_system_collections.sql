CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "suspension_reason" TEXT,
    "subscription_plan" VARCHAR(50) DEFAULT 'basic',
    "last_activity" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "action" VARCHAR(255) NOT NULL,
    "collection_name" VARCHAR(255),
    "doc_id" VARCHAR(255),
    "user_id" VARCHAR(255),
    "tenant_id" UUID REFERENCES tenants(id),
    "ip_address" VARCHAR(255),
    "user_agent" TEXT,
    "payload" JSONB,
    "old_data" JSONB,
    "new_data" JSONB,
    "changes" JSONB,
    "severity" VARCHAR(50) DEFAULT 'low',
    "error" TEXT,
    "duration" INTEGER,
    "request_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "public"."business_documentation" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) UNIQUE,
    "summary" TEXT,
    "content" JSONB,
    "category" VARCHAR(255),
    "subcategory" VARCHAR(255),
    "priority" VARCHAR(50),
    "status" VARCHAR(50),
    "tags" JSONB,
    "keywords" TEXT,
    "tenant_id" UUID REFERENCES tenants(id),
    "author_id" UUID REFERENCES users(id),
    "reviewers" JSONB,
    "approved_by_id" UUID REFERENCES users(id),
    "approved_at" TIMESTAMPTZ,
    "is_public" BOOLEAN DEFAULT false,
    "requires_acknowledgment" BOOLEAN DEFAULT false,
    "version" VARCHAR(50),
    "version_history" JSONB,
    "change_notes" TEXT,
    "effective_date" TIMESTAMPTZ,
    "expiration_date" TIMESTAMPTZ,
    "review_date" TIMESTAMPTZ,
    "attachments" JSONB,
    "related_documents" JSONB,
    "acknowledgments" JSONB,
    "view_count" INTEGER DEFAULT 0,
    "download_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ... (tables for all other collections in the system directory) ...