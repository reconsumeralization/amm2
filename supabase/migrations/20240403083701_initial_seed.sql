-- Insert initial rules using the final schema structure
INSERT INTO rules (id, rule_id, name, description, trigger_type, trigger_condition, guidance, priority)
VALUES
    (uuid_generate_v4(), 'PERF-001', 'Prefer Async I/O', 'Encourages use of asynchronous I/O operations over synchronous ones.',
     'static', '{"languageIds": ["typescript", "javascript"], "codePatterns": ["\\.readFileSync\\(", "\\.writeFileSync\\(", "\\.existsSync\\("]}',
     'Avoid Synchronous I/O. Replace readFileSync with readFile, writeFileSync with writeFile, etc.', 'MEDIUM'),

    (uuid_generate_v4(), 'PERF-002', 'High Response Time', 'Detects when API response times exceed acceptable thresholds.',
     'dynamic', '{"metric": "response_time", "threshold": 1000}',
     'Optimize database queries and API response handling.', 'HIGH'),

    (uuid_generate_v4(), 'PERF-003', 'Resource Exhaustion', 'Monitors for potential resource exhaustion scenarios.',
     'dynamic', '{"metric": "memory_usage", "threshold_percent": 80}',
     'Implement resource pooling and cleanup mechanisms.', 'CRITICAL')
ON CONFLICT (id) DO NOTHING;

-- Insert analytics thresholds using the final schema structure
INSERT INTO analytics_thresholds (id, metric_name, warning_threshold, critical_threshold, evaluation_period, component_type, severity, description)
VALUES
    (uuid_generate_v4(), 'response_time', 200, 500, 'PT1M', 'agent', 'medium', 'Agent response time (ms)'),
    (uuid_generate_v4(), 'completion_rate', 85, 70, 'PT5M', 'workflow', 'high', 'Workflow success rate (%) - Warning below 85, Critical below 70'),
    (uuid_generate_v4(), 'memory_usage', 75, 90, 'PT1M', 'system', 'critical', 'System memory usage (%)'),
    (uuid_generate_v4(), 'error_rate', 5, 10, 'PT5M', 'api', 'high', 'API error rate (%)')
ON CONFLICT (id) DO NOTHING;

-- Insert sample tool using the final schema structure
INSERT INTO tools (id, tool_id, name, description, version, implementation, status, inputs, outputs)
VALUES (
    uuid_generate_v4(),
    'tool-git-01',
    'GitHub File History',
    'Retrieves file history and changes from GitHub repositories',
    '1.1.0',
    '{
        "type": "MCP_CALL",
        "mcp_target": "GitHubMCP",
        "method": "getFileHistory",
        "parameter_mapping": {
            "owner": "{inputs.owner}",
            "repo": "{inputs.repo}",
            "path": "{inputs.filePath}",
            "ref": "{inputs.branch || ''''}"
        },
        "response_mapping": {
            "commits": "$",
            "sha": "$.sha",
            "message": "$.commit.message",
            "author": "$.commit.author.name",
            "date": "$.commit.author.date"
        }
    }'::jsonb,
    'ACTIVE',
    '[{"name": "owner", "type": "string", "description": "Repository owner", "required": true}, {"name": "repo", "type": "string", "description": "Repository name", "required": true}, {"name": "filePath", "type": "string", "description": "Path to the file", "required": true}, {"name": "branch", "type": "string", "description": "Branch or ref (optional)", "required": false}]'::jsonb,
    '{"type": "array", "items": {"type": "object", "properties": {"sha": {"type": "string"}, "author": {"type": "string"}, "date": {"type": "string", "format": "date-time"}, "message": {"type": "string"}}}}'::jsonb
)
ON CONFLICT (id) DO NOTHING; 