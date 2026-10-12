const path = require("path");
const dotenv = require("dotenv");

// Load environment based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.resolve(__dirname, "..", envFile),
});