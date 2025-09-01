-- Insert tool definitions
INSERT INTO tool_definitions (id, name, type, category, description, is_streaming, requires_approval, configuration)
VALUES
    (uuid_generate_v4(), 'Read File', 'READ_FILE', 'CLIENT_SIDE', 'Reads file content with optional range limits',
     false, false, '{"max_size": 1000000, "supported_languages": ["*"]}'::jsonb),

    (uuid_generate_v4(), 'Edit File', 'EDIT_FILE', 'CLIENT_SIDE', 'Applies edits to a file',
     false, true, '{"supported_languages": ["*"], "max_edit_size": 100000}'::jsonb),

    (uuid_generate_v4(), 'Run Terminal Command', 'RUN_TERMINAL_COMMAND_V2', 'CLIENT_SIDE', 'Executes terminal commands',
     false, true, '{"allowed_commands": ["*"], "timeout": 300}'::jsonb),

    (uuid_generate_v4(), 'Semantic rch', 'SEMANTIC_RCH_FULL', 'CLIENT_SIDE', 'Performs semantic code rch',
     false, false, '{"max_results": 100, "min_score": 0.5}'::jsonb),

    (uuid_generate_v4(), 'rch Symbols', 'RCH_SYMBOLS', 'CLIENT_SIDE', 'rches for code symbols',
     false, false, '{"max_results": 50}'::jsonb),

    (uuid_generate_v4(), 'Get Project Structure', 'GET_PROJECT_STRUCTURE', 'BUILTIN', 'Retrieves project file structure',
     false, false, '{"max_depth": 5}'::jsonb),

    (uuid_generate_v4(), 'Read with Linter', 'READ_WITH_LINTER', 'BUILTIN', 'Reads file with linting information',
     false, false, '{"supported_linters": ["eslint", "tslint"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert tool schemas for Read File
INSERT INTO tool_schemas (id, tool_id, name, description, required_fields)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_definitions WHERE type = 'READ_FILE'),
    'Read File Parameters',
    'Parameters for reading file content',
    ARRAY['path', 'start_line', 'end_line']
ON CONFLICT DO NOTHING;

-- Insert schema properties for Read File
INSERT INTO schema_properties (id, schema_id, name, type, description, is_required, validation_rules)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_schemas WHERE name = 'Read File Parameters'),
    'path',
    'string',
    'Relative path to the file',
    true,
    '{"pattern": "^[^/].*"}'::jsonb
ON CONFLICT DO NOTHING;

-- Insert tool schemas for Edit File
INSERT INTO tool_schemas (id, tool_id, name, description, required_fields)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_definitions WHERE type = 'EDIT_FILE'),
    'Edit File Parameters',
    'Parameters for editing file content',
    ARRAY['path', 'content', 'language']
ON CONFLICT DO NOTHING;

-- Insert schema properties for Edit File
INSERT INTO schema_properties (id, schema_id, name, type, description, is_required, validation_rules)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_schemas WHERE name = 'Edit File Parameters'),
    'content',
    'string',
    'New file content',
    true,
    '{"minLength": 1}'::jsonb
ON CONFLICT DO NOTHING;

-- Insert tool schemas for Run Terminal Command
INSERT INTO tool_schemas (id, tool_id, name, description, required_fields)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_definitions WHERE type = 'RUN_TERMINAL_COMMAND_V2'),
    'Terminal Command Parameters',
    'Parameters for executing terminal commands',
    ARRAY['command', 'cwd']
ON CONFLICT DO NOTHING;

-- Insert schema properties for Run Terminal Command
INSERT INTO schema_properties (id, schema_id, name, type, description, is_required, validation_rules)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_schemas WHERE name = 'Terminal Command Parameters'),
    'command',
    'string',
    'Command to execute',
    true,
    '{"minLength": 1}'::jsonb
ON CONFLICT DO NOTHING;

-- Insert tool schemas for Semantic rch
INSERT INTO tool_schemas (id, tool_id, name, description, required_fields)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_definitions WHERE type = 'SEMANTIC_RCH_FULL'),
    'Semantic rch Parameters',
    'Parameters for semantic code rch',
    ARRAY['query', 'top_k']
ON CONFLICT DO NOTHING;

-- Insert schema properties for Semantic rch
INSERT INTO schema_properties (id, schema_id, name, type, description, is_required, validation_rules)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM tool_schemas WHERE name = 'Semantic rch Parameters'),
    'query',
    'string',
    'rch query',
    true,
    '{"minLength": 3}'::jsonb
ON CONFLICT DO NOTHING; 