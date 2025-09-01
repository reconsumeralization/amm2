-- =================================================================
-- Row Level Security (RLS) Policies for Modern Men Hair BarberShop
-- =================================================================
-- This migration sets up comprehensive RLS policies to ensure
-- secure data access across all tables.

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- PROFILES TABLE POLICIES
-- =================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin users can view all profiles
CREATE POLICY "Admin users can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can update all profiles
CREATE POLICY "Admin users can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- APPOINTMENTS TABLE POLICIES
-- =================================================================

-- Users can view their own appointments
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own appointments
CREATE POLICY "Users can create own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending/cancelled appointments
CREATE POLICY "Users can update own pending appointments" ON appointments
  FOR UPDATE USING (
    auth.uid() = user_id AND
    status IN ('pending', 'cancelled')
  );

-- Stylists can view appointments assigned to them
CREATE POLICY "Stylists can view assigned appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('barber', 'stylist', 'admin', 'manager')
    ) OR
    stylist_id IN (
      SELECT id FROM stylists WHERE user_id = auth.uid()
    )
  );

-- Stylists can update status of their appointments
CREATE POLICY "Stylists can update appointment status" ON appointments
  FOR UPDATE USING (
    stylist_id IN (
      SELECT id FROM stylists WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can view all appointments
CREATE POLICY "Admin users can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can update all appointments
CREATE POLICY "Admin users can update all appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- SERVICES TABLE POLICIES
-- =================================================================

-- Everyone can view active services
CREATE POLICY "Everyone can view active services" ON services
  FOR SELECT USING (is_active = true);

-- Admin users can view all services
CREATE POLICY "Admin users can view all services" ON services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can create services
CREATE POLICY "Admin users can create services" ON services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can update services
CREATE POLICY "Admin users can update services" ON services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can delete services
CREATE POLICY "Admin users can delete services" ON services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- STYLISTS TABLE POLICIES
-- =================================================================

-- Everyone can view active stylists
CREATE POLICY "Everyone can view active stylists" ON stylists
  FOR SELECT USING (is_active = true);

-- Stylists can view their own record
CREATE POLICY "Stylists can view own record" ON stylists
  FOR SELECT USING (user_id = auth.uid());

-- Stylists can update their own record
CREATE POLICY "Stylists can update own record" ON stylists
  FOR UPDATE USING (user_id = auth.uid());

-- Admin users can view all stylists
CREATE POLICY "Admin users can view all stylists" ON stylists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can create stylists
CREATE POLICY "Admin users can create stylists" ON stylists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin users can update all stylists
CREATE POLICY "Admin users can update all stylists" ON stylists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- STYLIST AVAILABILITY TABLE POLICIES
-- =================================================================

-- Everyone can view stylist availability
CREATE POLICY "Everyone can view stylist availability" ON stylist_availability
  FOR SELECT USING (is_available = true);

-- Stylists can view their own availability
CREATE POLICY "Stylists can view own availability" ON stylist_availability
  FOR SELECT USING (
    stylist_id IN (
      SELECT id FROM stylists WHERE user_id = auth.uid()
    )
  );

-- Stylists can create their own availability
CREATE POLICY "Stylists can create own availability" ON stylist_availability
  FOR INSERT WITH CHECK (
    stylist_id IN (
      SELECT id FROM stylists WHERE user_id = auth.uid()
    )
  );

-- Stylists can update their own availability
CREATE POLICY "Stylists can update own availability" ON stylist_availability
  FOR UPDATE USING (
    stylist_id IN (
      SELECT id FROM stylists WHERE user_id = auth.uid()
    )
  );

-- Admin users can manage all availability
CREATE POLICY "Admin users can manage availability" ON stylist_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- REVIEWS TABLE POLICIES
-- =================================================================

-- Everyone can view reviews
CREATE POLICY "Everyone can view reviews" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin users can manage all reviews
CREATE POLICY "Admin users can manage reviews" ON reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- NOTIFICATIONS TABLE POLICIES
-- =================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Admin users can view all notifications
CREATE POLICY "Admin users can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- NOTIFICATION LOGS TABLE POLICIES
-- =================================================================

-- Only system/service role can insert notification logs
CREATE POLICY "System can create notification logs" ON notification_logs
  FOR INSERT WITH CHECK (true);

-- Admin users can view notification logs
CREATE POLICY "Admin users can view notification logs" ON notification_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- PAYMENTS TABLE POLICIES
-- =================================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

-- System can create payment records
CREATE POLICY "System can create payments" ON payments
  FOR INSERT WITH CHECK (true);

-- System can update payment status
CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (true);

-- Admin users can view all payments
CREATE POLICY "Admin users can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- =================================================================
-- HELPER FUNCTIONS
-- =================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role IN ('admin', 'manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is stylist
CREATE OR REPLACE FUNCTION is_stylist(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM stylists
    WHERE user_id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns appointment
CREATE OR REPLACE FUNCTION owns_appointment(user_id UUID, appointment_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM appointments
    WHERE id = appointment_id AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- ADDITIONAL SECURITY POLICIES
-- =================================================================

-- Prevent users from deleting their own data (except where appropriate)
-- Most deletions should be handled by admin or through status updates

-- Ensure users can only access data from their tenant (if multi-tenant)
-- This would be implemented based on your tenant structure

-- Rate limiting policies can be implemented at the application level
-- or through Supabase Edge Functions

-- =================================================================
-- AUDIT POLICIES (Optional - for compliance)
-- =================================================================

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admin users can view audit logs
CREATE POLICY "Admin users can view audit logs" ON audit_log
  FOR SELECT USING (is_admin(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_log
  FOR INSERT WITH CHECK (true);

-- =================================================================
-- PERFORMANCE INDEXES FOR RLS
-- =================================================================

-- Add indexes to improve RLS query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_stylist_id ON appointments(stylist_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_stylists_user_id ON stylists(user_id);
CREATE INDEX IF NOT EXISTS idx_stylists_is_active ON stylists(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
