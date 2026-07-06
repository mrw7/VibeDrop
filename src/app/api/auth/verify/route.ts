import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * GET /api/auth/verify?token=xxx
 * Verifies a user's email address.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/verify?error=missing-token", request.url),
    )
  }

  try {
    // Find user by reset token (reused for verification)
    const user = await prisma.user.findFirst({
      where: { resetToken: token },
    })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.redirect(
        new URL("/auth/verify?error=expired", request.url),
      )
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.redirect(
      new URL("/auth/signin?verified=success", request.url),
    )
  } catch (error) {
    console.error("Email verification failed:", error)
    return NextResponse.redirect(
      new URL("/auth/verify?error=server-error", request.url),
    )
  }
}
