'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { 
  CreditCardIcon, 
  SparklesIcon, 
  ClockIcon,
  PlusIcon,
  ArrowUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface CreditTransaction {
  id: number
  amount: number
  description: string
  type: 'purchase' | 'usage' | 'bonus'
  created_at: string
}

interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonus_credits?: number
  popular?: boolean
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 5
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 250,
    price: 10,
    bonus_credits: 50,
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 500,
    price: 20,
    bonus_credits: 150
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    price: 35,
    bonus_credits: 400
  }
]

const AI_MODEL_COSTS = {
  'openai-gpt4': { name: 'GPT-4', cost: 0.5, description: 'Most powerful model' },
  'openai-gpt3.5': { name: 'GPT-3.5 Turbo', cost: 0.1, description: 'Fast and efficient' },
  'gemini': { name: 'Google Gemini', cost: 0.05, description: 'Most economical' }
}

export default function CreditsPage() {
  const { user, refreshUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load mock transactions for now
    setTransactions([
      {
        id: 1,
        amount: -0.5,
        description: 'GPT-4 response in "AI Chat Group"',
        type: 'usage',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        amount: -0.1,
        description: 'GPT-3.5 response in "General Discussion"',
        type: 'usage',
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 3,
        amount: 100,
        description: 'Welcome bonus',
        type: 'bonus',
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ])
  }, [])

  const handlePurchase = async (packageId: string) => {
    setLoading(true)
    
    // TODO: Implement actual purchase logic
    setTimeout(() => {
      alert(`Purchase of ${packageId} package would be processed here`)
      setLoading(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'purchase', name: 'Buy Credits' },
    { id: 'history', name: 'Transaction History' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credits</h1>
          <p className="text-gray-600 mt-2">Manage your AI credits and view usage history</p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium opacity-90">Current Balance</h2>
              <div className="flex items-center space-x-2 mt-2">
                <SparklesIcon className="w-8 h-8" />
                <span className="text-3xl font-bold">{user?.credits || 0}</span>
                <span className="text-lg opacity-90">credits</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Estimated usage</div>
              <div className="text-lg font-semibold">
                ~{Math.floor((user?.credits || 0) / 0.1)} GPT-3.5 responses
              </div>
              <div className="text-sm opacity-75">
                or ~{Math.floor((user?.credits || 0) / 0.5)} GPT-4 responses
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* AI Model Pricing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(AI_MODEL_COSTS).map(([model, info]) => (
                      <div key={model} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{info.name}</h4>
                          <span className="text-lg font-bold text-indigo-600">{info.cost} credits</span>
                        </div>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Usage Tips</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• Use GPT-3.5 for general conversations to save credits</li>
                        <li>• GPT-4 is best for complex tasks and detailed analysis</li>
                        <li>• Gemini offers the most economical option for basic queries</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'usage' 
                              ? 'bg-red-100 text-red-600'
                              : transaction.type === 'purchase'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.type === 'usage' ? (
                              <SparklesIcon className="w-4 h-4" />
                            ) : (
                              <PlusIcon className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                          </div>
                        </div>
                        <span className={`font-medium ${
                          transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'purchase' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose a Credit Package</h3>
                  <p className="text-gray-600">Select the package that best fits your usage needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {CREDIT_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className={`relative border rounded-xl p-6 ${
                      pkg.popular 
                        ? 'border-indigo-300 ring-2 ring-indigo-100 bg-indigo-50' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                            Most Popular
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <h4 className="font-semibold text-gray-900 mb-2">{pkg.name}</h4>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">${pkg.price}</span>
                        </div>
                        
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Base Credits</span>
                            <span className="font-medium">{pkg.credits}</span>
                          </div>
                          {pkg.bonus_credits && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Bonus Credits</span>
                              <span className="font-medium text-green-600">+{pkg.bonus_credits}</span>
                            </div>
                          )}
                          <div className="border-t pt-2">
                            <div className="flex items-center justify-between text-sm font-semibold">
                              <span>Total Credits</span>
                              <span className="text-indigo-600">
                                {pkg.credits + (pkg.bonus_credits || 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handlePurchase(pkg.id)}
                          disabled={loading}
                          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                            pkg.popular
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {loading ? 'Processing...' : 'Purchase'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <InformationCircleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Payment Notice</h4>
                      <p className="text-sm text-yellow-800 mt-1">
                        Credit purchases are currently in demo mode. Real payment processing will be available soon.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transaction History</h3>
                  <p className="text-gray-600">View all your credit transactions and usage</p>
                </div>

                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          transaction.type === 'usage' 
                            ? 'bg-red-100 text-red-600'
                            : transaction.type === 'purchase'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'usage' ? (
                            <SparklesIcon className="w-5 h-5" />
                          ) : transaction.type === 'purchase' ? (
                            <CreditCardIcon className="w-5 h-5" />
                          ) : (
                            <PlusIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-medium ${
                          transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                        <p className="text-xs text-gray-500 capitalize">{transaction.type}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {transactions.length === 0 && (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}