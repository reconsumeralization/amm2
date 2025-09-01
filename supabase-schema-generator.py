#!/usr/bin/env python3
"""
Supabase Schema and Query Generator
Generates Supabase-specific schemas, migrations, and TypeScript queries from collection types.
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

class SupabaseSchemaGenerator:
    def __init__(self):
        self.collections_info = self.load_collections_info()
        self.migrations = []
        self.queries = []
        
    def load_collections_info(self) -> Dict[str, Any]:
        """Load collection information from JSON file"""
        try:
            with open('collections-info.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            print("ERROR: collections-info.json not found. Run generate-all-types.js first.")
            return {"collections": []}
    
    def pascale_to_snake(self, name: str) -> str:
        """Convert PascalCase to snake_case"""
        name = re.sub('([a-z0-9])([A-Z])', r'\1_\2', name)
        return name.lower()
    
    def generate_supabase_table_schema(self, table_name: str, collection_name: str) -> str:
        """Generate Supabase-specific table schema"""
        return f"""
-- =====================================================
-- Table: {table_name} ({collection_name})
-- =====================================================

CREATE TABLE IF NOT EXISTS public.{table_name} (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{{}}'::jsonb,
    
    -- Common fields that might be extracted from data for performance
    title TEXT GENERATED ALWAYS AS (data->>'title') STORED,
    slug TEXT GENERATED ALWAYS AS (data->>'slug') STORED,
    status TEXT GENERATED ALWAYS AS (COALESCE(data->>'status', 'draft')) STORED,
    
    -- Full-text search vector
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(data->>'title', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(data->>'name', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(data->>'description', '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(data->>'content', '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(data->>'tags', '')), 'D')
    ) STORED,
    
    -- Data validation constraint
    CONSTRAINT {table_name}_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT {table_name}_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for {table_name}
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_{table_name}_created_at ON public.{table_name}(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_{table_name}_updated_at ON public.{table_name}(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_{table_name}_status ON public.{table_name}(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_{table_name}_slug ON public.{table_name}(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_{table_name}_data_gin ON public.{table_name} USING gin(data);
CREATE INDEX IF NOT EXISTS idx_{table_name}_data_title ON public.{table_name} USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_{table_name}_data_status ON public.{table_name} USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_{table_name}_search ON public.{table_name} USING gin(search_vector);

-- =====================================================
-- RLS Policies for {table_name}
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.{table_name}
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.{table_name}
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for {table_name}
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_{table_name}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_{table_name}_updated_at ON public.{table_name};
CREATE TRIGGER trigger_{table_name}_updated_at
    BEFORE UPDATE ON public.{table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_{table_name}_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION {table_name}_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        old_data,
        new_data,
        user_id,
        created_at
    ) VALUES (
        '{table_name}',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid(),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Optional audit trigger (uncomment if audit_logs table exists)
-- DROP TRIGGER IF EXISTS trigger_{table_name}_audit ON public.{table_name};
-- CREATE TRIGGER trigger_{table_name}_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.{table_name}
--     FOR EACH ROW
--     EXECUTE FUNCTION {table_name}_audit_log();
"""

    def generate_relationship_tables(self) -> str:
        """Generate relationship and system tables"""
        return """
-- =====================================================
-- SYSTEM TABLES FOR RELATIONSHIPS AND MANAGEMENT
-- =====================================================

-- Collection relationships table
CREATE TABLE IF NOT EXISTS public.collection_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_collection TEXT NOT NULL,
    from_id UUID NOT NULL,
    to_collection TEXT NOT NULL,
    to_id UUID NOT NULL,
    relationship_type TEXT NOT NULL DEFAULT 'related',
    relationship_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Unique constraint to prevent duplicate relationships
    UNIQUE(from_collection, from_id, to_collection, to_id, relationship_type)
);

-- Indexes for relationships
CREATE INDEX IF NOT EXISTS idx_relationships_from ON public.collection_relationships(from_collection, from_id);
CREATE INDEX IF NOT EXISTS idx_relationships_to ON public.collection_relationships(to_collection, to_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON public.collection_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_relationships_data ON public.collection_relationships USING gin(relationship_data);

-- RLS for relationships
ALTER TABLE public.collection_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage relationships" ON public.collection_relationships
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- AUDIT LOGS TABLE (Optional)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- RLS for audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own audit logs" ON public.audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow admins to read all audit logs" ON public.audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND (data->>'role' = 'admin' OR data->>'role' = 'super_admin')
        )
    );

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to safely extract JSONB values with defaults
CREATE OR REPLACE FUNCTION safe_jsonb_extract(data JSONB, key TEXT, default_val TEXT DEFAULT NULL)
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(data->>key, default_val);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user has permission for collection
CREATE OR REPLACE FUNCTION user_can_access_collection(
    collection_name TEXT,
    operation TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get current user's role
    SELECT data->>'role' INTO user_role 
    FROM public.users 
    WHERE id = auth.uid();
    
    -- Admin can do everything
    IF user_role IN ('admin', 'super_admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Staff can read most collections
    IF user_role = 'staff' AND operation = 'read' THEN
        RETURN TRUE;
    END IF;
    
    -- Customer can only read public collections
    IF user_role = 'customer' AND operation = 'read' THEN
        RETURN collection_name IN ('services', 'products', 'blog_posts', 'gallery');
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for full-text search across all collections
CREATE OR REPLACE FUNCTION search_collections(
    search_term TEXT,
    collection_filter TEXT[] DEFAULT NULL,
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE(
    collection_name TEXT,
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    rank REAL,
    data JSONB
) AS $$
DECLARE
    table_name TEXT;
    query TEXT := '';
    collections TEXT[] := ARRAY[
        'commerce', 'coupons', 'gift_cards', 'invoices', 'orders', 'payment_methods',
        'products', 'promotions', 'returns', 'shipping_methods', 'blog_posts', 'content',
        'faq', 'gallery', 'media', 'media_folders', 'navigation', 'navigation_menus',
        'pages_main', 'pages', 'redirects_main', 'redirects', 'seosettings', 'tags',
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
        -- Skip if collection filter is specified and this table is not in it
        IF collection_filter IS NOT NULL AND NOT (table_name = ANY(collection_filter)) THEN
            CONTINUE;
        END IF;
        
        -- Build UNION query for each table
        IF query != '' THEN
            query := query || ' UNION ALL ';
        END IF;
        
        query := query || format('
            SELECT %L::TEXT as collection_name,
                   t.id,
                   COALESCE(t.title, t.data->>''name'', ''Untitled'') as title,
                   t.slug,
                   LEFT(COALESCE(t.data->>''description'', t.data->>''content'', ''''), 200) as excerpt,
                   ts_rank_cd(t.search_vector, plainto_tsquery(%L)) as rank,
                   t.data
            FROM public.%I t
            WHERE t.search_vector @@ plainto_tsquery(%L)
              AND user_can_access_collection(%L, ''read'')
        ', table_name, search_term, table_name, search_term, table_name);
    END LOOP;
    
    -- Execute the complete query
    IF query != '' THEN
        query := query || format(' ORDER BY rank DESC LIMIT %s', limit_results);
        RETURN QUERY EXECUTE query;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
"""

    def generate_supabase_migration(self) -> str:
        """Generate complete Supabase migration file"""
        collections = self.collections_info.get('collections', [])
        migration_content = f"""-- =====================================================
-- SUPABASE MIGRATION: ModernMen Collections Schema
-- Generated at: {datetime.now().isoformat()}
-- Collections: {len(collections)}
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';

{self.generate_relationship_tables()}

-- =====================================================
-- COLLECTION TABLES
-- =====================================================
"""
        
        print(f"Generating Supabase schemas for {len(collections)} collections...")
        
        for collection in collections:
            table_name = self.pascale_to_snake(collection)
            schema = self.generate_supabase_table_schema(table_name, collection)
            migration_content += schema + "\n"
            print(f"Generated Supabase schema for {collection} -> {table_name}")
        
        migration_content += """
-- =====================================================
-- FINAL SETUP
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read permissions to anon users for public data
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Commit the transaction
COMMIT;
"""
        
        return migration_content

    def generate_typescript_queries(self) -> str:
        """Generate TypeScript query functions for Supabase"""
        collections = self.collections_info.get('collections', [])
        
        ts_content = f"""// =====================================================
// SUPABASE QUERIES: ModernMen Collections
// Generated at: {datetime.now().isoformat()}
// Collections: {len(collections)}
// =====================================================

import {{ createClient, SupabaseClient }} from '@supabase/supabase-js'
import {{ Database }} from './database.types'

// Import generated types
import {{
  {', '.join(collections)},
  {', '.join([f'Create{col}' for col in collections])},
  {', '.join([f'Update{col}' for col in collections])}
}} from './generated-types'

type SupabaseClientType = SupabaseClient<Database>

// =====================================================
// SUPABASE CLIENT SETUP
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// =====================================================
// GENERIC COLLECTION OPERATIONS
// =====================================================

export class SupabaseCollectionManager<T extends Record<string, any>> {{
  constructor(
    private client: SupabaseClientType,
    private tableName: string
  ) {{}}

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> {{
    const {{ data: result, error }} = await this.client
      .from(this.tableName)
      .insert({{ data }})
      .select()
      .single()

    if (error) throw error
    return result as T
  }}

  async findById(id: string): Promise<T | null> {{
    const {{ data, error }} = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as T
  }}

  async findBySlug(slug: string): Promise<T | null> {{
    const {{ data, error }} = await this.client
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as T
  }}

  async findMany({{
    page = 1,
    limit = 50,
    orderBy = 'created_at',
    orderDirection = 'desc',
    filters = {{}}
  }}: {{
    page?: number
    limit?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    filters?: Record<string, any>
  }} = {{}}): Promise<{{ data: T[], count: number }}> {{
    let query = this.client
      .from(this.tableName)
      .select('*', {{ count: 'exact' }})

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {{
      if (value !== undefined && value !== null) {{
        if (Array.isArray(value)) {{
          query = query.in(key, value)
        }} else if (typeof value === 'string' && value.includes('%')) {{
          query = query.like(key, value)
        }} else {{
          query = query.eq(key, value)
        }}
      }}
    }})

    // Apply pagination and ordering
    const from = (page - 1) * limit
    const to = from + limit - 1

    const {{ data, error, count }} = await query
      .order(orderBy, {{ ascending: orderDirection === 'asc' }})
      .range(from, to)

    if (error) throw error

    return {{
      data: (data as T[]) || [],
      count: count || 0
    }}
  }}

  async update(id: string, updates: Partial<T>): Promise<T | null> {{
    const {{ data, error }} = await this.client
      .from(this.tableName)
      .update({{ data: updates }})
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as T
  }}

  async delete(id: string): Promise<boolean> {{
    const {{ error }} = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }}

  async search(searchTerm: string, limit = 20): Promise<T[]> {{
    const {{ data, error }} = await this.client
      .rpc('search_collections', {{
        search_term: searchTerm,
        collection_filter: [this.tableName],
        limit_results: limit
      }})

    if (error) throw error
    return (data || []).map((item: any) => item.data as T)
  }}
}}

// =====================================================
// COLLECTION-SPECIFIC MANAGERS
// =====================================================
"""

        # Generate specific managers for each collection
        for collection in collections:
            table_name = self.pascale_to_snake(collection)
            
            ts_content += f"""
export class {collection}Manager extends SupabaseCollectionManager<{collection}> {{
  constructor(client: SupabaseClientType = supabase) {{
    super(client, '{table_name}')
  }}

  // Collection-specific methods can be added here
  async findPublished(): Promise<{collection}[]> {{
    const {{ data, error }} = await this.client
      .from('{table_name}')
      .select('*')
      .eq('status', 'published')
      .order('created_at', {{ ascending: false }})

    if (error) throw error
    return (data as {collection}[]) || []
  }}

  async findByStatus(status: string): Promise<{collection}[]> {{
    const {{ data, error }} = await this.client
      .from('{table_name}')
      .select('*')
      .eq('status', status)
      .order('created_at', {{ ascending: false }})

    if (error) throw error
    return (data as {collection}[]) || []
  }}
}}

export const {collection.lower()}Manager = new {collection}Manager()
"""

        # Add convenience exports
        ts_content += f"""

// =====================================================
// CONVENIENCE EXPORTS
// =====================================================

// Export all managers
export const collectionManagers = {{
{chr(10).join([f'  {collection.lower()}: {collection.lower()}Manager,' for collection in collections])}
}}

// Generic search across all collections
export async function searchAllCollections(
  searchTerm: string,
  collections?: string[],
  limit = 50
): Promise<Array<{{
  collection_name: string
  id: string
  title: string
  slug: string
  excerpt: string
  rank: number
  data: any
}}>> {{
  const {{ data, error }} = await supabase
    .rpc('search_collections', {{
      search_term: searchTerm,
      collection_filter: collections || null,
      limit_results: limit
    }})

  if (error) throw error
  return data || []
}}

// Get collection statistics
export async function getCollectionStats(): Promise<Array<{{
  collection_name: string
  record_count: number
  avg_data_size: number
  last_updated: string
}}>> {{
  const {{ data, error }} = await supabase
    .rpc('get_collection_stats')

  if (error) throw error
  return data || []
}}

// Batch operations
export async function batchCreate<T>(
  tableName: string,
  records: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>
): Promise<T[]> {{
  const {{ data, error }} = await supabase
    .from(tableName)
    .insert(records.map(record => ({{ data: record }})))
    .select()

  if (error) throw error
  return (data as T[]) || []
}}

export async function batchUpdate<T>(
  tableName: string,
  updates: Array<{{ id: string; data: Partial<T> }}>
): Promise<T[]> {{
  const results: T[] = []
  
  for (const update of updates) {{
    const {{ data, error }} = await supabase
      .from(tableName)
      .update({{ data: update.data }})
      .eq('id', update.id)
      .select()
      .single()

    if (error) throw error
    if (data) results.push(data as T)
  }}

  return results
}}

export async function batchDelete(
  tableName: string,
  ids: string[]
): Promise<boolean> {{
  const {{ error }} = await supabase
    .from(tableName)
    .delete()
    .in('id', ids)

  if (error) throw error
  return true
}}
"""

        return ts_content

    def save_files(self):
        """Save all generated files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save Supabase migration
        migration_file = f"supabase_migration_{timestamp}.sql"
        migration_content = self.generate_supabase_migration()
        with open(migration_file, 'w', encoding='utf-8') as f:
            f.write(migration_content)
        print(f"Supabase migration saved to: {migration_file}")
        
        # Save TypeScript queries
        queries_file = f"supabase-queries.ts"
        queries_content = self.generate_typescript_queries()
        with open(queries_file, 'w', encoding='utf-8') as f:
            f.write(queries_content)
        print(f"TypeScript queries saved to: {queries_file}")
        
        return migration_file, queries_file

    def run(self):
        """Main execution function"""
        print("Starting Supabase Schema and Query Generation...")
        
        if not self.collections_info.get('collections'):
            print("ERROR: No collections found. Run the type generation first.")
            return
        
        migration_file, queries_file = self.save_files()
        
        print("")
        print("Supabase Generation Complete!")
        print(f"Generated schemas for {len(self.collections_info.get('collections', []))} collections")
        print(f"Migration file: {migration_file}")
        print(f"TypeScript queries: {queries_file}")
        print("")
        print("Next steps:")
        print(f"1. Review and run: supabase db reset")
        print(f"2. Apply migration: supabase db push")
        print(f"3. Generate types: supabase gen types typescript --local > database.types.ts")
        print(f"4. Import queries in your app: import {{ collectionManagers }} from './{queries_file}'")

if __name__ == "__main__":
    generator = SupabaseSchemaGenerator()
    generator.run()