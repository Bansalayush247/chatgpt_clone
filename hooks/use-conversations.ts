"use client"

import { useState, useEffect } from "react"
import type { Conversation } from "@/lib/database"

export function useConversations(userId = "default-user") {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/conversations?userId=${userId}`)

      if (!response.ok) {
        throw new Error("Failed to load conversations")
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error loading conversations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const createConversation = async (title: string, messages: any[] = []) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, messages }),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const data = await response.json()
      await loadConversations() // Refresh the list
      return data.conversationId
    } catch (err) {
      console.error("Error creating conversation:", err)
      throw err
    }
  }

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update conversation")
      }

      await loadConversations() // Refresh the list
    } catch (err) {
      console.error("Error updating conversation:", err)
      throw err
    }
  }

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      await loadConversations() // Refresh the list
    } catch (err) {
      console.error("Error deleting conversation:", err)
      throw err
    }
  }

  const searchConversations = async (query: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/conversations?userId=${userId}&q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error("Failed to search conversations")
      }

      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error searching conversations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [userId])

  return {
    conversations,
    isLoading,
    error,
    loadConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    searchConversations,
  }
}
