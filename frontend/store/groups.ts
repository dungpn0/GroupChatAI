'use client'

import { create } from 'zustand'
import { apiService } from '@/services/api'

export interface ChatGroup {
  id: number
  name: string
  description?: string
  is_private: boolean
  ai_enabled: boolean
  ai_model?: string
  member_count: number
  created_by: number
  created_at: string
}

export interface GroupMember {
  id: number
  user_id: number
  group_id: number
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user?: {
    id: number
    username: string
    full_name?: string
    avatar_url?: string
  }
}

interface GroupStore {
  groups: ChatGroup[]
  currentGroupMembers: { [groupId: number]: GroupMember[] }
  loading: boolean
  error: string | null
  
  // Actions
  fetchGroups: () => Promise<void>
  fetchGroupMembers: (groupId: number) => Promise<void>
  createGroup: (data: {
    name: string
    description?: string
    is_private: boolean
    ai_enabled: boolean
    ai_model?: string
  }) => Promise<ChatGroup>
  joinGroup: (groupId: number) => Promise<void>
  leaveGroup: (groupId: number) => Promise<void>
  setError: (error: string | null) => void
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: [],
  currentGroupMembers: {},
  loading: false,
  error: null,

  fetchGroups: async () => {
    try {
      set({ loading: true, error: null })
      const groups = await apiService.getGroups()
      set({ groups, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch groups',
        loading: false 
      })
    }
  },

  fetchGroupMembers: async (groupId: number) => {
    try {
      const members = await apiService.getGroupMembers(groupId)
      set(state => ({
        currentGroupMembers: {
          ...state.currentGroupMembers,
          [groupId]: members
        }
      }))
    } catch (error) {
      console.error('Failed to fetch group members:', error)
    }
  },

  createGroup: async (data) => {
    try {
      set({ loading: true, error: null })
      const newGroup = await apiService.createGroup(data)
      set(state => ({
        groups: [...state.groups, newGroup],
        loading: false
      }))
      return newGroup
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create group'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  joinGroup: async (groupId: number) => {
    try {
      await apiService.joinGroup(groupId)
      // Refresh groups after joining
      await get().fetchGroups()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join group'
      set({ error: errorMessage })
      throw error
    }
  },

  leaveGroup: async (groupId: number) => {
    try {
      await apiService.leaveGroup(groupId)
      // Remove from local state
      set(state => ({
        groups: state.groups.filter(group => group.id !== groupId)
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave group'
      set({ error: errorMessage })
      throw error
    }
  },

  setError: (error: string | null) => {
    set({ error })
  }
}))