import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
// For production, use Redis or similar
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimits = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimits.entries()) {
    if (entry.resetTime < now) {
      rateLimits.delete(key)
    }
  }
}, 60000)

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60000, // 1 minute
  maxRequests: 100 // 100 requests per minute
}

const strictConfig: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 20 // 20 requests per minute for sensitive endpoints
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  // Get IP from header or fallback to forwarded
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip') 
    || 'unknown'
  
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  
  let entry = rateLimits.get(key)
  
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    }
    rateLimits.set(key, entry)
  }
  
  entry.count++
  
  const remaining = Math.max(0, config.maxRequests - entry.count)
  
  return {
    allowed: entry.count <= config.maxRequests,
    remaining,
    resetTime: entry.resetTime
  }
}

export function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): NextResponse | null {
  const { allowed, remaining, resetTime } = rateLimit(request, config)
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.ceil((resetTime - Date.now()) / 1000) },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    )
  }
  
  // Return response with rate limit headers
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString()
      }
    }
  )
}

// Pre-configured rate limiters
export const standardRateLimit = (req: NextRequest) => rateLimit(req, defaultConfig)
export const strictRateLimit = (req: NextRequest) => rateLimit(req, strictConfig)
