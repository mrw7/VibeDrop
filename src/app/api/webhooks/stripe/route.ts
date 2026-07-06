import { prisma } from "@/lib/prisma"
import { getStripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = (await headers()).get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const { appId, tipperId, recipientId, message } = session.metadata || {}

    if (!appId || !tipperId || !recipientId) {
      console.error("Missing metadata in Stripe session:", session.id)
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const amount = session.amount_total || 0
    const currency = session.currency || "cny"

    try {
      await prisma.$transaction([
        prisma.tip.create({
          data: {
            tipperId,
            appId,
            recipientId,
            amount,
            currency,
            message: message || null,
            stripeSessionId: session.id,
          },
        }),
        prisma.app.update({
          where: { id: appId },
          data: {
            tipsCount: { increment: 1 },
            tipsTotal: { increment: amount },
          },
        }),
      ])

      // Revalidate affected pages
      revalidatePath(`/apps/${appId}`)
      revalidatePath(`/users/${recipientId}`)
    } catch (error) {
      // Duplicate webhook — unique constraint on stripeSessionId
      const message =
        error instanceof Error ? error.message : String(error)
      if (message.includes("Unique constraint")) {
        console.log("Duplicate webhook event ignored:", session.id)
        return NextResponse.json({ received: true })
      }
      console.error("Failed to record tip:", error)
      return NextResponse.json(
        { error: "Failed to record tip" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
