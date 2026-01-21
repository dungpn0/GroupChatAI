import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { groupsAPI, messagesAPI, ChatGroup, Message, GroupMember, wsService } from '@/services/api'
import toast from 'react-hot-toast'

interface ChatState {
  groups: ChatGroup[]
  currentGroupId: number | null
  currentGroup: ChatGroup | null
  messages: { [groupId: number]: Message[] }
  members: { [groupId: number]: GroupMember[] }
  isLoading: boolean
  isLoadingMessages: boolean
  typingUsers: { [groupId: number]: number[] }
  
  // Actions
  loadGroups: () => Promise<void>
  loadGroup: (groupId: number) => Promise<void>
  setCurrentGroup: (groupId: number | null) => void
  loadMessages: (groupId: number, page?: number) => Promise<{messages: any[], hasMore: boolean, total: number} | void>
  sendMessage: (groupId: number, content: string) => Promise<void>
  createGroup: (data: {
    name: string
    description?: string
    is_private?: boolean
    ai_enabled?: boolean
    ai_model?: string
  }) => Promise<ChatGroup | null>
  joinGroup: (groupId: number) => Promise<void>
  leaveGroup: (groupId: number) => Promise<void>
  loadGroupMembers: (groupId: number) => Promise<void>
  addMessage: (message: Message) => void
  setTyping: (groupId: number, userId: number, isTyping: boolean) => void
  initializeWebSocket: () => void
  reset: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      groups: [],
      currentGroupId: null,
      currentGroup: null,
      messages: {},
      members: {},
      isLoading: false,
      isLoadingMessages: false,
      typingUsers: {},

      loadGroups: async () => {
        set({ isLoading: true })
        try {
          const groups = await groupsAPI.getGroups()
          set({ groups, isLoading: false })
        } catch (error: any) {
          console.error('Failed to load groups:', error)
          toast.error('Failed to load chat groups')
          set({ isLoading: false })
        }
      },

      loadGroup: async (groupId: number) => {
        try {
          const group = await groupsAPI.getGroup(groupId)
          const groups = get().groups.map(g => 
            g.id === groupId ? group : g
          )
          set({ 
            groups,
            currentGroup: group
          })
        } catch (error: any) {
          console.error('Failed to load group:', error)
          toast.error('Failed to load group details')
        }
      },

      setCurrentGroup: (groupId: number | null) => {
        console.log('setCurrentGroup:', { groupId })
        
        // Leave previous group if switching
        if (get().currentGroupId && get().currentGroupId !== groupId) {
          try {
            wsService.leaveGroup(get().currentGroupId!)
          } catch (e) {
            console.warn('Failed to leave group via WebSocket:', e)
          }
        }
        
        set({ currentGroupId: groupId, currentGroup: null })
        
        // Join new group if selected (only if WebSocket is connected)
        if (groupId) {
          console.log('Setting current group:', groupId)
          try {
            wsService.joinGroup(groupId)
          } catch (e) {
            console.warn('Failed to join group via WebSocket (will retry when connected):', e)
          }
        }
      },

      loadMessages: async (groupId: number, page = 1) => {
        console.log('loadMessages called:', { groupId, page })
        set({ isLoadingMessages: true })
        try {
          const response: Message[] = await messagesAPI.getMessages(groupId, page, 20) // Load 20 messages per page
          console.log('loadMessages response:', response)
          const currentMessages = get().messages[groupId] || []
          
          // API trả về array messages
          const messagesArray = response
          
          let newMessages
          if (page === 1) {
            // First page - replace all messages
            newMessages = messagesArray
          } else {
            // Subsequent pages - prepend to existing messages (older messages go first)
            newMessages = [...messagesArray, ...currentMessages]
          }
          
          set({ 
            messages: {
              ...get().messages,
              [groupId]: newMessages.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            },
            isLoadingMessages: false
          })
          
          // Return info about pagination
          return {
            messages: messagesArray,
            hasMore: messagesArray.length === 20, // If we got full page, assume there are more
            total: messagesArray.length
          }
        } catch (error: any) {
          console.error('Failed to load messages:', error)
          toast.error('Failed to load messages')
          set({ isLoadingMessages: false })
          throw error
        }
      },

