#!/usr/bin/env python3
"""
Database Schema Generator and Sync Tool
Generates PostgreSQL schemas from TypeScript collection types and syncs them with the database.
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
import subprocess
try:
	import psycopg2  # type: ignore
except Exception:  # pragma: no cover - optional for fuzzing environments
	psycopg2 = None  # type: ignore
from datetime import datetime

class SchemaGenerator:
    def __init__(self):
        self.collections_info = self.load_collections_info()
        self.schema_statements = []
        self.migration_statements = []
        
    def load_collections_info(self) -> Dict[str, Any]:
        """Load collection information from JSON file"""
        try:
            with open('collections-info.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ collections-info.json not found. Run generate-all-types.js first.")
            return {"collections": []}
    
    def pascale_to_snake(self, name: str) -> str:
        """Convert PascalCase to snake_case"""
        # Handle special cases first
        name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
        return name.lower()
    
    def generate_base_table_schema(self, table_name: str) -> str:
        """Generate base table schema with common fields"""
        return f"""
-- Table: {table_name}
CREATE TABLE IF NOT EXISTS {table_name} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{{}}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT {table_name}_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for {table_name}
CREATE INDEX IF NOT EXISTS idx_{table_name}_created_at ON {table_name}(created_at);
CREATE INDEX IF NOT EXISTS idx_{table_name}_updated_at ON {table_name}(updated_at);
CREATE INDEX IF NOT EXISTS idx_{table_name}_search ON {table_name} USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_{table_name}_data_gin ON {table_name} USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_{table_name}()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_{table_name}_updated_at ON {table_name};
CREATE TRIGGER trigger_update_{table_name}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_{table_name}();
"""

    def generate_relationship_tables(self) -> List[str]:
        """Generate tables for managing relationships between collections"""
        relationship_tables = []
        
        # Generic relationship table
        relationship_tables.append("""
-- Table: collection_relationships
CREATE TABLE IF NOT EXISTS collection_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_collection VARCHAR(100) NOT NULL,
    from_id UUID NOT NULL,
    to_collection VARCHAR(100) NOT NULL,
    to_id UUID NOT NULL,
    relationship_type VARCHAR(50) NOT NULL DEFAULT 'related',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(from_collection, from_id, to_collection, to_id, relationship_type)
);

