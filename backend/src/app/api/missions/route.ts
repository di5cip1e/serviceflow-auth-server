import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Type guard for session user
function getUserId(session: Awaited<ReturnType<typeof getServerSession>>): string | null {
  if (!(session as any)?.user?.id) return null
  return (session as any).user.id as string
}

const createMissionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  type: z.enum(['SURVEILLANCE', 'LOGISTICS', 'REPAIR', 'EXPLORATION', 'CRISIS']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXTREME']),
  zoneId: z.string().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? null
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rank: true }
    })

    // Get all missions - user's own plus available system missions
    const missions = await prisma.mission.findMany({
      where: {
        OR: [
          { userId },
          { status: 'AVAILABLE', userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(missions)
  } catch (error) {
    console.error('Get missions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createMissionSchema.parse(body)
    const userId = session?.user?.id ?? null

    // Validate zoneId exists if provided
    if (data.zoneId) {
      const zone = await prisma.zone.findUnique({
        where: { id: data.zoneId }
      })
      if (!zone) {
        return NextResponse.json(
          { error: 'Invalid zoneId: Zone does not exist' },
          { status: 400 }
        )
      }
    }

    // Calculate rewards based on difficulty
    const difficultyMultipliers: Record<string, number> = {
      EASY: 1,
      MEDIUM: 2,
      HARD: 3,
      EXTREME: 5
    }
    const multiplier = difficultyMultipliers[data.difficulty]
    const rewards = {
      xp: 100 * multiplier,
      credits: 50 * multiplier
    }

    const mission = await prisma.mission.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        type: data.type,
        difficulty: data.difficulty,
        zoneId: data.zoneId,
        rewards
      }
    })

    return NextResponse.json(mission, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create mission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
