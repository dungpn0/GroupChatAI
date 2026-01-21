// API services for GroupChatAI frontend
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Configure axios with interceptors
const api = axios.create({
  baseURL: API_URL,
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const parsedToken = JSON.parse(token)
      if (parsedToken?.state?.token) {
        config.headers.Authorization = `Bearer ${parsedToken.state.token}`
      }
    } catch (error) {
      console.error('Error parsing token from localStorage:', error)
    }
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Types
export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  credits: number
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login?: string
}

export interface ChatGroup {
  id: number
  name: string
  description?: string
  created_by: number
  is_private: boolean
  ai_enabled: boolean
  ai_model?: string
  member_count: number
  created_at: string
  updated_at: string
  creator?: User
  last_message?: Message
}

export interface Message {
  id: number
  content: string
  user_id: number
  group_id: number
  is_ai_message: boolean
  ai_model_used?: string
  credits_used?: number
  created_at: string
  sender?: User
}

export interface GroupMember {
  id: number
  user_id: number
  group_id: number
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: User
}

export interface WebSocketMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'typing'
  data: any
  group_id?: number
  user_id?: number
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password })
    return response.data
  },

  register: async (email: string, username: string, password: string, full_name?: string) => {
    const response = await api.post('/api/v1/auth/register', {
      email,
      username,
      password,
      full_name,
    })
    return response.data
  },

  googleAuth: async (googleToken: string) => {
    const response = await api.post('/api/v1/auth/google', {
      google_token: googleToken,
    })
    return response.data
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/v1/auth/me')
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post('/api/v1/auth/refresh')
    return response.data
  },
}

// Groups API
export const groupsAPI = {
  getGroups: async (): Promise<ChatGroup[]> => {
    const response = await api.get('/api/v1/groups/')
    return response.data
  },

  getGroup: async (groupId: number): Promise<ChatGroup> => {
    const response = await api.get(`/api/v1/groups/${groupId}`)
    return response.data
  },

  createGroup: async (data: {
    name: string
    description?: string
    is_private?: boolean
    ai_enabled?: boolean
    ai_model?: string
  }): Promise<ChatGroup> => {
    const response = await api.post('/api/v1/groups/', data)
    return response.data
  },

  updateGroup: async (groupId: number, data: {
    name?: string
    description?: string
    ai_enabled?: boolean
    ai_model?: string
  }): Promise<ChatGroup> => {
    const response = await api.put(`/api/v1/groups/${groupId}`, data)
    return response.data
  },

  deleteGroup: async (groupId: number): Promise<void> => {
    await api.delete(`/api/v1/groups/${groupId}`)
  },

  joinGroup: async (groupId: number): Promise<void> => {
    await api.post(`/api/v1/groups/${groupId}/join`)
  },

  leaveGroup: async (groupId: number): Promise<void> => {
    await api.post(`/api/v1/groups/${groupId}/leave`)
  },

  inviteToGroup: async (groupId: number, email: string): Promise<void> => {
    await api.post(`/api/v1/groups/${groupId}/invite`, { email })
  },

  getGroupMembers: async (groupId: number): Promise<GroupMember[]> => {
    const response = await api.get(`/api/v1/groups/${groupId}/members`)
    return response.data
  },

  removeGroupMember: async (groupId: number, userId: number): Promise<void> => {
    await api.delete(`/api/v1/groups/${groupId}/members/${userId}`)
  },

  updateGroupMember: async (groupId: number, userId: number, role: string): Promise<void> => {
    await api.put(`/api/v1/groups/${groupId}/members/${userId}`, { role })
  },
}

// Messages API
export const messagesAPI = {
  getMessages: async (groupId: number, page = 1, limit = 50): Promise<{
    messages: Message[]
    total: number
    has_more: boolean
  }> => {
    const response = await api.get(`/api/v1/groups/${groupId}/messages`, {
      params: { page, limit }
    })
    return response.data
  },

  sendMessage: async (groupId: number, content: string): Promise<Message> => {
    const response = await api.post(`/api/v1/groups/${groupId}/messages`, {
      content
    })
    return response.data
  },

  deleteMessage: async (messageId: number): Promise<void> => {
    await api.delete(`/api/v1/messages/${messageId}`)
  },

  editMessage: async (messageId: number, content: string): Promise<Message> => {
    const response = await api.put(`/api/v1/messages/${messageId}`, {
      content
    })
    return response.data
  },
}

