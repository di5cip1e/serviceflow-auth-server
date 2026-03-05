import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params for pagination
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const npcs = await prisma.nPC.findMany({
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(npcs)
  } catch (error) {
    console.error('Get NPCs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
