import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter
// In production, replace with @upstash/ratelimit or similar
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
const RATE_LIMIT_MAX = 20 // max requests per window per IP

// Stricter rate limits for auth endpoints (credential stuffing prevention)
const AUTH_RATE_LIMIT_MAX = 5 // 5 attempts per minute per IP

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  )
}

function isRateLimited(ip: string, maxRequests = RATE_LIMIT_MAX): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (entry.count >= maxRequests) {
    return true
  }

  entry.count++
  return false
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60_000)

// Auth paths that need stricter rate limiting
const AUTH_PATHS = [
  "/api/auth/signup",
  "/auth/signin",       // credential stuffing target
  "/auth/reset-password", // abuse prevention
]

function isAuthPath(path: string): boolean {
  return AUTH_PATHS.some((p) => path.startsWith(p))
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Stripe webhooks are called by Stripe servers — bypass rate limiting
  if (path.startsWith("/api/webhooks/")) {
    return NextResponse.next()
  }

  // Rate limit based on path sensitivity
  if (
    path.startsWith("/api/") ||
    path.startsWith("/publish") ||
    isAuthPath(path)
  ) {
    const ip = getClientIP(request)
    const maxRequests = isAuthPath(path) ? AUTH_RATE_LIMIT_MAX : RATE_LIMIT_MAX

    if (isRateLimited(ip, maxRequests)) {
      return new NextResponse(
        JSON.stringify({ error: "请求过于频繁，请稍后再试", code: "RATE_LIMITED" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match API routes, publish, and auth paths
  matcher: ["/api/:path*", "/publish", "/auth/:path*"],
}
