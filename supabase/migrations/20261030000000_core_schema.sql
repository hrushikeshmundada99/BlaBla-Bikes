-- ==============================================================================
-- BlaBlaBikes: Core Schema Migration
-- Sets up all 12 core tables, enums, triggers, and security functions
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ride_status AS ENUM ('open', 'full', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rider_verification AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('open', 'reviewed', 'dismissed', 'actioned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio VARCHAR(280),
  phone VARCHAR(20),
  preferred_language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'mr')),
  role user_role NOT NULL DEFAULT 'user',
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4. Rider profiles table
CREATE TABLE IF NOT EXISTS rider_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bike_model VARCHAR(100) NOT NULL,
  registration_number VARCHAR(20) NOT NULL UNIQUE,
  licence_number VARCHAR(30) NOT NULL UNIQUE,
  helmet_available BOOLEAN NOT NULL DEFAULT true,
  bike_photo_path TEXT,
  licence_doc_path TEXT,
  rc_doc_path TEXT,
  verification rider_verification NOT NULL DEFAULT 'none',
  verification_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trigger_rider_profiles_updated_at
  BEFORE UPDATE ON rider_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 5. Helper function is_admin()
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_banned = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. Trigger protect_privileged_columns()
CREATE OR REPLACE FUNCTION protect_privileged_columns()
RETURNS TRIGGER AS $$
DECLARE
  caller_role TEXT;
  caller_is_admin BOOLEAN;
BEGIN
  -- Service role or postgres superuser bypass
  caller_role := current_setting('request.jwt.claim.role', true);
  IF caller_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT (role = 'admin' AND is_banned = false) INTO caller_is_admin
  FROM profiles WHERE id = auth.uid();

  -- If caller is not admin, prevent modifying protected columns
  IF caller_is_admin IS NOT TRUE THEN
    IF TG_TABLE_NAME = 'profiles' THEN
      IF NEW.role <> OLD.role OR NEW.is_banned <> OLD.is_banned THEN
        RAISE EXCEPTION 'Unauthorized: only administrators can alter user role or ban status.';
      END IF;
    ELSIF TG_TABLE_NAME = 'rider_profiles' THEN
      IF NEW.verification <> OLD.verification OR
         NEW.verification_note IS DISTINCT FROM OLD.verification_note OR
         NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by OR
         NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at THEN
        RAISE EXCEPTION 'Unauthorized: rider verification fields can only be updated by administrators.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER trigger_protect_profiles_privileged
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_privileged_columns();

CREATE TRIGGER trigger_protect_rider_profiles_privileged
  BEFORE UPDATE ON rider_profiles
  FOR EACH ROW EXECUTE FUNCTION protect_privileged_columns();

-- 7. Trigger handle_new_user() on auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_name TEXT;
  default_avatar TEXT;
BEGIN
  default_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  default_avatar := NEW.raw_user_meta_data->>'avatar_url';

  INSERT INTO public.profiles (id, full_name, avatar_url, preferred_language, role, is_banned)
  VALUES (
    NEW.id,
    SUBSTRING(default_name FROM 1 FOR 100),
    default_avatar,
    'en',
    'user',
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Defensively never fail user creation
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 8. Rides table
CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_place VARCHAR(150) NOT NULL,
  to_place VARCHAR(150) NOT NULL,
  from_lat NUMERIC(9,6) NOT NULL,
  from_lng NUMERIC(9,6) NOT NULL,
  to_lat NUMERIC(9,6) NOT NULL,
  to_lng NUMERIC(9,6) NOT NULL,
  depart_at TIMESTAMPTZ NOT NULL,
  seats_total SMALLINT NOT NULL CHECK (seats_total BETWEEN 1 AND 2),
  seats_available SMALLINT NOT NULL CHECK (seats_available >= 0 AND seats_available <= seats_total),
  contribution_inr NUMERIC(6,2) NOT NULL CHECK (contribution_inr >= 0),
  distance_km NUMERIC(5,2) NOT NULL CHECK (distance_km > 0),
  notes VARCHAR(500),
  helmet_available BOOLEAN NOT NULL DEFAULT true,
  status ride_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_different_places CHECK (from_place <> to_place)
);

CREATE TRIGGER trigger_rides_updated_at
  BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_rides_search ON rides(from_place, to_place, depart_at);
CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON rides(rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_status_depart ON rides(status, depart_at);

-- 9. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status booking_status NOT NULL DEFAULT 'pending',
  helmet_confirmed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_ride_passenger UNIQUE (ride_id, passenger_id)
);

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_bookings_ride ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger ON bookings(passenger_id);

-- 10. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body VARCHAR(500) NOT NULL CHECK (length(body) >= 1 AND length(body) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_ride_time ON messages(ride_id, created_at);

-- 11. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);

-- 12. Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment VARCHAR(500) CHECK (comment IS NULL OR length(comment) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_ride_rating UNIQUE (ride_id, rater_id, ratee_id),
  CONSTRAINT check_different_rater_ratee CHECK (rater_id <> ratee_id)
);

-- 13. Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT NOT NULL,
  status report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Blocks table
CREATE TABLE IF NOT EXISTS blocks (
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT check_different_blocker_blocked CHECK (blocker_id <> blocked_id)
);

-- 15. Emergency Contacts table (max 3 per user)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION enforce_max_emergency_contacts()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
BEGIN
  SELECT count(*) INTO current_count
  FROM emergency_contacts
  WHERE user_id = NEW.user_id;

  IF current_count >= 3 THEN
    RAISE EXCEPTION 'Maximum limit of 3 emergency contacts reached.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_emergency_contacts_limit
  BEFORE INSERT ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION enforce_max_emergency_contacts();

-- 16. Trip Shares table
CREATE TABLE IF NOT EXISTS trip_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

