CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(255) UNIQUE NOT NULL,
    "discount_type" VARCHAR(50) NOT NULL,
    "amount" INTEGER NOT NULL,
    "starts_at" TIMESTAMPTZ,
    "ends_at" TIMESTAMPTZ,
    "max_uses" INTEGER,
    "uses" INTEGER DEFAULT 0,
    "active" BOOLEAN DEFAULT true,
    "tenant_id" UUID REFERENCES tenants(id),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "public"."gift_cards" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "code" VARCHAR(255) UNIQUE NOT NULL,
    "balance" INTEGER NOT NULL,
    "issued_to" VARCHAR(255),
    "issued_by_id" UUID REFERENCES users(id),
    "expiry_date" TIMESTAMPTZ,
    "is_active" BOOLEAN DEFAULT true,
    "transactions" JSONB,
    "tenant_id" UUID REFERENCES tenants(id),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ... (tables for all other collections in the commerce directory) ...