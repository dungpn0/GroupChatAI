'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { useGroupStore } from '@/store/groups'
import { CreateGroupModal } from './CreateGroupModal'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  UserGroupIcon,
  CreditCardIcon,
  Bars3Icon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  selectedGroupId: number | null
  onSelectGroup: (groupId: number | null) => void
  onToggleSidebar: () => void
}

export function Sidebar({ selectedGroupId, onSelectGroup, onToggleSidebar }: SidebarProps) {
  const { user, logout } = useAuthStore()
  const { groups, loading, error, fetchGroups } = useGroupStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateGroup, setShowCreateGroup] = useState(false)

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // Filter groups based on search query
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateGroup = () => {
    setShowCreateGroup(!showCreateGroup)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / (24 * 60))}d ago`
  }

  const handleLogout = () => {
    logout()
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
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">
            <p className="text-sm">Failed to load groups</p>
            <button 
              onClick={fetchGroups}
              className="text-indigo-600 hover:text-indigo-700 text-sm mt-2"
            >
              Try again
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No groups found' : 'No groups yet'}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedGroupId === group.id
                    ? 'bg-indigo-50 border-indigo-200 border'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {group.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(group.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 truncate">
                        {group.description || `${group.member_count} members`}
                      </p>
                      
                      <div className="flex items-center space-x-1">
                        {group.ai_enabled && (
                          <div className="flex items-center space-x-1">
                            <SparklesIcon className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-purple-600">
                              {group.ai_model}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || 'User'}
              </p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <CreditCardIcon className="w-3 h-3" />
                <span>{user?.credits || 0} credits</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
      />
    </div>
  )
}