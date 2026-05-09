import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Get user ID from either NextAuth session or x-user-id header
export async function getUserId(request: NextRequest): Promise<string | null> {
  // First try NextAuth session
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    console.log('getUserId: from session', session.user.id);
    return session.user.id as string
  }
  
  // Fallback to x-user-id header (from frontend NextAuth session)
  const userId = request.headers.get('x-user-id')
  console.log('getUserId: from header', userId);
  if (userId) {
    return userId
  }
  
  console.log('getUserId: no user ID found');
  return null
}

// Helper to require auth
export async function requireAuth(request: NextRequest): Promise<{ userId: string | null, error: NextResponse | null }> {
  const userId = await getUserId(request)
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  return { userId, error: null }
}
