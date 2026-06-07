import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const account = await prisma.account.findUnique({
    where: { email: session.user!.email! },
  })

  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 })

  let customerId = account.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user!.email!,
      name: account.name || undefined,
    })
    customerId = customer.id
    await prisma.account.update({
      where: { id: account.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?canceled=true`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
