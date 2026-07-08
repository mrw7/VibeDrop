"use server"

import { auth, signIn } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { parseOrThrow, signUpSchema, signInSchema, passwordResetRequestSchema, passwordResetSchema, AppError } from "@/lib/validations"
import { hashPassword } from "@/lib/password"
import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email"

/**
 * Create a new account with email and password.
 * Sends a verification email and redirects to the verify page.
 */
export async function signUp(formData: FormData) {
  const raw = {
    email: formData.get("email") as string || "",
    password: formData.get("password") as string || "",
    name: formData.get("name") as string || "",
  }

  const input = parseOrThrow(signUpSchema, raw)

  // Check for duplicate email
  const existing = await prisma.user.findFirst({
    where: { email: input.email.toLowerCase().trim() },
  })
  if (existing) {
    throw AppError.conflict("该邮箱已注册")
  }

  // Hash password
  const passwordHash = await hashPassword(input.password)

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      name: input.name,
      passwordHash,
      githubLogin: null,
    },
  })

  // Generate and store verification token
  const { token, expires } = generateVerificationToken()
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: token, // Reusing resetToken field for verification token
      resetTokenExpiry: expires,
    },
  })

  // Send verification email
  try {
    await sendVerificationEmail(user.email!, token, input.name)
  } catch {
    // Email failed but account is created — user can resend verification
    console.warn("Failed to send verification email to", user.email)
  }

  // Dev mode: pass code in URL so it shows on the verify page (no SMTP needed)
  const devParam = process.env.NODE_ENV !== "production" ? `&code=${token}` : ""
  redirect(`/auth/verify?email=${encodeURIComponent(user.email!)}${devParam}`)
}

/**
 * Sign in with email and password credentials.
 */
export async function signInWithPassword(formData: FormData) {
  const raw = {
    email: formData.get("email") as string || "",
    password: formData.get("password") as string || "",
  }

  parseOrThrow(signInSchema, raw)

  // NextAuth handles the actual credential verification via the authorize() callback
  try {
    await signIn("credentials", {
      email: raw.email.toLowerCase().trim(),
      password: raw.password,
      redirect: false,
    })
  } catch (error) {
    // NextAuth throws CredentialsSignin on failure
    if (error instanceof Error) {
      // Check for email-not-verified errors thrown from authorize()
      if (error.message.startsWith("EMAIL_NOT_VERIFIED:")) {
        throw AppError.emailNotVerified(error.message.split(":")[1])
      }
    }
    throw AppError.badRequest("邮箱或密码错误")
  }

  redirect("/")
}

/**
 * Request a password reset link.
 * Always returns success to prevent email enumeration.
 */
export async function requestPasswordReset(formData: FormData) {
  const raw = {
    email: formData.get("email") as string || "",
  }

  const input = parseOrThrow(passwordResetRequestSchema, raw)

  const user = await prisma.user.findFirst({
    where: { email: input.email.toLowerCase().trim() },
  })

  // Always return success, even if email doesn't exist (prevents enumeration)
  if (user && user.email) {
    // Rate limit: check if a recent token exists
    if (user.resetTokenExpiry && user.resetTokenExpiry > new Date(Date.now() - 60 * 1000)) {
      // Token was generated less than 60 seconds ago — silently skip
      return { success: true }
    }

    const { token, expires } = generatePasswordResetToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    })

    try {
      await sendPasswordResetEmail(user.email, token, user.name || user.githubLogin || user.email)
    } catch {
      console.warn("Failed to send password reset email to", user.email)
    }
  }

  return { success: true }
}

/**
 * Set a new password using a reset token.
 */
export async function resetPassword(formData: FormData) {
  const raw = {
    token: formData.get("token") as string || "",
    password: formData.get("password") as string || "",
  }

  const input = parseOrThrow(passwordResetSchema, raw)

  // Find user by reset token
  const user = await prisma.user.findFirst({
    where: { resetToken: input.token },
  })

  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw AppError.badRequest("重置链接已过期，请重新请求")
  }

  // Set new password and clear reset token
  const passwordHash = await hashPassword(input.password)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      // If user wasn't verified (shouldn't happen, but be safe), verify them now
      emailVerified: user.emailVerified || new Date(),
    },
  })

  redirect("/auth/signin?reset=success")
}

/**
 * Resend verification email.
 */
export async function resendVerificationEmail(formData: FormData) {
  const raw = {
    email: formData.get("email") as string || "",
  }

  if (!raw.email) {
    throw AppError.badRequest("请输入邮箱地址")
  }

  const user = await prisma.user.findFirst({
    where: { email: raw.email.toLowerCase().trim() },
  })

  // Always return success (prevent enumeration)
  if (user && user.email && !user.emailVerified) {
    // Rate limit
    if (user.resetTokenExpiry && user.resetTokenExpiry > new Date(Date.now() - 60 * 1000)) {
      return { success: true }
    }

    const { token, expires } = generateVerificationToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expires,
      },
    })

    try {
      await sendVerificationEmail(user.email, token, user.name || user.email)
    } catch {
      console.warn("Failed to resend verification email to", user.email)
    }
  }

  return { success: true }
}
