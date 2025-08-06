// Memory management for ChatGPT Clone
// Simple in-memory storage for development, can be extended with mem0 integration

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
  private memories: Map<string, ConversationMemory> = new Map()

  async saveMemory(userId: string, conversationId: string, messages: any[]) {
    const key = `${userId}:${conversationId}`

    // Extract context and entities from messages
    const context = messages.map((m) => m.content).slice(-10) // Keep last 10 messages
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

    this.memories.set(key, memory)
    return memory
  }

  async getMemory(userId: string, conversationId: string): Promise<ConversationMemory | null> {
    const key = `${userId}:${conversationId}`
    return this.memories.get(key) || null
  }

  async searchMemories(userId: string, query: string): Promise<ConversationMemory[]> {
    const userMemories = Array.from(this.memories.values())
      .filter((m) => m.userId === userId)
      .filter(
        (m) =>
          m.context.some((c) => c.toLowerCase().includes(query.toLowerCase())) ||
          m.summary.toLowerCase().includes(query.toLowerCase()),
      )

    return userMemories
  }

  private extractEntities(messages: any[]): Record<string, any> {
    // Simple entity extraction (in a real app, use NLP libraries)
    const entities: Record<string, any> = {}
    const text = messages.map((m) => m.content).join(" ")

    // Extract emails
    const emails = text.match(/[\w\.-]+@[\w\.-]+\.\w+/g)
    if (emails) entities.emails = emails

    // Extract URLs
    const urls = text.match(/https?:\/\/[^\s]+/g)
    if (urls) entities.urls = urls

    return entities
  }

  private async generateSummary(messages: any[]): Promise<string> {
    // Simple summary generation (in a real app, use AI for summarization)
    if (messages.length === 0) return ""

    const lastFewMessages = messages.slice(-3)
    const topics = lastFewMessages
      .map((m) => m.content)
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

export function trimMessagesForContext(messages: any[], maxTokens: number = 4000): any[] {
  let totalTokens = 0
  const trimmedMessages = []
  
  // Start from the end (most recent messages)
  for (let i = messages.length - 1; i >= 0; i--) {
    const messageTokens = countTokens(messages[i].content || '')
    
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
export async function addMemory(userId: string, conversationId: string, messages: any[]) {
  return await memoryManager.saveMemory(userId, conversationId, messages)
}

export async function getMemory(userId: string, conversationId: string) {
  return await memoryManager.getMemory(userId, conversationId)
}

export async function searchMemory(userId: string, query: string) {
  return await memoryManager.searchMemories(userId, query)
}
