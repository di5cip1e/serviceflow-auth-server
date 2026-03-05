import { EventEmitter } from 'events'

// Global event emitter for real-time updates
class StationEventEmitter extends EventEmitter {
  private static instance: StationEventEmitter

  static getInstance(): StationEventEmitter {
    if (!StationEventEmitter.instance) {
      StationEventEmitter.instance = new StationEventEmitter()
    }
    return StationEventEmitter.instance
  }

  // Mission events
  emitMissionUpdate(userId: string, mission: unknown) {
    this.emit(`mission:${userId}`, mission)
    this.emit('mission:all', { userId, mission })
  }

  emitMissionComplete(userId: string, mission: unknown, rewards: unknown) {
    this.emit(`mission:complete:${userId}`, { mission, rewards })
  }

  // Agent events
  emitAgentStatusChange(userId: string, agent: unknown) {
    this.emit(`agent:${userId}`, agent)
  }

  emitAgentTaskComplete(userId: string, agent: unknown, task: unknown, rewards: unknown) {
    this.emit(`agent:task:${userId}`, { agent, task, rewards })
  }

  // Achievement events
  emitAchievementUnlock(userId: string, achievement: unknown) {
    this.emit(`achievement:${userId}`, achievement)
  }

  // Battle events
  emitBattleUpdate(userId: string, battle: unknown) {
    this.emit(`battle:${userId}`, battle)
  }

  emitBattleComplete(userId: string, result: unknown) {
    this.emit(`battle:complete:${userId}`, result)
  }

  // System events
  emitSystemNotification(userId: string, notification: unknown) {
    this.emit(`notification:${userId}`, notification)
  }
}

export const stationEvents = StationEventEmitter.getInstance()

// Event types for type safety
export type StationEventType = 
  | 'mission'
  | 'mission:complete'
  | 'agent'
  | 'agent:task'
  | 'achievement'
  | 'battle'
  | 'battle:complete'
  | 'notification'
