-- Create custom types for core components
DO $$ BEGIN CREATE TYPE component_type AS ENUM ('IDEExt', 'AICore', 'RulesEngine', 'AVB', 'CMPServer', 'MCPSrvs', 'Telemetry', 'Security', 'CtxProvider', 'MCPPool'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE security_level AS ENUM ('RO', 'FSRead', 'FSWrite', 'ProcExec', 'Config'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE trigger_type AS ENUM ('static', 'dynamic', 'context'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE context_key AS ENUM ('editor', 'ws', 'diag', 'rules', 'codeIntel', 'telemetry'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create core_components table
CREATE TABLE IF NOT EXISTS "public"."core_components" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "type" component_type NOT NULL,
    "version" VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    "description" TEXT,
    "configuration" JSONB,
    "dependencies" text[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.core_components IS 'Core components of the Chimera system.';

-- Create component_connections table
CREATE TABLE IF NOT EXISTS "public"."component_connections" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "source_component_id" UUID NOT NULL REFERENCES core_components(id),
    "target_component_id" UUID NOT NULL REFERENCES core_components(id),
    "connection_type" VARCHAR(50) NOT NULL,
    "protocol" VARCHAR(50),
    "configuration" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.component_connections IS 'Connections between core components.';

-- Create security_policies table
CREATE TABLE IF NOT EXISTS "public"."security_policies" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "component_id" UUID NOT NULL REFERENCES core_components(id),
    "level" security_level NOT NULL,
    "permissions" JSONB NOT NULL,
    "description" TEXT,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.security_policies IS 'Security policies for core components.';

-- Create context_providers table
CREATE TABLE IF NOT EXISTS "public"."context_providers" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "component_id" UUID NOT NULL REFERENCES core_components(id),
    "context_keys" context_key[] NOT NULL,
    "processing_rules" JSONB,
    "configuration" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.context_providers IS 'Context providers for AI interactions.';

-- Create mcp_services table
CREATE TABLE IF NOT EXISTS "public"."mcp_services" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "namespace" VARCHAR(50) NOT NULL,
    "methods" JSONB NOT NULL,
    "protocol" VARCHAR(50) NOT NULL DEFAULT 'JSON-RPC/WS',
    "configuration" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.mcp_services IS 'MCP services and their methods.';

-- Create context_monitors table
CREATE TABLE IF NOT EXISTS "public"."context_monitors" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "component_id" UUID NOT NULL REFERENCES core_components(id),
    "events" text[] NOT NULL,
    "actions" text[] NOT NULL,
    "debounce_ms" integer DEFAULT 500,
    "configuration" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.context_monitors IS 'Monitors for context updates.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_core_components_type ON core_components(type);
CREATE INDEX IF NOT EXISTS idx_core_components_status ON core_components(status);
CREATE INDEX IF NOT EXISTS idx_component_connections_source ON component_connections(source_component_id);
CREATE INDEX IF NOT EXISTS idx_component_connections_target ON component_connections(target_component_id);
CREATE INDEX IF NOT EXISTS idx_security_policies_component ON security_policies(component_id);
CREATE INDEX IF NOT EXISTS idx_security_policies_level ON security_policies(level);
CREATE INDEX IF NOT EXISTS idx_context_providers_component ON context_providers(component_id);
CREATE INDEX IF NOT EXISTS idx_mcp_services_namespace ON mcp_services(namespace);
CREATE INDEX IF NOT EXISTS idx_context_monitors_component ON context_monitors(component_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_core_components_updated_at ON core_components;
CREATE TRIGGER update_core_components_updated_at BEFORE UPDATE ON core_components FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_component_connections_updated_at ON component_connections;
CREATE TRIGGER update_component_connections_updated_at BEFORE UPDATE ON component_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_security_policies_updated_at ON security_policies;
CREATE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON security_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_context_providers_updated_at ON context_providers;
CREATE TRIGGER update_context_providers_updated_at BEFORE UPDATE ON context_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mcp_services_updated_at ON mcp_services;
CREATE TRIGGER update_mcp_services_updated_at BEFORE UPDATE ON mcp_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_context_monitors_updated_at ON context_monitors;
CREATE TRIGGER update_context_monitors_updated_at BEFORE UPDATE ON context_monitors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE core_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_monitors ENABLE ROW LEVEL SECURITY;

-- Create basic default policies
CREATE POLICY "Allow read access to authenticated users" ON core_components FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON component_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON security_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON context_providers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON mcp_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON context_monitors FOR SELECT TO authenticated USING (true); 