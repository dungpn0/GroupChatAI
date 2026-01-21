'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useChatStore } from '@/store/chat'
import { wsService } from '@/services/api'
import { 
  PaperAirplaneIcon,
  Bars3Icon,
  Cog6ToothIcon,
  UserGroupIcon,
  PhotoIcon,
  FaceSmileIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ChatWindowProps {
  selectedGroupId: number | null
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ChatWindow({ selectedGroupId, sidebarOpen, onToggleSidebar }: ChatWindowProps) {
  const { user } = useAuthStore()
  const { 
    currentGroup, 
    messages, 
    members,
    typingUsers,
    isLoadingMessages,
    sendMessage,
    setCurrentGroup,
    loadMessages
  } = useChatStore()
  
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Set current group when selectedGroupId changes
  useEffect(() => {
    setCurrentGroup(selectedGroupId)
  }, [selectedGroupId, setCurrentGroup])

  // Get messages for current group
  const currentMessages = selectedGroupId ? messages[selectedGroupId] || [] : []
  
  // Get typing users for current group (excluding current user)
  const currentTypingUsers = selectedGroupId 
    ? typingUsers[selectedGroupId]?.filter(id => id !== user?.id) || []
    : []

  useEffect(() => {
    scrollToBottom()
  }, [currentMessages, currentTypingUsers])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTyping = () => {
    if (!selectedGroupId || !user) return

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing start if not already typing
    if (!isTyping) {
      setIsTyping(true)
      wsService.sendTyping(selectedGroupId, true)
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      wsService.sendTyping(selectedGroupId, false)
    }, 2000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !user || !selectedGroupId) return

    try {
      await sendMessage(selectedGroupId, message.trim())
      setMessage('')
      
      // Stop typing
      if (isTyping) {
        setIsTyping(false)
        wsService.sendTyping(selectedGroupId, false)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    handleTyping()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!selectedGroupId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="absolute top-4 left-4 p-2 text-gray-500 hover:text-gray-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        )}
        <div className="text-center">
          <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No group selected</h3>
          <p className="text-gray-500">Choose a group from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          {!sidebarOpen && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          )}
          
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {currentGroup?.name?.charAt(0)?.toUpperCase() || '#'}
            </span>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentGroup?.name || 'Loading...'}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>
                {currentGroup?.member_count} members
              </span>
              {currentGroup?.ai_enabled && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <SparklesIcon className="w-4 h-4" />
                    <span>AI: {currentGroup.ai_model}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button className="p-2 text-gray-500 hover:text-gray-700">
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <UserGroupIcon className="w-12 h-12 mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          currentMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender?.id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender?.id === user?.id
                  ? 'bg-indigo-600 text-white'
                  : msg.is_ai_message
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}>
                {msg.sender?.id !== user?.id && (
                  <div className="text-xs opacity-75 mb-1 flex items-center">
                    {msg.is_ai_message && <SparklesIcon className="w-3 h-3 mr-1" />}
                    {msg.sender?.username || 'Unknown'}
                  </div>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-75 mt-1">
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {currentTypingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs ml-2">
                  {currentTypingUsers.length === 1 ? 'Someone is typing...' : `${currentTypingUsers.length} people are typing...`}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <PhotoIcon className="w-5 h-5" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
            >
              <FaceSmileIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}