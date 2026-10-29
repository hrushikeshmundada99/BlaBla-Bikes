import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const messagesDir = path.join(rootDir, "messages");

const locales = ["en", "hi", "mr"];

function flattenKeys(obj, prefix = "") {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

console.log("Checking i18n message key consistency across en, hi, mr...");

const catalogs = {};
for (const loc of locales) {
  const filePath = path.join(messagesDir, `${loc}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing locale file: ${filePath}`);
    process.exit(1);
  }
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  catalogs[loc] = {
    keys: new Set(flattenKeys(content)),
    count: flattenKeys(content).length,
  };
  console.log(`- Locale [${loc}]: ${catalogs[loc].count} keys found.`);
}

const enKeys = catalogs["en"].keys;
let hasError = false;

for (const loc of ["hi", "mr"]) {
  const locKeys = catalogs[loc].keys;
  const missingInLoc = [...enKeys].filter((k) => !locKeys.has(k));
  const extraInLoc = [...locKeys].filter((k) => !enKeys.has(k));

  if (missingInLoc.length > 0) {
    console.error(`Error: Locale [${loc}] is missing ${missingInLoc.length} keys from en:`);
    missingInLoc.forEach((k) => console.error(`  - ${k}`));
    hasError = true;
  }

  if (extraInLoc.length > 0) {
    console.warn(`Warning: Locale [${loc}] has ${extraInLoc.length} extra keys not in en:`);
    extraInLoc.forEach((k) => console.warn(`  + ${k}`));
  }
}

if (hasError) {
  console.error("\n❌ i18n consistency check failed. Please ensure all keys exist in en, hi, and mr.");
  process.exit(1);
} else {
  console.log("\n✅ All i18n keys are fully consistent across en, hi, and mr!");
  process.exit(0);
}

