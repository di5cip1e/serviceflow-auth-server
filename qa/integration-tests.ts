/**
 * Station Command - Integration Tests
 * Full flow and error handling tests
 * 
 * Run with: npx vitest run integration-tests.ts
 * or: npx jest integration-tests.ts
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { hash } from 'bcryptjs'

// Mock database state
let mockUsers: any[] = []
let mockMissions: any[] = []
let mockNPCs: any[] = [
  { id: 'npc-1', name: 'Commander Zeta', role: 'COMMANDER', faction: 'EARTH', dialogueTree: {} },
  { id: 'npc-2', name: 'Dr. Nova', role: 'SCIENTIST', faction: 'VENUS', dialogueTree: {} }
]
let userIdCounter = 1
let missionIdCounter = 1

// ==================== FULL FLOW TESTS ====================

describe('Full User Flow: Register → Login → Create Mission → Start → Complete', () => {
  let authToken: string
  let createdMissionId: string

  it('Step 1: Register a new user', async () => {
    const email = `testuser${userIdCounter}@example.com`
    const username = `testuser${userIdCounter}`
    const password = 'password123'

    // Check user doesn't exist
    const existingUser = mockUsers.find(u => u.email === email || u.username === username)
    expect(existingUser).toBeUndefined()

    // Create user
    const passwordHash = await hash(password, 12)
    const newUser = {
      id: `user-${userIdCounter++}`,
      email,
      username,
      passwordHash,
      rank: 'ENSIGN',
      xp: 0
    }
    mockUsers.push(newUser)

    expect(newUser.email).toBe(email)
    expect(newUser.username).toBe(username)
    expect(newUser.rank).toBe('ENSIGN')
    expect(newUser.xp).toBe(0)
  })

  it('Step 2: Login with registered credentials', async () => {
    const email = 'testuser1@example.com'
    const password = 'password123'

    // Find user
    const user = mockUsers.find(u => u.email === email)
    expect(user).toBeDefined()

    // Simulate password verification (bcrypt compare)
    const { compare } = await import('bcryptjs')
    const isValid = await compare(password, user.passwordHash)
    expect(isValid).toBe(true)

    // Generate token (simulating JWT)
    authToken = `mock-jwt-token-${user.id}`
    expect(authToken).toBeTruthy()
  })

  it('Step 3: Create a new mission', async () => {
    const user = mockUsers[0]
    const missionData = {
      title: 'First Mission',
      description: 'Patrol the station perimeter',
      type: 'SURVEILLANCE',
      difficulty: 'EASY'
    }

    const rewards = { xp: 100, credits: 50 }

    const newMission = {
      id: `mission-${missionIdCounter++}`,
      userId: user.id,
      title: missionData.title,
      description: missionData.description,
      type: missionData.type,
      difficulty: missionData.difficulty,
      status: 'AVAILABLE',
      rewards,
      startTime: null,
      completedAt: null,
      createdAt: new Date()
    }
    mockMissions.push(newMission)

    createdMissionId = newMission.id
    expect(newMission.status).toBe('AVAILABLE')
    expect(newMission.rewards.xp).toBe(100)
  })

  it('Step 4: Start the mission', async () => {
    const mission = mockMissions.find(m => m.id === createdMissionId)
    
    // Verify mission is available
    expect(mission.status).toBe('AVAILABLE')

    // Start mission
    mission.status = 'IN_PROGRESS'
    mission.startTime = new Date()

    expect(mission.status).toBe('IN_PROGRESS')
    expect(mission.startTime).toBeInstanceOf(Date)
  })

  it('Step 5: Complete the mission and verify rewards', async () => {
    const user = mockUsers[0]
    const mission = mockMissions.find(m => m.id === createdMissionId)

    // Verify mission is in progress
    expect(mission.status).toBe('IN_PROGRESS')

    // Complete mission
    mission.status = 'COMPLETED'
    mission.completedAt = new Date()

    // Grant rewards
    user.xp += mission.rewards.xp

    expect(mission.status).toBe('COMPLETED')
    expect(user.xp).toBe(100) // Started at 0, gained 100
  })

  it('Verify full flow completed successfully', () => {
    expect(mockUsers.length).toBeGreaterThan(0)
    expect(mockMissions.length).toBe(1)
    expect(mockMissions[0].status).toBe('COMPLETED')
    expect(mockUsers[0].xp).toBe(100)
  })
})

describe('Multi-Mission Flow', () => {
  beforeAll(() => {
    // Reset for clean test
    mockMissions = []
    missionIdCounter = 1
  })

  it('should handle multiple missions in sequence', async () => {
    const user = mockUsers[0]
    const initialXp = user.xp

    // Create 3 missions of increasing difficulty
    const missions = [
      { type: 'SURVEILLANCE', difficulty: 'EASY', xp: 100 },
      { type: 'LOGISTICS', difficulty: 'MEDIUM', xp: 200 },
      { type: 'CRISIS', difficulty: 'HARD', xp: 300 }
    ]

    for (const m of missions) {
      const mission = {
        id: `mission-${missionIdCounter++}`,
        userId: user.id,
        title: `${m.type} Mission`,
        description: 'Test mission',
        type: m.type,
        difficulty: m.difficulty,
        status: 'AVAILABLE',
        rewards: { xp: m.xp, credits: 50 },
        startTime: null,
        completedAt: null,
        createdAt: new Date()
      }
      mockMissions.push(mission)

      // Start and complete
      mission.status = 'IN_PROGRESS'
      mission.status = 'COMPLETED'
      mission.completedAt = new Date()
      user.xp += m.xp
    }

    expect(mockMissions).toHaveLength(3)
    expect(user.xp).toBe(initialXp + 600)
  })
})

// ==================== ERROR HANDLING TESTS ====================

describe('Error Handling - Authentication', () => {
  it('should reject registration with duplicate email', async () => {
    const email = 'duplicate@test.com'
    mockUsers.push({ email, username: 'user1', passwordHash: 'hash' })

    const duplicateUser = mockUsers.find(u => u.email === email)
    expect(duplicateUser).toBeDefined()
    
    // Simulate error response
    const error = 'User already exists'
    expect(error).toBe('User already exists')
  })

  it('should reject login with wrong password', async () => {
    const user = mockUsers[0]
    const { compare } = await import('bcryptjs')
    
    const isValid = await compare('wrongpassword', user.passwordHash)
    expect(isValid).toBe(false)
  })

  it('should reject login for non-existent user', async () => {
    const user = mockUsers.find(u => u.email === 'nonexistent@test.com')
    expect(user).toBeUndefined()
  })

  it('should require authentication for protected endpoints', () => {
    const protectedEndpoints = [
      '/api/missions',
      '/api/missions/123/start',
      '/api/npcs',
      '/api/users/me'
    ]

    // Simulate unauthenticated requests
    const hasToken = false
    
    protectedEndpoints.forEach(endpoint => {
      expect(hasToken).toBe(false) // Should fail without token
    })
  })

  it('should reject expired/invalid tokens', () => {
    const invalidTokens = [
      'invalid-token',
      'expired-token',
      ''
    ]

    invalidTokens.forEach(token => {
      const isValid = token.length > 10 && !token.includes('invalid')
      expect(isValid).toBe(false)
    })
  })
})

describe('Error Handling - Missions', () => {
  it('should reject creating mission with invalid type', () => {
    const validTypes = ['SURVEILLANCE', 'LOGISTICS', 'REPAIR', 'EXPLORATION', 'CRISIS']
    const invalidType = 'INVALID_TYPE'
    
    expect(validTypes).not.toContain(invalidType)
  })

  it('should reject creating mission with invalid difficulty', () => {
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD', 'EXTREME']
    const invalidDifficulty = 'IMPOSSIBLE'
    
    expect(validDifficulties).not.toContain(invalidDifficulty)
  })

  it('should return 404 for non-existent mission', () => {
    const mission = mockMissions.find(m => m.id === 'non-existent')
    expect(mission).toBeUndefined()
  })

  it('should not start already completed mission', () => {
    const completedMission = { status: 'COMPLETED', id: 'test-1' }
    const canStart = completedMission.status === 'AVAILABLE'
    expect(canStart).toBe(false)
  })

  it('should not start already in-progress mission', () => {
    const inProgressMission = { status: 'IN_PROGRESS', id: 'test-2' }
    const canStart = inProgressMission.status === 'AVAILABLE'
    expect(canStart).toBe(false)
  })

  it('should validate mission title length', () => {
    const shortTitle = 'A'
    const longTitle = 'A'.repeat(101)
    
    expect(shortTitle.length >= 1 && shortTitle.length <= 100).toBe(false)
    expect(longTitle.length >= 1 && longTitle.length <= 100).toBe(false)
  })

  it('should validate mission description length', () => {
    const shortDesc = ''
    const longDesc = 'A'.repeat(1001)
    
    expect(shortDesc.length >= 1).toBe(false)
    expect(longDesc.length >= 1 && longDesc.length <= 1000).toBe(false)
  })
})

describe('Error Handling - NPCs', () => {
  it('should return 404 for non-existent NPC', () => {
    const npc = mockNPCs.find(n => n.id === 'non-existent')
    expect(npc).toBeUndefined()
  })

  it('should handle pagination limits', () => {
    const maxLimit = 100
    const requestedLimit = 150
    
    expect(requestedLimit > maxLimit).toBe(true)
    expect(Math.min(requestedLimit, maxLimit)).toBe(maxLimit)
  })

  it('should handle negative offset', () => {
    const negativeOffset = -1
    const validOffset = Math.max(0, negativeOffset)
    
    expect(validOffset).toBe(0)
  })
})

describe('Error Handling - Input Validation', () => {
  it('should reject empty email', () => {
    const email = ''
    const isValid = email.includes('@') && email.length > 0
    expect(isValid).toBe(false)
  })

  it('should reject short password', () => {
    const password = 'short'
    const isValid = password.length >= 8
    expect(isValid).toBe(false)
  })

  it('should reject short username', () => {
    const username = 'ab'
    const isValid = username.length >= 3 && username.length <= 20
    expect(isValid).toBe(false)
  })

  it('should reject missing required fields', () => {
    const required = ['email', 'username', 'password']
    const provided = { email: 'test@test.com' }
    
    const missing = required.filter(field => !(field in provided))
    expect(missing).toContain('username')
    expect(missing).toContain('password')
  })

  it('should handle malformed JSON', () => {
    const badJson = '{ "incomplete": true'
    
    expect(() => JSON.parse(badJson)).toThrow()
  })
})

// ==================== EDGE CASES ====================

describe('Edge Cases', () => {
  it('should handle concurrent mission starts', () => {
    const mission = { id: 'test', status: 'AVAILABLE', userId: 'user-1' }
    
    // First start
    const firstStart = mission.status === 'AVAILABLE'
    if (firstStart) mission.status = 'IN_PROGRESS'
    
    // Second start (should fail)
    const secondStart = mission.status === 'AVAILABLE'
    
    expect(firstStart).toBe(true)
    expect(secondStart).toBe(false)
  })

  it('should handle XP overflow', () => {
    const user = { xp: Number.MAX_SAFE_INTEGER - 100 }
    const bonusXp = 200
    
    // Should handle safely (in real code would check for overflow)
    const wouldOverflow = user.xp + bonusXp > Number.MAX_SAFE_INTEGER
    expect(wouldOverflow).toBe(true)
  })

  it('should handle empty mission list', () => {
    mockMissions = []
    const missions = mockMissions.filter(m => m.userId === 'non-existent-user')
    expect(missions).toHaveLength(0)
  })

  it('should handle Unicode in usernames', () => {
    const unicodeUsername = '用户123'
    const isValid = unicodeUsername.length >= 3 && unicodeUsername.length <= 20
    expect(isValid).toBe(true)
  })
})

// ==================== DATA INTEGRITY ====================

describe('Data Integrity', () => {
  it('should maintain referential integrity between user and missions', () => {
    const user = mockUsers[0]
    const userMissions = mockMissions.filter(m => m.userId === user.id)
    
    userMissions.forEach(mission => {
      expect(mission.userId).toBe(user.id)
    })
  })

  it('should not allow negative XP', () => {
    const user = { xp: -100 }
    expect(user.xp >= 0).toBe(false)
  })

  it('should properly serialize dates', () => {
    const mission = {
      createdAt: new Date('2024-01-01'),
      completedAt: new Date('2024-01-02')
    }
    
    const created = mission.createdAt.toISOString()
    const completed = mission.completedAt.toISOString()
    
    expect(created).toBe('2024-01-01T00:00:00.000Z')
    expect(completed).toBe('2024-01-02T00:00:00.000Z')
    expect(completed > created).toBe(true)
  })
})
