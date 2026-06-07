import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { reviewId, response } = await req.json()

  if (!reviewId || !response) {
    return NextResponse.json({ error: "Missing reviewId or response" }, { status: 400 })
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { account: true },
  })

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  if (review.platform === "google" && review.account.googleToken) {
    try {
      const tokenData = JSON.parse(review.account.googleToken)
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      )
      oauth2Client.setCredentials(tokenData)

      const mybusiness = google.mybusinessbusinessinformation({
        version: "v1",
        auth: oauth2Client,
      })

      await mybusiness.accounts.locations.reviews.updateReply({
        name: review.externalId,
        requestBody: { comment: response },
      })
    } catch (err) {
      console.error("Google reply error:", err)
      // Still save locally even if Google API fails
    }
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { responseSent: true, respondedAt: new Date(), responseText: response },
  })

  return NextResponse.json({ success: true })
}
