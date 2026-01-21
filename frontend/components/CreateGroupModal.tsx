'use client'

import { useState } from 'react'
import { useGroupStore } from '@/store/groups'
import { 
  XMarkIcon,
  SparklesIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
}

const AI_MODELS = [
  { id: 'openai-gpt4', name: 'GPT-4', description: 'Most capable model for complex tasks' },
  { id: 'openai-gpt3.5', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most conversations' },
  { id: 'gemini', name: 'Google Gemini', description: 'Google\'s advanced AI model' }
]

export function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const { createGroup, loading } = useGroupStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ai_enabled: false,
    ai_model: 'openai-gpt3.5',
    is_private: false
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Feature flag for AI Chat
  const isAIChatEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Group name must be less than 50 characters'
    }
    
    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length > 0) {
      return
    }

    try {
      await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        ai_enabled: formData.ai_enabled,
        ai_model: formData.ai_enabled ? formData.ai_model : undefined,
        is_private: formData.is_private
      })
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        ai_enabled: false,
        ai_model: 'openai-gpt3.5',
        is_private: false
      })
      setErrors({})
      onClose()
    } catch (error) {
      setErrors({ general: 'Failed to create group. Please try again.' })
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
              <p className="text-sm text-gray-600">Start a new conversation with AI assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter group name..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What's this group about? (optional)"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.is_private}
                onChange={(e) => handleInputChange('is_private', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Private Group</span>
                <p className="text-xs text-gray-500">Only invited members can join</p>
              </div>
            </label>
          </div>

          {/* AI Integration */}
          {isAIChatEnabled && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-600">Add AI capabilities to your group</p>
              </div>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.ai_enabled}
                onChange={(e) => handleInputChange('ai_enabled', e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enable AI assistant</span>
            </label>

            {formData.ai_enabled && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700">
                  Choose AI Model
                </label>
                <div className="space-y-2">
                  {AI_MODELS.map((model) => (
                    <label key={model.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="ai_model"
                        value={model.id}
                        checked={formData.ai_model === model.id}
                        onChange={(e) => handleInputChange('ai_model', e.target.value)}
                        className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500 mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-xs text-gray-600">{model.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}