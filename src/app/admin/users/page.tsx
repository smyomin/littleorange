'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Trash2, Eye, EyeOff, ShieldCheck, Shield, User, Pencil, KeyRound, X, Save } from 'lucide-react'

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
  { value: 'admin', label: 'Admin', desc: 'Can manage orders, products, categories and inventory', color: '#2563EB', bg: '#DBEAFE', icon: <Shield size={16} /> },
  { value: 'staff', label: 'Staff', desc: 'Can view and update orders and inventory only', color: '#16A34A', bg: '#DCFCE7', icon: <User size={16} /> },
]

type ModalType = 'add' | 'edit' | 'password' | null

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<ModalType>(null)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{text: string; type: 'success' | 'error'} | null>(null)
  const [currentUser, setCurrentUser] = useState<{id: string; role: string} | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'admin' })
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'admin', is_active: true })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })

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

  function showMessage(text: string, type: 'success' | 'error') {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  function openAdd() {
    setAddForm({ name: '', email: '', password: '', role: 'admin' })
    setShowPassword(false)
    setModal('add')
  }

  function openEdit(user: AdminUser) {
    setSelectedUser(user)
    setEditForm({ name: user.name, email: user.email, role: user.role, is_active: user.is_active })
    setModal('edit')
  }

  function openResetPassword(user: AdminUser) {
    setSelectedUser(user)
    setPasswordForm({ newPassword: '', confirmPassword: '' })
    setShowNewPassword(false)
    setModal('password')
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
    if (!addForm.name || !addForm.email || !addForm.password) {
      showMessage('Please fill in all fields.', 'error')
      return
    }
    if (addForm.password.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error')
      return
    }
    setSaving(true)
    const hash = await hashPassword(addForm.password)
    const { data, error } = await supabase
      .from('admin_users')
      .insert([{ name: addForm.name.trim(), email: addForm.email.toLowerCase().trim(), password: hash, role: addForm.role }])
      .select()
    if (error) {
      showMessage(error.message.includes('unique') ? 'Email already exists.' : error.message, 'error')
    } else if (data) {
      setUsers(prev => [...prev, data[0]])
      closeModal()
      showMessage(`${addForm.name} has been added successfully!`, 'success')
    }
    setSaving(false)
  }

  async function handleEdit() {
    if (!selectedUser) return
    if (!editForm.name || !editForm.email) {
      showMessage('Please fill in all fields.', 'error')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('admin_users')
      .update({ name: editForm.name.trim(), email: editForm.email.toLowerCase().trim(), role: editForm.role, is_active: editForm.is_active })
      .eq('id', selectedUser.id)
    if (error) {
      showMessage('Error: ' + error.message, 'error')
    } else {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u))
      closeModal()
      showMessage('User updated successfully!', 'success')
    }
    setSaving(false)
  }

  async function handleResetPassword() {
    if (!selectedUser) return
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showMessage('Please fill in both fields.', 'error')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('Passwords do not match.', 'error')
      return
    }
    setSaving(true)
    const hash = await hashPassword(passwordForm.newPassword)
    const { error } = await supabase
      .from('admin_users')
      .update({ password: hash })
      .eq('id', selectedUser.id)
    if (error) {
      showMessage('Error: ' + error.message, 'error')
    } else {
      closeModal()
      showMessage(`Password reset for ${selectedUser.name}!`, 'success')
    }
    setSaving(false)
  }

  async function handleDelete(user: AdminUser) {
    if (user.role === 'owner') { alert('Cannot delete the owner account.'); return }
    if (user.id === currentUser?.id) { alert('Cannot delete your own account.'); return }
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
    const { error } = await supabase.from('admin_users').delete().eq('id', user.id)
    if (!error) {
      setUsers(prev => prev.filter(u => u.id !== user.id))
      showMessage(`${user.name} has been deleted.`, 'success')
    }
  }

  const getRoleBadge = (role: string) => ROLES.find(r => r.value === role) ?? ROLES[1]

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    borderRadius: '12px', border: '2px solid #F0E0CC',
    fontSize: '14px', color: '#1C1917',
    background: '#FFFBF5', outline: 'none',
    boxSizing: 'border-box',
  }

  const Modal = ({ title, onClose, onSave, saveLabel, children }: {
    title: string; onClose: () => void; onSave: () => void
    saveLabel: string; children: React.ReactNode
  }) => (
    <>
      <div onClick={onClose} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40}} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: '20px',
        padding: '28px', width: '100%', maxWidth: '480px',
        zIndex: 50, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <h2 style={{fontWeight: 900, fontSize: '18px', color: '#1C1917'}}>{title}</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#78716C'}}>
            <X size={22} />
          </button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
          {children}
        </div>
        <div style={{display: 'flex', gap: '10px', marginTop: '24px'}}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: '12px', borderRadius: '12px',
            border: '1.5px solid #F0E0CC', background: 'white',
            fontSize: '14px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
          }}>Cancel</button>
          <button type="button" onClick={onSave} disabled={saving} style={{
            flex: 2, padding: '12px', borderRadius: '12px',
            background: '#F97316', color: 'white', border: 'none',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <Save size={16} />
            {saving ? 'Saving...' : saveLabel}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <AdminLayout title="Admin Users">

      {/* Role cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '28px'}}>
        {ROLES.map(role => (
          <div key={role.value} style={{background: 'white', borderRadius: '14px', padding: '16px', border: '1.5px solid #F0E0CC'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
              <span style={{color: role.color}}>{role.icon}</span>
              <span style={{fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: role.bg, color: role.color}}>{role.label}</span>
            </div>
            <p style={{fontSize: '12px', color: '#78716C', lineHeight: 1.6}}>{role.desc}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
        <p style={{fontSize: '14px', color: '#78716C', fontWeight: 600}}>{users.length} user{users.length !== 1 ? 's' : ''}</p>
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

      {/* Users list */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#78716C'}}>Loading...</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {users.map(user => {
            const role = getRoleBadge(user.role)
            const isCurrentUser = user.id === currentUser?.id
            return (
              <div key={user.id} style={{
                background: 'white', borderRadius: '14px',
                border: `1.5px solid ${isCurrentUser ? '#F97316' : '#F0E0CC'}`,
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
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
                <div style={{flex: 1, minWidth: '160px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px'}}>
                    <p style={{fontWeight: 700, fontSize: '14px', color: '#1C1917'}}>{user.name}</p>
                    {isCurrentUser && (
                      <span style={{fontSize: '10px', fontWeight: 700, color: '#F97316', background: '#FFF7ED', padding: '2px 8px', borderRadius: '999px', border: '1px solid #FED7AA'}}>
                        You
                      </span>
                    )}
                  </div>
                  <p style={{fontSize: '12px', color: '#78716C'}}>{user.email}</p>
                  {user.last_login && (
                    <p style={{fontSize: '11px', color: '#A8A29E', marginTop: '2px'}}>
                      Last login: {new Date(user.last_login).toLocaleDateString('en-NZ', {dateStyle: 'medium'})}
                    </p>
                  )}
                </div>

                {/* Role */}
                <span style={{display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px', background: role.bg, color: role.color}}>
                  {role.icon} {role.label}
                </span>

                {/* Status */}
                <span style={{
                  padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                  background: user.is_active ? '#DCFCE7' : '#F5F5F4',
                  color: user.is_active ? '#16A34A' : '#A8A29E',
                  border: `1.5px solid ${user.is_active ? '#BBF7D0' : '#F0E0CC'}`,
                }}>
                  {user.is_active ? '● Active' : '○ Inactive'}
                </span>

                {/* Actions */}
                <div style={{display: 'flex', gap: '8px'}}>
                  <button type="button" onClick={() => openEdit(user)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 12px', borderRadius: '10px',
                    background: '#F5F5F4', border: '1.5px solid #F0E0CC',
                    fontSize: '13px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
                  }}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button type="button" onClick={() => openResetPassword(user)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 12px', borderRadius: '10px',
                    background: '#DBEAFE', border: '1.5px solid #BFDBFE',
                    fontSize: '13px', fontWeight: 600, color: '#2563EB', cursor: 'pointer',
                  }}>
                    <KeyRound size={14} /> Reset Password
                  </button>
                  {user.role !== 'owner' && !isCurrentUser && (
                    <button type="button" onClick={() => handleDelete(user)} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 12px', borderRadius: '10px',
                      background: '#FEE2E2', border: '1.5px solid #FECACA',
                      fontSize: '13px', fontWeight: 600, color: '#DC2626', cursor: 'pointer',
                    }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {modal === 'add' && (
        <Modal title="Add Admin User" onClose={closeModal} onSave={handleAdd} saveLabel="Add User">
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Full Name *</label>
            <input type="text" value={addForm.name} onChange={e => setAddForm(p => ({...p, name: e.target.value}))}
              placeholder="John Smith" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Email *</label>
            <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({...p, email: e.target.value}))}
              placeholder="john@email.com" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Password *</label>
            <div style={{position: 'relative'}}>
              <input type={showPassword ? 'text' : 'password'} value={addForm.password}
                onChange={e => setAddForm(p => ({...p, password: e.target.value}))}
                placeholder="Min 6 characters" style={{...inputStyle, paddingRight: '44px'}}
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
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Role *</label>
            <select value={addForm.role} onChange={e => setAddForm(p => ({...p, role: e.target.value}))} style={inputStyle}>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && selectedUser && (
        <Modal title={`Edit — ${selectedUser.name}`} onClose={closeModal} onSave={handleEdit} saveLabel="Save Changes">
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Full Name *</label>
            <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({...p, name: e.target.value}))}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Email *</label>
            <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({...p, email: e.target.value}))}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Role</label>
            <select value={editForm.role} onChange={e => setEditForm(p => ({...p, role: e.target.value}))}
              disabled={selectedUser.role === 'owner'} style={{...inputStyle, opacity: selectedUser.role === 'owner' ? 0.6 : 1}}>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            {selectedUser.role === 'owner' && (
              <p style={{fontSize: '12px', color: '#A8A29E', marginTop: '4px'}}>Owner role cannot be changed.</p>
            )}
          </div>
          {selectedUser.role !== 'owner' && (
            <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
              <input type="checkbox" checked={editForm.is_active}
                onChange={e => setEditForm(p => ({...p, is_active: e.target.checked}))}
                style={{width: '18px', height: '18px', accentColor: '#F97316'}} />
              <span style={{fontSize: '14px', fontWeight: 600, color: '#1C1917'}}>Active Account</span>
            </label>
          )}
        </Modal>
      )}

      {/* Reset Password Modal */}
      {modal === 'password' && selectedUser && (
        <Modal title={`Reset Password — ${selectedUser.name}`} onClose={closeModal} onSave={handleResetPassword} saveLabel="Reset Password">
          <div style={{
            padding: '12px 16px', borderRadius: '12px',
            background: '#FEF3C7', border: '1.5px solid #FDE68A',
            fontSize: '13px', color: '#92400E', fontWeight: 600,
          }}>
            ⚠️ This will immediately change {selectedUser.name}&apos;s password.
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>New Password *</label>
            <div style={{position: 'relative'}}>
              <input type={showNewPassword ? 'text' : 'password'} value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({...p, newPassword: e.target.value}))}
                placeholder="Min 6 characters" style={{...inputStyle, paddingRight: '44px'}}
                onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#78716C',
              }}>
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Confirm Password *</label>
            <input type="password" value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(p => ({...p, confirmPassword: e.target.value}))}
              placeholder="Repeat new password" style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
          </div>
          {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
            <p style={{fontSize: '13px', color: '#DC2626', fontWeight: 600}}>
              ✗ Passwords do not match
            </p>
          )}
          {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
            <p style={{fontSize: '13px', color: '#16A34A', fontWeight: 600}}>
              ✓ Passwords match
            </p>
          )}
        </Modal>
      )}
    </AdminLayout>
  )
}