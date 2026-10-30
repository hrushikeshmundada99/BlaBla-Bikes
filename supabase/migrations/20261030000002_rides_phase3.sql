-- ==============================================================================
-- BlaBlaBikes Migration: Phase 3 Ride Enhancements
-- 1. Alter rides.contribution_inr to INTEGER and limit to 0..500
-- 2. Add idempotency_key column and unique index
-- 3. Add haversine_distance_km function for spatial search
-- ==============================================================================

-- 1. Alter contribution_inr column to integer with 0..500 check
ALTER TABLE rides DROP CONSTRAINT IF EXISTS rides_contribution_inr_check;
ALTER TABLE rides ALTER COLUMN contribution_inr TYPE integer USING round(contribution_inr)::integer;
ALTER TABLE rides ADD CONSTRAINT rides_contribution_inr_check CHECK (contribution_inr >= 0 AND contribution_inr <= 500);

COMMENT ON COLUMN rides.contribution_inr IS 'Fuel cost contribution in whole INR (0 to 500 ceiling to prevent typo abuse).';

-- 2. Add idempotency_key with unique partial index on (rider_id, idempotency_key)
ALTER TABLE rides ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS idx_rides_rider_idempotency 
ON rides(rider_id, idempotency_key) 
WHERE idempotency_key IS NOT NULL;

COMMENT ON COLUMN rides.idempotency_key IS 'Client-supplied UUID/token to prevent duplicate ride creations on double-click or network retry.';

-- 3. Spatial haversine distance helper function
CREATE OR REPLACE FUNCTION haversine_distance_km(
    lat1 double precision,
    lon1 double precision,
    lat2 double precision,
    lon2 double precision
) RETURNS double precision AS $$
DECLARE
    r double precision := 6371.0;
    dlat double precision := radians(lat2 - lat1);
    dlon double precision := radians(lon2 - lon1);
    a double precision;
    c double precision;
BEGIN
    a := sin(dlat / 2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)^2;
    c := 2 * atan2(sqrt(a), sqrt(1 - a));
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

COMMENT ON FUNCTION haversine_distance_km IS 'Returns the Great Circle haversine distance in kilometers between two lat/lng points.';
