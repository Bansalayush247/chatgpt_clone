// Memory management for ChatGPT Clone
// Simple in-memory storage for development, can be extended with mem0 integration
import type { UIMessage } from "ai"
import mem0ai from "mem0ai"

interface ConversationMemory {
  userId: string
  conversationId: string
  context: string[]
  entities: Record<string, any>
  summary: string
  createdAt: Date
  updatedAt: Date
}

class MemoryManager {
  private memories: Map<string, ConversationMemory>
  private mem0: any
  private mem0Enabled: boolean

  constructor() {
    this.memories = new Map()
    const apiKey = process.env.MEM0_API_KEY
    this.mem0Enabled = typeof apiKey === 'string' && apiKey.length > 0
    if (this.mem0Enabled) {
      this.mem0 = new mem0ai({ apiKey: apiKey as string })
    }
  }

  async saveMemory(userId: string, conversationId: string, messages: UIMessage[]) {
    const key = `${userId}:${conversationId}`
    // Extract context and entities from messages
    const context = messages.map((m) => {
      return m.parts?.map(p => p.type === 'text' ? p.text : `[${p.type}]`).join(' ') || ''
    }).slice(-10) // Keep last 10 messages
    const entities = this.extractEntities(messages)
    const summary = await this.generateSummary(messages)
    const memory: ConversationMemory = {
      userId,
      conversationId,
      context,
      entities,
      summary,
      createdAt: this.memories.get(key)?.createdAt || new Date(),
      updatedAt: new Date(),
    }
    if (this.mem0Enabled) {
      await this.mem0.set(key, memory)
    } else {
      this.memories.set(key, memory)
    }
    return memory
  }

  async getMemory(userId: string, conversationId: string): Promise<ConversationMemory | null> {
    const key = `${userId}:${conversationId}`
    if (this.mem0Enabled) {
      return (await this.mem0.get(key)) || null
    }
    return this.memories.get(key) || null
  }

  async searchMemories(userId: string, query: string): Promise<ConversationMemory[]> {
    let memories: ConversationMemory[] = []
    if (this.mem0Enabled) {
      const all = await this.mem0.all()
      memories = Object.values(all).filter((m: any) => (m as ConversationMemory).userId === userId) as ConversationMemory[]
    } else {
      memories = Array.from(this.memories.values()).filter((m) => m.userId === userId)
    }
    return memories.filter(
      (m) =>
        m.context.some((c) => c.toLowerCase().includes(query.toLowerCase())) ||
        m.summary.toLowerCase().includes(query.toLowerCase()),
    )
  }

  private extractEntities(messages: UIMessage[]): Record<string, any> {
    // Simple entity extraction (in a real app, use NLP libraries)
    const entities: Record<string, any> = {}
    const text = messages.map((m) => 
      m.parts?.map(p => p.type === 'text' ? p.text : '').join(' ') || ''
    ).join(" ")

    // Extract emails
    const emails = text.match(/[\w\.-]+@[\w\.-]+\.\w+/g)
    if (emails) entities.emails = emails

    // Extract URLs
    const urls = text.match(/https?:\/\/[^\s]+/g)
    if (urls) entities.urls = urls

    return entities
  }

  private async generateSummary(messages: UIMessage[]): Promise<string> {
    // Simple summary generation (in a real app, use AI for summarization)
    if (messages.length === 0) return ""

    const lastFewMessages = messages.slice(-3)
    const topics = lastFewMessages
      .map((m) => m.parts?.map(p => p.type === 'text' ? p.text : '').join(' ') || '')
      .join(" ")
      .split(" ")
      .filter((word) => word.length > 4)
      .slice(0, 5)

    return `Conversation about: ${topics.join(", ")}`
  }
}

// Token counting utility
export function countTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

export function trimMessagesForContext(messages: UIMessage[], maxTokens: number = 4000): UIMessage[] {
  let totalTokens = 0
  const trimmedMessages = []
  
  // Start from the end (most recent messages)
  for (let i = messages.length - 1; i >= 0; i--) {
    const messageText = messages[i].parts?.map(p => p.type === 'text' ? p.text : '').join(' ') || ''
    const messageTokens = countTokens(messageText)
    
    if (totalTokens + messageTokens > maxTokens) {
      break
    }
    
    totalTokens += messageTokens
    trimmedMessages.unshift(messages[i])
  }
  
  return trimmedMessages
}

// Export singleton instance
export const memoryManager = new MemoryManager()

// Convenience functions for memory operations
export async function addMemory(userId: string, conversationId: string, messages: UIMessage[]) {
  return await memoryManager.saveMemory(userId, conversationId, messages)
}

export async function getMemory(userId: string, conversationId: string) {
  return await memoryManager.getMemory(userId, conversationId)
}

export async function searchMemory(userId: string, query: string) {
  return await memoryManager.searchMemories(userId, query)
}
