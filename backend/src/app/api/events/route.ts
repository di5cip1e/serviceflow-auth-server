import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stationEvents } from '@/lib/events'

// Type guard for session user
function getUserId(session: Awaited<ReturnType<typeof getServerSession>>): string | null {
  if (!(session as any)?.user?.id) return null
  return (session as any).user.id as string
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = session?.user?.id ?? null
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        controller.enqueue(encoder.encode(`event:connected\ndata: {"userId":"${userId}"}\n\n`))

        // Subscribe to mission updates
        const onMissionUpdate = (mission: unknown) => {
          controller.enqueue(encoder.encode(`event:mission\ndata: ${JSON.stringify(mission)}\n\n`))
        }

        const onMissionComplete = (data: { mission: unknown; rewards: unknown }) => {
          controller.enqueue(encoder.encode(`event:mission_complete\ndata: ${JSON.stringify(data)}\n\n`))
        }

        const onAgentUpdate = (agent: unknown) => {
          controller.enqueue(encoder.encode(`event:agent\ndata: ${JSON.stringify(agent)}\n\n`))
        }

        const onAgentTask = (data: { agent: unknown; task: unknown; rewards: unknown }) => {
          controller.enqueue(encoder.encode(`event:agent_task\ndata: ${JSON.stringify(data)}\n\n`))
        }

        const onAchievement = (achievement: unknown) => {
          controller.enqueue(encoder.encode(`event:achievement\ndata: ${JSON.stringify(achievement)}\n\n`))
        }

        const onBattle = (battle: unknown) => {
          controller.enqueue(encoder.encode(`event:battle\ndata: ${JSON.stringify(battle)}\n\n`))
        }

        const onBattleComplete = (result: unknown) => {
          controller.enqueue(encoder.encode(`event:battle_complete\ndata: ${JSON.stringify(result)}\n\n`))
        }

        const onNotification = (notification: unknown) => {
          controller.enqueue(encoder.encode(`event:notification\ndata: ${JSON.stringify(notification)}\n\n`))
        }

        // Register listeners for this user's events
        stationEvents.on(`mission:${userId}`, onMissionUpdate)
        stationEvents.on(`mission:complete:${userId}`, onMissionComplete)
        stationEvents.on(`agent:${userId}`, onAgentUpdate)
        stationEvents.on(`agent:task:${userId}`, onAgentTask)
        stationEvents.on(`achievement:${userId}`, onAchievement)
        stationEvents.on(`battle:${userId}`, onBattle)
        stationEvents.on(`battle:complete:${userId}`, onBattleComplete)
        stationEvents.on(`notification:${userId}`, onNotification)

        // Heartbeat to keep connection alive
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(`event:heartbeat\ndata: {"time":"${new Date().toISOString()}"}\n\n`))
          } catch {
            // Stream closed
            clearInterval(heartbeat)
          }
        }, 30000)

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat)
          stationEvents.off(`mission:${userId}`, onMissionUpdate)
          stationEvents.off(`mission:complete:${userId}`, onMissionComplete)
          stationEvents.off(`agent:${userId}`, onAgentUpdate)
          stationEvents.off(`agent:task:${userId}`, onAgentTask)
          stationEvents.off(`achievement:${userId}`, onAchievement)
          stationEvents.off(`battle:${userId}`, onBattle)
          stationEvents.off(`battle:complete:${userId}`, onBattleComplete)
          stationEvents.off(`notification:${userId}`, onNotification)
          
          try {
            controller.close()
          } catch {
            // Already closed
          }
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      }
    })
  } catch (error) {
    console.error('SSE connection error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
