const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..");

// 1. Determine environment file based on NODE_ENV
// Production server (Hostinger) runs with NODE_ENV=production
const isProd = process.env.NODE_ENV === "production";
const envFile = isProd ? ".env.production" : ".env.development";

// 2. Load base .env first (if present)
if (fs.existsSync(path.join(rootDir, ".env"))) {
  dotenv.config({ path: path.join(rootDir, ".env") });
}

// 3. Load environment-specific file (.env.production or .env.development)
if (fs.existsSync(path.join(rootDir, envFile))) {
  dotenv.config({ path: path.join(rootDir, envFile), override: true });
}