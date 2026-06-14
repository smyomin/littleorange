'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Trash2, Eye, EyeOff, ShieldCheck, Shield, User, KeyRound, Pencil, X } from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  password: string
  role: 'owner' | 'admin' | 'staff'
  is_active: boolean
  created_at: string
  last_login: string | null
}

const ROLES = [
  { value: 'owner', label: 'Owner', desc: 'Full access including user management and settings', color: '#D97706', bg: '#FEF3C7', icon: <ShieldCheck size={16} /> },
  { value: 'admin', label: 'Admin', desc: 'Manage orders, products, categories and inventory', color: '#2563EB', bg: '#DBEAFE', icon: <Shield size={16} /> },
  { value: 'staff', label: 'Staff', desc: 'View and update orders and inventory only', color: '#16A34A', bg: '#DCFCE7', icon: <User size={16} /> },
]

type ModalType = 'add' | 'edit' | 'reset' | null

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null)
  const [currentUser, setCurrentUser] = useState<{id: string; role: string} | null>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' })
  const [resetPassword, setResetPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user')
    if (userStr) setCurrentUser(JSON.parse(userStr))
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: true })
    setUsers(data || [])
    setLoading(false)
  }

  function showMsg(text: string, type: 'success' | 'error' = 'success') {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  function openAdd() {
    setForm({ name: '', email: '', password: '', role: 'admin' })
    setShowPassword(false)
    setModal('add')
  }

  function openEdit(user: AdminUser) {
    setSelectedUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setModal('edit')
  }

  function openReset(user: AdminUser) {
    setSelectedUser(user)
    setResetPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
    setModal('reset')
  }

  function closeModal() {
    setModal(null)
    setSelectedUser(null)
  }

  async function hashPassword(password: string): Promise<string> {
    const res = await fetch('/api/admin/hash-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const { hash } = await res.json()
    return hash
  }

  async function handleAdd() {
    if (!form.name || !form.email || !form.password) {
      showMsg('Please fill in all fields.', 'error')
      return
    }
    if (form.password.length < 6) {
      showMsg('Password must be at least 6 characters.', 'error')
      return
    }
    setSaving(true)
    const hash = await hashPassword(form.password)
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: hash,
        role: form.role,
      }])
      .select()
    if (error) {
      showMsg(error.message.includes('unique') ? 'Email already exists.' : error.message, 'error')
    } else if (data) {
      setUsers(prev => [...prev, data[0]])
      showMsg(`${form.name} added successfully!`)
      closeModal()
    }
    setSaving(false)
  }

  async function handleEdit() {
    if (!selectedUser || !form.name || !form.email) {
      showMsg('Please fill in all fields.', 'error')
      return
    }
    setSaving(true)
    const updates = {
      name: form.name.trim(),
      email: form.email.toLowerCase().trim(),
      role: form.role as 'owner' | 'admin' | 'staff',
    }
    const { error } = await supabase.from('admin_users').update(updates).eq('id', selectedUser.id)
    if (error) {
      showMsg('Error updating user: ' + error.message, 'error')
    } else {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...updates } : u))
      showMsg('User updated successfully!')
      closeModal()
    }
    setSaving(false)
  }

  async function handleResetPassword() {
    if (!selectedUser) return
    if (!resetPassword || !confirmPassword) {
      showMsg('Please fill in both password fields.', 'error')
      return
    }
    if (resetPassword !== confirmPassword) {
      showMsg('Passwords do not match.', 'error')
      return
    }
    if (resetPassword.length < 6) {
      showMsg('Password must be at least 6 characters.', 'error')
      return
    }
    setSaving(true)
    const hash = await hashPassword(resetPassword)
    const { error } = await supabase.from('admin_users').update({ password: hash }).eq('id', selectedUser.id)
    if (error) {
      showMsg('Error resetting password: ' + error.message, 'error')
    } else {
      showMsg(`Password reset for ${selectedUser.name}!`)
      closeModal()
    }
    setSaving(false)
  }

  async function toggleActive(user: AdminUser) {
    if (user.role === 'owner') return
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: !user.is_active })
      .eq('id', user.id)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
    }
  }

  async function handleDelete(user: AdminUser) {
    if (user.role === 'owner') {
      alert('Cannot delete the owner account.')
      return
    }
    if (user.id === currentUser?.id) {
      alert('Cannot delete your own account.')
      return
    }
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
    const { error } = await supabase.from('admin_users').delete().eq('id', user.id)
    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
      showMsg('User deleted.')
    }
  }

  const getRoleBadge = (role: string) => ROLES.find(r => r.value === role) ?? ROLES[1]

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

  // Shared modal wrapper
  const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '480px',
        zIndex: 50, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: 900, fontSize: '18px', color: '#1C1917' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716C' }}>
            <X size={22} />
          </button>
        </div>
        {children}
      </div>
    </>
  )

  return (
    <AdminLayout title="Admin Users">

      {/* Role Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {ROLES.map(role => (
          <div key={role.value} style={{ background: 'white', borderRadius: '14px', padding: '16px', border: '1.5px solid #F0E0CC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: role.color }}>{role.icon}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: role.bg, color: role.color }}>
                {role.label}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.6 }}>{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: '#78716C', fontWeight: 600 }}>{users.length} user{users.length !== 1 ? 's' : ''}</p>
        <button type="button" onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#F97316', color: 'white', border: 'none',
          borderRadius: '12px', padding: '12px 20px',
          fontWeight: 700, fontSize: '14px', cursor: 'pointer',
        }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
          background: message.type === 'error' ? '#FEE2E2' : '#DCFCE7',
          color: message.type === 'error' ? '#DC2626' : '#16A34A',
          fontSize: '13px', fontWeight: 600,
        }}>
          {message.text}
        </div>
      )}

      {/* Users List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#78716C' }}>Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {users.map(user => {
            const role = getRoleBadge(user.role)
            const isCurrentUser = user.id === currentUser?.id
            return (
              <div key={user.id} style={{
                background: 'white', borderRadius: '14px',
                border: `1.5px solid ${isCurrentUser ? '#F97316' : '#F0E0CC'}`,
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: role.bg, color: role.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 900, flexShrink: 0,
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#1C1917' }}>{user.name}</p>
                    {isCurrentUser && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#F97316', background: '#FFF7ED', padding: '2px 8px', borderRadius: '999px', border: '1px solid #FED7AA' }}>
                        You
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#78716C' }}>{user.email}</p>
                  {user.last_login && (
                    <p style={{ fontSize: '11px', color: '#A8A29E', marginTop: '2px' }}>
                      Last login: {new Date(user.last_login).toLocaleDateString('en-NZ', { dateStyle: 'medium' })}
                    </p>
                  )}
                </div>

                {/* Role Badge */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '12px', fontWeight: 700, padding: '4px 12px',
                  borderRadius: '999px', background: role.bg, color: role.color,
                }}>
                  {role.icon} {role.label}
                </span>

                {/* Active Toggle */}
                {user.role !== 'owner' ? (
                  <button type="button" onClick={() => toggleActive(user)} style={{
                    padding: '6px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: 700, border: '1.5px solid',
                    borderColor: user.is_active ? '#BBF7D0' : '#F0E0CC',
                    background: user.is_active ? '#DCFCE7' : '#F5F5F4',
                    color: user.is_active ? '#16A34A' : '#A8A29E',
                    cursor: 'pointer',
                  }}>
                    {user.is_active ? '● Active' : '○ Inactive'}
                  </button>
                ) : (
                  <span style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: '#FEF3C7', color: '#D97706', border: '1.5px solid #FDE68A' }}>
                    ● Active
                  </span>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => openEdit(user)} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '8px 12px', borderRadius: '10px',
                    background: '#F5F5F4', border: '1.5px solid #F0E0CC',
                    fontSize: '13px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
                  }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button type="button" onClick={() => openReset(user)} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '8px 12px', borderRadius: '10px',
                    background: '#EDE9FE', border: '1.5px solid #DDD6FE',
                    fontSize: '13px', fontWeight: 600, color: '#7C3AED', cursor: 'pointer',
                  }}>
                    <KeyRound size={13} /> Reset PW
                  </button>
                  {user.role !== 'owner' && !isCurrentUser && (
                    <button type="button" onClick={() => handleDelete(user)} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '8px 12px', borderRadius: '10px',
                      background: '#FEE2E2', border: '1.5px solid #FECACA',
                      fontSize: '13px', fontWeight: 600, color: '#DC2626', cursor: 'pointer',
                    }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ADD Modal */}
      {modal === 'add' && (
        <Modal title="Add New User" onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="John Smith" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="john@email.com" style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#78716C',
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={inputStyle}>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={closeModal} style={{
                padding: '12px 20px', borderRadius: '12px', border: '1.5px solid #F0E0CC',
                background: 'white', fontSize: '14px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
              }}>Cancel</button>
              <button type="button" onClick={handleAdd} disabled={saving} style={{
                padding: '12px 24px', borderRadius: '12px', background: '#F97316',
                color: 'white', border: 'none', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT Modal */}
      {modal === 'edit' && selectedUser && (
        <Modal title={`Edit — ${selectedUser.name}`} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
            </div>
            <div>
              <label style={labelStyle}>Role *</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                disabled={selectedUser.role === 'owner'} style={{ ...inputStyle, opacity: selectedUser.role === 'owner' ? 0.6 : 1 }}>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              {selectedUser.role === 'owner' && (
                <p style={{ fontSize: '12px', color: '#A8A29E', marginTop: '4px' }}>Owner role cannot be changed.</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={closeModal} style={{
                padding: '12px 20px', borderRadius: '12px', border: '1.5px solid #F0E0CC',
                background: 'white', fontSize: '14px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
              }}>Cancel</button>
              <button type="button" onClick={handleEdit} disabled={saving} style={{
                padding: '12px 24px', borderRadius: '12px', background: '#F97316',
                color: 'white', border: 'none', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* RESET PASSWORD Modal */}
      {modal === 'reset' && selectedUser && (
        <Modal title={`Reset Password — ${selectedUser.name}`} onClose={closeModal}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#EDE9FE', border: '1.5px solid #DDD6FE',
              fontSize: '13px', color: '#7C3AED', fontWeight: 600,
            }}>
              🔐 This will immediately change {selectedUser.name}&apos;s password.
            </div>
            <div>
              <label style={labelStyle}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#78716C',
                }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password" style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#78716C',
                }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {resetPassword && confirmPassword && resetPassword !== confirmPassword && (
                <p style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', fontWeight: 600 }}>
                  Passwords do not match
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" onClick={closeModal} style={{
                padding: '12px 20px', borderRadius: '12px', border: '1.5px solid #F0E0CC',
                background: 'white', fontSize: '14px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
              }}>Cancel</button>
              <button type="button" onClick={handleResetPassword} disabled={saving} style={{
                padding: '12px 24px', borderRadius: '12px', background: '#7C3AED',
                color: 'white', border: 'none', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                {saving ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}