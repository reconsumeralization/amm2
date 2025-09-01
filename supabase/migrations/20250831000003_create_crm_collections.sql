CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "appointment_title" VARCHAR(255) NOT NULL,
    "customer_id" UUID REFERENCES users(id),
    "stylist_id" UUID REFERENCES users(id),
    "tenant_id" UUID REFERENCES tenants(id),
    "date_time" TIMESTAMPTZ NOT NULL,
    "service" TEXT NOT NULL,
    "status" VARCHAR(50) DEFAULT 'pending',
    "payment_status" VARCHAR(50) DEFAULT 'unpaid',
    "stripe_payment_intent_id" VARCHAR(255),
    "google_event_id" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ... (tables for all other collections in the crm directory) ...