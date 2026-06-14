'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Pencil, Trash2, Upload, X, Save } from 'lucide-react'

interface Category { id: string; name: string; slug: string }
interface Product {
  id: string; name: string; description: string; price: number
  image_url: string | null; category_id: string; in_stock: boolean; stock_count: number
}

const emptyProduct = { name: '', description: '', price: '', category_id: '', in_stock: true, stock_count: '50' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('categories').select('*').order('name'),
    ])
    setProducts(p || [])
    setCategories(c || [])
    setLoading(false)
  }

  function openNew() {
    setEditing(null)
    setForm(emptyProduct)
    setImageFile(null)
    setImagePreview(null)
    setShowForm(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category_id: product.category_id || '',
      in_stock: product.in_stock,
      stock_count: product.stock_count?.toString() || '0',
    })
    setImagePreview(product.image_url)
    setImageFile(null)
    setShowForm(true)
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.name || !form.price) return
    setSaving(true)

    let image_url = editing?.image_url || null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const { data: uploaded } = await supabase.storage
        .from('products')
        .upload(filename, imageFile, { upsert: true })
      if (uploaded) {
        const { data: url } = supabase.storage.from('products').getPublicUrl(filename)
        image_url = url.publicUrl
      }
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id || null,
      in_stock: form.in_stock,
      stock_count: parseInt(form.stock_count),
      image_url,
    }

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(payload)
    }

    await fetchData()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: '10px', border: '2px solid #F0E0CC',
    fontSize: '14px', color: '#1C1917',
    background: '#FFFBF5', outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <AdminLayout title="Products">
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '20px'}}>
        <button onClick={openNew} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: '#F97316', color: 'white',
          border: 'none', borderRadius: '12px', padding: '12px 20px',
          fontWeight: 700, fontSize: '14px', cursor: 'pointer',
        }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40}} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white', borderRadius: '20px',
            padding: '28px', width: '100%', maxWidth: '520px',
            zIndex: 50, maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h2 style={{fontWeight: 900, fontSize: '18px', color: '#1C1917'}}>
                {editing ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#78716C'}}>
                <X size={22} />
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {/* Image Upload */}
              <div>
                <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '8px'}}>Product Image</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed #F0E0CC', borderRadius: '14px',
                    height: '140px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer',
                    background: '#FFFBF5', overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <div style={{textAlign: 'center', color: '#A8A29E'}}>
                      <Upload size={24} style={{margin: '0 auto 8px', display: 'block'}} />
                      <p style={{fontSize: '13px', fontWeight: 600}}>Click to upload image</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{display: 'none'}} />
              </div>

              <div>
                <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Product Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} style={inputStyle}
                  placeholder="e.g. Mala Spicy Pot Base"
                  onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
              </div>

              <div>
                <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
                  rows={3} placeholder="Product description..."
                  style={{...inputStyle, resize: 'none'}}
                  onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                <div>
                  <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Price (NZD) *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))}
                    style={inputStyle} placeholder="0.00"
                    onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                </div>
                <div>
                  <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Stock Count</label>
                  <input type="number" value={form.stock_count} onChange={e => setForm(p => ({...p, stock_count: e.target.value}))}
                    style={inputStyle} placeholder="50"
                    onFocus={e => (e.target.style.borderColor = '#F97316')} onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                </div>
              </div>

              <div>
                <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C', display: 'block', marginBottom: '6px'}}>Category</label>
                <select value={form.category_id} onChange={e => setForm(p => ({...p, category_id: e.target.value}))}
                  style={inputStyle}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <label style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                <input type="checkbox" checked={form.in_stock} onChange={e => setForm(p => ({...p, in_stock: e.target.checked}))}
                  style={{width: '18px', height: '18px', accentColor: '#F97316'}} />
                <span style={{fontSize: '14px', fontWeight: 600, color: '#1C1917'}}>In Stock</span>
              </label>

              <button onClick={handleSave} disabled={saving} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: '#F97316', color: 'white', border: 'none',
                borderRadius: '12px', padding: '14px', fontWeight: 700,
                fontSize: '15px', cursor: 'pointer', opacity: saving ? 0.7 : 1,
              }}>
                <Save size={16} />
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Products Table */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#78716C'}}>Loading...</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {products.map(product => (
            <div key={product.id} style={{
              background: 'white', borderRadius: '14px',
              border: '1.5px solid #F0E0CC', padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  : <span style={{fontSize: '24px'}}>🍱</span>
                }
              </div>
              <div style={{flex: 1, minWidth: 0}}>
                <p style={{fontWeight: 700, fontSize: '14px', color: '#1C1917'}}>{product.name}</p>
                <p style={{fontSize: '12px', color: '#78716C'}}>
                  NZ${product.price.toFixed(2)} · Stock: {product.stock_count ?? 0}
                </p>
              </div>
              <span style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                background: product.in_stock ? '#DCFCE7' : '#FEE2E2',
                color: product.in_stock ? '#16A34A' : '#DC2626',
              }}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </span>
              <div style={{display: 'flex', gap: '8px'}}>
                <button onClick={() => openEdit(product)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '10px',
                  background: '#F5F5F4', border: '1.5px solid #F0E0CC',
                  fontSize: '13px', fontWeight: 600, color: '#78716C', cursor: 'pointer',
                }}>
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(product.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 12px', borderRadius: '10px',
                  background: '#FEE2E2', border: '1.5px solid #FECACA',
                  fontSize: '13px', fontWeight: 600, color: '#DC2626', cursor: 'pointer',
                }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}