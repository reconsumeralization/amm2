-- Create custom types for tool system
DO $$ BEGIN CREATE TYPE tool_category AS ENUM ('CLIENT_SIDE', 'BUILTIN', 'COMPOSER'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tool_type AS ENUM (
    'READ_SEMRCH_FILES', 'READ_FILE_FOR_IMPORTS', 'RIPGREP_RCH', 'RUN_TERMINAL_COMMAND',
    'RUN_TERMINAL_COMMAND_V2', 'READ_FILE', 'LIST_DIR', 'EDIT_FILE', 'FILE_RCH',
    'SEMANTIC_RCH_FULL', 'CREATE_FILE', 'DELETE_FILE', 'REAPPLY', 'GET_RELATED_FILES',
    'PARALLEL_APPLY', 'FETCH_RULES', 'PLANNER', 'WEB_RCH', 'MCP', 'WEB_VIEWER',
    'DIFF_HISTORY', 'IMPLEMENTER', 'RCH_SYMBOLS', 'BACKGROUND_COMPOSER_FOLLOWUP',
    'RCH', 'READ_CHUNK', 'GOTODEF', 'EDIT', 'NEW_EDIT', 'UNDO_EDIT', 'END',
    'NEW_FILE', 'ADD_TEST', 'RUN_TEST', 'DELETE_TEST', 'GET_TESTS', 'SAVE_FILE',
    'GET_SYMBOLS', 'SEMANTIC_RCH', 'GET_PROJECT_STRUCTURE', 'CREATE_RM_FILES',
    'RUN_TERMINAL_COMMANDS', 'READ_WITH_LINTER', 'ADD_FILE_TO_CONTEXT',
    'REMOVE_FILE_FROM_CONTEXT', 'SEMANTIC_RCH_CODEBASE', 'ITERATE'
); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE property_type AS ENUM ('string', 'number', 'boolean', 'array', 'object'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create tool_definitions table
CREATE TABLE IF NOT EXISTS "public"."tool_definitions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "type" tool_type NOT NULL,
    "category" tool_category NOT NULL,
    "description" TEXT,
    "version" VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    "is_streaming" boolean DEFAULT false NOT NULL,
    "requires_approval" boolean DEFAULT false NOT NULL,
    "configuration" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tool_definitions IS 'Definitions of available tools in the system.';

-- Create tool_schemas table
CREATE TABLE IF NOT EXISTS "public"."tool_schemas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tool_id" UUID NOT NULL REFERENCES tool_definitions(id),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "required_fields" text[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tool_schemas IS 'JSON schemas for tool parameters and results.';

-- Create schema_properties table
CREATE TABLE IF NOT EXISTS "public"."schema_properties" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "schema_id" UUID NOT NULL REFERENCES tool_schemas(id),
    "name" VARCHAR(255) NOT NULL,
    "type" property_type NOT NULL,
    "description" TEXT,
    "default_value" TEXT,
    "validation_rules" JSONB,
    "is_required" boolean DEFAULT false NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.schema_properties IS 'Properties within tool schemas.';

-- Create tool_calls table
CREATE TABLE IF NOT EXISTS "public"."tool_calls" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tool_id" UUID NOT NULL REFERENCES tool_definitions(id),
    "call_id" VARCHAR(255) NOT NULL,
    "params" JSONB NOT NULL,
    "is_streaming" boolean DEFAULT false NOT NULL,
    "is_last_message" boolean DEFAULT false NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tool_calls IS 'Record of tool execution requests.';

-- Create tool_results table
CREATE TABLE IF NOT EXISTS "public"."tool_results" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tool_call_id" UUID NOT NULL REFERENCES tool_calls(id),
    "result" JSONB,
    "error" JSONB,
    "execution_time_ms" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tool_results IS 'Results from tool executions.';

-- Create tool_errors table
CREATE TABLE IF NOT EXISTS "public"."tool_errors" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tool_call_id" UUID NOT NULL REFERENCES tool_calls(id),
    "client_message" TEXT,
    "model_message" TEXT,
    "error_type" VARCHAR(50) NOT NULL,
    "stack_trace" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tool_errors IS 'Detailed error information from tool executions.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tool_defs_type ON tool_definitions(type);
CREATE INDEX IF NOT EXISTS idx_tool_defs_category ON tool_definitions(category);
CREATE INDEX IF NOT EXISTS idx_tool_schemas_tool ON tool_schemas(tool_id);
CREATE INDEX IF NOT EXISTS idx_schema_props_schema ON schema_properties(schema_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_tool ON tool_calls(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_status ON tool_calls(status);
CREATE INDEX IF NOT EXISTS idx_tool_results_call ON tool_results(tool_call_id);
CREATE INDEX IF NOT EXISTS idx_tool_errors_call ON tool_errors(tool_call_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_tool_defs_updated_at ON tool_definitions;
CREATE TRIGGER update_tool_defs_updated_at BEFORE UPDATE ON tool_definitions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tool_schemas_updated_at ON tool_schemas;
CREATE TRIGGER update_tool_schemas_updated_at BEFORE UPDATE ON tool_schemas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schema_props_updated_at ON schema_properties;
CREATE TRIGGER update_schema_props_updated_at BEFORE UPDATE ON schema_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tool_calls_updated_at ON tool_calls;
CREATE TRIGGER update_tool_calls_updated_at BEFORE UPDATE ON tool_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tool_results_updated_at ON tool_results;
CREATE TRIGGER update_tool_results_updated_at BEFORE UPDATE ON tool_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tool_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_schemas ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_errors ENABLE ROW LEVEL SECURITY;

-- Create basic default policies
CREATE POLICY "Allow read access to authenticated users" ON tool_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON tool_schemas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON schema_properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON tool_calls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON tool_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON tool_errors FOR SELECT TO authenticated USING (true); 