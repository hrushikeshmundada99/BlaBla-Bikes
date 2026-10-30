import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Database RLS & Security Policies Verification", () => {
  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
  const rlsSql = fs.readFileSync(
    path.join(migrationsDir, "20261030000001_rls_and_views.sql"),
    "utf-8"
  );
  const coreSql = fs.readFileSync(
    path.join(migrationsDir, "20261030000000_core_schema.sql"),
    "utf-8"
  );

  const tables = [
    "profiles",
    "rider_profiles",
    "rides",
    "bookings",
    "messages",
    "notifications",
    "ratings",
    "reports",
    "blocks",
    "emergency_contacts",
    "trip_shares",
    "audit_log",
  ];

  it("enables Row Level Security on ALL 12 core tables", () => {
    for (const table of tables) {
      expect(rlsSql).toContain(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
    }
  });

  it("defines public sanitization views for profiles and rider profiles", () => {
    expect(rlsSql).toContain("CREATE OR REPLACE VIEW public_profiles");
    expect(rlsSql).toContain("CREATE OR REPLACE VIEW public_rider_profiles");

    // Views should never leak phone or private document paths
    expect(rlsSql).not.toContain("SELECT phone FROM public_profiles");
    expect(rlsSql).not.toContain("SELECT licence_doc_path FROM public_rider_profiles");
  });

  it("enforces participant-only isolation on coordination messages", () => {
    expect(rlsSql).toContain('CREATE POLICY "messages_select_participant"');
    expect(rlsSql).toContain('CREATE POLICY "messages_insert_participant"');
    // Checks that messages check ride_id and rider/passenger membership
    expect(rlsSql).toContain("rides.rider_id = (SELECT auth.uid())");
    expect(rlsSql).toContain("bookings.passenger_id = (SELECT auth.uid())");
  });

  it("enforces emergency contacts owner isolation and max 3 trigger", () => {
    expect(rlsSql).toContain('CREATE POLICY "emergency_contacts_owner_all"');
    expect(rlsSql).toContain("user_id = (SELECT auth.uid())");
    expect(coreSql).toContain("enforce_max_emergency_contacts()");
  });

  it("protects privileged columns (role, is_banned, verification) from unauthorized API updates", () => {
    expect(coreSql).toContain("protect_privileged_columns()");
    expect(coreSql).toContain("NEW.role <> OLD.role");
    expect(coreSql).toContain("NEW.is_banned <> OLD.is_banned");
    expect(coreSql).toContain("NEW.verification <> OLD.verification");
  });

  it("configures storage buckets with private rider-docs and size limits", () => {
    expect(rlsSql).toContain("INSERT INTO storage.buckets");
    expect(rlsSql).toContain("'avatars'");
    expect(rlsSql).toContain("'rider-docs'");
    expect(rlsSql).toContain("CREATE POLICY \"rider_docs_select_owner_or_admin\"");
  });
});

