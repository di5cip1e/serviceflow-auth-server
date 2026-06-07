import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const subscriptionId = session.subscription as string
    const customerId = session.customer as string

    await prisma.account.updateMany({
      where: { stripeCustomerId: customerId },
      data: {
        stripeSubscriptionId: subscriptionId,
        plan: "pro",
      },
    })
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription
    await prisma.account.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { plan: "free", stripeSubscriptionId: null },
    })
  }

  return NextResponse.json({ received: true })
}
