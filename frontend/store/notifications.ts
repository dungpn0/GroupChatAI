import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { notificationsAPI, Notification, NotificationSummary } from '@/services/api'
import toast from 'react-hot-toast'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  totalCount: number
  isLoading: boolean
  
  // Actions
  loadNotifications: (unreadOnly?: boolean) => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshCount: () => Promise<void>
  reset: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      totalCount: 0,
      isLoading: false,

      loadNotifications: async (unreadOnly = false) => {
        set({ isLoading: true })
        try {
          const data = await notificationsAPI.getNotifications(50, 0, unreadOnly)
          set({
            notifications: data.notifications,
            unreadCount: data.unread_count,
            totalCount: data.total_count,
            isLoading: false
          })
        } catch (error: any) {
          console.error('Failed to load notifications:', error)
          set({ isLoading: false })
          toast.error('Failed to load notifications')
        }
      },

      markAsRead: async (notificationId: number) => {
        try {
          await notificationsAPI.markAsRead(notificationId)
          
          // Update local state
          const notifications = get().notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, is_read: true, read_at: new Date().toISOString() }
              : notification
          )
          
          const unreadCount = notifications.filter(n => !n.is_read).length
          
          set({
            notifications,
            unreadCount
          })
        } catch (error: any) {
          console.error('Failed to mark notification as read:', error)
          toast.error('Failed to mark notification as read')
        }
      },

      markAllAsRead: async () => {
        try {
          await notificationsAPI.markAllAsRead()
          
          // Update local state
          const notifications = get().notifications.map(notification => ({
            ...notification,
            is_read: true,
            read_at: new Date().toISOString()
          }))
          
          set({
            notifications,
            unreadCount: 0
          })
          
          toast.success('All notifications marked as read')
        } catch (error: any) {
          console.error('Failed to mark all notifications as read:', error)
          toast.error('Failed to mark all notifications as read')
        }
      },

      refreshCount: async () => {
        try {
          const counts = await notificationsAPI.getCount()
          set({
            unreadCount: counts.unread_count,
            totalCount: counts.total_count
          })
        } catch (error: any) {
          console.error('Failed to refresh notification count:', error)
        }
      },

      reset: () => {
        set({
          notifications: [],
          unreadCount: 0,
          totalCount: 0,
          isLoading: false
        })
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        // Don't persist notifications in localStorage, only counts
        unreadCount: state.unreadCount,
        totalCount: state.totalCount
      })
    }
  )
)