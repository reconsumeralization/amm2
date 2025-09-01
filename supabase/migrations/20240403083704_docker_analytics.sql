-- Create custom types for Docker configurations
DO $$ BEGIN CREATE TYPE docker_daemon_type AS ENUM ('tcp', 'unix', 'npipe'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE analytics_provider AS ENUM ('docker', 'prometheus', 'custom'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create docker_configurations table
CREATE TABLE IF NOT EXISTS "public"."docker_configurations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "daemon_type" docker_daemon_type NOT NULL DEFAULT 'tcp',
    "host" VARCHAR(255) NOT NULL DEFAULT 'localhost',
    "port" INTEGER,
    "socket_path" VARCHAR(255),
    "tls_enabled" boolean DEFAULT false NOT NULL,
    "tls_verify" boolean DEFAULT true NOT NULL,
    "tls_cert_path" VARCHAR(255),
    "tls_key_path" VARCHAR(255),
    "tls_ca_path" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "valid_daemon_config" CHECK (
        (daemon_type = 'tcp' AND port IS NOT NULL) OR
        (daemon_type = 'unix' AND socket_path IS NOT NULL) OR
        (daemon_type = 'npipe' AND socket_path IS NOT NULL)
    )
);
COMMENT ON TABLE public.docker_configurations IS 'Docker daemon connection configurations.';

-- Create analytics_configurations table
CREATE TABLE IF NOT EXISTS "public"."analytics_configurations" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "provider" analytics_provider NOT NULL,
    "docker_config_id" UUID REFERENCES docker_configurations(id),
    "endpoint" VARCHAR(255),
    "metrics_path" VARCHAR(255) DEFAULT '/metrics',
    "scrape_interval" INTEGER DEFAULT 15,
    "timeout" INTEGER DEFAULT 10,
    "authentication" JSONB,
    "labels" JSONB,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "valid_analytics_config" CHECK (
        (provider = 'docker' AND docker_config_id IS NOT NULL) OR
        (provider != 'docker' AND endpoint IS NOT NULL)
    )
);
COMMENT ON TABLE public.analytics_configurations IS 'Analytics provider configurations.';

-- Create analytics_metrics table
CREATE TABLE IF NOT EXISTS "public"."analytics_metrics" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "config_id" UUID NOT NULL REFERENCES analytics_configurations(id),
    "metric_name" VARCHAR(255) NOT NULL,
    "metric_type" VARCHAR(50) NOT NULL,
    "value" NUMERIC NOT NULL,
    "labels" JSONB,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.analytics_metrics IS 'Collected analytics metrics.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_docker_configs_status ON docker_configurations(status);
CREATE INDEX IF NOT EXISTS idx_analytics_configs_provider ON analytics_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_analytics_configs_status ON analytics_configurations(status);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_config ON analytics_metrics(config_id);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_name ON analytics_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_timestamp ON analytics_metrics(timestamp);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_docker_configs_updated_at ON docker_configurations;
CREATE TRIGGER update_docker_configs_updated_at BEFORE UPDATE ON docker_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_configs_updated_at ON analytics_configurations;
CREATE TRIGGER update_analytics_configs_updated_at BEFORE UPDATE ON analytics_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE docker_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;

-- Create basic default policies
CREATE POLICY "Allow read access to authenticated users" ON docker_configurations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON analytics_configurations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON analytics_metrics FOR SELECT TO authenticated USING (true);

-- Insert default Docker configuration
INSERT INTO docker_configurations (id, name, daemon_type, host, port, tls_enabled, status)
VALUES (
    uuid_generate_v4(),
    'Default Local Docker',
    'tcp',
    'localhost',
    2375,
    false,
    'ACTIVE'
)
ON CONFLICT DO NOTHING;

-- Insert default analytics configuration
INSERT INTO analytics_configurations (id, name, provider, docker_config_id, status)
SELECT 
    uuid_generate_v4(),
    'Default Docker Analytics',
    'docker',
    (SELECT id FROM docker_configurations WHERE name = 'Default Local Docker'),
    'ACTIVE'
ON CONFLICT DO NOTHING; 