import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accounts = await prisma.account.findMany({
    where: { googleToken: { not: null }, plan: "pro" },
  })

  let totalFetched = 0

  for (const account of accounts) {
    try {
      const tokenData = JSON.parse(account.googleToken!)
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
      oauth2Client.setCredentials(tokenData)

      const mybusiness = google.mybusinessbusinessinformation({
        version: "v1",
        auth: oauth2Client,
      })

      const response = await (mybusiness.accounts.locations.reviews as any).list({
        parent: "accounts/your-location-id",
        pageSize: 50,
      })

      const reviews = response.data.reviews || []

      for (const review of reviews) {
        await prisma.review.upsert({
          where: { externalId: review.reviewId! },
          update: { fetchedAt: new Date() },
          create: {
            accountId: account.id,
            externalId: review.reviewId!,
            platform: "google",
            authorName: review.reviewer?.displayName || "Anonymous",
            rating: review.starRating === "FIVE" ? 5 : review.starRating === "FOUR" ? 4 : review.starRating === "THREE" ? 3 : review.starRating === "TWO" ? 2 : 1,
            text: review.comment || "",
          },
        })
        totalFetched++
      }
    } catch (err) {
      console.error(`Failed to fetch reviews for account ${account.id}:`, err)
    }
  }

  return NextResponse.json({ fetched: totalFetched })
}
