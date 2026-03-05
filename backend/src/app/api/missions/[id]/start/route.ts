import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    if (mission.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Mission is not available' },
        { status: 400 }
      )
    }

    const updatedMission = await prisma.mission.update({
      where: { id: params.id },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    })

    return NextResponse.json(updatedMission)
  } catch (error) {
    console.error('Start mission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
