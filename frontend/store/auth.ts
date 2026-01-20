import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axios from 'axios'

interface User {
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

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (googleToken: string) => Promise<void>
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  setUser: (user: User) => void
  updateCredits: (credits: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            email,
            password,
          })

          const { access_token, user } = response.data
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.detail || 'Login failed')
        }
      },

      loginWithGoogle: async (googleToken: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`, {
            google_token: googleToken,
          })

          const { access_token, user } = response.data
          
          // Set axios default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.detail || 'Google login failed')
        }
      },

      register: async (email: string, username: string, password: string, fullName?: string) => {
        set({ isLoading: true })
        try {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
            email,
            username,
            password,
            full_name: fullName,
          })

          // Auto-login after registration
          await get().login(email, password)
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.response?.data?.detail || 'Registration failed')
        }
      },

      logout: () => {
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization']
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      refreshUser: async () => {
        const { token } = get()
        if (!token) return

        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`)
          set({ user: response.data })
        } catch (error) {
          console.error('Failed to refresh user:', error)
          get().logout()
        }
      },

      setUser: (user: User) => {
        set({ user })
      },

      updateCredits: (credits: number) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, credits } })
        }
      },
    }),
    {
      name: 'auth-storage',      storage: createJSONStorage(() => localStorage),      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set axios authorization header on rehydration
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
        }
      },
    }
  )
)