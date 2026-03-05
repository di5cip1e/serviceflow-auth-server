import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Type guard for session user
function getUserId(session: Awaited<ReturnType<typeof getServerSession>>): string | null {
  if (!(session as any)?.user?.id) return null
  return (session as any).user.id as string
}

const grantXpSchema = z.object({
  xp: z.number().int().min(1).max(1000)
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = session?.user?.id ?? null
    const body = await request.json()
    const { xp } = grantXpSchema.parse(body)

    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: { id, userId }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Calculate new XP and potential level up
    const newXp = agent.xp + xp
    const xpPerLevel = 100
    const newLevel = Math.floor(newXp / xpPerLevel) + 1
    const leveledUp = newLevel > agent.level

    // Update agent
    const updatedAgent = await prisma.agent.update({
      where: { id },
      data: {
        xp: newXp,
        level: newLevel
      }
    })

    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xp }
      }
    })

    return NextResponse.json({
      agent: updatedAgent,
      leveledUp,
      newLevel,
      xpGained: xp
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Grant XP error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
