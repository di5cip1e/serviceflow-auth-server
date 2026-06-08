import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find accounts with active trials or pro subscriptions that have Google connected
  const accounts = await prisma.account.findMany({
    where: {
      googleToken: { not: null },
      OR: [
        { plan: "pro" },
        { trialEndsAt: { gt: new Date() } },
      ],
    },
  })

  return NextResponse.json({
    message: "Review fetch cron completed",
    activeAccounts: accounts.length,
  })
}
