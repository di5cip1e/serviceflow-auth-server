import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getOAuthClient } from "@/lib/google"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect("/login")

  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect("/dashboard/settings?error=google_auth_failed")
  }

  try {
    const oauth2Client = getOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)

    await prisma.account.update({
      where: { email: session.user!.email! },
      data: { googleToken: JSON.stringify(tokens) },
    })

    return NextResponse.redirect("/dashboard/settings?success=google_connected")
  } catch (err) {
    console.error("Google OAuth error:", err)
    return NextResponse.redirect("/dashboard/settings?error=google_auth_failed")
  }
}
