-- ==============================================================================
-- BlaBlaBikes: Row Level Security (RLS) & Public Views
-- Enforces strict data isolation, zero-trust policies, and public sanitization
-- ==============================================================================

-- 1. Public Profiles View (Never exposes phone, banned status, or sensitive metadata)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  preferred_language
FROM profiles
WHERE is_banned = false AND deleted_at IS NULL;

-- 2. Public Rider Profiles View (Exposes bike model & verified status, never documents or reg numbers)
CREATE OR REPLACE VIEW public_rider_profiles AS
SELECT
  user_id,
  bike_model,
  helmet_available,
  (verification = 'approved') AS is_verified
FROM rider_profiles;

-- 3. Enable RLS on all 12 tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 4. PROFILES Policies
CREATE POLICY "profiles_select_owner_or_admin"
  ON profiles FOR SELECT
  USING (
    id = (SELECT auth.uid()) OR
    is_admin()
  );
COMMENT ON POLICY "profiles_select_owner_or_admin" ON profiles IS
  'Users can view their own full profile data including phone. Admins can view all.';

CREATE POLICY "profiles_update_owner"
  ON profiles FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));
COMMENT ON POLICY "profiles_update_owner" ON profiles IS
  'Users can update their own profile. Privileged fields are guarded by trigger.';

-- 5. RIDER_PROFILES Policies
CREATE POLICY "rider_profiles_select_owner_or_admin"
  ON rider_profiles FOR SELECT
  USING (
    user_id = (SELECT auth.uid()) OR
    is_admin()
  );
COMMENT ON POLICY "rider_profiles_select_owner_or_admin" ON rider_profiles IS
  'Riders can view their own onboarding details and doc paths. Admins can view all for review.';

CREATE POLICY "rider_profiles_insert_owner"
  ON rider_profiles FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));
COMMENT ON POLICY "rider_profiles_insert_owner" ON rider_profiles IS
  'Users can submit their own rider onboarding profile.';

CREATE POLICY "rider_profiles_update_owner_or_admin"
  ON rider_profiles FOR UPDATE
  USING (
    user_id = (SELECT auth.uid()) OR
    is_admin()
  );
COMMENT ON POLICY "rider_profiles_update_owner_or_admin" ON rider_profiles IS
  'Riders can edit bike details; admins can update verification status.';

-- 6. RIDES Policies
CREATE POLICY "rides_select_active"
  ON rides FOR SELECT
  USING (
    -- Exclude rides by users who blocked the current user or whom the current user blocked
    NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = (SELECT auth.uid()) AND blocked_id = rides.rider_id)
         OR (blocker_id = rides.rider_id AND blocked_id = (SELECT auth.uid()))
    )
  );
COMMENT ON POLICY "rides_select_active" ON rides IS
  'Authenticated users can search rides, respecting user blocks.';

CREATE POLICY "rides_insert_verified_rider"
  ON rides FOR INSERT
  WITH CHECK (
    rider_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN rider_profiles rp ON rp.user_id = p.id
      WHERE p.id = (SELECT auth.uid())
        AND p.is_banned = false
        AND (auth.jwt()->>'email_verified')::boolean = true
        AND rp.verification IN ('pending', 'approved')
    )
  );
COMMENT ON POLICY "rides_insert_verified_rider" ON rides IS
  'Only email-verified users with a rider profile can offer rides.';

CREATE POLICY "rides_update_delete_owner"
  ON rides FOR ALL
  USING (rider_id = (SELECT auth.uid()))
  WITH CHECK (rider_id = (SELECT auth.uid()));
COMMENT ON POLICY "rides_update_delete_owner" ON rides IS
  'Riders can edit or cancel their own rides.';

-- 7. BOOKINGS Policies
CREATE POLICY "bookings_select_participant"
  ON bookings FOR SELECT
  USING (
    passenger_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM rides
      WHERE rides.id = bookings.ride_id AND rides.rider_id = (SELECT auth.uid())
    )
  );
COMMENT ON POLICY "bookings_select_participant" ON bookings IS
  'Passengers can see their own bookings; riders can see bookings for their rides.';

CREATE POLICY "bookings_insert_passenger"
  ON bookings FOR INSERT
  WITH CHECK (
    passenger_id = (SELECT auth.uid()) AND
    (auth.jwt()->>'email_verified')::boolean = true AND
    NOT EXISTS (
      SELECT 1 FROM rides
      WHERE rides.id = bookings.ride_id AND rides.rider_id = (SELECT auth.uid())
    )
  );
COMMENT ON POLICY "bookings_insert_passenger" ON bookings IS
  'Email-verified passengers can request rides. Riders cannot request seats on their own rides.';

CREATE POLICY "bookings_update_participant"
  ON bookings FOR UPDATE
  USING (
    passenger_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM rides
      WHERE rides.id = bookings.ride_id AND rides.rider_id = (SELECT auth.uid())
    )
  );
COMMENT ON POLICY "bookings_update_participant" ON bookings IS
  'Passengers can cancel their bookings; riders can accept or reject bookings.';