// Users API
export const usersAPI = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/v1/users/')
    return response.data
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await api.get(`/api/v1/users/${userId}`)
    return response.data
  },

  updateUser: async (data: {
    username?: string
    full_name?: string
    avatar_url?: string
  }): Promise<User> => {
    const response = await api.put('/api/v1/users/me', data)
    return response.data
  },

  updateCredits: async (amount: number): Promise<User> => {
    const response = await api.post('/api/v1/users/credits', { amount })
    return response.data
  },

  getCredits: async (): Promise<{ credits: number }> => {
    const response = await api.get('/api/v1/users/credits')
    return response.data
  },
}

// Main API service combining all APIs
export const apiService = {
  // Auth methods
  login: authAPI.login,
  register: authAPI.register,
  googleAuth: authAPI.googleAuth,
  getCurrentUser: authAPI.getCurrentUser,
  refreshToken: authAPI.refreshToken,
  
  // Groups methods
  getGroups: groupsAPI.getGroups,
  getGroup: groupsAPI.getGroup,
  createGroup: groupsAPI.createGroup,
  updateGroup: groupsAPI.updateGroup,
  deleteGroup: groupsAPI.deleteGroup,
  joinGroup: groupsAPI.joinGroup,
  leaveGroup: groupsAPI.leaveGroup,
  inviteToGroup: groupsAPI.inviteToGroup,
  getGroupMembers: groupsAPI.getGroupMembers,
  removeGroupMember: groupsAPI.removeGroupMember,
  updateGroupMember: groupsAPI.updateGroupMember,
  
  // Messages methods
  getMessages: messagesAPI.getMessages,
  sendMessage: messagesAPI.sendMessage,
  deleteMessage: messagesAPI.deleteMessage,
  editMessage: messagesAPI.editMessage,
  
  // Users methods
  getUsers: usersAPI.getUsers,
  getUser: usersAPI.getUser,
  updateUser: usersAPI.updateUser,
  updateCredits: usersAPI.updateCredits,
}

// WebSocket service
export class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private messageHandlers: { [key: string]: Function[] } = {}

  constructor() {
    // Only connect in browser environment
    if (typeof window !== 'undefined') {
      this.connect()
    }
  }

  connect() {
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      return
    }
    
    const token = this.getToken()
    if (!token) {
      console.error('No auth token found for WebSocket connection')
      return
    }

    const wsUrl = `ws://localhost:8000/ws?token=${token}`
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.handleReconnect()
    }
  }

  private getToken(): string | null {
    try {
      // Check if running in browser environment
      if (typeof window === 'undefined') {
        console.log('No auth token found for WebSocket connection')
        return null
      }
      
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed?.state?.token
      }
    } catch (error) {
      console.error('Error getting token for WebSocket:', error)
    }
    return null
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval * this.reconnectAttempts)
    } else {
      console.error('Max WebSocket reconnection attempts reached')
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers[message.type] || []
    handlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('Error in message handler:', error)
      }
    })
  }

  onMessage(type: string, handler: Function) {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = []
    }
    this.messageHandlers[type].push(handler)
  }

  offMessage(type: string, handler: Function) {
    if (this.messageHandlers[type]) {
      this.messageHandlers[type] = this.messageHandlers[type].filter(h => h !== handler)
    }
  }

  sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  joinGroup(groupId: number) {
    this.sendMessage({
      type: 'join_group',
      group_id: groupId
    })
  }

  leaveGroup(groupId: number) {
    this.sendMessage({
      type: 'leave_group',
      group_id: groupId
    })
  }

  sendTyping(groupId: number, isTyping: boolean) {
    this.sendMessage({
      type: 'typing',
      group_id: groupId,
      data: { is_typing: isTyping }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Create singleton instance
export const wsService = new WebSocketService()

export default api