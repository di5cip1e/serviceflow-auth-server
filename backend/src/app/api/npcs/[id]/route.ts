import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const npc = await prisma.nPC.findUnique({
      where: { id }
    })

    if (!npc) {
      return NextResponse.json({ error: 'NPC not found' }, { status: 404 })
    }

    return NextResponse.json(npc)
  } catch (error) {
    console.error('Get NPC error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
