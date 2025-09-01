-- Create services table for barber services
CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "category" VARCHAR(100),
    "is_active" BOOLEAN DEFAULT true,
    "image_url" TEXT,
    "features" JSONB DEFAULT '[]'::jsonb,
    "tenant_id" UUID REFERENCES tenants(id),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for services table
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_services_tenant_id ON services(tenant_id);
CREATE INDEX idx_services_created_at ON services(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_services_timestamp
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Services are viewable by authenticated users" ON services
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Services can be created by managers and admins" ON services
    FOR INSERT TO authenticated
    WITH CHECK (true);  -- Simplified for now, will be updated with proper auth

CREATE POLICY "Services can be updated by managers and admins" ON services
    FOR UPDATE TO authenticated
    USING (true);  -- Simplified for now, will be updated with proper auth

-- Insert default services
INSERT INTO services (name, description, price, duration_minutes, category, features) VALUES
    ('Haircut', 'Professional haircut with styling', 45.00, 60, 'hair', '["Consultation", "Wash", "Cut", "Style"]'::jsonb),
    ('Beard Trim', 'Professional beard grooming and trimming', 25.00, 30, 'beard', '["Trim", "Shape", "Styling"]'::jsonb),
    ('Haircut & Beard', 'Complete grooming package', 65.00, 90, 'combo', '["Haircut", "Beard Trim", "Wash", "Style"]'::jsonb),
    ('Kids Haircut', 'Specialized children''s haircut', 30.00, 45, 'hair', '["Gentle cut", "Distraction items", "Treat"]'::jsonb);