      sendMessage: async (groupId: number, content: string) => {
        try {
          const message = await messagesAPI.sendMessage(groupId, content)
          
          // Add message optimistically
          const currentMessages = get().messages[groupId] || []
          set({
            messages: {
              ...get().messages,
              [groupId]: [...currentMessages, message]
            }
          })
        } catch (error: any) {
          console.error('Failed to send message:', error)
          toast.error('Failed to send message')
        }
      },

      createGroup: async (data) => {
        try {
          const group = await groupsAPI.createGroup(data)
          const groups = [...get().groups, group]
          set({ groups })
          toast.success('Group created successfully!')
          return group
        } catch (error: any) {
          console.error('Failed to create group:', error)
          toast.error('Failed to create group')
          return null
        }
      },

      joinGroup: async (groupId: number) => {
        try {
          await groupsAPI.joinGroup(groupId)
          await get().loadGroups() // Refresh groups list
          toast.success('Joined group successfully!')
        } catch (error: any) {
          console.error('Failed to join group:', error)
          toast.error('Failed to join group')
        }
      },

      leaveGroup: async (groupId: number) => {
        try {
          await groupsAPI.leaveGroup(groupId)
          
          // Remove group from list or update member count
          const groups = get().groups.filter(g => g.id !== groupId)
          set({ groups })
          
          // If leaving current group, reset current group
          if (get().currentGroupId === groupId) {
            set({ currentGroupId: null, currentGroup: null })
          }
          
          wsService.leaveGroup(groupId)
          toast.success('Left group successfully!')
        } catch (error: any) {
          console.error('Failed to leave group:', error)
          toast.error('Failed to leave group')
        }
      },

      loadGroupMembers: async (groupId: number) => {
        try {
          const members = await groupsAPI.getGroupMembers(groupId)
          set({
            members: {
              ...get().members,
              [groupId]: members
            }
          })
        } catch (error: any) {
          console.error('Failed to load group members:', error)
          toast.error('Failed to load group members')
        }
      },

      addMessage: (message: Message) => {
        console.log('addMessage called with:', message)
        const currentMessages = get().messages[message.group_id] || []
        console.log('Current messages for group', message.group_id, ':', currentMessages.length)
        
        // Check if message already exists (to avoid duplicates)
        const exists = currentMessages.find(m => m.id === message.id)
        if (!exists) {
          console.log('Adding new message to store')
          set({
            messages: {
              ...get().messages,
              [message.group_id]: [...currentMessages, message]
            }
          })
        } else {
          console.log('Message already exists, skipping')
        }
      },

      setTyping: (groupId: number, userId: number, isTyping: boolean) => {
        const currentTyping = get().typingUsers[groupId] || []
        let newTyping: number[]
        
        if (isTyping) {
          newTyping = currentTyping.includes(userId) ? currentTyping : [...currentTyping, userId]
        } else {
          newTyping = currentTyping.filter(id => id !== userId)
        }
        
        set({
          typingUsers: {
            ...get().typingUsers,
            [groupId]: newTyping
          }
        })
      },

      initializeWebSocket: () => {
        // Listen for new messages (legacy)
        wsService.onMessage('message', (wsMessage: any) => {
          const message = wsMessage.data as Message
          get().addMessage(message)
        })

        // Listen for new messages (current format)
        wsService.onMessage('new_message', (wsMessage: any) => {
          console.log('Received new_message via WebSocket:', wsMessage)
          const message = wsMessage.message as Message
          console.log('Parsed message:', message)
          get().addMessage(message)
        })

        // Listen for typing events
        wsService.onMessage('typing', (wsMessage: any) => {
          const { group_id, user_id, data } = wsMessage
          get().setTyping(group_id, user_id, data.is_typing)
        })

        // Listen for user join/leave events
        wsService.onMessage('user_joined', (wsMessage: any) => {
          const { group_id } = wsMessage
          if (group_id === get().currentGroupId) {
            get().loadGroupMembers(group_id)
          }
        })

        wsService.onMessage('user_left', (wsMessage: any) => {
          const { group_id } = wsMessage
          if (group_id === get().currentGroupId) {
            get().loadGroupMembers(group_id)
          }
        })
      },

      reset: () => {
        set({
          groups: [],
          currentGroupId: null,
          currentGroup: null,
          messages: {},
          members: {},
          typingUsers: {},
          isLoading: false,
          isLoadingMessages: false
        })
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist groups and current group, not messages (reload fresh)
        groups: state.groups,
        currentGroupId: state.currentGroupId,
      }),
    }
  )
)