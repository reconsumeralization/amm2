-- ModernMen Payload Collections Schema Migration
-- Generated at: 2025-09-01T00:00:08.547929
-- Collections: 80

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Collection Tables
-- =================

-- Table: commerce
CREATE TABLE IF NOT EXISTS commerce (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT commerce_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for commerce
CREATE INDEX IF NOT EXISTS idx_commerce_created_at ON commerce(created_at);
CREATE INDEX IF NOT EXISTS idx_commerce_updated_at ON commerce(updated_at);
CREATE INDEX IF NOT EXISTS idx_commerce_search ON commerce USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_commerce_data_gin ON commerce USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_commerce()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_commerce_updated_at ON commerce;
CREATE TRIGGER trigger_update_commerce_updated_at
    BEFORE UPDATE ON commerce
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_commerce();


-- Table: coupons
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT coupons_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for coupons
CREATE INDEX IF NOT EXISTS idx_coupons_created_at ON coupons(created_at);
CREATE INDEX IF NOT EXISTS idx_coupons_updated_at ON coupons(updated_at);
CREATE INDEX IF NOT EXISTS idx_coupons_search ON coupons USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_coupons_data_gin ON coupons USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_coupons()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_coupons_updated_at ON coupons;
CREATE TRIGGER trigger_update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_coupons();


-- Table: gift_cards
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT gift_cards_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for gift_cards
CREATE INDEX IF NOT EXISTS idx_gift_cards_created_at ON gift_cards(created_at);
CREATE INDEX IF NOT EXISTS idx_gift_cards_updated_at ON gift_cards(updated_at);
CREATE INDEX IF NOT EXISTS idx_gift_cards_search ON gift_cards USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_gift_cards_data_gin ON gift_cards USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_gift_cards()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_gift_cards_updated_at ON gift_cards;
CREATE TRIGGER trigger_update_gift_cards_updated_at
    BEFORE UPDATE ON gift_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_gift_cards();


-- Table: invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT invoices_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_updated_at ON invoices(updated_at);
CREATE INDEX IF NOT EXISTS idx_invoices_search ON invoices USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_invoices_data_gin ON invoices USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_invoices()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_invoices();


-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT orders_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_search ON orders USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_orders_data_gin ON orders USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_orders()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_orders_updated_at ON orders;
CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_orders();


-- Table: payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT payment_methods_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_created_at ON payment_methods(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_updated_at ON payment_methods(updated_at);
CREATE INDEX IF NOT EXISTS idx_payment_methods_search ON payment_methods USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_payment_methods_data_gin ON payment_methods USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_payment_methods()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER trigger_update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_payment_methods();


-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT products_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_data_gin ON products USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_products()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_products();


-- Table: promotions
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT promotions_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for promotions
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON promotions(created_at);
CREATE INDEX IF NOT EXISTS idx_promotions_updated_at ON promotions(updated_at);
CREATE INDEX IF NOT EXISTS idx_promotions_search ON promotions USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_promotions_data_gin ON promotions USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_promotions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_promotions_updated_at ON promotions;
CREATE TRIGGER trigger_update_promotions_updated_at
    BEFORE UPDATE ON promotions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_promotions();


-- Table: returns
CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT returns_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for returns
CREATE INDEX IF NOT EXISTS idx_returns_created_at ON returns(created_at);
CREATE INDEX IF NOT EXISTS idx_returns_updated_at ON returns(updated_at);
CREATE INDEX IF NOT EXISTS idx_returns_search ON returns USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_returns_data_gin ON returns USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_returns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_returns_updated_at ON returns;
CREATE TRIGGER trigger_update_returns_updated_at
    BEFORE UPDATE ON returns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_returns();


-- Table: shipping_methods
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT shipping_methods_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for shipping_methods
CREATE INDEX IF NOT EXISTS idx_shipping_methods_created_at ON shipping_methods(created_at);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_updated_at ON shipping_methods(updated_at);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_search ON shipping_methods USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_data_gin ON shipping_methods USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_shipping_methods()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_shipping_methods_updated_at ON shipping_methods;
CREATE TRIGGER trigger_update_shipping_methods_updated_at
    BEFORE UPDATE ON shipping_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_shipping_methods();


-- Table: blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT blog_posts_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_at ON blog_posts(updated_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_blog_posts_data_gin ON blog_posts USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_blog_posts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_blog_posts();


-- Table: content
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT content_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for content
CREATE INDEX IF NOT EXISTS idx_content_created_at ON content(created_at);
CREATE INDEX IF NOT EXISTS idx_content_updated_at ON content(updated_at);
CREATE INDEX IF NOT EXISTS idx_content_search ON content USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_content_data_gin ON content USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_content()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_content_updated_at ON content;
CREATE TRIGGER trigger_update_content_updated_at
    BEFORE UPDATE ON content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_content();


-- Table: faq
CREATE TABLE IF NOT EXISTS faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT faq_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for faq
CREATE INDEX IF NOT EXISTS idx_faq_created_at ON faq(created_at);
CREATE INDEX IF NOT EXISTS idx_faq_updated_at ON faq(updated_at);
CREATE INDEX IF NOT EXISTS idx_faq_search ON faq USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_faq_data_gin ON faq USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_faq()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_faq_updated_at ON faq;
CREATE TRIGGER trigger_update_faq_updated_at
    BEFORE UPDATE ON faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_faq();


-- Table: gallery
CREATE TABLE IF NOT EXISTS gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT gallery_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for gallery
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON gallery(created_at);
CREATE INDEX IF NOT EXISTS idx_gallery_updated_at ON gallery(updated_at);
CREATE INDEX IF NOT EXISTS idx_gallery_search ON gallery USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_gallery_data_gin ON gallery USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_gallery()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_gallery_updated_at ON gallery;
CREATE TRIGGER trigger_update_gallery_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_gallery();


-- Table: media
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT media_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for media
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_updated_at ON media(updated_at);
CREATE INDEX IF NOT EXISTS idx_media_search ON media USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_media_data_gin ON media USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_media()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_media_updated_at ON media;
CREATE TRIGGER trigger_update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_media();


-- Table: media_folders
CREATE TABLE IF NOT EXISTS media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT media_folders_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for media_folders
CREATE INDEX IF NOT EXISTS idx_media_folders_created_at ON media_folders(created_at);
CREATE INDEX IF NOT EXISTS idx_media_folders_updated_at ON media_folders(updated_at);
CREATE INDEX IF NOT EXISTS idx_media_folders_search ON media_folders USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_media_folders_data_gin ON media_folders USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_media_folders()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_media_folders_updated_at ON media_folders;
CREATE TRIGGER trigger_update_media_folders_updated_at
    BEFORE UPDATE ON media_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_media_folders();


-- Table: navigation
CREATE TABLE IF NOT EXISTS navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT navigation_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for navigation
CREATE INDEX IF NOT EXISTS idx_navigation_created_at ON navigation(created_at);
CREATE INDEX IF NOT EXISTS idx_navigation_updated_at ON navigation(updated_at);
CREATE INDEX IF NOT EXISTS idx_navigation_search ON navigation USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_navigation_data_gin ON navigation USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_navigation()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_navigation_updated_at ON navigation;
CREATE TRIGGER trigger_update_navigation_updated_at
    BEFORE UPDATE ON navigation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_navigation();


-- Table: navigation_menus
CREATE TABLE IF NOT EXISTS navigation_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT navigation_menus_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for navigation_menus
CREATE INDEX IF NOT EXISTS idx_navigation_menus_created_at ON navigation_menus(created_at);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_updated_at ON navigation_menus(updated_at);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_search ON navigation_menus USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_data_gin ON navigation_menus USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_navigation_menus()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_navigation_menus_updated_at ON navigation_menus;
CREATE TRIGGER trigger_update_navigation_menus_updated_at
    BEFORE UPDATE ON navigation_menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_navigation_menus();


-- Table: pages_main
CREATE TABLE IF NOT EXISTS pages_main (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT pages_main_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for pages_main
CREATE INDEX IF NOT EXISTS idx_pages_main_created_at ON pages_main(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_main_updated_at ON pages_main(updated_at);
CREATE INDEX IF NOT EXISTS idx_pages_main_search ON pages_main USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_pages_main_data_gin ON pages_main USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_pages_main()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_pages_main_updated_at ON pages_main;
CREATE TRIGGER trigger_update_pages_main_updated_at
    BEFORE UPDATE ON pages_main
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_pages_main();


-- Table: pages
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT pages_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for pages
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON pages(created_at);
CREATE INDEX IF NOT EXISTS idx_pages_updated_at ON pages(updated_at);
CREATE INDEX IF NOT EXISTS idx_pages_search ON pages USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_pages_data_gin ON pages USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_pages()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_pages_updated_at ON pages;
CREATE TRIGGER trigger_update_pages_updated_at
    BEFORE UPDATE ON pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_pages();


-- Table: products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT products_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_data_gin ON products USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_products()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_products_updated_at ON products;
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_products();


-- Table: redirects_main
CREATE TABLE IF NOT EXISTS redirects_main (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT redirects_main_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for redirects_main
CREATE INDEX IF NOT EXISTS idx_redirects_main_created_at ON redirects_main(created_at);
CREATE INDEX IF NOT EXISTS idx_redirects_main_updated_at ON redirects_main(updated_at);
CREATE INDEX IF NOT EXISTS idx_redirects_main_search ON redirects_main USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_redirects_main_data_gin ON redirects_main USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_redirects_main()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_redirects_main_updated_at ON redirects_main;
CREATE TRIGGER trigger_update_redirects_main_updated_at
    BEFORE UPDATE ON redirects_main
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_redirects_main();


-- Table: redirects
CREATE TABLE IF NOT EXISTS redirects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT redirects_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for redirects
CREATE INDEX IF NOT EXISTS idx_redirects_created_at ON redirects(created_at);
CREATE INDEX IF NOT EXISTS idx_redirects_updated_at ON redirects(updated_at);
CREATE INDEX IF NOT EXISTS idx_redirects_search ON redirects USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_redirects_data_gin ON redirects USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_redirects()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_redirects_updated_at ON redirects;
CREATE TRIGGER trigger_update_redirects_updated_at
    BEFORE UPDATE ON redirects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_redirects();


-- Table: seosettings
CREATE TABLE IF NOT EXISTS seosettings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT seosettings_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for seosettings
CREATE INDEX IF NOT EXISTS idx_seosettings_created_at ON seosettings(created_at);
CREATE INDEX IF NOT EXISTS idx_seosettings_updated_at ON seosettings(updated_at);
CREATE INDEX IF NOT EXISTS idx_seosettings_search ON seosettings USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_seosettings_data_gin ON seosettings USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_seosettings()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_seosettings_updated_at ON seosettings;
CREATE TRIGGER trigger_update_seosettings_updated_at
    BEFORE UPDATE ON seosettings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_seosettings();


-- Table: tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT tags_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);
CREATE INDEX IF NOT EXISTS idx_tags_updated_at ON tags(updated_at);
CREATE INDEX IF NOT EXISTS idx_tags_search ON tags USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_tags_data_gin ON tags USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_tags()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_tags_updated_at ON tags;
CREATE TRIGGER trigger_update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_tags();


-- Table: appointments_main
CREATE TABLE IF NOT EXISTS appointments_main (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT appointments_main_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for appointments_main
CREATE INDEX IF NOT EXISTS idx_appointments_main_created_at ON appointments_main(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_main_updated_at ON appointments_main(updated_at);
CREATE INDEX IF NOT EXISTS idx_appointments_main_search ON appointments_main USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_appointments_main_data_gin ON appointments_main USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_appointments_main()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_appointments_main_updated_at ON appointments_main;
CREATE TRIGGER trigger_update_appointments_main_updated_at
    BEFORE UPDATE ON appointments_main
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_appointments_main();


-- Table: cancellations
CREATE TABLE IF NOT EXISTS cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT cancellations_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for cancellations
CREATE INDEX IF NOT EXISTS idx_cancellations_created_at ON cancellations(created_at);
CREATE INDEX IF NOT EXISTS idx_cancellations_updated_at ON cancellations(updated_at);
CREATE INDEX IF NOT EXISTS idx_cancellations_search ON cancellations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_cancellations_data_gin ON cancellations USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_cancellations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_cancellations_updated_at ON cancellations;
CREATE TRIGGER trigger_update_cancellations_updated_at
    BEFORE UPDATE ON cancellations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_cancellations();


-- Table: chatbot
CREATE TABLE IF NOT EXISTS chatbot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT chatbot_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for chatbot
CREATE INDEX IF NOT EXISTS idx_chatbot_created_at ON chatbot(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_updated_at ON chatbot(updated_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_search ON chatbot USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_chatbot_data_gin ON chatbot USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_chatbot()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_chatbot_updated_at ON chatbot;
CREATE TRIGGER trigger_update_chatbot_updated_at
    BEFORE UPDATE ON chatbot
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_chatbot();


-- Table: chat_conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT chat_conversations_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_search ON chat_conversations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_gin ON chat_conversations USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_chat_conversations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER trigger_update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_chat_conversations();


-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT chat_messages_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_updated_at ON chat_messages(updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search ON chat_messages USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_messages_data_gin ON chat_messages USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_chat_messages()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER trigger_update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_chat_messages();


-- Table: contacts
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT contacts_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_updated_at ON contacts(updated_at);
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_contacts_data_gin ON contacts USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_contacts()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_contacts_updated_at ON contacts;
CREATE TRIGGER trigger_update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_contacts();


-- Table: customer_notes
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT customer_notes_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for customer_notes
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_at ON customer_notes(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_notes_updated_at ON customer_notes(updated_at);
CREATE INDEX IF NOT EXISTS idx_customer_notes_search ON customer_notes USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_customer_notes_data_gin ON customer_notes USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_customer_notes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_customer_notes_updated_at ON customer_notes;
CREATE TRIGGER trigger_update_customer_notes_updated_at
    BEFORE UPDATE ON customer_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_customer_notes();


-- Table: customers_main
CREATE TABLE IF NOT EXISTS customers_main (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT customers_main_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for customers_main
CREATE INDEX IF NOT EXISTS idx_customers_main_created_at ON customers_main(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_main_updated_at ON customers_main(updated_at);
CREATE INDEX IF NOT EXISTS idx_customers_main_search ON customers_main USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_customers_main_data_gin ON customers_main USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_customers_main()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_customers_main_updated_at ON customers_main;
CREATE TRIGGER trigger_update_customers_main_updated_at
    BEFORE UPDATE ON customers_main
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_customers_main();


-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT customers_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_updated_at ON customers(updated_at);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_customers_data_gin ON customers USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_customers()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_customers_updated_at ON customers;
CREATE TRIGGER trigger_update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_customers();


-- Table: customer_tags
CREATE TABLE IF NOT EXISTS customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT customer_tags_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for customer_tags
CREATE INDEX IF NOT EXISTS idx_customer_tags_created_at ON customer_tags(created_at);
CREATE INDEX IF NOT EXISTS idx_customer_tags_updated_at ON customer_tags(updated_at);
CREATE INDEX IF NOT EXISTS idx_customer_tags_search ON customer_tags USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_customer_tags_data_gin ON customer_tags USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_customer_tags()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_customer_tags_updated_at ON customer_tags;
CREATE TRIGGER trigger_update_customer_tags_updated_at
    BEFORE UPDATE ON customer_tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_customer_tags();


-- Table: email_campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT email_campaigns_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for email_campaigns
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_at ON email_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_updated_at ON email_campaigns(updated_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_search ON email_campaigns USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_data_gin ON email_campaigns USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_email_campaigns()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER trigger_update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_email_campaigns();


-- Table: loyalty_program
CREATE TABLE IF NOT EXISTS loyalty_program (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT loyalty_program_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for loyalty_program
CREATE INDEX IF NOT EXISTS idx_loyalty_program_created_at ON loyalty_program(created_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_program_updated_at ON loyalty_program(updated_at);
CREATE INDEX IF NOT EXISTS idx_loyalty_program_search ON loyalty_program USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_loyalty_program_data_gin ON loyalty_program USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_loyalty_program()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_loyalty_program_updated_at ON loyalty_program;
CREATE TRIGGER trigger_update_loyalty_program_updated_at
    BEFORE UPDATE ON loyalty_program
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_loyalty_program();


-- Table: reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT reviews_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_updated_at ON reviews(updated_at);
CREATE INDEX IF NOT EXISTS idx_reviews_search ON reviews USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_reviews_data_gin ON reviews USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_reviews()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_reviews();


-- Table: subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT subscriptions_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_updated_at ON subscriptions(updated_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_search ON subscriptions USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_subscriptions_data_gin ON subscriptions USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_subscriptions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_subscriptions();


-- Table: testimonials
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT testimonials_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON testimonials(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_updated_at ON testimonials(updated_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_search ON testimonials USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_testimonials_data_gin ON testimonials USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_testimonials()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_testimonials_updated_at ON testimonials;
CREATE TRIGGER trigger_update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_testimonials();


-- Table: clock_records
CREATE TABLE IF NOT EXISTS clock_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT clock_records_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for clock_records
CREATE INDEX IF NOT EXISTS idx_clock_records_created_at ON clock_records(created_at);
CREATE INDEX IF NOT EXISTS idx_clock_records_updated_at ON clock_records(updated_at);
CREATE INDEX IF NOT EXISTS idx_clock_records_search ON clock_records USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_clock_records_data_gin ON clock_records USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_clock_records()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_clock_records_updated_at ON clock_records;
CREATE TRIGGER trigger_update_clock_records_updated_at
    BEFORE UPDATE ON clock_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_clock_records();


-- Table: commissions
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT commissions_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for commissions
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at);
CREATE INDEX IF NOT EXISTS idx_commissions_updated_at ON commissions(updated_at);
CREATE INDEX IF NOT EXISTS idx_commissions_search ON commissions USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_commissions_data_gin ON commissions USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_commissions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_commissions_updated_at ON commissions;
CREATE TRIGGER trigger_update_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_commissions();


-- Table: staff_roles
CREATE TABLE IF NOT EXISTS staff_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT staff_roles_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for staff_roles
CREATE INDEX IF NOT EXISTS idx_staff_roles_created_at ON staff_roles(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_roles_updated_at ON staff_roles(updated_at);
CREATE INDEX IF NOT EXISTS idx_staff_roles_search ON staff_roles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_staff_roles_data_gin ON staff_roles USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_staff_roles()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_staff_roles_updated_at ON staff_roles;
CREATE TRIGGER trigger_update_staff_roles_updated_at
    BEFORE UPDATE ON staff_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_staff_roles();


-- Table: staff_schedules
CREATE TABLE IF NOT EXISTS staff_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT staff_schedules_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for staff_schedules
CREATE INDEX IF NOT EXISTS idx_staff_schedules_created_at ON staff_schedules(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_updated_at ON staff_schedules(updated_at);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_search ON staff_schedules USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_data_gin ON staff_schedules USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_staff_schedules()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_staff_schedules_updated_at ON staff_schedules;
CREATE TRIGGER trigger_update_staff_schedules_updated_at
    BEFORE UPDATE ON staff_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_staff_schedules();


-- Table: stylists
CREATE TABLE IF NOT EXISTS stylists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT stylists_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for stylists
CREATE INDEX IF NOT EXISTS idx_stylists_created_at ON stylists(created_at);
CREATE INDEX IF NOT EXISTS idx_stylists_updated_at ON stylists(updated_at);
CREATE INDEX IF NOT EXISTS idx_stylists_search ON stylists USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_stylists_data_gin ON stylists USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_stylists()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_stylists_updated_at ON stylists;
CREATE TRIGGER trigger_update_stylists_updated_at
    BEFORE UPDATE ON stylists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_stylists();


-- Table: time_off_requests
CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT time_off_requests_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for time_off_requests
CREATE INDEX IF NOT EXISTS idx_time_off_requests_created_at ON time_off_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_updated_at ON time_off_requests(updated_at);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_search ON time_off_requests USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_data_gin ON time_off_requests USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_time_off_requests()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_time_off_requests_updated_at ON time_off_requests;
CREATE TRIGGER trigger_update_time_off_requests_updated_at
    BEFORE UPDATE ON time_off_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_time_off_requests();


-- Table: appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT appointments_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for appointments
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_updated_at ON appointments(updated_at);
CREATE INDEX IF NOT EXISTS idx_appointments_search ON appointments USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_appointments_data_gin ON appointments USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_appointments()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_appointments_updated_at ON appointments;
CREATE TRIGGER trigger_update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_appointments();


-- Table: audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT audit_logs_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_updated_at ON audit_logs(updated_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_search ON audit_logs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_audit_logs_data_gin ON audit_logs USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_audit_logs_updated_at ON audit_logs;
CREATE TRIGGER trigger_update_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_audit_logs();


-- Table: business_documentation
CREATE TABLE IF NOT EXISTS business_documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT business_documentation_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for business_documentation
CREATE INDEX IF NOT EXISTS idx_business_documentation_created_at ON business_documentation(created_at);
CREATE INDEX IF NOT EXISTS idx_business_documentation_updated_at ON business_documentation(updated_at);
CREATE INDEX IF NOT EXISTS idx_business_documentation_search ON business_documentation USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_business_documentation_data_gin ON business_documentation USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_business_documentation()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_business_documentation_updated_at ON business_documentation;
CREATE TRIGGER trigger_update_business_documentation_updated_at
    BEFORE UPDATE ON business_documentation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_business_documentation();


-- Table: chatbot_logs
CREATE TABLE IF NOT EXISTS chatbot_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT chatbot_logs_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for chatbot_logs
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_created_at ON chatbot_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_updated_at ON chatbot_logs(updated_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_search ON chatbot_logs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_chatbot_logs_data_gin ON chatbot_logs USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_chatbot_logs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_chatbot_logs_updated_at ON chatbot_logs;
CREATE TRIGGER trigger_update_chatbot_logs_updated_at
    BEFORE UPDATE ON chatbot_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_chatbot_logs();


-- Table: chat_conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT chat_conversations_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_search ON chat_conversations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_data_gin ON chat_conversations USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_chat_conversations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER trigger_update_chat_conversations_updated_at
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_chat_conversations();


-- Table: documentation
CREATE TABLE IF NOT EXISTS documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT documentation_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for documentation
CREATE INDEX IF NOT EXISTS idx_documentation_created_at ON documentation(created_at);
CREATE INDEX IF NOT EXISTS idx_documentation_updated_at ON documentation(updated_at);
CREATE INDEX IF NOT EXISTS idx_documentation_search ON documentation USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_documentation_data_gin ON documentation USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_documentation()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_documentation_updated_at ON documentation;
CREATE TRIGGER trigger_update_documentation_updated_at
    BEFORE UPDATE ON documentation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_documentation();


-- Table: documentation_templates
CREATE TABLE IF NOT EXISTS documentation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT documentation_templates_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for documentation_templates
CREATE INDEX IF NOT EXISTS idx_documentation_templates_created_at ON documentation_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_updated_at ON documentation_templates(updated_at);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_search ON documentation_templates USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_documentation_templates_data_gin ON documentation_templates USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_documentation_templates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_documentation_templates_updated_at ON documentation_templates;
CREATE TRIGGER trigger_update_documentation_templates_updated_at
    BEFORE UPDATE ON documentation_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_documentation_templates();


-- Table: documentation_workflows
CREATE TABLE IF NOT EXISTS documentation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT documentation_workflows_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for documentation_workflows
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_created_at ON documentation_workflows(created_at);
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_updated_at ON documentation_workflows(updated_at);
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_search ON documentation_workflows USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_documentation_workflows_data_gin ON documentation_workflows USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_documentation_workflows()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_documentation_workflows_updated_at ON documentation_workflows;
CREATE TRIGGER trigger_update_documentation_workflows_updated_at
    BEFORE UPDATE ON documentation_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_documentation_workflows();


-- Table: editor_plugins
CREATE TABLE IF NOT EXISTS editor_plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT editor_plugins_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for editor_plugins
CREATE INDEX IF NOT EXISTS idx_editor_plugins_created_at ON editor_plugins(created_at);
CREATE INDEX IF NOT EXISTS idx_editor_plugins_updated_at ON editor_plugins(updated_at);
CREATE INDEX IF NOT EXISTS idx_editor_plugins_search ON editor_plugins USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_editor_plugins_data_gin ON editor_plugins USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_editor_plugins()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_editor_plugins_updated_at ON editor_plugins;
CREATE TRIGGER trigger_update_editor_plugins_updated_at
    BEFORE UPDATE ON editor_plugins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_editor_plugins();


-- Table: editor_templates
CREATE TABLE IF NOT EXISTS editor_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT editor_templates_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for editor_templates
CREATE INDEX IF NOT EXISTS idx_editor_templates_created_at ON editor_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_editor_templates_updated_at ON editor_templates(updated_at);
CREATE INDEX IF NOT EXISTS idx_editor_templates_search ON editor_templates USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_editor_templates_data_gin ON editor_templates USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_editor_templates()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_editor_templates_updated_at ON editor_templates;
CREATE TRIGGER trigger_update_editor_templates_updated_at
    BEFORE UPDATE ON editor_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_editor_templates();


-- Table: editor_themes
CREATE TABLE IF NOT EXISTS editor_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT editor_themes_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for editor_themes
CREATE INDEX IF NOT EXISTS idx_editor_themes_created_at ON editor_themes(created_at);
CREATE INDEX IF NOT EXISTS idx_editor_themes_updated_at ON editor_themes(updated_at);
CREATE INDEX IF NOT EXISTS idx_editor_themes_search ON editor_themes USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_editor_themes_data_gin ON editor_themes USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_editor_themes()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_editor_themes_updated_at ON editor_themes;
CREATE TRIGGER trigger_update_editor_themes_updated_at
    BEFORE UPDATE ON editor_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_editor_themes();


-- Table: email_logs
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT email_logs_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_updated_at ON email_logs(updated_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_search ON email_logs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_email_logs_data_gin ON email_logs USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_email_logs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_email_logs_updated_at ON email_logs;
CREATE TRIGGER trigger_update_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_email_logs();


-- Table: events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT events_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_updated_at ON events(updated_at);
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_events_data_gin ON events USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_events()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;
CREATE TRIGGER trigger_update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_events();


-- Table: event_tracking
CREATE TABLE IF NOT EXISTS event_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT event_tracking_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for event_tracking
CREATE INDEX IF NOT EXISTS idx_event_tracking_created_at ON event_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_event_tracking_updated_at ON event_tracking(updated_at);
CREATE INDEX IF NOT EXISTS idx_event_tracking_search ON event_tracking USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_event_tracking_data_gin ON event_tracking USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_event_tracking()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_event_tracking_updated_at ON event_tracking;
CREATE TRIGGER trigger_update_event_tracking_updated_at
    BEFORE UPDATE ON event_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_event_tracking();


-- Table: feature_flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT feature_flags_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for feature_flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_created_at ON feature_flags(created_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_at ON feature_flags(updated_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_search ON feature_flags USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_feature_flags_data_gin ON feature_flags USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_feature_flags()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER trigger_update_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_feature_flags();


-- Table: integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT integrations_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for integrations
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_updated_at ON integrations(updated_at);
CREATE INDEX IF NOT EXISTS idx_integrations_search ON integrations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_integrations_data_gin ON integrations USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_integrations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_integrations_updated_at ON integrations;
CREATE TRIGGER trigger_update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_integrations();


-- Table: inventory
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT inventory_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for inventory
CREATE INDEX IF NOT EXISTS idx_inventory_created_at ON inventory(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_updated_at ON inventory(updated_at);
CREATE INDEX IF NOT EXISTS idx_inventory_search ON inventory USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_inventory_data_gin ON inventory USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_inventory()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_inventory_updated_at ON inventory;
CREATE TRIGGER trigger_update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_inventory();


-- Table: locations
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT locations_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for locations
CREATE INDEX IF NOT EXISTS idx_locations_created_at ON locations(created_at);
CREATE INDEX IF NOT EXISTS idx_locations_updated_at ON locations(updated_at);
CREATE INDEX IF NOT EXISTS idx_locations_search ON locations USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_locations_data_gin ON locations USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_locations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_locations_updated_at ON locations;
CREATE TRIGGER trigger_update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_locations();


-- Table: maintenance_requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT maintenance_requests_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for maintenance_requests
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_updated_at ON maintenance_requests(updated_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_search ON maintenance_requests USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_data_gin ON maintenance_requests USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_maintenance_requests()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_maintenance_requests_updated_at ON maintenance_requests;
CREATE TRIGGER trigger_update_maintenance_requests_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_maintenance_requests();


-- Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT notifications_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_updated_at ON notifications(updated_at);
CREATE INDEX IF NOT EXISTS idx_notifications_search ON notifications USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_notifications_data_gin ON notifications USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_notifications()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_notifications();


-- Table: page_views
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT page_views_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for page_views
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_updated_at ON page_views(updated_at);
CREATE INDEX IF NOT EXISTS idx_page_views_search ON page_views USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_page_views_data_gin ON page_views USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_page_views()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_page_views_updated_at ON page_views;
CREATE TRIGGER trigger_update_page_views_updated_at
    BEFORE UPDATE ON page_views
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_page_views();


-- Table: push_notifications
CREATE TABLE IF NOT EXISTS push_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT push_notifications_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for push_notifications
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_at ON push_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_push_notifications_updated_at ON push_notifications(updated_at);
CREATE INDEX IF NOT EXISTS idx_push_notifications_search ON push_notifications USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_push_notifications_data_gin ON push_notifications USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_push_notifications()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_push_notifications_updated_at ON push_notifications;
CREATE TRIGGER trigger_update_push_notifications_updated_at
    BEFORE UPDATE ON push_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_push_notifications();


-- Table: recurring_appointments
CREATE TABLE IF NOT EXISTS recurring_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT recurring_appointments_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for recurring_appointments
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_created_at ON recurring_appointments(created_at);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_updated_at ON recurring_appointments(updated_at);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_search ON recurring_appointments USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_recurring_appointments_data_gin ON recurring_appointments USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_recurring_appointments()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_recurring_appointments_updated_at ON recurring_appointments;
CREATE TRIGGER trigger_update_recurring_appointments_updated_at
    BEFORE UPDATE ON recurring_appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_recurring_appointments();


-- Table: resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT resources_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for resources
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at);
CREATE INDEX IF NOT EXISTS idx_resources_updated_at ON resources(updated_at);
CREATE INDEX IF NOT EXISTS idx_resources_search ON resources USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_resources_data_gin ON resources USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_resources()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_resources_updated_at ON resources;
CREATE TRIGGER trigger_update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_resources();


-- Table: roles_permissions
CREATE TABLE IF NOT EXISTS roles_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT roles_permissions_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for roles_permissions
CREATE INDEX IF NOT EXISTS idx_roles_permissions_created_at ON roles_permissions(created_at);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_updated_at ON roles_permissions(updated_at);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_search ON roles_permissions USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_roles_permissions_data_gin ON roles_permissions USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_roles_permissions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_roles_permissions_updated_at ON roles_permissions;
CREATE TRIGGER trigger_update_roles_permissions_updated_at
    BEFORE UPDATE ON roles_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_roles_permissions();


-- Table: service_packages
CREATE TABLE IF NOT EXISTS service_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT service_packages_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for service_packages
CREATE INDEX IF NOT EXISTS idx_service_packages_created_at ON service_packages(created_at);
CREATE INDEX IF NOT EXISTS idx_service_packages_updated_at ON service_packages(updated_at);
CREATE INDEX IF NOT EXISTS idx_service_packages_search ON service_packages USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_service_packages_data_gin ON service_packages USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_service_packages()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_service_packages_updated_at ON service_packages;
CREATE TRIGGER trigger_update_service_packages_updated_at
    BEFORE UPDATE ON service_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_service_packages();


-- Table: services
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT services_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for services
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON services(updated_at);
CREATE INDEX IF NOT EXISTS idx_services_search ON services USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_services_data_gin ON services USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_services()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_services_updated_at ON services;
CREATE TRIGGER trigger_update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_services();


-- Table: settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT settings_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for settings
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON settings(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_settings_search ON settings USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_settings_data_gin ON settings USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_settings()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_settings_updated_at ON settings;
CREATE TRIGGER trigger_update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_settings();


-- Table: site_sections
CREATE TABLE IF NOT EXISTS site_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT site_sections_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for site_sections
CREATE INDEX IF NOT EXISTS idx_site_sections_created_at ON site_sections(created_at);
CREATE INDEX IF NOT EXISTS idx_site_sections_updated_at ON site_sections(updated_at);
CREATE INDEX IF NOT EXISTS idx_site_sections_search ON site_sections USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_site_sections_data_gin ON site_sections USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_site_sections()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_site_sections_updated_at ON site_sections;
CREATE TRIGGER trigger_update_site_sections_updated_at
    BEFORE UPDATE ON site_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_site_sections();


-- Table: tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT tenants_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for tenants
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);
CREATE INDEX IF NOT EXISTS idx_tenants_updated_at ON tenants(updated_at);
CREATE INDEX IF NOT EXISTS idx_tenants_search ON tenants USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_tenants_data_gin ON tenants USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_tenants()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_tenants_updated_at ON tenants;
CREATE TRIGGER trigger_update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_tenants();


-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT transactions_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_updated_at ON transactions(updated_at);
CREATE INDEX IF NOT EXISTS idx_transactions_search ON transactions USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_transactions_data_gin ON transactions USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_transactions()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON transactions;
CREATE TRIGGER trigger_update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_transactions();


-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT users_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_updated_at ON users(updated_at);
CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_users_data_gin ON users USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_users()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_users();


-- Table: wait_list
CREATE TABLE IF NOT EXISTS wait_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT wait_list_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for wait_list
CREATE INDEX IF NOT EXISTS idx_wait_list_created_at ON wait_list(created_at);
CREATE INDEX IF NOT EXISTS idx_wait_list_updated_at ON wait_list(updated_at);
CREATE INDEX IF NOT EXISTS idx_wait_list_search ON wait_list USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_wait_list_data_gin ON wait_list USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_wait_list()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_wait_list_updated_at ON wait_list;
CREATE TRIGGER trigger_update_wait_list_updated_at
    BEFORE UPDATE ON wait_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_wait_list();


-- Table: webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- JSON field for flexible data storage
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Search optimization
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', COALESCE(data->>'title', '') || ' ' || 
                               COALESCE(data->>'name', '') || ' ' ||
                               COALESCE(data->>'description', '') || ' ' ||
                               COALESCE(data->>'content', ''))
    ) STORED,
    
    -- Common indexes
    CONSTRAINT webhook_logs_data_check CHECK (jsonb_typeof(data) = 'object')
);

-- Indexes for webhook_logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_updated_at ON webhook_logs(updated_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_search ON webhook_logs USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_data_gin ON webhook_logs USING gin(data);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_webhook_logs()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_webhook_logs_updated_at ON webhook_logs;
CREATE TRIGGER trigger_update_webhook_logs_updated_at
    BEFORE UPDATE ON webhook_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_webhook_logs();



-- Final Setup
-- ============

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;
