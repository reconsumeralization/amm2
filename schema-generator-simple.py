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
            print("ERROR: collections-info.json not found. Run generate-all-types.js first.")
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

    def generate_collection_schemas(self) -> List[str]:
        """Generate schemas for all collections"""
        schemas = []
        collections = self.collections_info.get('collections', [])
        
        print(f"Generating schemas for {len(collections)} collections...")
        
        for collection in collections:
            table_name = self.pascale_to_snake(collection)
            schema = self.generate_base_table_schema(table_name)
            schemas.append(schema)
            print(f"Generated schema for {collection} -> {table_name}")
        
        return schemas

    def save_schema_file(self, schemas: List[str]) -> str:
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

-- Collection Tables
-- =================
"""
        
        for schema in schemas:
            content += schema + "\n"
        
        content += """

-- Final Setup
-- ============

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filename
    
    def sync_with_database(self, schema_file: str) -> bool:
        """Sync the generated schema with the database"""
        print("Attempting to sync with database...")
        
        # Get database URL from environment
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("WARNING: DATABASE_URL not found in environment. Schema file generated but not synced.")
            return False
        
        try:
            print("Connecting to database...")
            
            # Execute the schema file
            cmd = f'psql "{database_url}" -f {schema_file}'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("SUCCESS: Database schema synced successfully!")
                print(f"Migration applied: {schema_file}")
                return True
            else:
                print("ERROR: Database sync failed:")
                print(result.stderr)
                return False
                
        except Exception as e:
            print(f"ERROR: Database sync error: {str(e)}")
            return False
    
    def run(self):
        """Main execution function"""
        print("Starting Schema Generation and Sync...")
        
        if not self.collections_info.get('collections'):
            print("ERROR: No collections found. Run the type generation first.")
            return
        
        # Generate schemas
        collection_schemas = self.generate_collection_schemas()
        
        # Save to file
        schema_file = self.save_schema_file(collection_schemas)
        print(f"Schema saved to: {schema_file}")
        
        # Sync with database if possible
        synced = self.sync_with_database(schema_file)
        
        # Summary
        print("")
        print("Schema Generation Complete!")
        print(f"Generated schemas for {len(self.collections_info.get('collections', []))} collections")
        print(f"Migration file: {schema_file}")
        print(f"Database synced: {'Yes' if synced else 'No'}")
        
        if not synced:
            print("")
            print("To manually sync:")
            print(f"   psql $DATABASE_URL -f {schema_file}")

if __name__ == "__main__":
    generator = SchemaGenerator()
    generator.run()