-- Indexes for relationships
CREATE INDEX IF NOT EXISTS idx_relationships_from ON collection_relationships(from_collection, from_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON collection_relationships(to_collection, to_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON collection_relationships(relationship_type);
""")
        
        return relationship_tables
    
    def generate_collection_schemas(self) -> List[str]:
        """Generate schemas for all collections"""
        schemas = []
        collections = self.collections_info.get('collections', [])
        
        print(f"🔨 Generating schemas for {len(collections)} collections...")
        
        for collection in collections:
            table_name = self.pascale_to_snake(collection)
            schema = self.generate_base_table_schema(table_name)
            schemas.append(schema)
            print(f"✅ Generated schema for {collection} -> {table_name}")
        
        return schemas
    
    def generate_utility_functions(self) -> str:
        """Generate utility functions for database operations"""
        return """
-- Utility Functions
-- =================

-- Function to safely get JSONB field with default
CREATE OR REPLACE FUNCTION safe_jsonb_get(data JSONB, key TEXT, default_val TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(data->>key, default_val);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search across all collections
CREATE OR REPLACE FUNCTION search_all_collections(search_term TEXT, collection_filter TEXT[] DEFAULT NULL)
RETURNS TABLE(
    collection_name TEXT,
    id UUID,
    title TEXT,
    snippet TEXT,
    rank REAL
) AS $$
DECLARE
    table_name TEXT;
    query TEXT;
    collections TEXT[] := ARRAY[
        'commerce', 'coupons', 'gift_cards', 'invoices', 'orders', 'payment_methods', 
        'products', 'promotions', 'returns', 'shipping_methods', 'blog_posts', 'content',
        'faq', 'gallery', 'media', 'media_folders', 'navigation', 'navigation_menus',
        'pages_main', 'pages', 'redirects_main', 'redirects', 'seo_settings', 'tags',
        'appointments_main', 'cancellations', 'chatbot', 'chat_conversations', 'chat_messages',
        'contacts', 'customer_notes', 'customers_main', 'customers', 'customer_tags',
        'email_campaigns', 'loyalty_program', 'reviews', 'subscriptions', 'testimonials',
        'clock_records', 'commissions', 'staff_roles', 'staff_schedules', 'stylists',
        'time_off_requests', 'appointments', 'audit_logs', 'business_documentation',
        'chatbot_logs', 'documentation', 'documentation_templates', 'documentation_workflows',
        'editor_plugins', 'editor_templates', 'editor_themes', 'email_logs', 'events',
        'event_tracking', 'feature_flags', 'integrations', 'inventory', 'locations',
        'maintenance_requests', 'notifications', 'page_views', 'push_notifications',
        'recurring_appointments', 'resources', 'roles_permissions', 'service_packages',
        'services', 'settings', 'site_sections', 'tenants', 'transactions', 'users',
        'wait_list', 'webhook_logs'
    ];
BEGIN
    FOR table_name IN SELECT unnest(collections) LOOP
        IF collection_filter IS NULL OR table_name = ANY(collection_filter) THEN
            query := format('
                SELECT %L as collection_name, 
                       id, 
                       COALESCE(safe_jsonb_get(data, ''title''), safe_jsonb_get(data, ''name''), ''Untitled'') as title,
                       ts_headline(''english'', COALESCE(safe_jsonb_get(data, ''description''), safe_jsonb_get(data, ''content''), ''''), plainto_tsquery(%L)) as snippet,
                       ts_rank(search_vector, plainto_tsquery(%L)) as rank
                FROM %I 
                WHERE search_vector @@ plainto_tsquery(%L)
                ORDER BY rank DESC
                LIMIT 10
            ', table_name, search_term, search_term, table_name, search_term);
            
            BEGIN
                RETURN QUERY EXECUTE query;
            EXCEPTION 
                WHEN undefined_table THEN
                    -- Skip tables that don't exist yet
                    CONTINUE;
            END;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get collection statistics
CREATE OR REPLACE FUNCTION get_collection_stats()
RETURNS TABLE(
    collection_name TEXT,
    record_count BIGINT,
    avg_data_size NUMERIC,
    last_updated TIMESTAMPTZ
) AS $$
DECLARE
    table_name TEXT;
    query TEXT;
    collections TEXT[] := ARRAY[
        'commerce', 'coupons', 'gift_cards', 'invoices', 'orders', 'payment_methods', 
        'products', 'promotions', 'returns', 'shipping_methods', 'blog_posts', 'content',
        'faq', 'gallery', 'media', 'media_folders', 'navigation', 'navigation_menus',
        'pages_main', 'pages', 'redirects_main', 'redirects', 'seo_settings', 'tags',
        'appointments_main', 'cancellations', 'chatbot', 'chat_conversations', 'chat_messages',
        'contacts', 'customer_notes', 'customers_main', 'customers', 'customer_tags',
        'email_campaigns', 'loyalty_program', 'reviews', 'subscriptions', 'testimonials',
        'clock_records', 'commissions', 'staff_roles', 'staff_schedules', 'stylists',
        'time_off_requests', 'appointments', 'audit_logs', 'business_documentation',
        'chatbot_logs', 'documentation', 'documentation_templates', 'documentation_workflows',
        'editor_plugins', 'editor_templates', 'editor_themes', 'email_logs', 'events',
        'event_tracking', 'feature_flags', 'integrations', 'inventory', 'locations',
        'maintenance_requests', 'notifications', 'page_views', 'push_notifications',
        'recurring_appointments', 'resources', 'roles_permissions', 'service_packages',
        'services', 'settings', 'site_sections', 'tenants', 'transactions', 'users',
        'wait_list', 'webhook_logs'
    ];
BEGIN
    FOR table_name IN SELECT unnest(collections) LOOP
        query := format('
            SELECT %L as collection_name,
                   COUNT(*) as record_count,
                   AVG(octet_length(data::text)) as avg_data_size,
                   MAX(updated_at) as last_updated
            FROM %I
        ', table_name, table_name);
        
        BEGIN
            RETURN QUERY EXECUTE query;
        EXCEPTION 
            WHEN undefined_table THEN
                -- Return zero stats for missing tables
                RETURN QUERY SELECT table_name, 0::BIGINT, 0::NUMERIC, NULL::TIMESTAMPTZ;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
"""

    def save_schema_file(self, schemas: List[str], relationships: List[str], utilities: str) -> str:
        """Save all schemas to a single migration file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"schema_migration_{timestamp}.sql"
        
        content = f"""-- ModernMen Payload Collections Schema Migration
-- Generated at: {datetime.now().isoformat()}
-- Collections: {len(self.collections_info.get('collections', []))}

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

{utilities}

-- Collection Tables
-- =================
"""
        
        for schema in schemas:
            content += schema + "\n"
        
        content += """
-- Relationship Tables
-- ===================
"""
        
        for relationship in relationships:
            content += relationship + "\n"
        
        content += """
-- Final Setup
-- ============

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Create database views for common queries (optional)
-- CREATE VIEW active_users AS SELECT * FROM users WHERE data->>'status' = 'active';

COMMIT;
"""
        
        with open(filename, 'w') as f:
            f.write(content)
        
        return filename
    
    def sync_with_database(self, schema_file: str) -> bool:
        """Sync the generated schema with the database"""
        print("🔄 Attempting to sync with database...")
        
        # Get database URL from environment
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("⚠️ DATABASE_URL not found in environment. Schema file generated but not synced.")
            return False
        
        try:
            # Parse connection details (basic implementation)
            print("📡 Connecting to database...")
            
            # Execute the schema file
            cmd = f'psql "{database_url}" -f {schema_file}'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Database schema synced successfully!")
                print(f"📄 Migration applied: {schema_file}")
                return True
            else:
                print("❌ Database sync failed:")
                print(result.stderr)
                return False
                
        except Exception as e:
            print(f"❌ Database sync error: {str(e)}")
            return False
    
    def run(self):
        """Main execution function"""
        print("🚀 Starting Schema Generation and Sync...")
        
        if not self.collections_info.get('collections'):
            print("❌ No collections found. Run the type generation first.")
            return
        
        # Generate schemas
        collection_schemas = self.generate_collection_schemas()
        relationship_schemas = self.generate_relationship_tables()
        utility_functions = self.generate_utility_functions()
        
        # Save to file
        schema_file = self.save_schema_file(collection_schemas, relationship_schemas, utility_functions)
        print(f"📁 Schema saved to: {schema_file}")
        
        # Sync with database if possible
        synced = self.sync_with_database(schema_file)
        
        # Summary
        print("\n🎉 Schema Generation Complete!")
        print(f"📊 Generated schemas for {len(self.collections_info.get('collections', []))} collections")
        print(f"📄 Migration file: {schema_file}")
        print(f"🔄 Database synced: {'Yes' if synced else 'No'}")
        
        if not synced:
            print("\n💡 To manually sync:")
            print(f"   psql $DATABASE_URL -f {schema_file}")

if __name__ == "__main__":
    generator = SchemaGenerator()
    generator.run()