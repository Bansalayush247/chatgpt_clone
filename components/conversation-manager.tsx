"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2 } from "lucide-react"
import { useConversations } from "@/hooks/use-conversations"
import type { Conversation } from "@/lib/database"

interface ConversationManagerProps {
  onSelectConversation: (conversation: Conversation) => void
  currentConversationId?: string
}

export function ConversationManager({ onSelectConversation, currentConversationId }: ConversationManagerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const {
    conversations,
    isLoading,
    error,
    createConversation,
    deleteConversation,
    searchConversations,
    loadConversations,
  } = useConversations()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      setIsSearching(true)
      await searchConversations(query)
      setIsSearching(false)
    } else {
      await loadConversations()
    }
  }

  const handleCreateConversation = async () => {
    try {
      const title = `New Chat ${new Date().toLocaleDateString()}`
      await createConversation(title)
    } catch (error) {
      console.error("Failed to create conversation:", error)
    }
  }

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversation(id)
      } catch (error) {
        console.error("Failed to delete conversation:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
        />
      </div>

      {/* New Conversation Button */}
      <Button onClick={handleCreateConversation} className="w-full justify-start bg-gray-800 hover:bg-gray-700">
        <Plus className="h-4 w-4 mr-2" />
        New Conversation
      </Button>

      {/* Conversations List */}
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {isLoading || isSearching ? (
          <div className="text-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm text-center py-4">{error}</div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id?.toString()}
              className={`group flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-800 ${
                currentConversationId === conversation._id?.toString() ? "bg-gray-800" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex-1 truncate">
                <div className="text-sm font-medium truncate">{conversation.title}</div>
                <div className="text-xs text-gray-400">
                  {conversation.messages.length} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={(e) => handleDeleteConversation(conversation._id?.toString() || "", e)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
