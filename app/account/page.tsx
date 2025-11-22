'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createSupabaseClient()

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser) {
        setUser(currentUser)
        
        // Fetch user profile with username
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', currentUser.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error)
        }

        if (profile?.username) {
          setUsername(profile.username)
        } else {
          // If no username exists, use email prefix as default
          const emailPrefix = currentUser.email?.split('@')[0] || 'user'
          setUsername(emailPrefix)
        }
      }
    } catch (error) {
      console.error('Error loading user:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in' })
      setSaving(false)
      return
    }

    // Validate username
    if (!username || username.trim().length === 0) {
      setMessage({ type: 'error', text: 'Username cannot be empty' })
      setSaving(false)
      return
    }

    if (username.length < 3) {
      setMessage({ type: 'error', text: 'Username must be at least 3 characters' })
      setSaving(false)
      return
    }

    if (username.length > 30) {
      setMessage({ type: 'error', text: 'Username must be less than 30 characters' })
      setSaving(false)
      return
    }

    // Check if username contains only allowed characters (alphanumeric, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setMessage({ type: 'error', text: 'Username can only contain letters, numbers, underscores, and hyphens' })
      setSaving(false)
      return
    }

    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username.trim())
        .neq('id', user.id)
        .single()

      if (existingUser) {
        setMessage({ type: 'error', text: 'This username is already taken' })
        setSaving(false)
        return
      }

      // Update or insert profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Username updated successfully!' })
    } catch (error: any) {
      console.error('Error updating username:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update username. Please try again.' 
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your account settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
          
          <div className="space-y-6">
            {/* Email Section (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed px-3 py-2"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Your email is private and only used for account management
                </p>
              </div>
            </div>

            {/* Username Section */}
            <form onSubmit={handleUsernameChange}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-gray-500">(@handle)</span>
                </label>
                <div className="mt-1 flex gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="yourusername"
                        className="block w-full pl-8 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                        pattern="[a-zA-Z0-9_-]+"
                        minLength={3}
                        maxLength={30}
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      This is your public handle. Choose a unique username that others can use to find you.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {/* User Info */}
            <div className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

