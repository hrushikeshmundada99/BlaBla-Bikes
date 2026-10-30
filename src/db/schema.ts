import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  smallint,
  numeric,
  timestamp,
  jsonb,
  primaryKey,
  uniqueIndex,
  index,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Enums
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const rideStatusEnum = pgEnum("ride_status", ["open", "full", "cancelled", "completed"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
  "completed",
]);
export const riderVerificationEnum = pgEnum("rider_verification", [
  "none",
  "pending",
  "approved",
  "rejected",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewed",
  "dismissed",
  "actioned",
]);

// 2. Profiles Table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  bio: varchar("bio", { length: 280 }),
  phone: varchar("phone", { length: 20 }),
  preferredLanguage: varchar("preferred_language", { length: 5 })
    .default("en")
    .notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// 3. Rider Profiles Table
export const riderProfiles = pgTable("rider_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  bikeModel: varchar("bike_model", { length: 100 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 20 }).notNull().unique(),
  licenceNumber: varchar("licence_number", { length: 30 }).notNull().unique(),
  helmetAvailable: boolean("helmet_available").default(true).notNull(),
  bikePhotoPath: text("bike_photo_path"),
  licenceDocPath: text("licence_doc_path"),
  rcDocPath: text("rc_doc_path"),
  verification: riderVerificationEnum("verification").default("none").notNull(),
  verificationNote: text("verification_note"),
  reviewedBy: uuid("reviewed_by").references(() => profiles.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Rides Table
export const rides = pgTable(
  "rides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    riderId: uuid("rider_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    fromPlace: varchar("from_place", { length: 150 }).notNull(),
    toPlace: varchar("to_place", { length: 150 }).notNull(),
    fromLat: numeric("from_lat", { precision: 9, scale: 6 }).notNull(),
    fromLng: numeric("from_lng", { precision: 9, scale: 6 }).notNull(),
    toLat: numeric("to_lat", { precision: 9, scale: 6 }).notNull(),
    toLng: numeric("to_lng", { precision: 9, scale: 6 }).notNull(),
    departAt: timestamp("depart_at", { withTimezone: true }).notNull(),
    seatsTotal: smallint("seats_total").notNull(),
    seatsAvailable: smallint("seats_available").notNull(),
    contributionInr: numeric("contribution_inr", { precision: 6, scale: 2 }).notNull(),
    distanceKm: numeric("distance_km", { precision: 5, scale: 2 }).notNull(),
    notes: varchar("notes", { length: 500 }),
    helmetAvailable: boolean("helmet_available").default(true).notNull(),
    status: rideStatusEnum("status").default("open").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("check_different_places", sql`${table.fromPlace} <> ${table.toPlace}`),
    check("check_seats_total", sql`${table.seatsTotal} >= 1 AND ${table.seatsTotal} <= 2`),
    check(
      "check_seats_available",
      sql`${table.seatsAvailable} >= 0 AND ${table.seatsAvailable} <= ${table.seatsTotal}`
    ),
    check("check_contribution_non_neg", sql`${table.contributionInr} >= 0`),
    index("idx_rides_search").on(table.fromPlace, table.toPlace, table.departAt),
    index("idx_rides_rider").on(table.riderId),
    index("idx_rides_status_depart").on(table.status, table.departAt),
  ]
);

// 5. Bookings Table
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rideId: uuid("ride_id")
      .notNull()
      .references(() => rides.id, { onDelete: "cascade" }),
    passengerId: uuid("passenger_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: bookingStatusEnum("status").default("pending").notNull(),
    helmetConfirmed: boolean("helmet_confirmed").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_ride_passenger").on(table.rideId, table.passengerId),
    index("idx_bookings_ride").on(table.rideId),
    index("idx_bookings_passenger").on(table.passengerId),
  ]
);

// 6. Messages Table
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rideId: uuid("ride_id")
      .notNull()
      .references(() => rides.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: varchar("body", { length: 500 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("check_body_len", sql`length(${table.body}) >= 1 AND length(${table.body}) <= 500`),
    index("idx_messages_ride_time").on(table.rideId, table.createdAt),
  ]
);

// 7. Notifications Table
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    payload: jsonb("payload").default({}).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_notifications_user").on(table.userId, table.readAt)]
);

// 8. Ratings Table
export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    rideId: uuid("ride_id")
      .notNull()
      .references(() => rides.id, { onDelete: "cascade" }),
    raterId: uuid("rater_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    rateeId: uuid("ratee_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    score: smallint("score").notNull(),
    comment: varchar("comment", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_ride_rating").on(table.rideId, table.raterId, table.rateeId),
    check("check_score_range", sql`${table.score} >= 1 AND ${table.score} <= 5`),
    check("check_different_rater_ratee", sql`${table.raterId} <> ${table.rateeId}`),
  ]
);

// 9. Reports Table
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  reportedUserId: uuid("reported_user_id").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  rideId: uuid("ride_id").references(() => rides.id, { onDelete: "set null" }),
  reason: varchar("reason", { length: 100 }).notNull(),
  details: text("details").notNull(),
  status: reportStatusEnum("status").default("open").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 10. Blocks Table
export const blocks = pgTable(
  "blocks",
  {
    blockerId: uuid("blocker_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    blockedId: uuid("blocked_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.blockerId, table.blockedId] }),
    check("check_different_blocker_blocked", sql`${table.blockerId} <> ${table.blockedId}`),
  ]
);

// 11. Emergency Contacts Table
export const emergencyContacts = pgTable("emergency_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 12. Trip Shares Table
export const tripShares = pgTable("trip_shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  rideId: uuid("ride_id")
    .notNull()
    .references(() => rides.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 13. Audit Log Table
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => profiles.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

