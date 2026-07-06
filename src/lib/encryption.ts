import crypto from "node:crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn("ENCRYPTION_KEY is not set or too short. Using default key for development.")
}

// Derive a 32-byte key from the ENCRYPTION_KEY string
function deriveKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest()
}

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12 // 96 bits for GCM
const TAG_LENGTH = 16 // 128 bits

/**
 * Encrypt a token using AES-256-GCM.
 * Output format: hex(iv) + ":" + hex(ciphertext+tag)
 */
export function encryptToken(token: string): string {
  const key = deriveKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ])

  const tag = cipher.getAuthTag()

  // format: iv:ciphertext+tag (all hex)
  return `${iv.toString("hex")}:${Buffer.concat([encrypted, tag]).toString("hex")}`
}

/**
 * Decrypt a token using AES-256-GCM.
 */
export function decryptToken(encryptedToken: string): string {
  const key = deriveKey()

  const parts = encryptedToken.split(":")
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted token format")
  }

  const iv = Buffer.from(parts[0], "hex")
  const data = Buffer.from(parts[1], "hex")

  // Last TAG_LENGTH bytes are the auth tag
  const ciphertext = data.subarray(0, data.length - TAG_LENGTH)
  const tag = data.subarray(data.length - TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}
