import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const memorySchema = z.object({
  content: z.string().min(1).max(5000),
  type: z.enum(['mission', 'conversation', 'achievement', 'battle', 'general']),
  metadata: z.record(z.unknown()).optional()
})

const searchSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['mission', 'conversation', 'achievement', 'battle', 'general']).optional(),
  limit: z.number().min(1).max(50).default(10)
})

// GET /api/memory - Get user's memories
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')

    const memories = await prisma.memory.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type })
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json(memories)
  } catch (error) {
    console.error('Error fetching memories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/memory - Add a new memory
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = memorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors }, { status: 400 })
    }

    const memory = await prisma.memory.create({
      data: {
        content: validation.data.content,
        type: validation.data.type,
        metadata: validation.data.metadata || {},
        userId: session.user.id
      }
    })

    return NextResponse.json(memory, { status: 201 })
  } catch (error) {
    console.error('Error creating memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/memory - Delete a memory
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Memory ID required' }, { status: 400 })
    }

    await prisma.memory.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting memory:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
