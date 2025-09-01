-- Create media table for file uploads and references
CREATE TABLE IF NOT EXISTS "public"."media" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "filename" VARCHAR(255) NOT NULL,
    "original_filename" VARCHAR(255),
    "mime_type" VARCHAR(100),
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "alt_text" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "tags" JSONB DEFAULT '[]'::jsonb,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "uploaded_by" UUID REFERENCES users(id),
    "tenant_id" UUID REFERENCES tenants(id),
    "is_public" BOOLEAN DEFAULT false,
    "folder_id" UUID,
    "folder_path" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for media table
CREATE INDEX idx_media_filename ON media(filename);
CREATE INDEX idx_media_mime_type ON media(mime_type);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_tenant_id ON media(tenant_id);
CREATE INDEX idx_media_folder_id ON media(folder_id);
CREATE INDEX idx_media_created_at ON media(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_media_timestamp
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own media" ON media
    FOR SELECT TO authenticated USING (uploaded_by = auth.uid() OR is_public = true);

CREATE POLICY "Users can upload media" ON media
    FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update their own media" ON media
    FOR UPDATE TO authenticated USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own media" ON media
    FOR DELETE TO authenticated USING (uploaded_by = auth.uid());
