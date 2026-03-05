import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const updateMissionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(1000).optional(),
  status: z.enum(['AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
  progress: z.record(z.any()).optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const mission = await prisma.mission.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    return NextResponse.json(mission)
  } catch (error) {
    console.error('Get mission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = updateMissionSchema.parse(body)
    const userId = (session.user as any).id

    const existingMission = await prisma.mission.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingMission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    const mission = await prisma.mission.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        progress: data.progress
      }
    })

    return NextResponse.json(mission)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Update mission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    const existingMission = await prisma.mission.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!existingMission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Don't allow deleting missions that are in progress
    if (existingMission.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete mission in progress' },
        { status: 400 }
      )
    }

    await prisma.mission.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete mission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
