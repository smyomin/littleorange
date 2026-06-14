'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Trash2 } from 'lucide-react'

interface Category { id: string; name: string; slug: string }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('name')
    console.log('categories fetch:', data, error)
    setCategories(data || [])
    setLoading(false)
  }

  async function handleAdd() {
    console.log('handleAdd called, newName:', newName)
    if (!newName.trim()) {
      setMessage('Please enter a category name')
      return
    }
    setAdding(true)
    setMessage('Adding...')
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    console.log('inserting:', { name: newName.trim(), slug })
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newName.trim(), slug }])
      .select()
    console.log('insert result:', data, error)
    if (error) {
      setMessage('Error: ' + error.message)
    } else if (data && data.length > 0) {
      setCategories(prev => [...prev, data[0]])
      setNewName('')
      setMessage('Category added!')
      setTimeout(() => setMessage(''), 2000)
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <AdminLayout title="Categories">
      {/* Add new */}
      <div style={{
        background: 'white', borderRadius: '16px',
        padding: '20px', border: '1.5px solid #F0E0CC',
        marginBottom: '20px',
      }}>
        <p style={{fontSize: '13px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px'}}>
          Add New Category
        </p>
        <div style={{display: 'flex', gap: '10px', marginBottom: '8px'}}>
          <input
            type="text"
            value={newName}
            onChange={e => {
              console.log('input change:', e.target.value)
              setNewName(e.target.value)
            }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Kimchi"
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px',
              border: '2px solid #F0E0CC', fontSize: '14px',
              color: '#1C1917', background: 'white', outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = '#F97316')}
            onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
          />
          <button
            type="button"
            disabled={adding}
            onClick={handleAdd}
            style={{
              background: adding ? '#A8A29E' : '#F97316',
              color: 'white', border: 'none',
              borderRadius: '12px', padding: '12px 24px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {adding ? 'Adding...' : '+ Add'}
          </button>
        </div>
        {message && (
          <p style={{fontSize: '13px', fontWeight: 600, color: message.startsWith('Error') ? '#DC2626' : '#16A34A'}}>
            {message}
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#78716C'}}>Loading...</div>
      ) : categories.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: '#78716C'}}>No categories yet</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {categories.map(cat => (
            <div key={cat.id} style={{
              background: 'white', borderRadius: '14px',
              border: '1.5px solid #F0E0CC', padding: '16px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{fontWeight: 700, fontSize: '15px', color: '#1C1917'}}>{cat.name}</p>
                <p style={{fontSize: '12px', color: '#A8A29E'}}>/{cat.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '10px',
                  background: '#FEE2E2', border: '1.5px solid #FECACA',
                  fontSize: '13px', fontWeight: 600, color: '#DC2626', cursor: 'pointer',
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}