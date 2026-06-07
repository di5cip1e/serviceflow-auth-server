import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { reviewId, text, rating } = await req.json()

  if (!text || !rating) {
    return NextResponse.json({ error: "Missing text or rating" }, { status: 400 })
  }

  const account = await prisma.account.findUnique({
    where: { email: session.user!.email! },
    include: { settings: true },
  })

  const tone = account?.settings?.tone || "professional"

  const systemPrompt = `You are a business owner responding to a customer review. Write a ${tone} response that:
- Thanks the customer for their review
- Addresses specific points they mentioned
- Is concise (2-4 sentences)
- Sounds human and genuine, not robotic or corporate
- For negative reviews (1-3 stars): acknowledge the concern, apologize if appropriate, invite them to discuss offline
- For positive reviews (4-5 stars): express gratitude and invite them back
- Do NOT use emojis
- Do NOT include a sign-off like "Best regards" or "Sincerely" — just the body text`

  const sentiment = rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative"
  const userPrompt = `Customer review (${rating}/5 stars, ${sentiment}): "${text}"

Write a response:`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const responseText = completion.choices[0].message.content?.trim() || ""

    if (reviewId !== "preview") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { responseText },
      })
    }

    return NextResponse.json({ responseText })
  } catch (err) {
    console.error("OpenAI error:", err)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
