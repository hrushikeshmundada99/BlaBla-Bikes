import postgres from "postgres";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL!;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

async function runMigrations() {
  console.log("🚀 Running database migrations on:", databaseUrl.replace(/:[^:@]+@/, ":****@"));

  // Ensure migrations tracking table exists
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const appliedRows = await sql<{ version: string }[]>`SELECT version FROM _schema_migrations;`;
  const appliedSet = new Set(appliedRows.map((r) => r.version));

  // If profiles table already exists from previous manual apply, seed earlier migrations
  if (!appliedSet.has("20261030000000_core_schema.sql")) {
    const tableCheck = await sql`
      SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles';
    `;
    if (tableCheck.length > 0) {
      await sql`INSERT INTO _schema_migrations (version) VALUES ('20261030000000_core_schema.sql'), ('20261030000001_rls_and_views.sql') ON CONFLICT DO NOTHING;`;
      appliedSet.add("20261030000000_core_schema.sql");
      appliedSet.add("20261030000001_rls_and_views.sql");
    }
  }

  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏩ Skipping ${file} (already applied)`);
      continue;
    }

    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    console.log(`📄 Applying ${file}...`);
    try {
      await sql.begin(async (tx) => {
        await tx.unsafe(content);
        await tx`INSERT INTO _schema_migrations (version) VALUES (${file});`;
      });
      console.log(`✅ Applied ${file}`);
    } catch (err: any) {
      console.error(`❌ Migration error in ${file}:`, err.message);
      process.exit(1);
    }
  }

  console.log("🎉 All migrations applied successfully!");
  await sql.end();
}

runMigrations().catch((err) => {
  console.error("Migration runner failed:", err);
  process.exit(1);
});
