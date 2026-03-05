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

const createAgentSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['scout', 'miner', 'combat', 'diplomat', 'engineer', 'medic'])
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? null
    
    const agents = await prisma.agent.findMany({
      where: { userId },
      include: {
        currentTask: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(agents)
  } catch (error) {
    console.error('Get agents error:', error)
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
    const { name, type } = createAgentSchema.parse(body)
    const userId = session?.user?.id ?? null

    // Base stats by type
    const baseStats: Record<string, { health: number; attack: number; defense: number; speed: number }> = {
      scout: { health: 80, attack: 12, defense: 8, speed: 15 },
      miner: { health: 120, attack: 6, defense: 12, speed: 8 },
      combat: { health: 150, attack: 18, defense: 15, speed: 10 },
      diplomat: { health: 70, attack: 5, defense: 8, speed: 12 },
      engineer: { health: 100, attack: 8, defense: 10, speed: 10 },
      medic: { health: 90, attack: 6, defense: 12, speed: 12 }
    }

    const stats = baseStats[type]

    const agent = await prisma.agent.create({
      data: {
        name,
        type,
        userId,
        health: stats.health,
        maxHealth: stats.health,
        attack: stats.attack,
        defense: stats.defense,
        speed: stats.speed
      }
    })

    return NextResponse.json(agent, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create agent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
