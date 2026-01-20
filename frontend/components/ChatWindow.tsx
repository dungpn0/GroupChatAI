'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { 
  PaperAirplaneIcon,
  Bars3Icon,
  Cog6ToothIcon,
  UserGroupIcon,
  PhotoIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline'

interface ChatWindowProps {
  selectedGroupId: number | null
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

interface Message {
  id: number
  content: string
  sender: {
    id: number
    username: string
    avatar?: string
  }
  timestamp: string
  isAI?: boolean
  aiModel?: string
}

export function ChatWindow({ selectedGroupId, sidebarOpen, onToggleSidebar }: ChatWindowProps) {
  const { user } = useAuthStore()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Welcome to the group! Feel free to ask questions.',
      sender: {
        id: 2,
        username: 'john_doe',
      },
      timestamp: '10:30 AM',
    },
    {
      id: 2,
      content: 'Hello! I can help answer questions about various topics. What would you like to know?',
      sender: {
        id: 999,
        username: 'AI Assistant',
      },
      timestamp: '10:31 AM',
      isAI: true,
      aiModel: 'GPT-4'
    },
    {
      id: 3,
      content: 'Thanks! This AI integration is really cool.',
      sender: {
        id: 3,
        username: 'sarah_wilson',
      },
      timestamp: '10:32 AM',
    },
  ])

  const currentGroup = {
    id: selectedGroupId,
    name: selectedGroupId === 1 ? 'General Discussion' : selectedGroupId === 2 ? 'Project Team' : 'Random',
    memberCount: 5,
    aiEnabled: true,
    aiModel: 'GPT-4'
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !user) return

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      content: message.trim(),
      sender: {
        id: user.id,
        username: user.username,
        avatar: user.avatar_url
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setMessage('')

    // Simulate AI response if AI is enabled
    if (currentGroup.aiEnabled) {
      setIsTyping(true)
      
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: `I understand your message: "${userMessage.content}". This is a simulated AI response. In the full implementation, this would use real AI models like GPT-4 or Gemini.`,
          sender: {
            id: 999,
            username: 'AI Assistant'
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true,
          aiModel: currentGroup.aiModel
        }
        
        setMessages(prev => [...prev, aiMessage])
        setIsTyping(false)
      }, 2000)
    }
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
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <button
                onClick={onToggleSidebar}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
            )}
            
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <UserGroupIcon className="w-4 h-4 text-white" />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentGroup.name}</h2>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{currentGroup.memberCount} members</span>
                {currentGroup.aiEnabled && (
                  <>
                    <span>•</span>
                    <span className="text-purple-600">AI: {currentGroup.aiModel}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender.id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${msg.sender.id === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className="flex-shrink-0">
                {msg.sender.avatar ? (
                  <img
                    src={msg.sender.avatar}
                    alt={msg.sender.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                    msg.isAI 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : msg.sender.id === user?.id
                      ? 'bg-indigo-500'
                      : 'bg-gray-500'
                  }`}>
                    {msg.isAI ? 'AI' : msg.sender.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div className={`px-4 py-2 rounded-2xl ${
                  msg.isAI
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : msg.sender.id === user?.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                } ${msg.sender.id === user?.id ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                  {!msg.isAI && msg.sender.id !== user?.id && (
                    <p className="text-xs font-medium mb-1 opacity-75">
                      {msg.sender.username}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.content}</p>
                  {msg.isAI && msg.aiModel && (
                    <p className="text-xs mt-1 opacity-75">
                      {msg.aiModel}
                    </p>
                  )}
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${msg.sender.id === user?.id ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-medium">
                AI
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
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
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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