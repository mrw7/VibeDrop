"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseOrThrow, createTipSchema, AppError } from "@/lib/validations"
import { getStripe, TIP_MIN_AMOUNT, TIP_MAX_AMOUNT } from "@/lib/stripe"

export async function createCheckoutSession(
  appId: string,
  amount: number,
  message?: string,
) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(createTipSchema, { appId, amount, message })

  const app = await prisma.app.findUnique({
    where: { id: validated.appId },
    select: { id: true, title: true, authorId: true },
  })

  if (!app) throw AppError.notFound("作品不存在")

  // Cannot tip yourself
  if (app.authorId === session.user.id) {
    throw AppError.badRequest("不能给自己打赏")
  }

  const stripe = getStripe()
  if (!stripe) {
    throw AppError.badRequest("打赏功能暂未开放")
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "cny",
          product_data: {
            name: `打赏: ${app.title}`,
            description: message
              ? `留言: ${message.slice(0, 100)}`
              : `在 VibeDrop 上支持创作者`,
          },
          unit_amount: validated.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appId: validated.appId,
      tipperId: session.user.id as string,
      recipientId: app.authorId,
      message: validated.message || "",
    },
    success_url: `${baseUrl}/apps/${validated.appId}?tipped=success`,
    cancel_url: `${baseUrl}/apps/${validated.appId}`,
  })

  return { url: checkoutSession.url }
}
