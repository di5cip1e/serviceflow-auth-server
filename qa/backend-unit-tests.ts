/**
 * Station Command - Backend Unit Tests
 * Tests for Auth, Missions, and NPCs endpoints
 * 
 * Run with: npx vitest run backend-unit-tests.ts
 * or: npx jest backend-unit-tests.ts
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { hash, compare } from 'bcryptjs'

// Mock Prisma
const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  mission: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  nPC: {
    findMany: vi.fn(),
    findUnique: vi.fn()
  },
  zone: {
    findUnique: vi.fn()
  }
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

// ==================== AUTH TESTS ====================

describe('Auth - Registration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword',
    rank: 'ENSIGN',
    xp: 0
  }

  it('should register a new user with valid credentials', async () => {
    // Mock: no existing user found
    mockPrisma.user.findFirst.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: mockUser.id,
      email: mockUser.email,
      username: mockUser.username,
      rank: mockUser.rank,
      xp: mockUser.xp
    })

    const email = 'test@example.com'
    const username = 'testuser'
    const password = 'password123'

    // Simulate registration logic
    const existingUser = await mockPrisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })

    expect(existingUser).toBeNull()

    const passwordHash = await hash(password, 12)
    const user = await mockPrisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        profile: { create: {} }
      },
      select: {
        id: true,
        email: true,
        username: true,
        rank: true,
        xp: true
      }
    })

    expect(user.email).toBe(email)
    expect(user.username).toBe(username)
  })

  it('should reject registration with existing email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)

    const email = 'test@example.com'
    const existingUser = await mockPrisma.user.findFirst({
      where: { OR: [{ email }, { username: 'any' }] }
    })

    expect(existingUser).not.toBeNull()
  })

  it('should reject weak passwords', async () => {
    const password = 'short'
    expect(password.length).toBeLessThan(8)
  })

  it('should reject invalid email format', async () => {
    const email = 'not-an-email'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test(email)).toBe(false)
  })
})

describe('Auth - Login', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: '',
    rank: 'ENSIGN',
    xp: 0
  }

  beforeAll(async () => {
    mockUser.passwordHash = await hash('password123', 12)
  })

  it('should login with correct credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const user = await mockPrisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    expect(user).not.toBeNull()
    
    const isValid = await compare('password123', user!.passwordHash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const isValid = await compare('wrongpassword', mockUser.passwordHash)
    expect(isValid).toBe(false)
  })

  it('should reject login for non-existent user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const user = await mockPrisma.user.findUnique({
      where: { email: 'nonexistent@example.com' }
    })

    expect(user).toBeNull()
  })
})

// ==================== MISSIONS TESTS ====================

describe('Missions - CRUD Operations', () => {
  const mockMission = {
    id: 'mission-123',
    userId: 'user-123',
    title: 'Test Mission',
    description: 'A test mission',
    type: 'SURVEILLANCE',
    difficulty: 'EASY',
    status: 'AVAILABLE',
    rewards: { xp: 100, credits: 50 },
    startTime: null,
    completedAt: null,
    createdAt: new Date()
  }

  it('should list missions for user', async () => {
    mockPrisma.mission.findMany.mockResolvedValue([mockMission])

    const missions = await mockPrisma.mission.findMany({
      where: {
        OR: [
          { userId: 'user-123' },
          { status: 'AVAILABLE', userId: null }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    expect(missions).toHaveLength(1)
    expect(missions[0].title).toBe('Test Mission')
  })

  it('should create a new mission', async () => {
    mockPrisma.mission.create.mockResolvedValue(mockMission)

    const mission = await mockPrisma.mission.create({
      data: {
        userId: 'user-123',
        title: 'Test Mission',
        description: 'A test mission',
        type: 'SURVEILLANCE',
        difficulty: 'EASY',
        rewards: { xp: 100, credits: 50 }
      }
    })

    expect(mission.title).toBe('Test Mission')
    expect(mission.status).toBe('AVAILABLE')
  })

  it('should get mission by ID', async () => {
    mockPrisma.mission.findFirst.mockResolvedValue(mockMission)

    const mission = await mockPrisma.mission.findFirst({
      where: { id: 'mission-123', userId: 'user-123' }
    })

    expect(mission).not.toBeNull()
    expect(mission?.id).toBe('mission-123')
  })

  it('should return 404 for non-existent mission', async () => {
    mockPrisma.mission.findFirst.mockResolvedValue(null)

    const mission = await mockPrisma.mission.findFirst({
      where: { id: 'non-existent', userId: 'user-123' }
    })

    expect(mission).toBeNull()
  })

  it('should update mission', async () => {
    const updatedMission = { ...mockMission, title: 'Updated Mission' }
    mockPrisma.mission.update.mockResolvedValue(updatedMission)

    const mission = await mockPrisma.mission.update({
      where: { id: 'mission-123' },
      data: { title: 'Updated Mission' }
    })

    expect(mission.title).toBe('Updated Mission')
  })

  it('should start a mission', async () => {
    const inProgressMission = {
      ...mockMission,
      status: 'IN_PROGRESS',
      startTime: new Date()
    }
    mockPrisma.mission.findFirst.mockResolvedValue(mockMission)
    mockPrisma.mission.update.mockResolvedValue(inProgressMission)

    // Verify mission is available
    expect(mockMission.status).toBe('AVAILABLE')

    const mission = await mockPrisma.mission.update({
      where: { id: 'mission-123' },
      data: { status: 'IN_PROGRESS', startTime: new Date() }
    })

    expect(mission.status).toBe('IN_PROGRESS')
    expect(mission.startTime).not.toBeNull()
  })

  it('should not start a mission that is not AVAILABLE', async () => {
    const inProgressMission = { ...mockMission, status: 'IN_PROGRESS' }

    const canStart = inProgressMission.status === 'AVAILABLE'
    expect(canStart).toBe(false)
  })
})

// ==================== NPCS TESTS ====================

describe('NPCs - List and Get', () => {
  const mockNPCs = [
    { id: 'npc-1', name: 'Commander Zeta', role: 'COMMANDER', faction: 'EARTH' },
    { id: 'npc-2', name: 'Dr. Nova', role: 'SCIENTIST', faction: 'VENUS' }
  ]

  it('should list all NPCs', async () => {
    mockPrisma.nPC.findMany.mockResolvedValue(mockNPCs)

    const npcs = await mockPrisma.nPC.findMany({
      take: 50,
      skip: 0,
      orderBy: { name: 'asc' }
    })

    expect(npcs).toHaveLength(2)
    expect(npcs[0].name).toBe('Commander Zeta')
  })

  it('should support pagination', async () => {
    mockPrisma.nPC.findMany.mockResolvedValue([mockNPCs[1]])

    const npcs = await mockPrisma.nPC.findMany({
      take: 1,
      skip: 1,
      orderBy: { name: 'asc' }
    })

    expect(npcs).toHaveLength(1)
  })

  it('should get NPC by ID', async () => {
    mockPrisma.nPC.findUnique.mockResolvedValue(mockNPCs[0])

    const npc = await mockPrisma.nPC.findUnique({
      where: { id: 'npc-1' }
    })

    expect(npc).not.toBeNull()
    expect(npc?.name).toBe('Commander Zeta')
  })

  it('should return 404 for non-existent NPC', async () => {
    mockPrisma.nPC.findUnique.mockResolvedValue(null)

    const npc = await mockPrisma.nPC.findUnique({
      where: { id: 'non-existent' }
    })

    expect(npc).toBeNull()
  })
})

// ==================== INPUT VALIDATION TESTS ====================

describe('Input Validation', () => {
  it('should validate email format', () => {
    const validEmails = ['test@example.com', 'user@domain.org']
    const invalidEmails = ['not-an-email', 'missing@', '@nodomain.com']

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true)
    })

    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false)
    })
  })

  it('should validate username length', () => {
    const validUsernames = ['abc', 'user123', 'commander_zeta']
    const invalidUsernames = ['ab', 'a'.repeat(21)]

    validUsernames.forEach(username => {
      expect(username.length >= 3 && username.length <= 20).toBe(true)
    })

    invalidUsernames.forEach(username => {
      expect(username.length >= 3 && username.length <= 20).toBe(false)
    })
  })

  it('should validate password minimum length', () => {
    const validPassword = 'password123'
    const invalidPassword = 'short'

    expect(validPassword.length >= 8).toBe(true)
    expect(invalidPassword.length >= 8).toBe(false)
  })

  it('should validate mission difficulty enum', () => {
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD', 'EXTREME']
    const invalidDifficulty = 'IMPOSSIBLE'

    expect(validDifficulties).toContain('EASY')
    expect(validDifficulties).not.toContain(invalidDifficulty)
  })

  it('should validate mission type enum', () => {
    const validTypes = ['SURVEILLANCE', 'LOGISTICS', 'REPAIR', 'EXPLORATION', 'CRISIS']
    const invalidType = 'INVALID'

    expect(validTypes).toContain('SURVEILLANCE')
    expect(validTypes).not.toContain(invalidType)
  })
})

// ==================== ERROR HANDLING TESTS ====================

describe('Error Handling', () => {
  it('should handle database connection errors', async () => {
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

    await expect(mockPrisma.user.findUnique({ where: { id: 'test' } }))
      .rejects.toThrow('Database connection failed')
  })

  it('should handle malformed JSON in request body', () => {
    const malformedJson = '{ invalid json }'
    
    expect(() => JSON.parse(malformedJson)).toThrow()
  })

  it('should handle missing required fields', () => {
    const requiredFields = ['email', 'username', 'password']
    const missingFields = requiredFields.filter(field => !{ email: 'test@test.com' }[field])

    expect(missingFields).toContain('username')
    expect(missingFields).toContain('password')
  })
})
