'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { data } = await supabase
      .from('settings')
      .select('admin_password')
      .single()

    if (data && password === data.admin_password) {
      sessionStorage.setItem('admin_authed', 'true')
      router.push('/admin/orders')
    } else {
      setError('Incorrect password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#FFFBF5',
    }}>
      <div style={{
        background: 'white', borderRadius: '24px',
        padding: '48px 40px', width: '100%', maxWidth: '400px',
        border: '1.5px solid #F0E0CC',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}>
        <span style={{fontSize: '48px', display: 'block', marginBottom: '16px'}}>🍊</span>
        <h1 style={{fontWeight: 900, fontSize: '1.5rem', color: '#1C1917', marginBottom: '6px'}}>
          Admin Dashboard
        </h1>
        <p style={{fontSize: '14px', color: '#78716C', marginBottom: '32px'}}>
          Little Orange · Restricted Access
        </p>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{
            width: '100%', padding: '14px 16px',
            borderRadius: '12px', border: '2px solid #F0E0CC',
            fontSize: '14px', color: '#1C1917',
            background: '#FFFBF5', outline: 'none',
            boxSizing: 'border-box', marginBottom: '12px',
            textAlign: 'center',
          }}
          onFocus={e => (e.target.style.borderColor = '#F97316')}
          onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
        />
        {error && (
          <p style={{fontSize: '13px', color: '#DC2626', marginBottom: '12px', fontWeight: 600}}>
            {error}
          </p>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', background: '#F97316', color: 'white',
            border: 'none', borderRadius: '12px', padding: '14px',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Checking...' : 'Login'}
        </button>
      </div>
    </div>
  )
}