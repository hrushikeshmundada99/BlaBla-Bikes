import { createClient } from "@supabase/supabase-js";
import { NASHIK_PLACES } from "../src/lib/constants/nashik-places.js";
import { calculateDistanceKm, calculateSuggestedContribution } from "../src/lib/constants/pricing.js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (process.env.NODE_ENV === "production") {
  console.error("❌ Refusing to run seed script in production!");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || "NashikRide2026!";

interface DemoUser {
  email: string;
  fullName: string;
  phone: string;
  role: "user" | "admin";
  preferredLanguage: "en" | "hi" | "mr";
  rider?: {
    bikeModel: string;
    registrationNumber: string;
    licenceNumber: string;
    helmetAvailable: boolean;
    verification: "approved" | "pending";
  };
}

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@blablabikes.in",
    fullName: "Nashik Admin",
    phone: "9822011000",
    role: "admin",
    preferredLanguage: "mr",
  },
  {
    email: "rahul.deshmukh@blablabikes.in",
    fullName: "Rahul Deshmukh",
    phone: "9822011001",
    role: "user",
    preferredLanguage: "mr",
    rider: {
      bikeModel: "Honda Shine 125",
      registrationNumber: "MH15AB1001",
      licenceNumber: "MH1520150011001",
      helmetAvailable: true,
      verification: "approved",
    },
  },
  {
    email: "amit.shinde@blablabikes.in",
    fullName: "Amit Shinde",
    phone: "9822011002",
    role: "user",
    preferredLanguage: "mr",
    rider: {
      bikeModel: "Bajaj Pulsar 150",
      registrationNumber: "MH15AB1002",
      licenceNumber: "MH1520160011002",
      helmetAvailable: true,
      verification: "approved",
    },
  },
  {
    email: "pooja.patil@blablabikes.in",
    fullName: "Pooja Patil",
    phone: "9822011003",
    role: "user",
    preferredLanguage: "mr",
    rider: {
      bikeModel: "TVS Raider 125",
      registrationNumber: "MH15AB1003",
      licenceNumber: "MH1520170011003",
      helmetAvailable: true,
      verification: "approved",
    },
  },
  {
    email: "vikas.more@blablabikes.in",
    fullName: "Vikas More",
    phone: "9822011004",
    role: "user",
    preferredLanguage: "hi",
    rider: {
      bikeModel: "Hero Splendor Plus",
      registrationNumber: "MH15AB1004",
      licenceNumber: "MH1520180011004",
      helmetAvailable: true,
      verification: "approved",
    },
  },
  {
    email: "suresh.kulkarni@blablabikes.in",
    fullName: "Suresh Kulkarni",
    phone: "9822011005",
    role: "user",
    preferredLanguage: "mr",
    rider: {
      bikeModel: "Yamaha FZ-S",
      registrationNumber: "MH15AB1005",
      licenceNumber: "MH1520190011005",
      helmetAvailable: true,
      verification: "approved",
    },
  },
  {
    email: "neha.jadhav@blablabikes.in",
    fullName: "Neha Jadhav",
    phone: "9822011006",
    role: "user",
    preferredLanguage: "mr",
    rider: {
      bikeModel: "Royal Enfield Classic 350",
      registrationNumber: "MH15AB1006",
      licenceNumber: "MH1520200011006",
      helmetAvailable: true,
      verification: "approved",
    },
  },
  {
    email: "rohit.verma@blablabikes.in",
    fullName: "Rohit Verma",
    phone: "9822011007",
    role: "user",
    preferredLanguage: "hi",
    rider: {
      bikeModel: "Suzuki Gixxer 150",
      registrationNumber: "MH15CD2001",
      licenceNumber: "MH1520210012001",
      helmetAvailable: true,
      verification: "pending",
    },
  },
  {
    email: "sneha.kapse@blablabikes.in",
    fullName: "Sneha Kapse",
    phone: "9822011008",
    role: "user",
    preferredLanguage: "mr",
    rider: {
      bikeModel: "Honda Unicorn 160",
      registrationNumber: "MH15CD2002",
      licenceNumber: "MH1520220012002",
      helmetAvailable: true,
      verification: "pending",
    },
  },
  {
    email: "anand.joshi@blablabikes.in",
    fullName: "Anand Joshi",
    phone: "9822011009",
    role: "user",
    preferredLanguage: "en",
  },
];

