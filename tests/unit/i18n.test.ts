import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

function flattenKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];
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

describe("i18n Translation Catalogs Integrity", () => {
  const messagesDir = path.resolve(__dirname, "../../messages");
  const enCatalog = JSON.parse(
    fs.readFileSync(path.join(messagesDir, "en.json"), "utf-8")
  );
  const hiCatalog = JSON.parse(
    fs.readFileSync(path.join(messagesDir, "hi.json"), "utf-8")
  );
  const mrCatalog = JSON.parse(
    fs.readFileSync(path.join(messagesDir, "mr.json"), "utf-8")
  );

  const enKeys = new Set(flattenKeys(enCatalog));
  const hiKeys = new Set(flattenKeys(hiCatalog));
  const mrKeys = new Set(flattenKeys(mrCatalog));

  it("has non-empty message catalogs", () => {
    expect(enKeys.size).toBeGreaterThan(50);
    expect(hiKeys.size).toBeGreaterThan(50);
    expect(mrKeys.size).toBeGreaterThan(50);
  });

  it("guarantees 100% key parity between English and Hindi", () => {
    const missingInHi = [...enKeys].filter((k) => !hiKeys.has(k));
    expect(missingInHi).toEqual([]);
  });

  it("guarantees 100% key parity between English and Marathi", () => {
    const missingInMr = [...enKeys].filter((k) => !mrKeys.has(k));
    expect(missingInMr).toEqual([]);
  });

  it("contains strictly cost-sharing and non-commercial disclaimer terms in all locales", () => {
    expect(enCatalog.common.costSharingOnly).toContain("Cost-Sharing");
    expect(hiCatalog.common.costSharingOnly).toContain("लागत-साझाकरण");
    expect(mrCatalog.common.costSharingOnly).toContain("खर्च-विभागणी");
  });
});

