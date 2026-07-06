import { type NextRequest, NextResponse } from "next/server"

const ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL || "http://localhost:3000",
]

/**
 * Validate the Origin/Referer header for API mutation requests.
 * Returns an error Response if the origin is invalid, or null if OK.
 */
export function validateOrigin(request: NextRequest): NextResponse | null {
  // Only check mutation methods
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return null
  }

  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")

  // In development, allow requests without origin (e.g., curl, server-to-server)
  if (process.env.NODE_ENV !== "production") {
    return null
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null)

  if (!requestOrigin) {
    return NextResponse.json(
      { error: "Missing Origin header", code: "CSRF_REJECTED" },
      { status: 403 }
    )
  }

  const isAllowed = ALLOWED_ORIGINS.some((allowed) => {
    try {
      const allowedUrl = new URL(allowed)
      const requestUrl = new URL(requestOrigin)
      return allowedUrl.origin === requestUrl.origin
    } catch {
      return false
    }
  })

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Invalid Origin", code: "CSRF_REJECTED" },
      { status: 403 }
    )
  }

  return null
}
