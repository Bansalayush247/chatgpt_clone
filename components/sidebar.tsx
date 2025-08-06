"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Search, Book, Zap, Users, ChevronLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  conversations: any[]
  currentConversationId: string | null
  onNewChat: () => void
  onSelectConversation: (conversationId: string) => void
  onDeleteConversation: (conversationId: string) => void
}

export function Sidebar({ 
  isOpen, 
  onToggle, 
  conversations, 
  currentConversationId, 
  onNewChat, 
  onSelectConversation, 
  onDeleteConversation 
}: SidebarProps) {
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header with New Chat */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-gray-900" />
            </div>
            <span className="font-semibold">ChatGPT</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-gray-400 hover:text-white hover:bg-gray-800 p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Button 
          onClick={onNewChat} 
          className="w-full justify-start bg-transparent border border-gray-700 hover:bg-gray-800 text-white rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          New chat
        </Button>
      </div>

      {/* Navigation Menu */}
      <div className="px-3 space-y-1">
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
          <Search className="h-4 w-4 mr-2" />
          Search chats
        </Button>
        
        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
          <Book className="h-4 w-4 mr-2" />
          Library
        </Button>
      </div>

      <div className="px-3 mt-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Explore</div>
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
            <Zap className="h-4 w-4 mr-2" />
            GPTs
          </Button>
        </div>
      </div>

      {/* Conversations */}
      <div className="px-3 mt-4 flex-1">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent chats</div>
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 cursor-pointer",
                    currentConversationId === conversation.id ? "bg-gray-800" : "",
                  )}
                  onMouseEnter={() => setHoveredConversation(conversation.id)}
                  onMouseLeave={() => setHoveredConversation(null)}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="flex-1 truncate text-sm text-gray-300">{conversation.title}</span>

                  {hoveredConversation === conversation.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(conversation.id)
                      }}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">Ayush Agarwal</span>
          <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded ml-auto">Free</span>
        </div>
      </div>
    </div>
  )
}
