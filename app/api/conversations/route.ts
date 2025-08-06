import { type NextRequest, NextResponse } from "next/server"
import { dbManager } from "@/lib/database"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId") || "default-user"
    const query = searchParams.get("q")

    let conversations
    if (query) {
      conversations = await dbManager.searchConversations(userId, query)
    } else {
      conversations = await dbManager.getUserConversations(userId)
    }

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId = "default-user", title, messages } = body

    const conversation = {
      userId,
      title: title || "New Conversation",
      messages: messages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const conversationId = await dbManager.saveConversation(conversation)
    return NextResponse.json({ conversationId })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
