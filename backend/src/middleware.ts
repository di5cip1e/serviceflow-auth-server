import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:3001']

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
const ALLOWED_HEADERS = [
  'Content-Type', 
  'Authorization', 
  'X-Requested-With',
  'X-RateLimit-Remaining'
]

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const method = request.method
  
  // Check if origin is allowed
  const isOriginAllowed = !origin || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
  
  // Handle preflight
  if (method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    
    response.headers.set('Access-Control-Allow-Origin', isOriginAllowed ? (origin || '*') : 'null')
    response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '))
    response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '))
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Max-Age', '86400')
    
    return response
  }
  
  // Continue with request - CORS headers will be added to responses
  const response = NextResponse.next()
  
  if (isOriginAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

export const config = {
  matcher: [
    '/api/:path*'
  ]
}
