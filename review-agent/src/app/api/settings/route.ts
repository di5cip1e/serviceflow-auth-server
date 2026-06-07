import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const tone = formData.get("tone") as string
  const replySignature = formData.get("replySignature") as string

  const account = await prisma.account.findUnique({
    where: { email: session.user!.email! },
  })

  if (!account) return NextResponse.redirect("/login")

  await prisma.setting.upsert({
    where: { accountId: account.id },
    update: { tone, replySignature },
    create: { accountId: account.id, tone, replySignature },
  })

  return NextResponse.redirect("/dashboard/settings")
}
