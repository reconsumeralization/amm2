-- Create NextAuth.js tables for Supabase adapter
-- These tables are required for NextAuth to work with Supabase

-- Users table (extends NextAuth's default user)
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "emailVerified" TIMESTAMPTZ,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT DEFAULT 'user',
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS "public"."accounts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" BIGINT,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE("provider", "providerAccountId")
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" UUID NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "expires" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY ("identifier", "token")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS "sessions_sessionToken_idx" ON "sessions"("sessionToken");
CREATE INDEX IF NOT EXISTS "verification_tokens_token_idx" ON "verification_tokens"("token");
CREATE INDEX IF NOT EXISTS "verification_tokens_identifier_idx" ON "verification_tokens"("identifier");

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_verification_tokens_updated_at ON verification_tokens;
CREATE TRIGGER update_verification_tokens_updated_at BEFORE UPDATE ON verification_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read and update their own data
CREATE POLICY "Users can view own user data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own user data" ON users FOR UPDATE USING (auth.uid() = id);

-- Service role has full access
CREATE POLICY "Service role has full access to users" ON users FOR ALL TO service_role USING (true);
CREATE POLICY "Service role has full access to accounts" ON accounts FOR ALL TO service_role USING (true);
CREATE POLICY "Service role has full access to sessions" ON sessions FOR ALL TO service_role USING (true);
CREATE POLICY "Service role has full access to verification_tokens" ON verification_tokens FOR ALL TO service_role USING (true);
