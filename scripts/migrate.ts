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

  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations");
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    console.log(`📄 Applying ${file}...`);
    try {
      await sql.unsafe(content);
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
