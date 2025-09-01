-- Insert core components
INSERT INTO core_components (id, name, type, version, description, configuration, dependencies)
VALUES
    (uuid_generate_v4(), 'IDE Extension', 'IDEExt', '1.0.0', 'VSCode extension for Chimera',
     '{"ui": "minimal", "events": ["editor", "document", "diagnostics", "selection"]}'::jsonb,
     ARRAY['RulesEngine', 'AVB', 'MCPPool']),

    (uuid_generate_v4(), 'Grok AI Core', 'AICore', '1.0.0', 'Core AI engine for planning and tool usage',
     '{"role": ["plan", "generate", "tool_user"]}'::jsonb,
     ARRAY['RulesEngine', 'CtxProvider']),

    (uuid_generate_v4(), 'Rules Engine', 'RulesEngine', '1.0.0', 'Dynamic rules processing engine',
     '{"input": ".chimera/rules/*.mdc", "format": "MD+YAML", "triggers": {"static": ["langId", "glob"], "dynamic": ["pattern", "context"]}}'::jsonb,
     ARRAY['AVB', 'Telemetry']),

    (uuid_generate_v4(), 'AVB Bridge', 'AVB', '1.0.0', 'Headless VSCode API Bridge',
     '{"interface": "JSON/MCP", "namespace": "vscode", "methods": ["getDiagnostics", "getDocSymbols", "getFileContent", "analyzeImports"]}'::jsonb,
     ARRAY['Security', 'MCPPool']),

    (uuid_generate_v4(), 'CMP Server', 'CMPServer', '1.0.0', 'Tool execution server',
     '{"role": "ToolExec", "target": "MCPs"}'::jsonb,
     ARRAY['MCPPool']),

    (uuid_generate_v4(), 'MCP Services', 'MCPSrvs', '1.0.0', 'Secure tool gateway services',
     '{"protocol": "JSON-RPC/WS", "principles": ["Modular", "Secure", "Standard", "Discoverable"]}'::jsonb,
     ARRAY['Security']),

    (uuid_generate_v4(), 'Telemetry Service', 'Telemetry', '1.0.0', 'Monitoring and context source',
     '{"interface": ["event", "error", "performance", "getAIContext"], "privacy": "Sanitize"}'::jsonb,
     ARRAY['Security']),

    (uuid_generate_v4(), 'Security Service', 'Security', '1.0.0', 'VSCode bridge security',
     '{"name": "VSCodeBridgeSec", "levels": ["RO", "FSRead", "FSWrite", "ProcExec", "Config"]}'::jsonb,
     ARRAY[]::text[]),

    (uuid_generate_v4(), 'Context Provider', 'CtxProvider', '1.0.0', 'Enhanced AI context provider',
     '{"name": "EnhancedAIContextProviderVSCode", "role": "AssembleAICtx"}'::jsonb,
     ARRAY['AVB', 'RulesEngine', 'Telemetry']),

    (uuid_generate_v4(), 'MCP Pool', 'MCPPool', '1.0.0', 'Client connection manager',
     '{"technology": "WebSocket", "features": ["JSON-RPC", "reconnect", "health", "telemetry"]}'::jsonb,
     ARRAY['Security'])
ON CONFLICT (id) DO NOTHING;

-- Insert component connections
INSERT INTO component_connections (id, source_component_id, target_component_id, connection_type, protocol)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM core_components WHERE name = 'IDE Extension'),
    (SELECT id FROM core_components WHERE name = 'Grok AI Core'),
    'bidirectional',
    'JSON-RPC'
ON CONFLICT DO NOTHING;

-- Insert security policies
INSERT INTO security_policies (id, component_id, level, permissions, description)
SELECT 
    uuid_generate_v4(),
    (SELECT id FROM core_components WHERE name = 'AVB Bridge'),
    'FSRead',
    '{"allowed_paths": ["/workspace/**"], "denied_paths": ["/node_modules/**"]}'::jsonb,
    'File system read access for workspace files'
ON CONFLICT DO NOTHING;

-- Insert context providers
INSERT INTO context_providers (id, name, component_id, context_keys, processing_rules)
SELECT 
    uuid_generate_v4(),
    'EnhancedAIContextProvider',
    (SELECT id FROM core_components WHERE name = 'Context Provider'),
    ARRAY['editor', 'ws', 'diag', 'rules', 'codeIntel', 'telemetry']::context_key[],
    '{"filter": {"max_size": 10000}, "summarize": {"max_length": 500}}'::jsonb
ON CONFLICT DO NOTHING;

-- Insert MCP services
INSERT INTO mcp_services (id, name, namespace, methods, protocol)
VALUES
    (uuid_generate_v4(), 'GitHub MCP', 'github',
     '["readFile", "rchCode", "getIssue", "createIssue", "updateIssue"]'::jsonb,
     'JSON-RPC/WS'),
    (uuid_generate_v4(), 'Database MCP', 'database',
     '["queryRecs", "createRec", "updateRec", "deleteRec"]'::jsonb,
     'JSON-RPC/WS'),
    (uuid_generate_v4(), 'VSCode MCP', 'vscode',
     '["getDiagnostics", "getDocSymbols", "getFileContent", "analyzeImports"]'::jsonb,
     'JSON-RPC/WS')
ON CONFLICT (id) DO NOTHING;

-- Insert context monitors
INSERT INTO context_monitors (id, name, component_id, events, actions, debounce_ms)
SELECT 
    uuid_generate_v4(),
    'EditorContextMonitor',
    (SELECT id FROM core_components WHERE name = 'Context Provider'),
    ARRAY['editor', 'document', 'diagnostics', 'selection'],
    ARRAY['debounce', 'refresh'],
    500
ON CONFLICT DO NOTHING; 