'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    localStorage.setItem('admin_authed', 'true')
    localStorage.setItem('admin_user', JSON.stringify(data.user))
    console.log('Login success, stored:', localStorage.getItem('admin_authed'))
    
    // Small delay to ensure localStorage is set before navigation
    await new Promise(resolve => setTimeout(resolve, 100))
    router.push('/admin/dashboard')
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

        <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px'}}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: '12px', border: '2px solid #F0E0CC',
              fontSize: '14px', color: '#1C1917',
              background: '#FFFBF5', outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#F97316')}
            onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: '12px', border: '2px solid #F0E0CC',
              fontSize: '14px', color: '#1C1917',
              background: '#FFFBF5', outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#F97316')}
            onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
          />
        </div>

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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}