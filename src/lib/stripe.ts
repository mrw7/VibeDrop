import Stripe from "stripe"

let _stripe: Stripe | null | undefined

/**
 * Get the Stripe client instance.
 * Returns null if STRIPE_SECRET_KEY is not configured (tipping disabled).
 */
export function getStripe(): Stripe | null {
  if (_stripe !== undefined) return _stripe

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.warn("STRIPE_SECRET_KEY not configured — tipping is disabled")
    _stripe = null
    return null
  }

  _stripe = new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    typescript: true,
  })

  return _stripe
}

/**
 * Tip amount presets in cents (CNY).
 */
export const TIP_PRESETS = [
  { amount: 500, label: "¥5" },
  { amount: 1000, label: "¥10" },
  { amount: 2000, label: "¥20" },
  { amount: 5000, label: "¥50" },
] as const

export const TIP_MIN_AMOUNT = 100 // ¥1.00
export const TIP_MAX_AMOUNT = 999999 // ¥9,999.99
