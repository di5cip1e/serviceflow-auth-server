import { hash } from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  password: z.string().min(8)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, username, password } = registerSchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const passwordHash = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        profile: {
          create: {}
        }
      },
      select: {
        id: true,
        email: true,
        username: true,
        rank: true,
        xp: true
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Map validation errors to user-friendly messages
      const errorMessages = error.errors.map(err => {
        const field = err.path.join('.')
        switch (err.code) {
          case 'invalid_string':
            if (err.validation === 'email') return 'Please enter a valid email address'
            return `Invalid value for ${field}`
          case 'too_small':
            if (field === 'username') return 'Username must be at least 3 characters'
            if (field === 'password') return 'Password must be at least 8 characters'
            return `${field} is too short`
          case 'too_big':
            if (field === 'username') return 'Username must be at most 20 characters'
            return `${field} is too long`
          default:
            return `${field}: ${err.message}`
        }
      })
      return NextResponse.json(
        { error: 'Validation failed', messages: errorMessages },
        { status: 400 }
      )
    }
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
