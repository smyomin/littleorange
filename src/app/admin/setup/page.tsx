'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SetupPage() {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function setup() {
    setLoading(true)

    // Hash the owner password
    const res = await fetch('/api/admin/hash-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Billions$20260527#' }),
    })
    const { hash } = await res.json()

    // Insert owner with hashed password
    await supabase.from('admin_users').insert([{
      name: 'Store Owner',
      email: 'eihninphyu@gmail.com',
      password: hash,
      role: 'owner',
    }])

    setDone(true)
    setLoading(false)
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFBF5'}}>
      <div style={{background: 'white', borderRadius: '24px', padding: '48px', textAlign: 'center', border: '1.5px solid #F0E0CC', maxWidth: '400px'}}>
        <span style={{fontSize: '48px', display: 'block', marginBottom: '16px'}}>🔐</span>
        <h1 style={{fontWeight: 900, fontSize: '1.5rem', color: '#1C1917', marginBottom: '8px'}}>Admin Setup</h1>
        <p style={{color: '#78716C', fontSize: '14px', marginBottom: '24px'}}>
          This will create the owner account with a securely hashed password.
        </p>
        {done ? (
          <div>
            <p style={{color: '#16A34A', fontWeight: 700, marginBottom: '16px'}}>✓ Owner account created!</p>
            <a href="/admin" style={{
              display: 'block', background: '#F97316', color: 'white',
              padding: '14px', borderRadius: '12px', fontWeight: 700,
              textDecoration: 'none', fontSize: '15px',
            }}>
              Go to Login
            </a>
          </div>
        ) : (
          <button
            onClick={setup}
            disabled={loading}
            style={{
              width: '100%', background: '#F97316', color: 'white',
              border: 'none', borderRadius: '12px', padding: '14px',
              fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            }}
          >
            {loading ? 'Setting up...' : 'Create Owner Account'}
          </button>
        )}
      </div>
    </div>
  )
}