import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export type ApiError = {
  error: string
  code?: string
  details?: unknown
}

export class ApiResponse {
  static success<T>(data: T, status: number = 200): NextResponse<T> {
    return NextResponse.json(data, { status })
  }

  static error(message: string, status: number = 500, details?: unknown): NextResponse<ApiError> {
    return NextResponse.json(
      { error: message, details },
      { status }
    )
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse<ApiError> {
    return this.error(message, 401)
  }

  static forbidden(message: string = 'Forbidden'): NextResponse<ApiError> {
    return this.error(message, 403)
  }

  static notFound(resource: string = 'Resource'): NextResponse<ApiError> {
    return this.error(`${resource} not found`, 404)
  }

  static badRequest(message: string = 'Bad request', details?: unknown): NextResponse<ApiError> {
    return this.error(message, 400, details)
  }

  static validationError(error: z.ZodError): NextResponse<ApiError> {
    return this.error('Validation error', 400, error.errors)
  }

  static rateLimited(retryAfter?: number): NextResponse<ApiError> {
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED', retryAfter },
      { 
        status: 429,
        headers: retryAfter ? { 'Retry-After': retryAfter.toString() } : {}
      }
    )
  }
}

export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error('API Error:', error)
  
  if (error instanceof z.ZodError) {
    return ApiResponse.validationError(error)
  }
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma known errors
    if (error.code === 'P2002') {
      return ApiResponse.badRequest('A record with this value already exists')
    }
    if (error.code === 'P2025') {
      return ApiResponse.notFound()
    }
  }
  
  if (error instanceof Prisma.PrismaClientValidationError) {
    return ApiResponse.badRequest('Invalid data provided')
  }
  
  return ApiResponse.error('Internal server error')
}