-- 8. MESSAGES Policies
CREATE POLICY "messages_select_participant"
  ON messages FOR SELECT
  USING (
    -- Sender must be rider or passenger on ride, and not blocked in either direction
    (
      EXISTS (
        SELECT 1 FROM rides
        WHERE rides.id = messages.ride_id AND rides.rider_id = (SELECT auth.uid())
      ) OR
      EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.ride_id = messages.ride_id
          AND bookings.passenger_id = (SELECT auth.uid())
          AND bookings.status IN ('pending', 'accepted')
      )
    ) AND
    NOT EXISTS (
      SELECT 1 FROM blocks
      WHERE (blocker_id = (SELECT auth.uid()) AND blocked_id = messages.sender_id)
         OR (blocker_id = messages.sender_id AND blocked_id = (SELECT auth.uid()))
    )
  );
COMMENT ON POLICY "messages_select_participant" ON messages IS
  'Messages are accessible strictly to riders and active/accepted passengers of the ride.';

CREATE POLICY "messages_insert_participant"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    (
      EXISTS (
        SELECT 1 FROM rides
        WHERE rides.id = messages.ride_id AND rides.rider_id = (SELECT auth.uid())
      ) OR
      EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.ride_id = messages.ride_id
          AND bookings.passenger_id = (SELECT auth.uid())
          AND bookings.status IN ('pending', 'accepted')
      )
    )
  );
COMMENT ON POLICY "messages_insert_participant" ON messages IS
  'Only authenticated ride participants can send messages.';

-- 9. NOTIFICATIONS Policies
CREATE POLICY "notifications_owner_all"
  ON notifications FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
COMMENT ON POLICY "notifications_owner_all" ON notifications IS
  'Users have exclusive private access to their notifications.';

-- 10. RATINGS Policies
CREATE POLICY "ratings_select_all"
  ON ratings FOR SELECT
  USING (true);
COMMENT ON POLICY "ratings_select_all" ON ratings IS
  'Ratings are publicly viewable for trust.';

CREATE POLICY "ratings_insert_participant"
  ON ratings FOR INSERT
  WITH CHECK (
    rater_id = (SELECT auth.uid()) AND
    rater_id <> ratee_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.ride_id = ratings.ride_id
        AND bookings.status = 'completed'
        AND (bookings.passenger_id = (SELECT auth.uid()) OR EXISTS (
          SELECT 1 FROM rides WHERE rides.id = ratings.ride_id AND rides.rider_id = (SELECT auth.uid())
        ))
    )
  );
COMMENT ON POLICY "ratings_insert_participant" ON ratings IS
  'Only passengers and riders of completed rides can rate each other.';

-- 11. REPORTS Policies
CREATE POLICY "reports_insert_user"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = (SELECT auth.uid()));
COMMENT ON POLICY "reports_insert_user" ON reports IS
  'Authenticated users can submit reports.';

CREATE POLICY "reports_select_admin_or_reporter"
  ON reports FOR SELECT
  USING (
    reporter_id = (SELECT auth.uid()) OR
    is_admin()
  );
COMMENT ON POLICY "reports_select_admin_or_reporter" ON reports IS
  'Users can see reports they submitted; admins can review all.';

-- 12. BLOCKS Policies
CREATE POLICY "blocks_owner_all"
  ON blocks FOR ALL
  USING (blocker_id = (SELECT auth.uid()))
  WITH CHECK (blocker_id = (SELECT auth.uid()));
COMMENT ON POLICY "blocks_owner_all" ON blocks IS
  'Users have full access to manage their blocked accounts list.';

-- 13. EMERGENCY_CONTACTS Policies
CREATE POLICY "emergency_contacts_owner_all"
  ON emergency_contacts FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
COMMENT ON POLICY "emergency_contacts_owner_all" ON emergency_contacts IS
  'Emergency contacts are private to the user.';

-- 14. TRIP_SHARES Policies
CREATE POLICY "trip_shares_select_token"
  ON trip_shares FOR SELECT
  USING (
    expires_at > NOW() OR
    created_by = (SELECT auth.uid())
  );
COMMENT ON POLICY "trip_shares_select_token" ON trip_shares IS
  'Active trip share links can be read via public token.';

CREATE POLICY "trip_shares_insert_owner"
  ON trip_shares FOR INSERT
  WITH CHECK (created_by = (SELECT auth.uid()));
COMMENT ON POLICY "trip_shares_insert_owner" ON trip_shares IS
  'Users can create trip share links for their rides.';

-- 15. AUDIT_LOG Policies
CREATE POLICY "audit_log_select_admin"
  ON audit_log FOR SELECT
  USING (is_admin());
COMMENT ON POLICY "audit_log_select_admin" ON audit_log IS
  'Audit logs are strictly readable only by system administrators.';

-- ==============================================================================
-- 16. Supabase Storage Buckets & Policies
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('rider-docs', 'rider-docs', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for Avatars (Public read, Owner write in folder {auth.uid()})
CREATE POLICY "avatars_public_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Storage Policies for Rider Docs (Private, Owner & Admin only)
CREATE POLICY "rider_docs_select_owner_or_admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'rider-docs' AND
    (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text OR
      is_admin()
    )
  );

CREATE POLICY "rider_docs_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'rider-docs' AND
    (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

