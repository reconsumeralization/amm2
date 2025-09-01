-- Staff Roles Table
CREATE TABLE IF NOT EXISTS "public"."staff_roles" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenant_id" UUID REFERENCES tenants(id),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "permissions" JSONB DEFAULT '[]',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clock Records Table
CREATE TABLE IF NOT EXISTS "public"."clock_records" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "staff_id" UUID REFERENCES users(id),
    "tenant_id" UUID REFERENCES tenants(id),
    "action" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "duration" INTEGER,
    "location" JSONB,
    "notes" TEXT,
    "is_manual_entry" BOOLEAN DEFAULT false,
    "manual_entry_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Staff Schedules Table
CREATE TABLE IF NOT EXISTS "public"."staff_schedules" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "staff_id" UUID REFERENCES users(id),
    "tenant_id" UUID REFERENCES tenants(id),
    "title" VARCHAR(200) NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "is_recurring" BOOLEAN DEFAULT false,
    "recurrence_pattern" JSONB,
    "location" VARCHAR(200),
    "notes" TEXT,
    "status" VARCHAR(50) DEFAULT 'scheduled',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_roles_tenant_id ON staff_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clock_records_staff_id ON clock_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_clock_records_tenant_id ON clock_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clock_records_timestamp ON clock_records(timestamp);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_id ON staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_tenant_id ON staff_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_start_time ON staff_schedules(start_time);