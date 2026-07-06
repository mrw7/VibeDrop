/**
 * Environment variable validation.
 * Fails fast on startup if required vars are missing.
 */

const REQUIRED_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "OSS_REGION",
  "OSS_BUCKET",
  "OSS_ACCESS_KEY_ID",
  "OSS_ACCESS_KEY_SECRET",
  "ENCRYPTION_KEY",
] as const

const OPTIONAL_VARS = [
  "ADMIN_GITHUB_IDS",
  "PLAYWRIGHT_BASE_URL",
  // SMTP email (required for email/password auth)
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
  // Stripe (required for tipping system)
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  // Emulator (required for native cloud emulator)
  "EMULATOR_ENABLED",
  "EMULATOR_DOCKER_HOST",
  "EMULATOR_MAX_SESSIONS",
  "EMULATOR_SESSION_TIMEOUT",
] as const

interface EnvValidation {
  valid: boolean
  missing: string[]
  warnings: string[]
}

export function validateEnv(): EnvValidation {
  const missing: string[] = []
  const warnings: string[] = []

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  // Specific validations
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    warnings.push("ENCRYPTION_KEY should be at least 32 characters")
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 16) {
    warnings.push("NEXTAUTH_SECRET should be at least 16 characters")
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgresql://")) {
    warnings.push("DATABASE_URL should start with postgresql://")
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

// Validate on import (once at startup)
const validation = validateEnv()

if (!validation.valid) {
  console.error("❌ Missing required environment variables:")
  validation.missing.forEach((v) => console.error(`  - ${v}`))
  console.error("Set them in .env.local and restart.\n")
}

if (validation.warnings.length > 0) {
  console.warn("⚠️  Environment variable warnings:")
  validation.warnings.forEach((w) => console.warn(`  - ${w}`))
}
