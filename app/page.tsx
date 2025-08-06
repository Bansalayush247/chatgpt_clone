"use client"

import type React from "react"
import { useState, useRef, useEffect, MutableRefObject } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, User, Bot, Edit3, RotateCcw, Plus, MessageSquare, Trash2, ChevronDown, Mic, X, FileText, Image, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/file-upload"
import { Sidebar } from "@/components/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [input, setInput] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: () => setUploadedFiles(null),
    onError: (error: unknown) => {
      console.error("Chat error:", error)
      alert("There was an error with the chat. Please try again.")
    },
  })

  // Separate refs for file input in center and bottom input areas
  const centerFileInputRef = useRef<HTMLInputElement>(null)
  const bottomFileInputRef = useRef<HTMLInputElement>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId)
    setEditingContent(content)
  }

  const handleSaveEdit = (messageId: string) => {
    const messageIndex = messages.findIndex((m: any) => m.id === messageId)
    if (messageIndex === -1) return

    const updatedMessages = [...messages]
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: editingContent,
    }

    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1)
    setMessages(messagesToKeep)

    setEditingMessageId(null)
    setEditingContent("")

    if (messages[messageIndex].role === "user") {
      // Regenerate response by sending the edited message
      const editedMessage = messagesToKeep[messagesToKeep.length - 1]
      const messageContent = editedMessage.content || 
        (Array.isArray(editedMessage.parts) 
          ? editedMessage.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ")
          : "")
      
      sendMessage({ text: messageContent, files: null })
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditingContent("")
  }

  // Regenerate last assistant response
  const handleRegenerate = () => {
    const lastUserMessageIndex = messages.findLastIndex((m: any) => m.role === "user")
    if (lastUserMessageIndex === -1) return
    
    const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1)
    setMessages(messagesToKeep)
    
    const lastUserMessage = messages[lastUserMessageIndex]
    const messageContent = lastUserMessage.content || 
      (Array.isArray(lastUserMessage.parts) 
        ? lastUserMessage.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join(" ")
        : "")
    
    sendMessage({ text: messageContent, files: null })
  }

  const handleFileUpload = (files: FileList) => {
    if (!files || files.length === 0) return
    if (!uploadedFiles || uploadedFiles.length === 0) {
      setUploadedFiles(files)
      return
    }
    // Merge new files with existing, avoiding duplicates by name/size/lastModified
    const existing = Array.from(uploadedFiles)
    const incoming = Array.from(files)
    const all = [...existing]
    incoming.forEach(f => {
      if (!existing.some(e => e.name === f.name && e.size === f.size && e.lastModified === f.lastModified)) {
        all.push(f)
      }
    })
    // DataTransfer to create a new FileList
    const dt = new DataTransfer()
    all.forEach(f => dt.items.add(f))
    setUploadedFiles(dt.files)
  }

  // Remove a file from uploadedFiles
  const handleRemoveFile = (index: number) => {
    if (!uploadedFiles) return
    const dt = new DataTransfer()
    Array.from(uploadedFiles).forEach((file, i) => {
      if (i !== index) dt.items.add(file)
    })
    setUploadedFiles(dt.files.length > 0 ? dt.files : null)
  }

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length > 0) {
      // Add a small delay to ensure the message is fully processed
      const timeoutId = setTimeout(() => {
        saveCurrentConversation()
      }, 500) // Increased delay to ensure messages are fully loaded
      
      return () => clearTimeout(timeoutId)
    }
  }, [messages, currentConversationId]) // Added currentConversationId as dependency

  const saveCurrentConversation = async () => {
    if (messages.length === 0) return
    
    // Create a conversation title from the first user message
    const firstUserMessage = messages.find((m: any) => m.role === "user")
    const title = firstUserMessage?.content 
      ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
      : "New conversation"
    
    // If this is a new conversation, create it
    if (!currentConversationId) {
      const newConversationId = Date.now().toString()
      const newConversation = {
        id: newConversationId,
        title,
        messages: [...messages],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setConversations(prev => [newConversation, ...prev])
      setCurrentConversationId(newConversationId)
    } else {
      // Update existing conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversationId 
            ? { 
                ...conv, 
                messages: [...messages], 
                updatedAt: new Date().toISOString(),
                // Update title if it was just "New conversation" and we now have user content
                title: conv.title === "New conversation" && firstUserMessage?.content 
                  ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
                  : conv.title
              }
            : conv
        )
      )
    }
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const messageContent = input.trim()
    setInput("")

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Send the message to ChatGPT
    sendMessage({ 
      text: messageContent, 
      files: uploadedFiles ? Array.from(uploadedFiles) : null 
    })

    // Send the message and files to Gemini endpoint
    if (uploadedFiles && uploadedFiles.length > 0) {
      const formData = new FormData()
      formData.append('text', messageContent)
      Array.from(uploadedFiles).forEach((file) => {
        formData.append('files', file)
      })
      fetch('/api/gemini', {
        method: 'POST',
        body: formData
      })
    } else {
      // If no files, send as JSON
      fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageContent })
      })
    }

    // If this is the first message and no current conversation, create a new one immediately
    if (!currentConversationId && messages.length === 0) {
      const newConversationId = Date.now().toString()
      const newConversation = {
        id: newConversationId,
        title: messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : ""),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setConversations(prev => [newConversation, ...prev])
      setCurrentConversationId(newConversationId)
    }
  }

  return (
    <div className="flex h-screen bg-[#121212] text-white">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={() => {
          setMessages([])
          setCurrentConversationId(null)
          setInput("")
          setEditingMessageId(null)
          setEditingContent("")
        }}
        onSelectConversation={(id) => {
          const conversation = conversations.find(c => c.id === id)
          if (conversation) {
            setCurrentConversationId(id)
            setMessages(conversation.messages || [])
          }
        }}
        onDeleteConversation={(id) => {
          setConversations(prev => prev.filter(c => c.id !== id))
          if (currentConversationId === id) {
            setMessages([])
            setCurrentConversationId(null)
            setInput("")
            setEditingMessageId(null)
            setEditingContent("")
          }
        }}
      />
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
              </svg>
            </Button>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-gray-700">
                    <span>ChatGPT</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-gray-700 border-gray-600">
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      GPT-4o
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      GPT-4
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      GPT-3.5
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
            Get Plus
          </Button>
        </div>
        {/* Messages and input areas */}
        <ScrollArea className="flex-1 px-4">
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <h2 className="text-3xl font-normal mb-8 text-white">What's on your mind today?</h2>
                {/* Center input area when no messages */}
                <form onSubmit={onSubmit} className="max-w-3xl w-full">
                  {/* Show selected files above input */}
                  {uploadedFiles && uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.from(uploadedFiles).map((file, idx) => (
                        <div key={idx} className="flex items-center bg-gray-700 text-gray-200 rounded px-3 py-1 text-xs">
                          <span className="truncate max-w-[120px]">{file.name}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="ml-1 h-4 w-4 p-0 text-gray-400 hover:text-white"
                            onClick={() => handleRemoveFile(idx)}
                            aria-label="Remove file"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="rounded-3xl bg-[#2c2c2f] flex items-center px-6 py-4 gap-3 shadow-none border-none">
                    <div className="flex items-center gap-3 mr-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-300 hover:text-white"
                        onClick={() => centerFileInputRef.current?.click()}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                      <input
                        ref={centerFileInputRef}
                        type="file"
                        multiple
                        style={{ display: "none" }}
                        onChange={e => {
                          if (e.target.files) handleFileUpload(e.target.files)
                        }}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white text-base font-normal"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                            Tools
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56 bg-gray-700 border-gray-600">
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Files
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                            <div className="flex items-center gap-2">
                              <Image className="h-5 w-5" />
                              Images
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                            <div className="flex items-center gap-2">
                              <Code className="h-5 w-5" />
                              Code
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value)
                        adjustTextareaHeight()
                      }}
                      placeholder="Message ChatGPT"
                      className="flex-1 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px] max-h-[120px] bg-transparent placeholder-gray-400 text-white text-base px-3"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          onSubmit(e)
                        }
                      }}
                      style={{ boxShadow: 'none', outline: 'none', background: 'transparent' }}
                    />
                    <div className="flex items-center gap-3 ml-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                        tabIndex={-1}
                        aria-label="Mic"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      {input.trim() === "" ? (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          tabIndex={0}
                          aria-label="Voice Mode"
                        >
                          <span className="text-xs font-semibold">🎤</span>
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          tabIndex={0}
                          aria-label="Send"
                        >
                          <Send className="h-4 w-4 rotate-[-90deg]" />
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <>
                {messages.map((message: any) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-4 group",
                      message.role === "assistant" ? "bg-gray-700/50 -mx-4 px-4 py-6 rounded-lg" : "",
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={message.role === "user" ? "bg-blue-500 text-white" : "bg-green-500 text-white"}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      {editingMessageId === message.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[100px] resize-none bg-gray-700 border-gray-600 text-white"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSaveEdit(message.id)}>
                              Save & Submit
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="prose prose-sm max-w-none">
                            <p className="whitespace-pre-wrap leading-relaxed text-white">
                              {message.content ?? (Array.isArray(message.parts)
                                ? message.parts
                                    .filter((p: any) => p.type === "text" && p.text)
                                    .map((p: any) => p.text)
                                    .join("\n\n")
                                : "")}
                            </p>
                          </div>
                          {(message as any).files && (message as any).files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(message as any).files.map((file: any, index: number) => (
                                <Card key={index} className="p-2 text-xs bg-gray-700 border-gray-600">
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <Paperclip className="h-3 w-3" />
                                    <span className="truncate max-w-[150px]">{file.name}</span>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                          {message.role === "user" && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditMessage(message.id, message.content)}
                                className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            </div>
                          )}
                          {message.role === "assistant" && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleRegenerate}
                                className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                Regenerate
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {(status === 'streaming' || status === 'submitted') && (
                  <div className="flex gap-4 bg-gray-700/50 -mx-4 px-4 py-6 rounded-lg">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-green-500 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <span className="text-sm text-gray-400 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        {messages.length > 0 && (
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={onSubmit} className="max-w-3xl mx-auto">
              {/* Show selected files above input */}
              {uploadedFiles && uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.from(uploadedFiles).map((file, idx) => (
                    <div key={idx} className="flex items-center bg-gray-700 text-gray-200 rounded px-3 py-1 text-xs">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="ml-1 h-4 w-4 p-0 text-gray-400 hover:text-white"
                        onClick={() => handleRemoveFile(idx)}
                        aria-label="Remove file"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-3xl bg-[#2c2c2f] flex items-center px-6 py-4 gap-3 shadow-none border-none">
                <div className="flex items-center gap-3 mr-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-300 hover:text-white"
                    onClick={() => bottomFileInputRef.current?.click()}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <input
                    ref={bottomFileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={e => {
                      if (e.target.files) handleFileUpload(e.target.files)
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex items-center gap-1 px-2 py-1 text-gray-300 hover:text-white text-base font-normal"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                        Tools
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-gray-700 border-gray-600">
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Files
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                        <div className="flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Images
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-gray-300 hover:bg-gray-600">
                        <div className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          Code
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    adjustTextareaHeight()
                  }}
                  placeholder="Message ChatGPT"
                  className="flex-1 border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[32px] max-h-[120px] bg-transparent placeholder-gray-400 text-white text-base px-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit(e)
                    }
                  }}
                  style={{ boxShadow: 'none', outline: 'none', background: 'transparent' }}
                />
                <div className="flex items-center gap-3 ml-3">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    tabIndex={-1}
                    aria-label="Mic"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  {input.trim() === "" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      tabIndex={0}
                      aria-label="Voice Mode"
                    >
                      <span className="text-xs font-semibold">🎤</span>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      tabIndex={0}
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4 rotate-[-90deg]" />
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
