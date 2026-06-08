import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
      const accessToken = tokenData.access_token

      // Use raw REST call to avoid TypeScript type issues with googleapis
      await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${review.externalId}:reply`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: response }),
        }
      )
    } catch (err) {
      console.error("Google reply error:", err)
    }
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: { responseSent: true, respondedAt: new Date(), responseText: response },
  })

  return NextResponse.json({ success: true })
}
