-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- Keep commented unless pg_cron is definitely needed and configured

-- Create custom types idempotently
DO $$ BEGIN CREATE TYPE agent_status AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR', 'MAINTENANCE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tool_status AS ENUM ('ACTIVE', 'INACTIVE', 'DEPRECATED', 'BETA'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE workflow_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED', 'ERROR'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE webhook_status AS ENUM ('ACTIVE', 'INACTIVE', 'FAILED'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE log_level AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE log_source AS ENUM ('AGENT', 'WORKFLOW', 'SYSTEM', 'TOOL', 'TELEMETRY', 'WEBHOOK', 'API', 'MCP'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE component_interaction_type AS ENUM ('tool_invocation', 'agent_assignment', 'workflow_step', 'webhook_trigger', 'rule_evaluation', 'resource_usage', 'mcp_request', 'database_query', 'file_system_access', 'api_call', 'cache_access'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create agents table
CREATE TABLE IF NOT EXISTS "public"."agents" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "capabilities" JSONB,
    "specialization" JSONB,
    "compatible_tools" text[],
    "behavioural_traits" JSONB,
    "configuration" JSONB,
    "status" agent_status NOT NULL DEFAULT 'ACTIVE',
    "current_task" text,
    "performance_metrics" JSONB,
    "created_by" text,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.agents IS 'Manages AI agents, their capabilities, and status.';

-- Create tools table
CREATE TABLE IF NOT EXISTS "public"."tools" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tool_id" text UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "version" text DEFAULT '1.0.0',
    "author" text DEFAULT 'Chimera AI',
    "implementation" JSONB NOT NULL,
    "permissions" jsonb DEFAULT '[]'::jsonb,
    "inputs" jsonb,
    "outputs" jsonb,
    "status" tool_status NOT NULL DEFAULT 'ACTIVE',
    "execution_count" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tools IS 'Stores configurations and metadata for executable tools.';

-- Create workflows table
CREATE TABLE IF NOT EXISTS "public"."workflows" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "version" text,
    "definition" JSONB NOT NULL,
    "steps" jsonb,
    "connections" jsonb,
    "status" workflow_status NOT NULL DEFAULT 'DRAFT',
    "created_by" text,
    "last_modified" timestamptz,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.workflows IS 'Defines multi-step workflows orchestrated by the system.';

-- Create webhooks table
CREATE TABLE IF NOT EXISTS "public"."webhooks" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "endpoint_url" TEXT NOT NULL,
    "target_system" text,
    "events" text[],
    "filter" jsonb,
    "headers" JSONB,
    "secret" text,
    "status" webhook_status NOT NULL DEFAULT 'ACTIVE',
    "created_by" text,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.webhooks IS 'Configuration for inbound webhooks.';
COMMENT ON COLUMN public.webhooks.secret IS 'Stores a secure hash of the webhook secret, not the raw secret.';

-- Create rules table
CREATE TABLE IF NOT EXISTS "public"."rules" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "rule_id" text UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "trigger_type" VARCHAR(50) NOT NULL,
    "trigger_condition" JSONB NOT NULL,
    "guidance" TEXT NOT NULL,
    "placeholders" jsonb,
    "priority" VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "last_triggered_at" timestamp with time zone,
    "trigger_count" integer DEFAULT 0 NOT NULL
);
COMMENT ON TABLE public.rules IS 'Defines rules for system behavior and guidance.';

-- Create permissions table
CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "entity_id" text NOT NULL,
    "entity_type" text NOT NULL,
    "level" text NOT NULL,
    "resource" text NOT NULL,
    "granted" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "granted_by" text,
    "revocation_reason" text
);
COMMENT ON TABLE public.permissions IS 'Manages granular permissions for system entities.';

-- Create telemetry_events table
CREATE TABLE IF NOT EXISTS "public"."telemetry_events" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "event_type" text NOT NULL,
    "component" text NOT NULL,
    "data" jsonb NOT NULL,
    "session_id" text,
    "user_id" text,
    "trace_id" uuid,
    "metadata" jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.telemetry_events IS 'Stores discrete events occurring within the system.';

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS "public"."performance_metrics" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "component" text NOT NULL,
    "metric_name" text NOT NULL,
    "metric_value" numeric NOT NULL,
    "duration_ms" integer,
    "labels" jsonb,
    "metadata" jsonb,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.performance_metrics IS 'Stores time-series performance metrics.';

-- Create error_logs table
CREATE TABLE IF NOT EXISTS "public"."error_logs" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "component" text NOT NULL,
    "error_type" text NOT NULL,
    "message" text NOT NULL,
    "stack_trace" text,
    "metadata" jsonb,
    "trace_id" uuid,
    "span_id" uuid,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.error_logs IS 'Stores detailed error information.';

-- Create analytics_thresholds table
CREATE TABLE IF NOT EXISTS "public"."analytics_thresholds" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "metric_name" VARCHAR(255) NOT NULL,
    "warning_threshold" NUMERIC NOT NULL,
    "critical_threshold" NUMERIC NOT NULL,
    "evaluation_period" VARCHAR(20) NOT NULL,
    "component_type" text,
    "severity" text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    "description" text,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_component_metric_severity_nullable" UNIQUE NULLS NOT DISTINCT (component_type, metric_name, severity)
);
COMMENT ON TABLE public.analytics_thresholds IS 'Configurable thresholds for monitoring and analytics.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_rules_priority ON rules(priority);
CREATE INDEX IF NOT EXISTS idx_permissions_entity ON permissions(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_timestamp ON telemetry_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type ON telemetry_events(event_type);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_component ON telemetry_events(component);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_trace_id ON telemetry_events(trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_component_metric ON performance_metrics(component, metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON error_logs(component);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_trace_id ON error_logs(trace_id) WHERE trace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_thresholds_metric ON analytics_thresholds(metric_name);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_webhooks_updated_at ON webhooks;
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rules_updated_at ON rules;
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_thresholds_updated_at ON analytics_thresholds;
CREATE TRIGGER update_analytics_thresholds_updated_at BEFORE UPDATE ON analytics_thresholds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_thresholds ENABLE ROW LEVEL SECURITY;

-- Create basic default policies
CREATE POLICY "Allow read access to authenticated users" ON agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON webhooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service_role full access" ON telemetry_events FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON performance_metrics FOR ALL TO service_role USING (true);
CREATE POLICY "Allow service_role full access" ON error_logs FOR ALL TO service_role USING (true);
CREATE POLICY "Allow read access to authenticated users" ON analytics_thresholds FOR SELECT TO authenticated USING (true); 