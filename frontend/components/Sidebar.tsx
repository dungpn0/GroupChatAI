'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  UserGroupIcon,
  CreditCardIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  selectedGroupId: number | null
  onSelectGroup: (groupId: number | null) => void
  onToggleSidebar: () => void
}

interface ChatGroup {
  id: number
  name: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  avatar?: string
}

export function Sidebar({ selectedGroupId, onSelectGroup, onToggleSidebar }: SidebarProps) {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  // Mock data - in real app this would come from API
  const [groups, setGroups] = useState<ChatGroup[]>([
    {
      id: 1,
      name: 'General Discussion',
      lastMessage: 'Hey everyone! How is everyone doing?',
      lastMessageTime: '2 min ago',
      unreadCount: 3,
    },
    {
      id: 2,
      name: 'Project Team',
      lastMessage: 'AI: The meeting is scheduled for tomorrow at 2 PM.',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
    },
    {
      id: 3,
      name: 'Random',
      lastMessage: 'Did you see the latest AI updates?',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
    },
  ])

  const handleCreateGroup = () => {
    // In real app, this would open a modal or navigate to create group page
    setShowCreateGroup(true)
  }

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Create Group Button */}
        <button
          onClick={handleCreateGroup}
          className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Group
        </button>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2 space-y-1">
          {groups
            .filter(group => group.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedGroupId === group.id
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Group Avatar */}
                  <div className="flex-shrink-0">
                    {group.avatar ? (
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {group.name}
                      </p>
                      {group.lastMessageTime && (
                        <p className="text-xs text-gray-500">
                          {group.lastMessageTime}
                        </p>
                      )}
                    </div>
                    
                    {group.lastMessage && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600 truncate">
                          {group.lastMessage}
                        </p>
                        {group.unreadCount && group.unreadCount > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                            {group.unreadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Footer - Credits and Buy More */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CreditCardIcon className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Credits</span>
          </div>
          <span className="text-sm font-bold text-green-600">
            {user?.credits?.toFixed(1) || '0.0'}
          </span>
        </div>
        
        <button className="w-full px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all">
          Buy More Credits
        </button>
      </div>

      {/* Create Group Modal (placeholder) */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Create New Group</h3>
            <p className="text-gray-600 mb-4">
              This feature is coming soon! You'll be able to create new chat groups with AI integration.
            </p>
            <button
              onClick={() => setShowCreateGroup(false)}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}