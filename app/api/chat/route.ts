import { google } from "@ai-sdk/google"
import { streamText, convertToModelMessages, UIMessage } from "ai"
import type { NextRequest } from "next/server"
import { trimMessagesForContext, addMemory } from "@/lib/memory"

// Use environment variable for OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    // Apply context window management
    const trimmedMessages = trimMessagesForContext(messages, 3000) // Leave room for system prompt and response

    // Save conversation memory (using user IP as a simple user identifier)
    const userId = req.headers.get('x-forwarded-for') || 'anonymous'
    const conversationId = 'current' // In a real app, you'd have proper conversation IDs
    
    try {
      await addMemory(userId, conversationId, trimmedMessages)
    } catch (error) {
      console.error('Error saving memory:', error)
    }

    const result = await streamText({
      model: google("models/gemini-2.0-flash-exp"),
      messages: convertToModelMessages(trimmedMessages),
      system: `You are a helpful AI assistant similar to ChatGPT. You can help with a wide variety of tasks including answering questions, writing, analysis, math, coding, and creative tasks. 

When users upload files:
- For images: Describe what you see and answer questions about the image
- For documents: Analyze the content and help with questions about it
- For text files: Read and work with the content as requested

Be conversational, helpful, and accurate in your responses.`,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
