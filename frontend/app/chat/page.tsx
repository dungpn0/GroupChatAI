'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { Navbar, Sidebar, ChatWindow, LoadingSpinner } from '@/components'

export default function ChatPage() {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const router = useRouter()
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <Sidebar 
            selectedGroupId={selectedGroupId}
            onSelectGroup={setSelectedGroupId}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatWindow 
            selectedGroupId={selectedGroupId}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
      </div>
    </div>
  )
}