import { QdrantClient } from '@qdrant/js-client-rest'

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333'
const COLLECTION_NAME = 'station_command_memory'

// Singleton Qdrant client
let qdrantClient: QdrantClient | null = null

export function getQdrantClient(): QdrantClient {
  if (!qdrantClient) {
    qdrantClient = new QdrantClient({
      url: QDRANT_URL
    })
  }
  return qdrantClient
}

export async function ensureCollection(): Promise<void> {
  const client = getQdrantClient()
  
  const collections = await client.getCollections()
  const exists = collections.collections.some(c => c.name === COLLECTION_NAME)
  
  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384, // Standard for sentence-transformers
        distance: 'Cosine'
      }
    })
  }
}

export interface MemoryRecord {
  id: string
  userId: string
  content: string
  type: 'mission' | 'conversation' | 'achievement' | 'battle' | 'general'
  metadata?: Record<string, unknown>
  createdAt: Date
}

export async function addMemory(memory: Omit<MemoryRecord, 'id' | 'createdAt'>): Promise<string> {
  const client = getQdrantClient()
  
  const id = crypto.randomUUID()
  
  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id,
        vector: await embedText(memory.content),
        payload: {
          userId: memory.userId,
          content: memory.content,
          type: memory.type,
          metadata: memory.metadata,
          createdAt: new Date().toISOString()
        }
      }
    ]
  })
  
  return id
}

export async function searchMemories(
  userId: string,
  query: string,
  limit: number = 5,
  type?: MemoryRecord['type']
): Promise<MemoryRecord[]> {
  const client = getQdrantClient()
  
  const queryVector = await embedText(query)
  
  const filter: Record<string, unknown> = {
    must: [
      {
        key: 'userId',
        match: { value: userId }
      }
    ]
  }
  
  if (type) {
    filter.must.push({
      key: 'type',
      match: { value: type }
    })
  }
  
  const results = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    filter
  })
  
  return results.map(r => ({
    id: r.id as string,
    userId: r.payload?.userId as string,
    content: r.payload?.content as string,
    type: r.payload?.type as MemoryRecord['type'],
    metadata: r.payload?.metadata as Record<string, unknown> | undefined,
    createdAt: new Date(r.payload?.createdAt as string)
  }))
}

// Simple embedding function - in production, use a proper embedding model
// For now, we use a simple hash-based approach as placeholder
// In production, integrate with OpenAI embeddings or similar
async function embedText(text: string): Promise<number[]> {
  // Simple deterministic hash-based embedding for demo
  // Replace with actual embedding model in production
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, ' ')
  const words = normalized.split(/\s+/).filter(Boolean)
  
  // Create a 384-dimensional vector (matching the collection)
  const vector = new Array(384).fill(0)
  
  words.forEach((word, idx) => {
    const hash = hashString(word)
    for (let i = 0; i < 384; i++) {
      vector[i] += Math.sin(hash * (i + 1)) * (1 / (idx + 1))
    }
  })
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  if (magnitude > 0) {
    for (let i = 0; i < 384; i++) {
      vector[i] /= magnitude
    }
  }
  
  return vector
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export async function getUserMemories(
  userId: string,
  limit: number = 50
): Promise<MemoryRecord[]> {
  const client = getQdrantClient()
  
interface ScrollResponse {
  results: Array<{
    id: string | number
    payload?: Record<string, unknown>
  }>
}
    filter: {
      must: [
        {
          key: 'userId',
          match: { value: userId }
        }
      ]
    },
    limit,
    with_payload: true
  })
  
  return results.results.map(r => ({
    id: r.id as string,
    userId: r.payload?.userId as string,
    content: r.payload?.content as string,
    type: r.payload?.type as MemoryRecord['type'],
    metadata: r.payload?.metadata as Record<string, unknown> | undefined,
    createdAt: new Date(r.payload?.createdAt as string)
  }))
}

export async function deleteMemory(memoryId: string): Promise<void> {
  const client = getQdrantClient()
  await client.delete(COLLECTION_NAME, {
    points: [memoryId]
  })
}
