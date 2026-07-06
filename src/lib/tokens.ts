import crypto from "node:crypto"

/**
 * Generate a cryptographically random hex token.
 */
export function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

/**
 * Generate an email verification token with 24-hour expiry.
 */
export function generateVerificationToken(): { token: string; expires: Date } {
  const token = generateToken(32)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
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
