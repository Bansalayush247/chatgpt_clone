import clientPromise from "./mongodb"
import { ObjectId } from "mongodb"

export interface Conversation {
  _id?: ObjectId
  userId: string
  title: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    files?: Array<{
      name: string
      url: string
      type: string
    }>
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}

export class DatabaseManager {
  private async getDb() {
    const client = await clientPromise
    return client.db("chatgpt-clone")
  }

  async saveConversation(conversation: Omit<Conversation, "_id">): Promise<string> {
    const db = await this.getDb()
    const result = await db.collection("conversations").insertOne(conversation)
    return result.insertedId.toString()
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const db = await this.getDb()
    await db.collection("conversations").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    )
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const db = await this.getDb()
    const conversation = await db.collection("conversations").findOne({ _id: new ObjectId(id) })
    return conversation as Conversation | null
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const db = await this.getDb()
    const conversations = await db.collection("conversations").find({ userId }).sort({ updatedAt: -1 }).toArray()

    return conversations as Conversation[]
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await this.getDb()
    await db.collection("conversations").deleteOne({ _id: new ObjectId(id) })
  }

  async searchConversations(userId: string, query: string): Promise<Conversation[]> {
    const db = await this.getDb()
    const conversations = await db
      .collection("conversations")
      .find({
        userId,
        $or: [{ title: { $regex: query, $options: "i" } }, { "messages.content": { $regex: query, $options: "i" } }],
      })
      .sort({ updatedAt: -1 })
      .toArray()

    return conversations as Conversation[]
  }
}

export const dbManager = new DatabaseManager()
