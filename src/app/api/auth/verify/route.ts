import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * POST /api/auth/verify
 * Body: { email: string, code: string }
 * Verifies a user's email address using a 6-digit code.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json({ error: "邮箱和验证码不能为空" }, { status: 400 })
    }

    // Find user by email and verify code matches
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        resetToken: code.trim(),
      },
    })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 },
      )
    }

    // Mark email as verified and clear code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error("Email verification failed:", error)
    return NextResponse.json({ error: "验证失败，请稍后重试" }, { status: 500 })
  }
}
