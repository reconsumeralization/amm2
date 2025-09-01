-- Create custom types for RAG and AI situations
CREATE TYPE rag_document_type AS ENUM (
    'TEXT',
    'CODE',
    'MARKDOWN',
    'JSON',
    'YAML',
    'SQL',
    'CONFIG',
    'LOG',
    'OTHER'
);

CREATE TYPE rag_embedding_model AS ENUM (
    'OPENAI_ADA_002',
    'COHERE_MULTILINGUAL',
    'HUGGINGFACE_MINILM',
    'CUSTOM'
);

CREATE TYPE ai_situation_type AS ENUM (
    'ERROR_HANDLING',
    'USER_INTERACTION',
    'SYSTEM_STATE',
    'PERFORMANCE_ISSUE',
    'SECURITY_ALERT',
    'DATA_VALIDATION',
    'API_INTEGRATION',
    'CUSTOM'
);

CREATE TYPE ai_situation_severity AS ENUM (
    'INFO',
    'WARNING',
    'ERROR',
    'CRITICAL'
);

-- Create tables for RAG data store
CREATE TABLE rag_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    document_type rag_document_type NOT NULL,
    source_path TEXT,
    source_url TEXT,
    metadata JSONB,
    embedding_model rag_embedding_model NOT NULL,
    embedding_vector vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_source CHECK (
        (source_path IS NOT NULL AND source_url IS NULL) OR
        (source_path IS NULL AND source_url IS NOT NULL) OR
        (source_path IS NULL AND source_url IS NULL)
    )
);

CREATE TABLE rag_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding_vector vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_chunk_index UNIQUE (document_id, chunk_index)
);

CREATE TABLE rag_metadata_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    data_type TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create tables for AI situations
CREATE TABLE ai_situations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_type ai_situation_type NOT NULL,
    severity ai_situation_severity NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    context JSONB,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_situation_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_id UUID NOT NULL REFERENCES ai_situations(id) ON DELETE CASCADE,
    response_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_situation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    situation_id UUID NOT NULL REFERENCES ai_situations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_rag_documents_embedding ON rag_documents USING ivfflat (embedding_vector vector_cosine_ops);
CREATE INDEX idx_rag_chunks_embedding ON rag_chunks USING ivfflat (embedding_vector vector_cosine_ops);
CREATE INDEX idx_rag_documents_type ON rag_documents(document_type);
CREATE INDEX idx_ai_situations_type ON ai_situations(situation_type);
CREATE INDEX idx_ai_situations_severity ON ai_situations(severity);
CREATE INDEX idx_ai_situations_status ON ai_situations(status);

-- Create triggers for updating timestamps
CREATE TRIGGER update_rag_documents_timestamp
    BEFORE UPDATE ON rag_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_chunks_timestamp
    BEFORE UPDATE ON rag_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rag_metadata_fields_timestamp
    BEFORE UPDATE ON rag_metadata_fields
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_situations_timestamp
    BEFORE UPDATE ON ai_situations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_situation_responses_timestamp
    BEFORE UPDATE ON ai_situation_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_situation_actions_timestamp
    BEFORE UPDATE ON ai_situation_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_metadata_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_situation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_situation_actions ENABLE ROW LEVEL SECURITY;

-- Create default policies
CREATE POLICY "Enable read access for authenticated users" ON rag_documents
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON rag_documents
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON rag_documents
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON rag_documents
    FOR DELETE TO authenticated USING (true);

-- Create similar policies for other tables
CREATE POLICY "Enable read access for authenticated users" ON rag_chunks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON rag_metadata_fields
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON ai_situations
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ai_situations
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON ai_situation_responses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON ai_situation_actions
    FOR SELECT TO authenticated USING (true);

-- Insert default metadata fields
INSERT INTO rag_metadata_fields (name, description, data_type, is_required, validation_rules)
VALUES
    ('author', 'Document author', 'TEXT', false, '{"minLength": 1}'),
    ('version', 'Document version', 'TEXT', false, '{"pattern": "^\\d+\\.\\d+\\.\\d+$"}'),
    ('tags', 'Document tags', 'ARRAY', false, '{"items": {"type": "string"}}'),
    ('last_modified', 'Last modification date', 'TIMESTAMP', false, '{}'),
    ('language', 'Document language', 'TEXT', false, '{"enum": ["en", "es", "fr", "de", "other"]}');

-- Insert default AI situations
INSERT INTO ai_situations (situation_type, severity, title, description, context)
VALUES
    ('ERROR_HANDLING', 'ERROR', 'Database Connection Failed', 'Failed to connect to the database', '{"component": "database", "error_code": "DB001"}'),
    ('PERFORMANCE_ISSUE', 'WARNING', 'High Response Time', 'API response time exceeds threshold', '{"endpoint": "/api/data", "threshold_ms": 1000}'),
    ('SECURITY_ALERT', 'CRITICAL', 'Unauthorized Access Attempt', 'Multiple failed login attempts detected', '{"ip_address": "192.168.1.1", "attempts": 5}'); 