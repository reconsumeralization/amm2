CREATE TABLE IF NOT EXISTS "public"."builder_animations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(255),
    "duration" VARCHAR(255),
    "delay" VARCHAR(255),
    "timing_function" VARCHAR(255),
    "custom_timing_function" VARCHAR(255),
    "direction" VARCHAR(255),
    "iteration_count" VARCHAR(255),
    "custom_iteration_count" INTEGER,
    "fill_mode" VARCHAR(255),
    "keyframes" JSONB,
    "trigger" JSONB,
    "responsive" JSONB,
    "preview" JSONB,
    "is_active" BOOLEAN,
    "is_default" BOOLEAN,
    "usage_count" INTEGER,
    "categories" JSONB,
    "tags" JSONB,
    "created_by_id" UUID REFERENCES users(id),
    "tenant_id" UUID REFERENCES tenants(id),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ... (tables for all other collections in the builder directory) ...