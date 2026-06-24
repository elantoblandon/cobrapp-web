import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");
const requiredKeys = ["DATABASE_URL", "AUTH_SECRET"];

function parseEnvFile(content: string) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const [key, ...valueParts] = line.split("=");
        return [key, valueParts.join("=").replace(/^"|"$/g, "")];
      }),
  );
}

if (!fs.existsSync(envPath)) {
  console.error("Missing .env file.");
  process.exit(1);
}

const env = parseEnvFile(fs.readFileSync(envPath, "utf8"));
const missingKeys = requiredKeys.filter((key) => !env[key]);

if (missingKeys.length > 0) {
  console.error(`Missing required env vars: ${missingKeys.join(", ")}`);
  process.exit(1);
}

if (env.AUTH_SECRET.length < 32) {
  console.error("AUTH_SECRET must be at least 32 characters.");
  process.exit(1);
}

if (!env.DATABASE_URL.startsWith("postgresql://")) {
  console.error("DATABASE_URL must be a PostgreSQL connection string.");
  process.exit(1);
}

console.log("Environment looks ready.");