async function seed() {
  console.log("🌱 Starting BlaBlaBikes Nashik seed script...");
  console.log(`🔐 Default password for all demo accounts: ${DEFAULT_PASSWORD}`);

  const userIds: Record<string, string> = {};
  const approvedRiderIds: string[] = [];

  // 1. Create or retrieve users
  for (const demo of DEMO_USERS) {
    const { data: userList } = await supabase.auth.admin.listUsers();
    let existing = userList?.users.find((u) => u.email === demo.email);

    if (!existing) {
      const { data: created, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: demo.fullName },
      });

      if (error) {
        console.error(`Error creating user ${demo.email}:`, error.message);
        continue;
      }
      existing = created.user;
    }

    if (!existing) continue;
    userIds[demo.email] = existing.id;

    // Upsert profile
    await supabase.from("profiles").upsert(
      {
        id: existing.id,
        full_name: demo.fullName,
        phone: demo.phone,
        preferred_language: demo.preferredLanguage,
        role: demo.role,
        is_banned: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // Upsert rider profile if applicable
    if (demo.rider) {
      await supabase.from("rider_profiles").upsert(
        {
          user_id: existing.id,
          bike_model: demo.rider.bikeModel,
          registration_number: demo.rider.registrationNumber,
          licence_number: demo.rider.licenceNumber,
          helmet_available: demo.rider.helmetAvailable,
          verification: demo.rider.verification,
          verification_note: demo.rider.verification === "approved" ? "Approved by Nashik RTO verification desk" : null,
          reviewed_at: demo.rider.verification === "approved" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (demo.rider.verification === "approved") {
        approvedRiderIds.push(existing.id);
      }
    }
  }

  console.log(`✅ Upserted ${Object.keys(userIds).length} demo users and profiles.`);
  console.log(`✅ Approved riders: ${approvedRiderIds.length}.`);

  // 2. Generate 30 realistic Nashik Rides across popular commute routes
  if (approvedRiderIds.length > 0) {
    console.log("🛵 Generating 30 sample rides across Nashik...");

    const sampleRides = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const riderId = approvedRiderIds[i % approvedRiderIds.length];

      // Pick two distinct locations from NASHIK_PLACES
      const fromIdx = (i * 3) % NASHIK_PLACES.length;
      let toIdx = (fromIdx + 4) % NASHIK_PLACES.length;
      if (fromIdx === toIdx) toIdx = (toIdx + 1) % NASHIK_PLACES.length;

      const fromPlace = NASHIK_PLACES[fromIdx];
      const toPlace = NASHIK_PLACES[toIdx];

      const distanceKm = calculateDistanceKm(
        fromPlace.latitude,
        fromPlace.longitude,
        toPlace.latitude,
        toPlace.longitude
      );

      const contribution = calculateSuggestedContribution(distanceKm);

      // Distribute departures over the next 5 days at peak commute hours (8:30 AM to 7:00 PM)
      const dayOffset = Math.floor(i / 6) + 1;
      const hour = 8 + (i % 5) * 2; // 8, 10, 12, 14, 16
      const minute = (i % 2 === 0) ? 15 : 45;

      const departAt = new Date(now);
      departAt.setDate(departAt.getDate() + dayOffset);
      departAt.setHours(hour, minute, 0, 0);

      sampleRides.push({
        rider_id: riderId,
        from_place: fromPlace.name,
        to_place: toPlace.name,
        from_lat: fromPlace.latitude,
        from_lng: fromPlace.longitude,
        to_lat: toPlace.latitude,
        to_lng: toPlace.longitude,
        depart_at: departAt.toISOString(),
        seats_total: (i % 3 === 0) ? 2 : 1,
        seats_available: (i % 3 === 0) ? 2 : 1,
        contribution_inr: contribution,
        distance_km: distanceKm,
        notes: `Leaving on time near ${fromPlace.name.split(" ")[0]}. ISI helmet available for co-passenger.`,
        helmet_available: true,
        status: "open",
      });
    }

    // Clear existing sample rides before inserting
    await supabase.from("rides").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const { error: rideErr } = await supabase.from("rides").insert(sampleRides);
    if (rideErr) {
      console.error("Error inserting sample rides:", rideErr.message);
    } else {
      console.log(`✅ Successfully seeded 30 Nashik rides!`);
    }
  }

  console.log("🎉 Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("Unhandled error in seed script:", err);
  process.exit(1);
});
