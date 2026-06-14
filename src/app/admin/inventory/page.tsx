'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { Save, AlertTriangle } from 'lucide-react'

interface Product {
  id: string; name: string; price: number
  in_stock: boolean; stock_count: number; image_url: string | null
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [changes, setChanges] = useState<Record<string, { stock_count: number; in_stock: boolean }>>({})

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('id, name, price, in_stock, stock_count, image_url').order('name')
    setProducts(data || [])
    setLoading(false)
  }

 function handleChange(id: string, field: 'stock_count' | 'in_stock', value: number | boolean) {
    const product = products.find(p => p.id === id)
    setChanges(prev => ({
      ...prev,
      [id]: {
        stock_count: prev[id]?.stock_count ?? product?.stock_count ?? 0,
        in_stock: prev[id]?.in_stock ?? product?.in_stock ?? true,
        [field]: value,
      }
    }))
  }

  async function handleSave(id: string) {
    if (!changes[id]) return
    setSaving(id)
    await supabase.from('products').update(changes[id]).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes[id] } : p))
    setChanges(prev => { const n = {...prev}; delete n[id]; return n })
    setSaving(null)
  }

  const getStockStatus = (count: number) => {
    if (count === 0) return { label: 'Out of Stock', color: '#DC2626', bg: '#FEE2E2' }
    if (count <= 5) return { label: 'Low Stock', color: '#D97706', bg: '#FEF3C7' }
    return { label: 'In Stock', color: '#16A34A', bg: '#DCFCE7' }
  }

  return (
    <AdminLayout title="Inventory">
      <div style={{marginBottom: '20px', padding: '16px 20px', borderRadius: '14px', background: '#FEF3C7', border: '1.5px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <AlertTriangle size={18} color="#D97706" />
        <p style={{fontSize: '13px', color: '#92400E', fontWeight: 600}}>
          Update stock counts and availability. Changes are saved per product.
        </p>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '60px', color: '#78716C'}}>Loading...</div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {products.map(product => {
            const current = changes[product.id] ?? { stock_count: product.stock_count, in_stock: product.in_stock }
            const stockStatus = getStockStatus(current.stock_count)
            const isDirty = !!changes[product.id]
            return (
              <div key={product.id} style={{
                background: 'white', borderRadius: '14px',
                border: `1.5px solid ${isDirty ? '#F97316' : '#F0E0CC'}`,
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {product.image_url
                    ? <img src={product.image_url} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    : <span style={{fontSize: '22px'}}>🍱</span>
                  }
                </div>

                <div style={{flex: 1, minWidth: '160px'}}>
                  <p style={{fontWeight: 700, fontSize: '14px', color: '#1C1917'}}>{product.name}</p>
                  <p style={{fontSize: '12px', color: '#78716C'}}>NZ${product.price.toFixed(2)}</p>
                </div>

                <span style={{
                  padding: '4px 10px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 700,
                  background: stockStatus.bg, color: stockStatus.color,
                }}>
                  {stockStatus.label}
                </span>

                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <label style={{fontSize: '13px', fontWeight: 600, color: '#78716C'}}>Stock:</label>
                  <input
                    type="number" min="0"
                    value={current.stock_count}
                    onChange={e => handleChange(product.id, 'stock_count', parseInt(e.target.value) || 0)}
                    style={{
                      width: '80px', padding: '8px 12px',
                      borderRadius: '10px', border: '2px solid #F0E0CC',
                      fontSize: '14px', fontWeight: 700, color: '#1C1917',
                      background: '#FFFBF5', outline: 'none', textAlign: 'center',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#F97316')}
                    onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
                  />
                </div>

                <label style={{display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={current.in_stock}
                    onChange={e => handleChange(product.id, 'in_stock', e.target.checked)}
                    style={{width: '16px', height: '16px', accentColor: '#F97316'}}
                  />
                  <span style={{fontSize: '13px', fontWeight: 600, color: '#78716C'}}>Available</span>
                </label>

                {isDirty && (
                  <button onClick={() => handleSave(product.id)} disabled={saving === product.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#F97316', color: 'white',
                    border: 'none', borderRadius: '10px', padding: '8px 14px',
                    fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                  }}>
                    <Save size={14} />
                    {saving === product.id ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}