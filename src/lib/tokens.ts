import crypto from "node:crypto"

/**
 * Generate a cryptographically random hex token.
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

/**
 * Generate a 6-digit email verification code (e.g. "384729").
 */
export function generateVerificationCode(): string {
  return String(Math.floor(100000 + crypto.randomInt(900000)))
}

/**
 * Generate an email verification code with 10-minute expiry.
 */
export function generateVerificationToken(): { token: string; expires: Date } {
  const token = generateVerificationCode()
  const expires = new Date(Date.now() + 10 * 60 * 1000)
  return { token, expires }
}

/**
 * Generate a password reset token with 1-hour expiry.
 */
export function generatePasswordResetToken(): { token: string; expires: Date } {
  const token = generateToken(32)
  const expires = new Date(Date.now() + 60 * 60 * 1000)
  return { token, expires }
}
