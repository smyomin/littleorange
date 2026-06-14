'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Save, Eye, EyeOff } from 'lucide-react'

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    store_name: '',
    store_phone: '',
    store_email: '',
    delivery_fee: '',
    minimum_order: '',
    admin_password: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [settingsId, setSettingsId] = useState('')

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('settings').select('*').single()
      if (data) {
        setSettingsId(data.id)
        setForm({
          store_name: data.store_name || '',
          store_phone: data.store_phone || '',
          store_email: data.store_email || '',
          delivery_fee: data.delivery_fee?.toString() || '',
          minimum_order: data.minimum_order?.toString() || '',
          admin_password: data.admin_password || '',
        })
      }
      setLoading(false)
    }
    fetch()
  }, [])

  async function handleSave() {
    setSaving(true)
    await supabase.from('settings').update({
      store_name: form.store_name,
      store_phone: form.store_phone,
      store_email: form.store_email,
      delivery_fee: parseFloat(form.delivery_fee),
      minimum_order: parseFloat(form.minimum_order),
      admin_password: form.admin_password,
      updated_at: new Date().toISOString(),
    }).eq('id', settingsId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    borderRadius: '12px', border: '2px solid #F0E0CC',
    fontSize: '14px', color: '#1C1917',
    background: '#FFFBF5', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 600 as const,
    color: '#78716C', display: 'block' as const,
    marginBottom: '6px',
  }

  if (loading) return <AdminLayout title="Settings"><p style={{color: '#78716C'}}>Loading...</p></AdminLayout>

  return (
    <AdminLayout title="Settings">
      <div style={{maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px'}}>

        {/* Store Info */}
        <div style={{background: 'white', borderRadius: '20px', padding: '28px', border: '1.5px solid #F0E0CC'}}>
          <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px'}}>Store Info</p>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div>
              <label style={labelStyle}>Store Name</label>
              <input value={form.store_name} onChange={e => setForm(p => ({...p, store_name: e.target.value}))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Number (e.g. 6421123456)</label>
              <input value={form.store_phone} onChange={e => setForm(p => ({...p, store_phone: e.target.value}))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>Store Email (for order notifications)</label>
              <input type="email" value={form.store_email} onChange={e => setForm(p => ({...p, store_email: e.target.value}))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div style={{background: 'white', borderRadius: '20px', padding: '28px', border: '1.5px solid #F0E0CC'}}>
          <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px'}}>Delivery Settings</p>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            <div>
              <label style={labelStyle}>Delivery Fee (NZD)</label>
              <input type="number" value={form.delivery_fee} onChange={e => setForm(p => ({...p, delivery_fee: e.target.value}))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>Minimum Order (NZD)</label>
              <input type="number" value={form.minimum_order} onChange={e => setForm(p => ({...p, minimum_order: e.target.value}))} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
          </div>
        </div>

        {/* Admin Password */}
        <div style={{background: 'white', borderRadius: '20px', padding: '28px', border: '1.5px solid #F0E0CC'}}>
          <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px'}}>Admin Password</p>
          <div style={{position: 'relative'}}>
            <label style={labelStyle}>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.admin_password}
              onChange={e => setForm(p => ({...p, admin_password: e.target.value}))}
              style={{...inputStyle, paddingRight: '44px'}}
              onFocus={e => (e.target.style.borderColor = '#F97316')}
              onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '14px', bottom: '13px',
                background: 'none', border: 'none', cursor: 'pointer', color: '#78716C',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: saved ? '#16A34A' : '#F97316', color: 'white',
            border: 'none', borderRadius: '14px', padding: '16px',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            transition: 'background 0.3s',
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </AdminLayout>
  )
}