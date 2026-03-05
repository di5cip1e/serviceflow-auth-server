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

const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  agentId: z.string(),
  missionId: z.string().optional(),
  xpReward: z.number().int().min(0).default(0),
  creditsReward: z.number().int().min(0).default(0),
  maxProgress: z.number().int().min(1).max(1000).default(100)
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session?.user?.id ?? null

    // Get all tasks for user's agents
    const tasks = await prisma.task.findMany({
      where: {
        agent: { userId }
      },
      include: {
        agent: true,
        mission: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Get tasks error:', error)
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
    const data = createTaskSchema.parse(body)
    const userId = session?.user?.id ?? null

    // Verify agent belongs to user
    const agent = await prisma.agent.findFirst({
      where: { id: data.agentId, userId }
    })

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }

    // Check if agent already has a task
    const existingTask = await prisma.task.findUnique({
      where: { agentId: data.agentId }
    })

    if (existingTask && existingTask.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Agent already has an active task' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        agentId: data.agentId,
        missionId: data.missionId,
        xpReward: data.xpReward,
        creditsReward: data.creditsReward,
        maxProgress: data.maxProgress,
        status: 'PENDING'
      }
    })

    // Update agent status to working
    await prisma.agent.update({
      where: { id: data.agentId },
      data: { status: 'WORKING' }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
