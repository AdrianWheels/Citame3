// app/auth/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AuthPage() {
  const [email, setEmail] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      console.error('Error logging in', error)
    } else {
      alert('Check your email for the login link!')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        type="email"
        className="p-2 border border-gray-300 rounded"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>
        Send Magic Link
      </button>
    </div>
  )
}
