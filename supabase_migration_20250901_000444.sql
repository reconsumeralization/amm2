-- =====================================================
-- SUPABASE MIGRATION: ModernMen Collections Schema
-- Generated at: 2025-09-01T00:04:44.256455
-- Collections: 80
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Set timezone
SET timezone = 'UTC';


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


-- =====================================================
-- COLLECTION TABLES
-- =====================================================

-- =====================================================
-- Table: commerce (Commerce)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.commerce (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT commerce_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT commerce_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for commerce
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_commerce_created_at ON public.commerce(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_updated_at ON public.commerce(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_commerce_status ON public.commerce(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commerce_slug ON public.commerce(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_commerce_data_gin ON public.commerce USING gin(data);
CREATE INDEX IF NOT EXISTS idx_commerce_data_title ON public.commerce USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_commerce_data_status ON public.commerce USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_commerce_search ON public.commerce USING gin(search_vector);

-- =====================================================
-- RLS Policies for commerce
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.commerce ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.commerce
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.commerce
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for commerce
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_commerce_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_commerce_updated_at ON public.commerce;
CREATE TRIGGER trigger_commerce_updated_at
    BEFORE UPDATE ON public.commerce
    FOR EACH ROW
    EXECUTE FUNCTION update_commerce_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION commerce_audit_log()
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
        'commerce',
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
-- DROP TRIGGER IF EXISTS trigger_commerce_audit ON public.commerce;
-- CREATE TRIGGER trigger_commerce_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.commerce
--     FOR EACH ROW
--     EXECUTE FUNCTION commerce_audit_log();


-- =====================================================
-- Table: coupons (Coupons)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.coupons (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT coupons_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT coupons_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for coupons
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON public.coupons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_updated_at ON public.coupons(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON public.coupons(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_coupons_slug ON public.coupons(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_coupons_data_gin ON public.coupons USING gin(data);
CREATE INDEX IF NOT EXISTS idx_coupons_data_title ON public.coupons USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_coupons_data_status ON public.coupons USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_coupons_search ON public.coupons USING gin(search_vector);

-- =====================================================
-- RLS Policies for coupons
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.coupons
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.coupons
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for coupons
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_coupons_updated_at ON public.coupons;
CREATE TRIGGER trigger_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_coupons_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION coupons_audit_log()
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
        'coupons',
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
-- DROP TRIGGER IF EXISTS trigger_coupons_audit ON public.coupons;
-- CREATE TRIGGER trigger_coupons_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.coupons
--     FOR EACH ROW
--     EXECUTE FUNCTION coupons_audit_log();


-- =====================================================
-- Table: gift_cards (GiftCards)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gift_cards (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT gift_cards_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT gift_cards_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for gift_cards
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_gift_cards_created_at ON public.gift_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_cards_updated_at ON public.gift_cards(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON public.gift_cards(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gift_cards_slug ON public.gift_cards(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_gift_cards_data_gin ON public.gift_cards USING gin(data);
CREATE INDEX IF NOT EXISTS idx_gift_cards_data_title ON public.gift_cards USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_gift_cards_data_status ON public.gift_cards USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_gift_cards_search ON public.gift_cards USING gin(search_vector);

-- =====================================================
-- RLS Policies for gift_cards
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.gift_cards
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.gift_cards
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for gift_cards
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_gift_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_gift_cards_updated_at ON public.gift_cards;
CREATE TRIGGER trigger_gift_cards_updated_at
    BEFORE UPDATE ON public.gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_gift_cards_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION gift_cards_audit_log()
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
        'gift_cards',
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
-- DROP TRIGGER IF EXISTS trigger_gift_cards_audit ON public.gift_cards;
-- CREATE TRIGGER trigger_gift_cards_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.gift_cards
--     FOR EACH ROW
--     EXECUTE FUNCTION gift_cards_audit_log();


-- =====================================================
-- Table: invoices (Invoices)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.invoices (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT invoices_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT invoices_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for invoices
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_updated_at ON public.invoices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_slug ON public.invoices(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_invoices_data_gin ON public.invoices USING gin(data);
CREATE INDEX IF NOT EXISTS idx_invoices_data_title ON public.invoices USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_invoices_data_status ON public.invoices USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_invoices_search ON public.invoices USING gin(search_vector);

-- =====================================================
-- RLS Policies for invoices
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.invoices
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.invoices
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for invoices
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON public.invoices;
CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION invoices_audit_log()
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
        'invoices',
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
-- DROP TRIGGER IF EXISTS trigger_invoices_audit ON public.invoices;
-- CREATE TRIGGER trigger_invoices_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.invoices
--     FOR EACH ROW
--     EXECUTE FUNCTION invoices_audit_log();


-- =====================================================
-- Table: orders (Orders)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.orders (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT orders_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT orders_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for orders
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON public.orders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_slug ON public.orders(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_data_gin ON public.orders USING gin(data);
CREATE INDEX IF NOT EXISTS idx_orders_data_title ON public.orders USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_orders_data_status ON public.orders USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_orders_search ON public.orders USING gin(search_vector);

-- =====================================================
-- RLS Policies for orders
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.orders
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for orders
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION orders_audit_log()
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
        'orders',
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
-- DROP TRIGGER IF EXISTS trigger_orders_audit ON public.orders;
-- CREATE TRIGGER trigger_orders_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.orders
--     FOR EACH ROW
--     EXECUTE FUNCTION orders_audit_log();


-- =====================================================
-- Table: payment_methods (PaymentMethods)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_methods (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT payment_methods_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT payment_methods_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for payment_methods
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at ON public.payment_methods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_methods_updated_at ON public.payment_methods(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON public.payment_methods(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_methods_slug ON public.payment_methods(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_payment_methods_data_gin ON public.payment_methods USING gin(data);
CREATE INDEX IF NOT EXISTS idx_payment_methods_data_title ON public.payment_methods USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_payment_methods_data_status ON public.payment_methods USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_payment_methods_search ON public.payment_methods USING gin(search_vector);

-- =====================================================
-- RLS Policies for payment_methods
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.payment_methods
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.payment_methods
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for payment_methods
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER trigger_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_methods_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION payment_methods_audit_log()
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
        'payment_methods',
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
-- DROP TRIGGER IF EXISTS trigger_payment_methods_audit ON public.payment_methods;
-- CREATE TRIGGER trigger_payment_methods_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.payment_methods
--     FOR EACH ROW
--     EXECUTE FUNCTION payment_methods_audit_log();


-- =====================================================
-- Table: products (Products)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.products (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT products_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT products_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for products
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_data_gin ON public.products USING gin(data);
CREATE INDEX IF NOT EXISTS idx_products_data_title ON public.products USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_products_data_status ON public.products USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin(search_vector);

-- =====================================================
-- RLS Policies for products
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.products
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for products
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION products_audit_log()
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
        'products',
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
-- DROP TRIGGER IF EXISTS trigger_products_audit ON public.products;
-- CREATE TRIGGER trigger_products_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.products
--     FOR EACH ROW
--     EXECUTE FUNCTION products_audit_log();


-- =====================================================
-- Table: promotions (Promotions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.promotions (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT promotions_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT promotions_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for promotions
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON public.promotions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_updated_at ON public.promotions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON public.promotions(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_promotions_slug ON public.promotions(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_promotions_data_gin ON public.promotions USING gin(data);
CREATE INDEX IF NOT EXISTS idx_promotions_data_title ON public.promotions USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_promotions_data_status ON public.promotions USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_promotions_search ON public.promotions USING gin(search_vector);

-- =====================================================
-- RLS Policies for promotions
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.promotions
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.promotions
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for promotions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_promotions_updated_at ON public.promotions;
CREATE TRIGGER trigger_promotions_updated_at
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_promotions_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION promotions_audit_log()
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
        'promotions',
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
-- DROP TRIGGER IF EXISTS trigger_promotions_audit ON public.promotions;
-- CREATE TRIGGER trigger_promotions_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.promotions
--     FOR EACH ROW
--     EXECUTE FUNCTION promotions_audit_log();


-- =====================================================
-- Table: returns (Returns)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.returns (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT returns_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT returns_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for returns
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON public.returns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_updated_at ON public.returns(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_status ON public.returns(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_returns_slug ON public.returns(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_returns_data_gin ON public.returns USING gin(data);
CREATE INDEX IF NOT EXISTS idx_returns_data_title ON public.returns USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_returns_data_status ON public.returns USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_returns_search ON public.returns USING gin(search_vector);

-- =====================================================
-- RLS Policies for returns
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.returns
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.returns
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for returns
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_returns_updated_at ON public.returns;
CREATE TRIGGER trigger_returns_updated_at
    BEFORE UPDATE ON public.returns
    FOR EACH ROW
    EXECUTE FUNCTION update_returns_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION returns_audit_log()
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
        'returns',
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
-- DROP TRIGGER IF EXISTS trigger_returns_audit ON public.returns;
-- CREATE TRIGGER trigger_returns_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.returns
--     FOR EACH ROW
--     EXECUTE FUNCTION returns_audit_log();


-- =====================================================
-- Table: shipping_methods (ShippingMethods)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.shipping_methods (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT shipping_methods_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT shipping_methods_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for shipping_methods
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_shipping_methods_created_at ON public.shipping_methods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_updated_at ON public.shipping_methods(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_status ON public.shipping_methods(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shipping_methods_slug ON public.shipping_methods(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_shipping_methods_data_gin ON public.shipping_methods USING gin(data);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_data_title ON public.shipping_methods USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_shipping_methods_data_status ON public.shipping_methods USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_shipping_methods_search ON public.shipping_methods USING gin(search_vector);

-- =====================================================
-- RLS Policies for shipping_methods
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.shipping_methods
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.shipping_methods
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for shipping_methods
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipping_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_shipping_methods_updated_at ON public.shipping_methods;
CREATE TRIGGER trigger_shipping_methods_updated_at
    BEFORE UPDATE ON public.shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_shipping_methods_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION shipping_methods_audit_log()
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
        'shipping_methods',
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
-- DROP TRIGGER IF EXISTS trigger_shipping_methods_audit ON public.shipping_methods;
-- CREATE TRIGGER trigger_shipping_methods_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.shipping_methods
--     FOR EACH ROW
--     EXECUTE FUNCTION shipping_methods_audit_log();


-- =====================================================
-- Table: blog_posts (BlogPosts)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT blog_posts_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT blog_posts_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for blog_posts
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_at ON public.blog_posts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_blog_posts_data_gin ON public.blog_posts USING gin(data);
CREATE INDEX IF NOT EXISTS idx_blog_posts_data_title ON public.blog_posts USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_blog_posts_data_status ON public.blog_posts USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON public.blog_posts USING gin(search_vector);

-- =====================================================
-- RLS Policies for blog_posts
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.blog_posts
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.blog_posts
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for blog_posts
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION blog_posts_audit_log()
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
        'blog_posts',
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
-- DROP TRIGGER IF EXISTS trigger_blog_posts_audit ON public.blog_posts;
-- CREATE TRIGGER trigger_blog_posts_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
--     FOR EACH ROW
--     EXECUTE FUNCTION blog_posts_audit_log();


-- =====================================================
-- Table: content (Content)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.content (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT content_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT content_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for content
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_updated_at ON public.content(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_content_data_gin ON public.content USING gin(data);
CREATE INDEX IF NOT EXISTS idx_content_data_title ON public.content USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_content_data_status ON public.content USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_content_search ON public.content USING gin(search_vector);

-- =====================================================
-- RLS Policies for content
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.content
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.content
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for content
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_content_updated_at ON public.content;
CREATE TRIGGER trigger_content_updated_at
    BEFORE UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION update_content_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION content_audit_log()
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
        'content',
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
-- DROP TRIGGER IF EXISTS trigger_content_audit ON public.content;
-- CREATE TRIGGER trigger_content_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.content
--     FOR EACH ROW
--     EXECUTE FUNCTION content_audit_log();


-- =====================================================
-- Table: faq (FAQ)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.faq (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT faq_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT faq_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for faq
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_faq_created_at ON public.faq(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_faq_updated_at ON public.faq(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_faq_status ON public.faq(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_faq_slug ON public.faq(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_faq_data_gin ON public.faq USING gin(data);
CREATE INDEX IF NOT EXISTS idx_faq_data_title ON public.faq USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_faq_data_status ON public.faq USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_faq_search ON public.faq USING gin(search_vector);

-- =====================================================
-- RLS Policies for faq
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.faq
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.faq
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for faq
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_faq_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_faq_updated_at ON public.faq;
CREATE TRIGGER trigger_faq_updated_at
    BEFORE UPDATE ON public.faq
    FOR EACH ROW
    EXECUTE FUNCTION update_faq_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION faq_audit_log()
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
        'faq',
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
-- DROP TRIGGER IF EXISTS trigger_faq_audit ON public.faq;
-- CREATE TRIGGER trigger_faq_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.faq
--     FOR EACH ROW
--     EXECUTE FUNCTION faq_audit_log();


-- =====================================================
-- Table: gallery (Gallery)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gallery (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT gallery_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT gallery_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for gallery
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_updated_at ON public.gallery(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_status ON public.gallery(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gallery_slug ON public.gallery(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_gallery_data_gin ON public.gallery USING gin(data);
CREATE INDEX IF NOT EXISTS idx_gallery_data_title ON public.gallery USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_gallery_data_status ON public.gallery USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_gallery_search ON public.gallery USING gin(search_vector);

-- =====================================================
-- RLS Policies for gallery
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.gallery
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.gallery
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for gallery
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_gallery_updated_at ON public.gallery;
CREATE TRIGGER trigger_gallery_updated_at
    BEFORE UPDATE ON public.gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_gallery_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION gallery_audit_log()
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
        'gallery',
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
-- DROP TRIGGER IF EXISTS trigger_gallery_audit ON public.gallery;
-- CREATE TRIGGER trigger_gallery_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.gallery
--     FOR EACH ROW
--     EXECUTE FUNCTION gallery_audit_log();


-- =====================================================
-- Table: media (Media)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.media (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT media_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT media_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for media
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_updated_at ON public.media(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_status ON public.media(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_slug ON public.media(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_media_data_gin ON public.media USING gin(data);
CREATE INDEX IF NOT EXISTS idx_media_data_title ON public.media USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_media_data_status ON public.media USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_media_search ON public.media USING gin(search_vector);

-- =====================================================
-- RLS Policies for media
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.media
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.media
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for media
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_media_updated_at ON public.media;
CREATE TRIGGER trigger_media_updated_at
    BEFORE UPDATE ON public.media
    FOR EACH ROW
    EXECUTE FUNCTION update_media_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION media_audit_log()
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
        'media',
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
-- DROP TRIGGER IF EXISTS trigger_media_audit ON public.media;
-- CREATE TRIGGER trigger_media_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.media
--     FOR EACH ROW
--     EXECUTE FUNCTION media_audit_log();


-- =====================================================
-- Table: media_folders (MediaFolders)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.media_folders (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT media_folders_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT media_folders_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for media_folders
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_media_folders_created_at ON public.media_folders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folders_updated_at ON public.media_folders(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_folders_status ON public.media_folders(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON public.media_folders(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_media_folders_data_gin ON public.media_folders USING gin(data);
CREATE INDEX IF NOT EXISTS idx_media_folders_data_title ON public.media_folders USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_media_folders_data_status ON public.media_folders USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_media_folders_search ON public.media_folders USING gin(search_vector);

-- =====================================================
-- RLS Policies for media_folders
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.media_folders
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.media_folders
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for media_folders
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_media_folders_updated_at ON public.media_folders;
CREATE TRIGGER trigger_media_folders_updated_at
    BEFORE UPDATE ON public.media_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_media_folders_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION media_folders_audit_log()
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
        'media_folders',
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
-- DROP TRIGGER IF EXISTS trigger_media_folders_audit ON public.media_folders;
-- CREATE TRIGGER trigger_media_folders_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.media_folders
--     FOR EACH ROW
--     EXECUTE FUNCTION media_folders_audit_log();


-- =====================================================
-- Table: navigation (Navigation)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.navigation (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT navigation_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT navigation_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for navigation
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_navigation_created_at ON public.navigation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_updated_at ON public.navigation(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_status ON public.navigation(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_navigation_slug ON public.navigation(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_navigation_data_gin ON public.navigation USING gin(data);
CREATE INDEX IF NOT EXISTS idx_navigation_data_title ON public.navigation USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_navigation_data_status ON public.navigation USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_navigation_search ON public.navigation USING gin(search_vector);

-- =====================================================
-- RLS Policies for navigation
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.navigation
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.navigation
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for navigation
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_navigation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_navigation_updated_at ON public.navigation;
CREATE TRIGGER trigger_navigation_updated_at
    BEFORE UPDATE ON public.navigation
    FOR EACH ROW
    EXECUTE FUNCTION update_navigation_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION navigation_audit_log()
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
        'navigation',
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
-- DROP TRIGGER IF EXISTS trigger_navigation_audit ON public.navigation;
-- CREATE TRIGGER trigger_navigation_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.navigation
--     FOR EACH ROW
--     EXECUTE FUNCTION navigation_audit_log();


-- =====================================================
-- Table: navigation_menus (NavigationMenus)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.navigation_menus (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT navigation_menus_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT navigation_menus_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for navigation_menus
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_navigation_menus_created_at ON public.navigation_menus(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_updated_at ON public.navigation_menus(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_status ON public.navigation_menus(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_navigation_menus_slug ON public.navigation_menus(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_navigation_menus_data_gin ON public.navigation_menus USING gin(data);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_data_title ON public.navigation_menus USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_navigation_menus_data_status ON public.navigation_menus USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_navigation_menus_search ON public.navigation_menus USING gin(search_vector);

-- =====================================================
-- RLS Policies for navigation_menus
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.navigation_menus
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.navigation_menus
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for navigation_menus
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_navigation_menus_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_navigation_menus_updated_at ON public.navigation_menus;
CREATE TRIGGER trigger_navigation_menus_updated_at
    BEFORE UPDATE ON public.navigation_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_navigation_menus_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION navigation_menus_audit_log()
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
        'navigation_menus',
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
-- DROP TRIGGER IF EXISTS trigger_navigation_menus_audit ON public.navigation_menus;
-- CREATE TRIGGER trigger_navigation_menus_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.navigation_menus
--     FOR EACH ROW
--     EXECUTE FUNCTION navigation_menus_audit_log();


-- =====================================================
-- Table: pages_main (PagesMain)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pages_main (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT pages_main_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT pages_main_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for pages_main
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_pages_main_created_at ON public.pages_main(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_main_updated_at ON public.pages_main(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_main_status ON public.pages_main(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pages_main_slug ON public.pages_main(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pages_main_data_gin ON public.pages_main USING gin(data);
CREATE INDEX IF NOT EXISTS idx_pages_main_data_title ON public.pages_main USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_pages_main_data_status ON public.pages_main USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_pages_main_search ON public.pages_main USING gin(search_vector);

-- =====================================================
-- RLS Policies for pages_main
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.pages_main ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.pages_main
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.pages_main
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for pages_main
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_main_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_pages_main_updated_at ON public.pages_main;
CREATE TRIGGER trigger_pages_main_updated_at
    BEFORE UPDATE ON public.pages_main
    FOR EACH ROW
    EXECUTE FUNCTION update_pages_main_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION pages_main_audit_log()
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
        'pages_main',
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
-- DROP TRIGGER IF EXISTS trigger_pages_main_audit ON public.pages_main;
-- CREATE TRIGGER trigger_pages_main_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.pages_main
--     FOR EACH ROW
--     EXECUTE FUNCTION pages_main_audit_log();


-- =====================================================
-- Table: pages (Pages)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.pages (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT pages_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT pages_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for pages
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON public.pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON public.pages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_pages_data_gin ON public.pages USING gin(data);
CREATE INDEX IF NOT EXISTS idx_pages_data_title ON public.pages USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_pages_data_status ON public.pages USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_pages_search ON public.pages USING gin(search_vector);

-- =====================================================
-- RLS Policies for pages
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.pages
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.pages
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for pages
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_pages_updated_at ON public.pages;
CREATE TRIGGER trigger_pages_updated_at
    BEFORE UPDATE ON public.pages
    FOR EACH ROW
    EXECUTE FUNCTION update_pages_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION pages_audit_log()
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
        'pages',
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
-- DROP TRIGGER IF EXISTS trigger_pages_audit ON public.pages;
-- CREATE TRIGGER trigger_pages_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.pages
--     FOR EACH ROW
--     EXECUTE FUNCTION pages_audit_log();


-- =====================================================
-- Table: products (Products)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.products (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT products_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT products_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for products
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_data_gin ON public.products USING gin(data);
CREATE INDEX IF NOT EXISTS idx_products_data_title ON public.products USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_products_data_status ON public.products USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_products_search ON public.products USING gin(search_vector);

-- =====================================================
-- RLS Policies for products
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.products
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for products
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION products_audit_log()
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
        'products',
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
-- DROP TRIGGER IF EXISTS trigger_products_audit ON public.products;
-- CREATE TRIGGER trigger_products_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.products
--     FOR EACH ROW
--     EXECUTE FUNCTION products_audit_log();


-- =====================================================
-- Table: redirects_main (RedirectsMain)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.redirects_main (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT redirects_main_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT redirects_main_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for redirects_main
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_redirects_main_created_at ON public.redirects_main(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redirects_main_updated_at ON public.redirects_main(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_redirects_main_status ON public.redirects_main(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_redirects_main_slug ON public.redirects_main(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_redirects_main_data_gin ON public.redirects_main USING gin(data);
CREATE INDEX IF NOT EXISTS idx_redirects_main_data_title ON public.redirects_main USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_redirects_main_data_status ON public.redirects_main USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_redirects_main_search ON public.redirects_main USING gin(search_vector);

-- =====================================================
-- RLS Policies for redirects_main
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.redirects_main ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.redirects_main
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.redirects_main
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for redirects_main
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_redirects_main_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_redirects_main_updated_at ON public.redirects_main;
CREATE TRIGGER trigger_redirects_main_updated_at
    BEFORE UPDATE ON public.redirects_main
    FOR EACH ROW
    EXECUTE FUNCTION update_redirects_main_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION redirects_main_audit_log()
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
        'redirects_main',
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
-- DROP TRIGGER IF EXISTS trigger_redirects_main_audit ON public.redirects_main;
-- CREATE TRIGGER trigger_redirects_main_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.redirects_main
--     FOR EACH ROW
--     EXECUTE FUNCTION redirects_main_audit_log();


-- =====================================================
-- Table: redirects (Redirects)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.redirects (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT redirects_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT redirects_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for redirects
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_redirects_created_at ON public.redirects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redirects_updated_at ON public.redirects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_redirects_status ON public.redirects(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_redirects_slug ON public.redirects(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_redirects_data_gin ON public.redirects USING gin(data);
CREATE INDEX IF NOT EXISTS idx_redirects_data_title ON public.redirects USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_redirects_data_status ON public.redirects USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_redirects_search ON public.redirects USING gin(search_vector);

-- =====================================================
-- RLS Policies for redirects
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.redirects
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.redirects
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for redirects
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_redirects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_redirects_updated_at ON public.redirects;
CREATE TRIGGER trigger_redirects_updated_at
    BEFORE UPDATE ON public.redirects
    FOR EACH ROW
    EXECUTE FUNCTION update_redirects_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION redirects_audit_log()
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
        'redirects',
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
-- DROP TRIGGER IF EXISTS trigger_redirects_audit ON public.redirects;
-- CREATE TRIGGER trigger_redirects_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.redirects
--     FOR EACH ROW
--     EXECUTE FUNCTION redirects_audit_log();


-- =====================================================
-- Table: seosettings (SEOSettings)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.seosettings (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT seosettings_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT seosettings_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for seosettings
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_seosettings_created_at ON public.seosettings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seosettings_updated_at ON public.seosettings(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_seosettings_status ON public.seosettings(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_seosettings_slug ON public.seosettings(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_seosettings_data_gin ON public.seosettings USING gin(data);
CREATE INDEX IF NOT EXISTS idx_seosettings_data_title ON public.seosettings USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_seosettings_data_status ON public.seosettings USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_seosettings_search ON public.seosettings USING gin(search_vector);

-- =====================================================
-- RLS Policies for seosettings
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.seosettings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.seosettings
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.seosettings
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for seosettings
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_seosettings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_seosettings_updated_at ON public.seosettings;
CREATE TRIGGER trigger_seosettings_updated_at
    BEFORE UPDATE ON public.seosettings
    FOR EACH ROW
    EXECUTE FUNCTION update_seosettings_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION seosettings_audit_log()
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
        'seosettings',
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
-- DROP TRIGGER IF EXISTS trigger_seosettings_audit ON public.seosettings;
-- CREATE TRIGGER trigger_seosettings_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.seosettings
--     FOR EACH ROW
--     EXECUTE FUNCTION seosettings_audit_log();


-- =====================================================
-- Table: tags (Tags)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tags (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT tags_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT tags_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for tags
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON public.tags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_updated_at ON public.tags(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_status ON public.tags(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tags_data_gin ON public.tags USING gin(data);
CREATE INDEX IF NOT EXISTS idx_tags_data_title ON public.tags USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_tags_data_status ON public.tags USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_tags_search ON public.tags USING gin(search_vector);

-- =====================================================
-- RLS Policies for tags
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.tags
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for tags
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_tags_updated_at ON public.tags;
CREATE TRIGGER trigger_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION update_tags_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION tags_audit_log()
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
        'tags',
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
-- DROP TRIGGER IF EXISTS trigger_tags_audit ON public.tags;
-- CREATE TRIGGER trigger_tags_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.tags
--     FOR EACH ROW
--     EXECUTE FUNCTION tags_audit_log();


-- =====================================================
-- Table: appointments_main (AppointmentsMain)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.appointments_main (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT appointments_main_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT appointments_main_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for appointments_main
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_appointments_main_created_at ON public.appointments_main(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_main_updated_at ON public.appointments_main(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_main_status ON public.appointments_main(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_main_slug ON public.appointments_main(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_appointments_main_data_gin ON public.appointments_main USING gin(data);
CREATE INDEX IF NOT EXISTS idx_appointments_main_data_title ON public.appointments_main USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_appointments_main_data_status ON public.appointments_main USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_appointments_main_search ON public.appointments_main USING gin(search_vector);

-- =====================================================
-- RLS Policies for appointments_main
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.appointments_main ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.appointments_main
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.appointments_main
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for appointments_main
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_main_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_appointments_main_updated_at ON public.appointments_main;
CREATE TRIGGER trigger_appointments_main_updated_at
    BEFORE UPDATE ON public.appointments_main
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_main_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION appointments_main_audit_log()
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
        'appointments_main',
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
-- DROP TRIGGER IF EXISTS trigger_appointments_main_audit ON public.appointments_main;
-- CREATE TRIGGER trigger_appointments_main_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.appointments_main
--     FOR EACH ROW
--     EXECUTE FUNCTION appointments_main_audit_log();


-- =====================================================
-- Table: cancellations (Cancellations)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.cancellations (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT cancellations_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT cancellations_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for cancellations
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON public.cancellations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cancellations_updated_at ON public.cancellations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cancellations_status ON public.cancellations(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cancellations_slug ON public.cancellations(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_cancellations_data_gin ON public.cancellations USING gin(data);
CREATE INDEX IF NOT EXISTS idx_cancellations_data_title ON public.cancellations USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_cancellations_data_status ON public.cancellations USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_cancellations_search ON public.cancellations USING gin(search_vector);

-- =====================================================
-- RLS Policies for cancellations
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.cancellations
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.cancellations
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for cancellations
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_cancellations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_cancellations_updated_at ON public.cancellations;
CREATE TRIGGER trigger_cancellations_updated_at
    BEFORE UPDATE ON public.cancellations
    FOR EACH ROW
    EXECUTE FUNCTION update_cancellations_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION cancellations_audit_log()
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
        'cancellations',
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
-- DROP TRIGGER IF EXISTS trigger_cancellations_audit ON public.cancellations;
-- CREATE TRIGGER trigger_cancellations_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.cancellations
--     FOR EACH ROW
--     EXECUTE FUNCTION cancellations_audit_log();


-- =====================================================
-- Table: chatbot (Chatbot)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chatbot (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT chatbot_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT chatbot_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for chatbot
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_created_at ON public.chatbot(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_updated_at ON public.chatbot(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_status ON public.chatbot(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_slug ON public.chatbot(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chatbot_data_gin ON public.chatbot USING gin(data);
CREATE INDEX IF NOT EXISTS idx_chatbot_data_title ON public.chatbot USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_chatbot_data_status ON public.chatbot USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chatbot_search ON public.chatbot USING gin(search_vector);

-- =====================================================
-- RLS Policies for chatbot
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.chatbot ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.chatbot
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.chatbot
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for chatbot
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatbot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_chatbot_updated_at ON public.chatbot;
CREATE TRIGGER trigger_chatbot_updated_at
    BEFORE UPDATE ON public.chatbot
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION chatbot_audit_log()
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
        'chatbot',
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
-- DROP TRIGGER IF EXISTS trigger_chatbot_audit ON public.chatbot;
-- CREATE TRIGGER trigger_chatbot_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.chatbot
--     FOR EACH ROW
--     EXECUTE FUNCTION chatbot_audit_log();


-- =====================================================
-- Table: chat_conversations (ChatConversations)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT chat_conversations_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT chat_conversations_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for chat_conversations
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON public.chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_slug ON public.chat_conversations(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_gin ON public.chat_conversations USING gin(data);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_title ON public.chat_conversations USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_status ON public.chat_conversations USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chat_conversations_search ON public.chat_conversations USING gin(search_vector);

-- =====================================================
-- RLS Policies for chat_conversations
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.chat_conversations
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.chat_conversations
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for chat_conversations
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER trigger_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversations_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION chat_conversations_audit_log()
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
        'chat_conversations',
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
-- DROP TRIGGER IF EXISTS trigger_chat_conversations_audit ON public.chat_conversations;
-- CREATE TRIGGER trigger_chat_conversations_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.chat_conversations
--     FOR EACH ROW
--     EXECUTE FUNCTION chat_conversations_audit_log();


-- =====================================================
-- Table: chat_messages (ChatMessages)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT chat_messages_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT chat_messages_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for chat_messages
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_updated_at ON public.chat_messages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON public.chat_messages(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_slug ON public.chat_messages(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chat_messages_data_gin ON public.chat_messages USING gin(data);
CREATE INDEX IF NOT EXISTS idx_chat_messages_data_title ON public.chat_messages USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_chat_messages_data_status ON public.chat_messages USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chat_messages_search ON public.chat_messages USING gin(search_vector);

-- =====================================================
-- RLS Policies for chat_messages
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.chat_messages
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.chat_messages
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for chat_messages
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_chat_messages_updated_at ON public.chat_messages;
CREATE TRIGGER trigger_chat_messages_updated_at
    BEFORE UPDATE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_messages_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION chat_messages_audit_log()
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
        'chat_messages',
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
-- DROP TRIGGER IF EXISTS trigger_chat_messages_audit ON public.chat_messages;
-- CREATE TRIGGER trigger_chat_messages_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.chat_messages
--     FOR EACH ROW
--     EXECUTE FUNCTION chat_messages_audit_log();


-- =====================================================
-- Table: contacts (Contacts)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.contacts (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT contacts_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT contacts_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for contacts
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON public.contacts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_slug ON public.contacts(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_contacts_data_gin ON public.contacts USING gin(data);
CREATE INDEX IF NOT EXISTS idx_contacts_data_title ON public.contacts USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_contacts_data_status ON public.contacts USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_contacts_search ON public.contacts USING gin(search_vector);

-- =====================================================
-- RLS Policies for contacts
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.contacts
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.contacts
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for contacts
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_contacts_updated_at ON public.contacts;
CREATE TRIGGER trigger_contacts_updated_at
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_contacts_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION contacts_audit_log()
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
        'contacts',
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
-- DROP TRIGGER IF EXISTS trigger_contacts_audit ON public.contacts;
-- CREATE TRIGGER trigger_contacts_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.contacts
--     FOR EACH ROW
--     EXECUTE FUNCTION contacts_audit_log();


-- =====================================================
-- Table: customer_notes (CustomerNotes)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customer_notes (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT customer_notes_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT customer_notes_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for customer_notes
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON public.customer_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notes_updated_at ON public.customer_notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_notes_status ON public.customer_notes(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_notes_slug ON public.customer_notes(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customer_notes_data_gin ON public.customer_notes USING gin(data);
CREATE INDEX IF NOT EXISTS idx_customer_notes_data_title ON public.customer_notes USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_customer_notes_data_status ON public.customer_notes USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_customer_notes_search ON public.customer_notes USING gin(search_vector);

-- =====================================================
-- RLS Policies for customer_notes
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.customer_notes
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.customer_notes
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for customer_notes
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_customer_notes_updated_at ON public.customer_notes;
CREATE TRIGGER trigger_customer_notes_updated_at
    BEFORE UPDATE ON public.customer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_notes_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION customer_notes_audit_log()
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
        'customer_notes',
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
-- DROP TRIGGER IF EXISTS trigger_customer_notes_audit ON public.customer_notes;
-- CREATE TRIGGER trigger_customer_notes_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.customer_notes
--     FOR EACH ROW
--     EXECUTE FUNCTION customer_notes_audit_log();


-- =====================================================
-- Table: customers_main (CustomersMain)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customers_main (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT customers_main_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT customers_main_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for customers_main
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_customers_main_created_at ON public.customers_main(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_main_updated_at ON public.customers_main(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_main_status ON public.customers_main(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_main_slug ON public.customers_main(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customers_main_data_gin ON public.customers_main USING gin(data);
CREATE INDEX IF NOT EXISTS idx_customers_main_data_title ON public.customers_main USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_customers_main_data_status ON public.customers_main USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_customers_main_search ON public.customers_main USING gin(search_vector);

-- =====================================================
-- RLS Policies for customers_main
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.customers_main ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.customers_main
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.customers_main
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for customers_main
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_main_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_customers_main_updated_at ON public.customers_main;
CREATE TRIGGER trigger_customers_main_updated_at
    BEFORE UPDATE ON public.customers_main
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_main_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION customers_main_audit_log()
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
        'customers_main',
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
-- DROP TRIGGER IF EXISTS trigger_customers_main_audit ON public.customers_main;
-- CREATE TRIGGER trigger_customers_main_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.customers_main
--     FOR EACH ROW
--     EXECUTE FUNCTION customers_main_audit_log();


-- =====================================================
-- Table: customers (Customers)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customers (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT customers_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT customers_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for customers
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON public.customers(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_slug ON public.customers(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customers_data_gin ON public.customers USING gin(data);
CREATE INDEX IF NOT EXISTS idx_customers_data_title ON public.customers USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_customers_data_status ON public.customers USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_customers_search ON public.customers USING gin(search_vector);

-- =====================================================
-- RLS Policies for customers
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.customers
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for customers
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_customers_updated_at ON public.customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION customers_audit_log()
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
        'customers',
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
-- DROP TRIGGER IF EXISTS trigger_customers_audit ON public.customers;
-- CREATE TRIGGER trigger_customers_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.customers
--     FOR EACH ROW
--     EXECUTE FUNCTION customers_audit_log();


-- =====================================================
-- Table: customer_tags (CustomerTags)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.customer_tags (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT customer_tags_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT customer_tags_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for customer_tags
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_customer_tags_created_at ON public.customer_tags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_tags_updated_at ON public.customer_tags(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_tags_status ON public.customer_tags(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customer_tags_slug ON public.customer_tags(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_customer_tags_data_gin ON public.customer_tags USING gin(data);
CREATE INDEX IF NOT EXISTS idx_customer_tags_data_title ON public.customer_tags USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_customer_tags_data_status ON public.customer_tags USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_customer_tags_search ON public.customer_tags USING gin(search_vector);

-- =====================================================
-- RLS Policies for customer_tags
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.customer_tags
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.customer_tags
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for customer_tags
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_customer_tags_updated_at ON public.customer_tags;
CREATE TRIGGER trigger_customer_tags_updated_at
    BEFORE UPDATE ON public.customer_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_tags_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION customer_tags_audit_log()
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
        'customer_tags',
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
-- DROP TRIGGER IF EXISTS trigger_customer_tags_audit ON public.customer_tags;
-- CREATE TRIGGER trigger_customer_tags_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.customer_tags
--     FOR EACH ROW
--     EXECUTE FUNCTION customer_tags_audit_log();


-- =====================================================
-- Table: email_campaigns (EmailCampaigns)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_campaigns (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT email_campaigns_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT email_campaigns_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for email_campaigns
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON public.email_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_updated_at ON public.email_campaigns(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_campaigns_slug ON public.email_campaigns(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_data_gin ON public.email_campaigns USING gin(data);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_data_title ON public.email_campaigns USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_email_campaigns_data_status ON public.email_campaigns USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_email_campaigns_search ON public.email_campaigns USING gin(search_vector);

-- =====================================================
-- RLS Policies for email_campaigns
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.email_campaigns
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.email_campaigns
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for email_campaigns
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER trigger_email_campaigns_updated_at
    BEFORE UPDATE ON public.email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_email_campaigns_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION email_campaigns_audit_log()
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
        'email_campaigns',
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
-- DROP TRIGGER IF EXISTS trigger_email_campaigns_audit ON public.email_campaigns;
-- CREATE TRIGGER trigger_email_campaigns_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.email_campaigns
--     FOR EACH ROW
--     EXECUTE FUNCTION email_campaigns_audit_log();


-- =====================================================
-- Table: loyalty_program (LoyaltyProgram)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.loyalty_program (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT loyalty_program_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT loyalty_program_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for loyalty_program
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_program_created_at ON public.loyalty_program(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_program_updated_at ON public.loyalty_program(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_program_status ON public.loyalty_program(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_loyalty_program_slug ON public.loyalty_program(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_loyalty_program_data_gin ON public.loyalty_program USING gin(data);
CREATE INDEX IF NOT EXISTS idx_loyalty_program_data_title ON public.loyalty_program USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_loyalty_program_data_status ON public.loyalty_program USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_loyalty_program_search ON public.loyalty_program USING gin(search_vector);

-- =====================================================
-- RLS Policies for loyalty_program
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.loyalty_program ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.loyalty_program
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.loyalty_program
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for loyalty_program
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_loyalty_program_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_loyalty_program_updated_at ON public.loyalty_program;
CREATE TRIGGER trigger_loyalty_program_updated_at
    BEFORE UPDATE ON public.loyalty_program
    FOR EACH ROW
    EXECUTE FUNCTION update_loyalty_program_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION loyalty_program_audit_log()
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
        'loyalty_program',
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
-- DROP TRIGGER IF EXISTS trigger_loyalty_program_audit ON public.loyalty_program;
-- CREATE TRIGGER trigger_loyalty_program_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.loyalty_program
--     FOR EACH ROW
--     EXECUTE FUNCTION loyalty_program_audit_log();


-- =====================================================
-- Table: reviews (Reviews)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT reviews_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT reviews_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for reviews
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_updated_at ON public.reviews(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_slug ON public.reviews(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_reviews_data_gin ON public.reviews USING gin(data);
CREATE INDEX IF NOT EXISTS idx_reviews_data_title ON public.reviews USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_reviews_data_status ON public.reviews USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_reviews_search ON public.reviews USING gin(search_vector);

-- =====================================================
-- RLS Policies for reviews
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.reviews
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.reviews
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for reviews
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION reviews_audit_log()
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
        'reviews',
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
-- DROP TRIGGER IF EXISTS trigger_reviews_audit ON public.reviews;
-- CREATE TRIGGER trigger_reviews_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.reviews
--     FOR EACH ROW
--     EXECUTE FUNCTION reviews_audit_log();


-- =====================================================
-- Table: subscriptions (Subscriptions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT subscriptions_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT subscriptions_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for subscriptions
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_at ON public.subscriptions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_slug ON public.subscriptions(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_subscriptions_data_gin ON public.subscriptions USING gin(data);
CREATE INDEX IF NOT EXISTS idx_subscriptions_data_title ON public.subscriptions USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_subscriptions_data_status ON public.subscriptions USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_subscriptions_search ON public.subscriptions USING gin(search_vector);

-- =====================================================
-- RLS Policies for subscriptions
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.subscriptions
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.subscriptions
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for subscriptions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trigger_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION subscriptions_audit_log()
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
        'subscriptions',
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
-- DROP TRIGGER IF EXISTS trigger_subscriptions_audit ON public.subscriptions;
-- CREATE TRIGGER trigger_subscriptions_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
--     FOR EACH ROW
--     EXECUTE FUNCTION subscriptions_audit_log();


-- =====================================================
-- Table: testimonials (Testimonials)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.testimonials (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT testimonials_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT testimonials_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for testimonials
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_updated_at ON public.testimonials(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_testimonials_slug ON public.testimonials(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_testimonials_data_gin ON public.testimonials USING gin(data);
CREATE INDEX IF NOT EXISTS idx_testimonials_data_title ON public.testimonials USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_testimonials_data_status ON public.testimonials USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_testimonials_search ON public.testimonials USING gin(search_vector);

-- =====================================================
-- RLS Policies for testimonials
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.testimonials
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.testimonials
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for testimonials
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER trigger_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION testimonials_audit_log()
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
        'testimonials',
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
-- DROP TRIGGER IF EXISTS trigger_testimonials_audit ON public.testimonials;
-- CREATE TRIGGER trigger_testimonials_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.testimonials
--     FOR EACH ROW
--     EXECUTE FUNCTION testimonials_audit_log();


-- =====================================================
-- Table: clock_records (ClockRecords)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.clock_records (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT clock_records_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT clock_records_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for clock_records
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_clock_records_created_at ON public.clock_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clock_records_updated_at ON public.clock_records(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_clock_records_status ON public.clock_records(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clock_records_slug ON public.clock_records(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_clock_records_data_gin ON public.clock_records USING gin(data);
CREATE INDEX IF NOT EXISTS idx_clock_records_data_title ON public.clock_records USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_clock_records_data_status ON public.clock_records USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_clock_records_search ON public.clock_records USING gin(search_vector);

-- =====================================================
-- RLS Policies for clock_records
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.clock_records ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.clock_records
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.clock_records
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for clock_records
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_clock_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_clock_records_updated_at ON public.clock_records;
CREATE TRIGGER trigger_clock_records_updated_at
    BEFORE UPDATE ON public.clock_records
    FOR EACH ROW
    EXECUTE FUNCTION update_clock_records_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION clock_records_audit_log()
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
        'clock_records',
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
-- DROP TRIGGER IF EXISTS trigger_clock_records_audit ON public.clock_records;
-- CREATE TRIGGER trigger_clock_records_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.clock_records
--     FOR EACH ROW
--     EXECUTE FUNCTION clock_records_audit_log();


-- =====================================================
-- Table: commissions (Commissions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.commissions (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT commissions_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT commissions_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for commissions
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON public.commissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_updated_at ON public.commissions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_commissions_slug ON public.commissions(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_commissions_data_gin ON public.commissions USING gin(data);
CREATE INDEX IF NOT EXISTS idx_commissions_data_title ON public.commissions USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_commissions_data_status ON public.commissions USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_commissions_search ON public.commissions USING gin(search_vector);

-- =====================================================
-- RLS Policies for commissions
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.commissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.commissions
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for commissions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_commissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_commissions_updated_at ON public.commissions;
CREATE TRIGGER trigger_commissions_updated_at
    BEFORE UPDATE ON public.commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_commissions_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION commissions_audit_log()
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
        'commissions',
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
-- DROP TRIGGER IF EXISTS trigger_commissions_audit ON public.commissions;
-- CREATE TRIGGER trigger_commissions_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.commissions
--     FOR EACH ROW
--     EXECUTE FUNCTION commissions_audit_log();


-- =====================================================
-- Table: staff_roles (StaffRoles)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.staff_roles (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT staff_roles_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT staff_roles_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for staff_roles
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_staff_roles_created_at ON public.staff_roles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_roles_updated_at ON public.staff_roles(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_roles_status ON public.staff_roles(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_roles_slug ON public.staff_roles(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_staff_roles_data_gin ON public.staff_roles USING gin(data);
CREATE INDEX IF NOT EXISTS idx_staff_roles_data_title ON public.staff_roles USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_staff_roles_data_status ON public.staff_roles USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_staff_roles_search ON public.staff_roles USING gin(search_vector);

-- =====================================================
-- RLS Policies for staff_roles
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.staff_roles
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.staff_roles
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for staff_roles
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_staff_roles_updated_at ON public.staff_roles;
CREATE TRIGGER trigger_staff_roles_updated_at
    BEFORE UPDATE ON public.staff_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_roles_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION staff_roles_audit_log()
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
        'staff_roles',
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
-- DROP TRIGGER IF EXISTS trigger_staff_roles_audit ON public.staff_roles;
-- CREATE TRIGGER trigger_staff_roles_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.staff_roles
--     FOR EACH ROW
--     EXECUTE FUNCTION staff_roles_audit_log();


-- =====================================================
-- Table: staff_schedules (StaffSchedules)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.staff_schedules (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT staff_schedules_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT staff_schedules_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for staff_schedules
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_staff_schedules_created_at ON public.staff_schedules(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_updated_at ON public.staff_schedules(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_status ON public.staff_schedules(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_schedules_slug ON public.staff_schedules(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_staff_schedules_data_gin ON public.staff_schedules USING gin(data);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_data_title ON public.staff_schedules USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_staff_schedules_data_status ON public.staff_schedules USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_staff_schedules_search ON public.staff_schedules USING gin(search_vector);

-- =====================================================
-- RLS Policies for staff_schedules
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.staff_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.staff_schedules
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.staff_schedules
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for staff_schedules
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_staff_schedules_updated_at ON public.staff_schedules;
CREATE TRIGGER trigger_staff_schedules_updated_at
    BEFORE UPDATE ON public.staff_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_schedules_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION staff_schedules_audit_log()
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
        'staff_schedules',
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
-- DROP TRIGGER IF EXISTS trigger_staff_schedules_audit ON public.staff_schedules;
-- CREATE TRIGGER trigger_staff_schedules_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.staff_schedules
--     FOR EACH ROW
--     EXECUTE FUNCTION staff_schedules_audit_log();


-- =====================================================
-- Table: stylists (Stylists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.stylists (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT stylists_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT stylists_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for stylists
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_stylists_created_at ON public.stylists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stylists_updated_at ON public.stylists(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stylists_status ON public.stylists(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stylists_slug ON public.stylists(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_stylists_data_gin ON public.stylists USING gin(data);
CREATE INDEX IF NOT EXISTS idx_stylists_data_title ON public.stylists USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_stylists_data_status ON public.stylists USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_stylists_search ON public.stylists USING gin(search_vector);

-- =====================================================
-- RLS Policies for stylists
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.stylists ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.stylists
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.stylists
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for stylists
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_stylists_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_stylists_updated_at ON public.stylists;
CREATE TRIGGER trigger_stylists_updated_at
    BEFORE UPDATE ON public.stylists
    FOR EACH ROW
    EXECUTE FUNCTION update_stylists_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION stylists_audit_log()
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
        'stylists',
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
-- DROP TRIGGER IF EXISTS trigger_stylists_audit ON public.stylists;
-- CREATE TRIGGER trigger_stylists_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.stylists
--     FOR EACH ROW
--     EXECUTE FUNCTION stylists_audit_log();


-- =====================================================
-- Table: time_off_requests (TimeOffRequests)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.time_off_requests (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT time_off_requests_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT time_off_requests_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for time_off_requests
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_time_off_requests_created_at ON public.time_off_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_updated_at ON public.time_off_requests(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON public.time_off_requests(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_off_requests_slug ON public.time_off_requests(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_time_off_requests_data_gin ON public.time_off_requests USING gin(data);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_data_title ON public.time_off_requests USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_time_off_requests_data_status ON public.time_off_requests USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_time_off_requests_search ON public.time_off_requests USING gin(search_vector);

-- =====================================================
-- RLS Policies for time_off_requests
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.time_off_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.time_off_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.time_off_requests
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for time_off_requests
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_time_off_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_time_off_requests_updated_at ON public.time_off_requests;
CREATE TRIGGER trigger_time_off_requests_updated_at
    BEFORE UPDATE ON public.time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_time_off_requests_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION time_off_requests_audit_log()
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
        'time_off_requests',
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
-- DROP TRIGGER IF EXISTS trigger_time_off_requests_audit ON public.time_off_requests;
-- CREATE TRIGGER trigger_time_off_requests_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.time_off_requests
--     FOR EACH ROW
--     EXECUTE FUNCTION time_off_requests_audit_log();


-- =====================================================
-- Table: appointments (Appointments)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT appointments_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT appointments_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for appointments
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON public.appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_updated_at ON public.appointments(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_slug ON public.appointments(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_appointments_data_gin ON public.appointments USING gin(data);
CREATE INDEX IF NOT EXISTS idx_appointments_data_title ON public.appointments USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_appointments_data_status ON public.appointments USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_appointments_search ON public.appointments USING gin(search_vector);

-- =====================================================
-- RLS Policies for appointments
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.appointments
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.appointments
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for appointments
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_appointments_updated_at ON public.appointments;
CREATE TRIGGER trigger_appointments_updated_at
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION appointments_audit_log()
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
        'appointments',
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
-- DROP TRIGGER IF EXISTS trigger_appointments_audit ON public.appointments;
-- CREATE TRIGGER trigger_appointments_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.appointments
--     FOR EACH ROW
--     EXECUTE FUNCTION appointments_audit_log();


-- =====================================================
-- Table: audit_logs (AuditLogs)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT audit_logs_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT audit_logs_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for audit_logs
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_updated_at ON public.audit_logs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON public.audit_logs(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_slug ON public.audit_logs(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_data_gin ON public.audit_logs USING gin(data);
CREATE INDEX IF NOT EXISTS idx_audit_logs_data_title ON public.audit_logs USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_audit_logs_data_status ON public.audit_logs USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON public.audit_logs USING gin(search_vector);

-- =====================================================
-- RLS Policies for audit_logs
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.audit_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.audit_logs
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for audit_logs
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_audit_logs_updated_at ON public.audit_logs;
CREATE TRIGGER trigger_audit_logs_updated_at
    BEFORE UPDATE ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_audit_logs_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION audit_logs_audit_log()
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
        'audit_logs',
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
-- DROP TRIGGER IF EXISTS trigger_audit_logs_audit ON public.audit_logs;
-- CREATE TRIGGER trigger_audit_logs_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.audit_logs
--     FOR EACH ROW
--     EXECUTE FUNCTION audit_logs_audit_log();


-- =====================================================
-- Table: business_documentation (BusinessDocumentation)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.business_documentation (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT business_documentation_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT business_documentation_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for business_documentation
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_business_documentation_created_at ON public.business_documentation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_documentation_updated_at ON public.business_documentation(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_documentation_status ON public.business_documentation(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_business_documentation_slug ON public.business_documentation(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_business_documentation_data_gin ON public.business_documentation USING gin(data);
CREATE INDEX IF NOT EXISTS idx_business_documentation_data_title ON public.business_documentation USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_business_documentation_data_status ON public.business_documentation USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_business_documentation_search ON public.business_documentation USING gin(search_vector);

-- =====================================================
-- RLS Policies for business_documentation
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.business_documentation ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.business_documentation
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.business_documentation
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for business_documentation
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_documentation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_business_documentation_updated_at ON public.business_documentation;
CREATE TRIGGER trigger_business_documentation_updated_at
    BEFORE UPDATE ON public.business_documentation
    FOR EACH ROW
    EXECUTE FUNCTION update_business_documentation_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION business_documentation_audit_log()
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
        'business_documentation',
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
-- DROP TRIGGER IF EXISTS trigger_business_documentation_audit ON public.business_documentation;
-- CREATE TRIGGER trigger_business_documentation_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.business_documentation
--     FOR EACH ROW
--     EXECUTE FUNCTION business_documentation_audit_log();


-- =====================================================
-- Table: chatbot_logs (ChatbotLogs)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chatbot_logs (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT chatbot_logs_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT chatbot_logs_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for chatbot_logs
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_created_at ON public.chatbot_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_updated_at ON public.chatbot_logs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_status ON public.chatbot_logs(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_slug ON public.chatbot_logs(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_data_gin ON public.chatbot_logs USING gin(data);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_data_title ON public.chatbot_logs USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_data_status ON public.chatbot_logs USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_search ON public.chatbot_logs USING gin(search_vector);

-- =====================================================
-- RLS Policies for chatbot_logs
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.chatbot_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.chatbot_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.chatbot_logs
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for chatbot_logs
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_chatbot_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_chatbot_logs_updated_at ON public.chatbot_logs;
CREATE TRIGGER trigger_chatbot_logs_updated_at
    BEFORE UPDATE ON public.chatbot_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_chatbot_logs_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION chatbot_logs_audit_log()
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
        'chatbot_logs',
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
-- DROP TRIGGER IF EXISTS trigger_chatbot_logs_audit ON public.chatbot_logs;
-- CREATE TRIGGER trigger_chatbot_logs_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.chatbot_logs
--     FOR EACH ROW
--     EXECUTE FUNCTION chatbot_logs_audit_log();


-- =====================================================
-- Table: chat_conversations (ChatConversations)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_conversations (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT chat_conversations_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT chat_conversations_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for chat_conversations
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON public.chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_slug ON public.chat_conversations(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_gin ON public.chat_conversations USING gin(data);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_title ON public.chat_conversations USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_status ON public.chat_conversations USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_chat_conversations_search ON public.chat_conversations USING gin(search_vector);

-- =====================================================
-- RLS Policies for chat_conversations
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.chat_conversations
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.chat_conversations
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for chat_conversations
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_chat_conversations_updated_at ON public.chat_conversations;
CREATE TRIGGER trigger_chat_conversations_updated_at
    BEFORE UPDATE ON public.chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversations_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION chat_conversations_audit_log()
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
        'chat_conversations',
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
-- DROP TRIGGER IF EXISTS trigger_chat_conversations_audit ON public.chat_conversations;
-- CREATE TRIGGER trigger_chat_conversations_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.chat_conversations
--     FOR EACH ROW
--     EXECUTE FUNCTION chat_conversations_audit_log();


-- =====================================================
-- Table: documentation (Documentation)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.documentation (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT documentation_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT documentation_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for documentation
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_documentation_created_at ON public.documentation(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_updated_at ON public.documentation(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_status ON public.documentation(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentation_slug ON public.documentation(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_documentation_data_gin ON public.documentation USING gin(data);
CREATE INDEX IF NOT EXISTS idx_documentation_data_title ON public.documentation USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_documentation_data_status ON public.documentation USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documentation_search ON public.documentation USING gin(search_vector);

-- =====================================================
-- RLS Policies for documentation
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.documentation
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.documentation
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for documentation
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_documentation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_documentation_updated_at ON public.documentation;
CREATE TRIGGER trigger_documentation_updated_at
    BEFORE UPDATE ON public.documentation
    FOR EACH ROW
    EXECUTE FUNCTION update_documentation_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION documentation_audit_log()
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
        'documentation',
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
-- DROP TRIGGER IF EXISTS trigger_documentation_audit ON public.documentation;
-- CREATE TRIGGER trigger_documentation_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.documentation
--     FOR EACH ROW
--     EXECUTE FUNCTION documentation_audit_log();


-- =====================================================
-- Table: documentation_templates (DocumentationTemplates)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.documentation_templates (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT documentation_templates_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT documentation_templates_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for documentation_templates
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_documentation_templates_created_at ON public.documentation_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_updated_at ON public.documentation_templates(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_status ON public.documentation_templates(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentation_templates_slug ON public.documentation_templates(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_documentation_templates_data_gin ON public.documentation_templates USING gin(data);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_data_title ON public.documentation_templates USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_documentation_templates_data_status ON public.documentation_templates USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documentation_templates_search ON public.documentation_templates USING gin(search_vector);

-- =====================================================
-- RLS Policies for documentation_templates
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.documentation_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.documentation_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.documentation_templates
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for documentation_templates
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_documentation_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_documentation_templates_updated_at ON public.documentation_templates;
CREATE TRIGGER trigger_documentation_templates_updated_at
    BEFORE UPDATE ON public.documentation_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_documentation_templates_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION documentation_templates_audit_log()
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
        'documentation_templates',
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
-- DROP TRIGGER IF EXISTS trigger_documentation_templates_audit ON public.documentation_templates;
-- CREATE TRIGGER trigger_documentation_templates_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.documentation_templates
--     FOR EACH ROW
--     EXECUTE FUNCTION documentation_templates_audit_log();


-- =====================================================
-- Table: documentation_workflows (DocumentationWorkflows)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.documentation_workflows (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT documentation_workflows_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT documentation_workflows_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for documentation_workflows
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_created_at ON public.documentation_workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_updated_at ON public.documentation_workflows(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_status ON public.documentation_workflows(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_slug ON public.documentation_workflows(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_data_gin ON public.documentation_workflows USING gin(data);
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_data_title ON public.documentation_workflows USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_data_status ON public.documentation_workflows USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_search ON public.documentation_workflows USING gin(search_vector);

-- =====================================================
-- RLS Policies for documentation_workflows
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.documentation_workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.documentation_workflows
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.documentation_workflows
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for documentation_workflows
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_documentation_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_documentation_workflows_updated_at ON public.documentation_workflows;
CREATE TRIGGER trigger_documentation_workflows_updated_at
    BEFORE UPDATE ON public.documentation_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_documentation_workflows_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION documentation_workflows_audit_log()
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
        'documentation_workflows',
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
-- DROP TRIGGER IF EXISTS trigger_documentation_workflows_audit ON public.documentation_workflows;
-- CREATE TRIGGER trigger_documentation_workflows_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.documentation_workflows
--     FOR EACH ROW
--     EXECUTE FUNCTION documentation_workflows_audit_log();


-- =====================================================
-- Table: editor_plugins (EditorPlugins)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.editor_plugins (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT editor_plugins_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT editor_plugins_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for editor_plugins
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_editor_plugins_created_at ON public.editor_plugins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_editor_plugins_updated_at ON public.editor_plugins(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_editor_plugins_status ON public.editor_plugins(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_editor_plugins_slug ON public.editor_plugins(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_editor_plugins_data_gin ON public.editor_plugins USING gin(data);
CREATE INDEX IF NOT EXISTS idx_editor_plugins_data_title ON public.editor_plugins USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_editor_plugins_data_status ON public.editor_plugins USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_editor_plugins_search ON public.editor_plugins USING gin(search_vector);

-- =====================================================
-- RLS Policies for editor_plugins
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.editor_plugins ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.editor_plugins
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.editor_plugins
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for editor_plugins
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_editor_plugins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_editor_plugins_updated_at ON public.editor_plugins;
CREATE TRIGGER trigger_editor_plugins_updated_at
    BEFORE UPDATE ON public.editor_plugins
    FOR EACH ROW
    EXECUTE FUNCTION update_editor_plugins_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION editor_plugins_audit_log()
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
        'editor_plugins',
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
-- DROP TRIGGER IF EXISTS trigger_editor_plugins_audit ON public.editor_plugins;
-- CREATE TRIGGER trigger_editor_plugins_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.editor_plugins
--     FOR EACH ROW
--     EXECUTE FUNCTION editor_plugins_audit_log();


-- =====================================================
-- Table: editor_templates (EditorTemplates)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.editor_templates (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT editor_templates_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT editor_templates_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for editor_templates
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_editor_templates_created_at ON public.editor_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_editor_templates_updated_at ON public.editor_templates(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_editor_templates_status ON public.editor_templates(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_editor_templates_slug ON public.editor_templates(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_editor_templates_data_gin ON public.editor_templates USING gin(data);
CREATE INDEX IF NOT EXISTS idx_editor_templates_data_title ON public.editor_templates USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_editor_templates_data_status ON public.editor_templates USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_editor_templates_search ON public.editor_templates USING gin(search_vector);

-- =====================================================
-- RLS Policies for editor_templates
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.editor_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.editor_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.editor_templates
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for editor_templates
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_editor_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_editor_templates_updated_at ON public.editor_templates;
CREATE TRIGGER trigger_editor_templates_updated_at
    BEFORE UPDATE ON public.editor_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_editor_templates_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION editor_templates_audit_log()
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
        'editor_templates',
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
-- DROP TRIGGER IF EXISTS trigger_editor_templates_audit ON public.editor_templates;
-- CREATE TRIGGER trigger_editor_templates_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.editor_templates
--     FOR EACH ROW
--     EXECUTE FUNCTION editor_templates_audit_log();


-- =====================================================
-- Table: editor_themes (EditorThemes)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.editor_themes (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT editor_themes_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT editor_themes_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for editor_themes
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_editor_themes_created_at ON public.editor_themes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_editor_themes_updated_at ON public.editor_themes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_editor_themes_status ON public.editor_themes(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_editor_themes_slug ON public.editor_themes(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_editor_themes_data_gin ON public.editor_themes USING gin(data);
CREATE INDEX IF NOT EXISTS idx_editor_themes_data_title ON public.editor_themes USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_editor_themes_data_status ON public.editor_themes USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_editor_themes_search ON public.editor_themes USING gin(search_vector);

-- =====================================================
-- RLS Policies for editor_themes
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.editor_themes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.editor_themes
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.editor_themes
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for editor_themes
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_editor_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_editor_themes_updated_at ON public.editor_themes;
CREATE TRIGGER trigger_editor_themes_updated_at
    BEFORE UPDATE ON public.editor_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_editor_themes_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION editor_themes_audit_log()
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
        'editor_themes',
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
-- DROP TRIGGER IF EXISTS trigger_editor_themes_audit ON public.editor_themes;
-- CREATE TRIGGER trigger_editor_themes_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.editor_themes
--     FOR EACH ROW
--     EXECUTE FUNCTION editor_themes_audit_log();


-- =====================================================
-- Table: email_logs (EmailLogs)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.email_logs (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT email_logs_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT email_logs_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for email_logs
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_updated_at ON public.email_logs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_email_logs_slug ON public.email_logs(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_email_logs_data_gin ON public.email_logs USING gin(data);
CREATE INDEX IF NOT EXISTS idx_email_logs_data_title ON public.email_logs USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_email_logs_data_status ON public.email_logs USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_email_logs_search ON public.email_logs USING gin(search_vector);

-- =====================================================
-- RLS Policies for email_logs
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.email_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.email_logs
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for email_logs
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_email_logs_updated_at ON public.email_logs;
CREATE TRIGGER trigger_email_logs_updated_at
    BEFORE UPDATE ON public.email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_email_logs_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION email_logs_audit_log()
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
        'email_logs',
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
-- DROP TRIGGER IF EXISTS trigger_email_logs_audit ON public.email_logs;
-- CREATE TRIGGER trigger_email_logs_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.email_logs
--     FOR EACH ROW
--     EXECUTE FUNCTION email_logs_audit_log();


-- =====================================================
-- Table: events (Events)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.events (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT events_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT events_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for events
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_updated_at ON public.events(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_data_gin ON public.events USING gin(data);
CREATE INDEX IF NOT EXISTS idx_events_data_title ON public.events USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_events_data_status ON public.events USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_events_search ON public.events USING gin(search_vector);

-- =====================================================
-- RLS Policies for events
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.events
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.events
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for events
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION events_audit_log()
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
        'events',
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
-- DROP TRIGGER IF EXISTS trigger_events_audit ON public.events;
-- CREATE TRIGGER trigger_events_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.events
--     FOR EACH ROW
--     EXECUTE FUNCTION events_audit_log();


-- =====================================================
-- Table: event_tracking (EventTracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.event_tracking (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT event_tracking_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT event_tracking_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for event_tracking
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_event_tracking_created_at ON public.event_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_tracking_updated_at ON public.event_tracking(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_tracking_status ON public.event_tracking(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_tracking_slug ON public.event_tracking(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_event_tracking_data_gin ON public.event_tracking USING gin(data);
CREATE INDEX IF NOT EXISTS idx_event_tracking_data_title ON public.event_tracking USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_event_tracking_data_status ON public.event_tracking USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_event_tracking_search ON public.event_tracking USING gin(search_vector);

-- =====================================================
-- RLS Policies for event_tracking
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.event_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.event_tracking
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.event_tracking
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for event_tracking
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_event_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_event_tracking_updated_at ON public.event_tracking;
CREATE TRIGGER trigger_event_tracking_updated_at
    BEFORE UPDATE ON public.event_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_event_tracking_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION event_tracking_audit_log()
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
        'event_tracking',
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
-- DROP TRIGGER IF EXISTS trigger_event_tracking_audit ON public.event_tracking;
-- CREATE TRIGGER trigger_event_tracking_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.event_tracking
--     FOR EACH ROW
--     EXECUTE FUNCTION event_tracking_audit_log();


-- =====================================================
-- Table: feature_flags (FeatureFlags)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.feature_flags (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT feature_flags_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT feature_flags_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for feature_flags
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_created_at ON public.feature_flags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_at ON public.feature_flags(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_flags_status ON public.feature_flags(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feature_flags_slug ON public.feature_flags(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_feature_flags_data_gin ON public.feature_flags USING gin(data);
CREATE INDEX IF NOT EXISTS idx_feature_flags_data_title ON public.feature_flags USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_feature_flags_data_status ON public.feature_flags USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_feature_flags_search ON public.feature_flags USING gin(search_vector);

-- =====================================================
-- RLS Policies for feature_flags
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.feature_flags
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.feature_flags
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for feature_flags
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER trigger_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_flags_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION feature_flags_audit_log()
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
        'feature_flags',
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
-- DROP TRIGGER IF EXISTS trigger_feature_flags_audit ON public.feature_flags;
-- CREATE TRIGGER trigger_feature_flags_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.feature_flags
--     FOR EACH ROW
--     EXECUTE FUNCTION feature_flags_audit_log();


-- =====================================================
-- Table: integrations (Integrations)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.integrations (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT integrations_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT integrations_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for integrations
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON public.integrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_updated_at ON public.integrations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON public.integrations(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_integrations_slug ON public.integrations(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_integrations_data_gin ON public.integrations USING gin(data);
CREATE INDEX IF NOT EXISTS idx_integrations_data_title ON public.integrations USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_integrations_data_status ON public.integrations USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_integrations_search ON public.integrations USING gin(search_vector);

-- =====================================================
-- RLS Policies for integrations
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.integrations
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.integrations
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for integrations
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_integrations_updated_at ON public.integrations;
CREATE TRIGGER trigger_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_integrations_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION integrations_audit_log()
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
        'integrations',
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
-- DROP TRIGGER IF EXISTS trigger_integrations_audit ON public.integrations;
-- CREATE TRIGGER trigger_integrations_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.integrations
--     FOR EACH ROW
--     EXECUTE FUNCTION integrations_audit_log();


-- =====================================================
-- Table: inventory (Inventory)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.inventory (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT inventory_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT inventory_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for inventory
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON public.inventory(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at ON public.inventory(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_inventory_slug ON public.inventory(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_inventory_data_gin ON public.inventory USING gin(data);
CREATE INDEX IF NOT EXISTS idx_inventory_data_title ON public.inventory USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_inventory_data_status ON public.inventory USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_inventory_search ON public.inventory USING gin(search_vector);

-- =====================================================
-- RLS Policies for inventory
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.inventory
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for inventory
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_inventory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_inventory_updated_at ON public.inventory;
CREATE TRIGGER trigger_inventory_updated_at
    BEFORE UPDATE ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION inventory_audit_log()
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
        'inventory',
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
-- DROP TRIGGER IF EXISTS trigger_inventory_audit ON public.inventory;
-- CREATE TRIGGER trigger_inventory_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.inventory
--     FOR EACH ROW
--     EXECUTE FUNCTION inventory_audit_log();


-- =====================================================
-- Table: locations (Locations)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.locations (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT locations_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT locations_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for locations
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON public.locations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON public.locations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_locations_status ON public.locations(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_locations_data_gin ON public.locations USING gin(data);
CREATE INDEX IF NOT EXISTS idx_locations_data_title ON public.locations USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_locations_data_status ON public.locations USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_locations_search ON public.locations USING gin(search_vector);

-- =====================================================
-- RLS Policies for locations
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.locations
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.locations
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for locations
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_locations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_locations_updated_at ON public.locations;
CREATE TRIGGER trigger_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION update_locations_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION locations_audit_log()
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
        'locations',
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
-- DROP TRIGGER IF EXISTS trigger_locations_audit ON public.locations;
-- CREATE TRIGGER trigger_locations_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.locations
--     FOR EACH ROW
--     EXECUTE FUNCTION locations_audit_log();


-- =====================================================
-- Table: maintenance_requests (MaintenanceRequests)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT maintenance_requests_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT maintenance_requests_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for maintenance_requests
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON public.maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_updated_at ON public.maintenance_requests(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_slug ON public.maintenance_requests(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_data_gin ON public.maintenance_requests USING gin(data);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_data_title ON public.maintenance_requests USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_data_status ON public.maintenance_requests USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_search ON public.maintenance_requests USING gin(search_vector);

-- =====================================================
-- RLS Policies for maintenance_requests
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.maintenance_requests
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.maintenance_requests
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for maintenance_requests
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_maintenance_requests_updated_at ON public.maintenance_requests;
CREATE TRIGGER trigger_maintenance_requests_updated_at
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_maintenance_requests_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION maintenance_requests_audit_log()
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
        'maintenance_requests',
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
-- DROP TRIGGER IF EXISTS trigger_maintenance_requests_audit ON public.maintenance_requests;
-- CREATE TRIGGER trigger_maintenance_requests_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_requests
--     FOR EACH ROW
--     EXECUTE FUNCTION maintenance_requests_audit_log();


-- =====================================================
-- Table: notifications (Notifications)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT notifications_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT notifications_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for notifications
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_updated_at ON public.notifications(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_slug ON public.notifications(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON public.notifications USING gin(data);
CREATE INDEX IF NOT EXISTS idx_notifications_data_title ON public.notifications USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_notifications_data_status ON public.notifications USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_notifications_search ON public.notifications USING gin(search_vector);

-- =====================================================
-- RLS Policies for notifications
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.notifications
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for notifications
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON public.notifications;
CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION notifications_audit_log()
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
        'notifications',
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
-- DROP TRIGGER IF EXISTS trigger_notifications_audit ON public.notifications;
-- CREATE TRIGGER trigger_notifications_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.notifications
--     FOR EACH ROW
--     EXECUTE FUNCTION notifications_audit_log();


-- =====================================================
-- Table: page_views (PageViews)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.page_views (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT page_views_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT page_views_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for page_views
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_updated_at ON public.page_views(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_status ON public.page_views(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_slug ON public.page_views(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_page_views_data_gin ON public.page_views USING gin(data);
CREATE INDEX IF NOT EXISTS idx_page_views_data_title ON public.page_views USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_page_views_data_status ON public.page_views USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_page_views_search ON public.page_views USING gin(search_vector);

-- =====================================================
-- RLS Policies for page_views
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.page_views
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.page_views
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for page_views
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_views_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_page_views_updated_at ON public.page_views;
CREATE TRIGGER trigger_page_views_updated_at
    BEFORE UPDATE ON public.page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_page_views_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION page_views_audit_log()
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
        'page_views',
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
-- DROP TRIGGER IF EXISTS trigger_page_views_audit ON public.page_views;
-- CREATE TRIGGER trigger_page_views_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.page_views
--     FOR EACH ROW
--     EXECUTE FUNCTION page_views_audit_log();


-- =====================================================
-- Table: push_notifications (PushNotifications)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.push_notifications (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT push_notifications_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT push_notifications_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for push_notifications
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_at ON public.push_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_notifications_updated_at ON public.push_notifications(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON public.push_notifications(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_push_notifications_slug ON public.push_notifications(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_push_notifications_data_gin ON public.push_notifications USING gin(data);
CREATE INDEX IF NOT EXISTS idx_push_notifications_data_title ON public.push_notifications USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_push_notifications_data_status ON public.push_notifications USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_push_notifications_search ON public.push_notifications USING gin(search_vector);

-- =====================================================
-- RLS Policies for push_notifications
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.push_notifications
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.push_notifications
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for push_notifications
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_push_notifications_updated_at ON public.push_notifications;
CREATE TRIGGER trigger_push_notifications_updated_at
    BEFORE UPDATE ON public.push_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_push_notifications_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION push_notifications_audit_log()
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
        'push_notifications',
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
-- DROP TRIGGER IF EXISTS trigger_push_notifications_audit ON public.push_notifications;
-- CREATE TRIGGER trigger_push_notifications_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.push_notifications
--     FOR EACH ROW
--     EXECUTE FUNCTION push_notifications_audit_log();


-- =====================================================
-- Table: recurring_appointments (RecurringAppointments)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.recurring_appointments (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT recurring_appointments_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT recurring_appointments_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for recurring_appointments
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_created_at ON public.recurring_appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_updated_at ON public.recurring_appointments(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_status ON public.recurring_appointments(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_slug ON public.recurring_appointments(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_data_gin ON public.recurring_appointments USING gin(data);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_data_title ON public.recurring_appointments USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_data_status ON public.recurring_appointments USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_search ON public.recurring_appointments USING gin(search_vector);

-- =====================================================
-- RLS Policies for recurring_appointments
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.recurring_appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.recurring_appointments
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.recurring_appointments
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for recurring_appointments
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_recurring_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_recurring_appointments_updated_at ON public.recurring_appointments;
CREATE TRIGGER trigger_recurring_appointments_updated_at
    BEFORE UPDATE ON public.recurring_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_recurring_appointments_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION recurring_appointments_audit_log()
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
        'recurring_appointments',
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
-- DROP TRIGGER IF EXISTS trigger_recurring_appointments_audit ON public.recurring_appointments;
-- CREATE TRIGGER trigger_recurring_appointments_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.recurring_appointments
--     FOR EACH ROW
--     EXECUTE FUNCTION recurring_appointments_audit_log();


-- =====================================================
-- Table: resources (Resources)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.resources (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT resources_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT resources_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for resources
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON public.resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON public.resources(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_resources_data_gin ON public.resources USING gin(data);
CREATE INDEX IF NOT EXISTS idx_resources_data_title ON public.resources USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_resources_data_status ON public.resources USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_resources_search ON public.resources USING gin(search_vector);

-- =====================================================
-- RLS Policies for resources
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.resources
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.resources
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for resources
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_resources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_resources_updated_at ON public.resources;
CREATE TRIGGER trigger_resources_updated_at
    BEFORE UPDATE ON public.resources
    FOR EACH ROW
    EXECUTE FUNCTION update_resources_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION resources_audit_log()
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
        'resources',
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
-- DROP TRIGGER IF EXISTS trigger_resources_audit ON public.resources;
-- CREATE TRIGGER trigger_resources_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.resources
--     FOR EACH ROW
--     EXECUTE FUNCTION resources_audit_log();


-- =====================================================
-- Table: roles_permissions (RolesPermissions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.roles_permissions (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT roles_permissions_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT roles_permissions_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for roles_permissions
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_roles_permissions_created_at ON public.roles_permissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_updated_at ON public.roles_permissions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_status ON public.roles_permissions(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roles_permissions_slug ON public.roles_permissions(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_roles_permissions_data_gin ON public.roles_permissions USING gin(data);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_data_title ON public.roles_permissions USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_roles_permissions_data_status ON public.roles_permissions USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_roles_permissions_search ON public.roles_permissions USING gin(search_vector);

-- =====================================================
-- RLS Policies for roles_permissions
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.roles_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.roles_permissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.roles_permissions
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for roles_permissions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_roles_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_roles_permissions_updated_at ON public.roles_permissions;
CREATE TRIGGER trigger_roles_permissions_updated_at
    BEFORE UPDATE ON public.roles_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_roles_permissions_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION roles_permissions_audit_log()
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
        'roles_permissions',
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
-- DROP TRIGGER IF EXISTS trigger_roles_permissions_audit ON public.roles_permissions;
-- CREATE TRIGGER trigger_roles_permissions_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.roles_permissions
--     FOR EACH ROW
--     EXECUTE FUNCTION roles_permissions_audit_log();


-- =====================================================
-- Table: service_packages (ServicePackages)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.service_packages (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT service_packages_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT service_packages_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for service_packages
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_created_at ON public.service_packages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_packages_updated_at ON public.service_packages(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_packages_status ON public.service_packages(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_service_packages_slug ON public.service_packages(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_service_packages_data_gin ON public.service_packages USING gin(data);
CREATE INDEX IF NOT EXISTS idx_service_packages_data_title ON public.service_packages USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_service_packages_data_status ON public.service_packages USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_service_packages_search ON public.service_packages USING gin(search_vector);

-- =====================================================
-- RLS Policies for service_packages
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.service_packages
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.service_packages
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for service_packages
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_service_packages_updated_at ON public.service_packages;
CREATE TRIGGER trigger_service_packages_updated_at
    BEFORE UPDATE ON public.service_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_service_packages_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION service_packages_audit_log()
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
        'service_packages',
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
-- DROP TRIGGER IF EXISTS trigger_service_packages_audit ON public.service_packages;
-- CREATE TRIGGER trigger_service_packages_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.service_packages
--     FOR EACH ROW
--     EXECUTE FUNCTION service_packages_audit_log();


-- =====================================================
-- Table: services (Services)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.services (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT services_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT services_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for services
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_services_created_at ON public.services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON public.services(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_services_status ON public.services(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_services_data_gin ON public.services USING gin(data);
CREATE INDEX IF NOT EXISTS idx_services_data_title ON public.services USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_services_data_status ON public.services USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_services_search ON public.services USING gin(search_vector);

-- =====================================================
-- RLS Policies for services
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.services
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.services
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for services
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_services_updated_at ON public.services;
CREATE TRIGGER trigger_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION update_services_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION services_audit_log()
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
        'services',
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
-- DROP TRIGGER IF EXISTS trigger_services_audit ON public.services;
-- CREATE TRIGGER trigger_services_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.services
--     FOR EACH ROW
--     EXECUTE FUNCTION services_audit_log();


-- =====================================================
-- Table: settings (Settings)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.settings (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT settings_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT settings_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for settings
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON public.settings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON public.settings(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_status ON public.settings(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_settings_slug ON public.settings(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_settings_data_gin ON public.settings USING gin(data);
CREATE INDEX IF NOT EXISTS idx_settings_data_title ON public.settings USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_settings_data_status ON public.settings USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_settings_search ON public.settings USING gin(search_vector);

-- =====================================================
-- RLS Policies for settings
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.settings
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for settings
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_settings_updated_at ON public.settings;
CREATE TRIGGER trigger_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION settings_audit_log()
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
        'settings',
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
-- DROP TRIGGER IF EXISTS trigger_settings_audit ON public.settings;
-- CREATE TRIGGER trigger_settings_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.settings
--     FOR EACH ROW
--     EXECUTE FUNCTION settings_audit_log();


-- =====================================================
-- Table: site_sections (SiteSections)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.site_sections (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT site_sections_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT site_sections_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for site_sections
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_site_sections_created_at ON public.site_sections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_sections_updated_at ON public.site_sections(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_sections_status ON public.site_sections(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_sections_slug ON public.site_sections(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_site_sections_data_gin ON public.site_sections USING gin(data);
CREATE INDEX IF NOT EXISTS idx_site_sections_data_title ON public.site_sections USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_site_sections_data_status ON public.site_sections USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_site_sections_search ON public.site_sections USING gin(search_vector);

-- =====================================================
-- RLS Policies for site_sections
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.site_sections
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.site_sections
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for site_sections
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_site_sections_updated_at ON public.site_sections;
CREATE TRIGGER trigger_site_sections_updated_at
    BEFORE UPDATE ON public.site_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_site_sections_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION site_sections_audit_log()
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
        'site_sections',
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
-- DROP TRIGGER IF EXISTS trigger_site_sections_audit ON public.site_sections;
-- CREATE TRIGGER trigger_site_sections_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.site_sections
--     FOR EACH ROW
--     EXECUTE FUNCTION site_sections_audit_log();


-- =====================================================
-- Table: tenants (Tenants)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tenants (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT tenants_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT tenants_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for tenants
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON public.tenants(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenants_updated_at ON public.tenants(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_tenants_data_gin ON public.tenants USING gin(data);
CREATE INDEX IF NOT EXISTS idx_tenants_data_title ON public.tenants USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_tenants_data_status ON public.tenants USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_tenants_search ON public.tenants USING gin(search_vector);

-- =====================================================
-- RLS Policies for tenants
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.tenants
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.tenants
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for tenants
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_tenants_updated_at ON public.tenants;
CREATE TRIGGER trigger_tenants_updated_at
    BEFORE UPDATE ON public.tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_tenants_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION tenants_audit_log()
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
        'tenants',
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
-- DROP TRIGGER IF EXISTS trigger_tenants_audit ON public.tenants;
-- CREATE TRIGGER trigger_tenants_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.tenants
--     FOR EACH ROW
--     EXECUTE FUNCTION tenants_audit_log();


-- =====================================================
-- Table: transactions (Transactions)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transactions (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT transactions_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT transactions_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for transactions
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_updated_at ON public.transactions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_slug ON public.transactions(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_data_gin ON public.transactions USING gin(data);
CREATE INDEX IF NOT EXISTS idx_transactions_data_title ON public.transactions USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_transactions_data_status ON public.transactions USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_transactions_search ON public.transactions USING gin(search_vector);

-- =====================================================
-- RLS Policies for transactions
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.transactions
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for transactions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON public.transactions;
CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_transactions_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION transactions_audit_log()
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
        'transactions',
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
-- DROP TRIGGER IF EXISTS trigger_transactions_audit ON public.transactions;
-- CREATE TRIGGER trigger_transactions_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.transactions
--     FOR EACH ROW
--     EXECUTE FUNCTION transactions_audit_log();


-- =====================================================
-- Table: users (Users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.users (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT users_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT users_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for users
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON public.users(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_slug ON public.users(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_users_data_gin ON public.users USING gin(data);
CREATE INDEX IF NOT EXISTS idx_users_data_title ON public.users USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_users_data_status ON public.users USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users USING gin(search_vector);

-- =====================================================
-- RLS Policies for users
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.users
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.users
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for users
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION users_audit_log()
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
        'users',
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
-- DROP TRIGGER IF EXISTS trigger_users_audit ON public.users;
-- CREATE TRIGGER trigger_users_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.users
--     FOR EACH ROW
--     EXECUTE FUNCTION users_audit_log();


-- =====================================================
-- Table: wait_list (WaitList)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wait_list (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT wait_list_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT wait_list_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for wait_list
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_wait_list_created_at ON public.wait_list(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wait_list_updated_at ON public.wait_list(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_wait_list_status ON public.wait_list(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wait_list_slug ON public.wait_list(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_wait_list_data_gin ON public.wait_list USING gin(data);
CREATE INDEX IF NOT EXISTS idx_wait_list_data_title ON public.wait_list USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_wait_list_data_status ON public.wait_list USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_wait_list_search ON public.wait_list USING gin(search_vector);

-- =====================================================
-- RLS Policies for wait_list
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.wait_list ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.wait_list
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.wait_list
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for wait_list
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_wait_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_wait_list_updated_at ON public.wait_list;
CREATE TRIGGER trigger_wait_list_updated_at
    BEFORE UPDATE ON public.wait_list
    FOR EACH ROW
    EXECUTE FUNCTION update_wait_list_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION wait_list_audit_log()
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
        'wait_list',
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
-- DROP TRIGGER IF EXISTS trigger_wait_list_audit ON public.wait_list;
-- CREATE TRIGGER trigger_wait_list_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.wait_list
--     FOR EACH ROW
--     EXECUTE FUNCTION wait_list_audit_log();


-- =====================================================
-- Table: webhook_logs (WebhookLogs)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.webhook_logs (
    -- Primary key with UUID
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Timestamps with timezone
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Flexible JSONB data storage for Payload CMS compatibility
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
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
    CONSTRAINT webhook_logs_data_check CHECK (jsonb_typeof(data) = 'object'),
    
    -- Unique slug constraint (if slug exists)
    CONSTRAINT webhook_logs_slug_unique UNIQUE (slug) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- Indexes for webhook_logs
-- =====================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_updated_at ON public.webhook_logs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_logs_slug ON public.webhook_logs(slug) WHERE slug IS NOT NULL;

-- JSONB indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_webhook_logs_data_gin ON public.webhook_logs USING gin(data);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_data_title ON public.webhook_logs USING btree((data->>'title'));
CREATE INDEX IF NOT EXISTS idx_webhook_logs_data_status ON public.webhook_logs USING btree((data->>'status'));

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_webhook_logs_search ON public.webhook_logs USING gin(search_vector);

-- =====================================================
-- RLS Policies for webhook_logs
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (modify as needed)
CREATE POLICY "Allow authenticated users full access" ON public.webhook_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Policy: Allow public read access for published content
CREATE POLICY "Allow public read access" ON public.webhook_logs
    FOR SELECT USING (
        data->>'status' = 'published' OR 
        data->>'visibility' = 'public'
    );

-- =====================================================
-- Triggers for webhook_logs
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_webhook_logs_updated_at ON public.webhook_logs;
CREATE TRIGGER trigger_webhook_logs_updated_at
    BEFORE UPDATE ON public.webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_webhook_logs_updated_at();

-- Function for audit logging (optional)
CREATE OR REPLACE FUNCTION webhook_logs_audit_log()
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
        'webhook_logs',
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
-- DROP TRIGGER IF EXISTS trigger_webhook_logs_audit ON public.webhook_logs;
-- CREATE TRIGGER trigger_webhook_logs_audit
--     AFTER INSERT OR UPDATE OR DELETE ON public.webhook_logs
--     FOR EACH ROW
--     EXECUTE FUNCTION webhook_logs_audit_log();


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
