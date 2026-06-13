'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, MessageCircle, LogOut, ShoppingBag, DollarSign, AlertCircle } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#D97706', bg: '#FEF3C7', icon: <Clock size={14} /> },
  { value: 'confirmed', label: 'Confirmed', color: '#2563EB', bg: '#DBEAFE', icon: <Package size={14} /> },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: '#7C3AED', bg: '#EDE9FE', icon: <Truck size={14} /> },
  { value: 'delivered', label: 'Delivered', color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle size={14} /> },
  { value: 'cancelled', label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', icon: <XCircle size={14} /> },
]

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: string
  status: string
  notes: string
  created_at: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [storePhone, setStorePhone] = useState('')

  const ADMIN_PASSWORD = 'Billion$20260527#'

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setError('')
      fetchOrders()
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    setOrders(data || [])

    const { data: settings } = await supabase
      .from('settings')
      .select('store_phone')
      .single()
    if (settings) setStorePhone(settings.store_phone || '')
    setLoading(false)
  }

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId)
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    setUpdating(null)
  }

  function getWhatsAppUrl(order: Order) {
    const items = order.items.map(i => `• ${i.name} x${i.quantity}`).join('\n')
    const statusLabel = STATUS_OPTIONS.find(s => s.value === order.status)?.label ?? order.status
    const message = `Hi ${order.customer_name}! 👋\n\nYour Little Orange order *${order.order_number}* is now: *${statusLabel}*\n\n${items}\n\nTotal: NZ$${order.total.toFixed(2)}\n\nThank you for shopping with us! 🍊`
    const phone = order.customer_phone?.replace(/\D/g, '') || storePhone.replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  const filtered = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  }

  const getStatus = (value: string) => STATUS_OPTIONS.find(s => s.value === value) ?? STATUS_OPTIONS[0]

  // Login Screen
  if (!authed) {
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
            style={{
              width: '100%', background: '#F97316', color: 'white',
              border: 'none', borderRadius: '12px', padding: '14px',
              fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            }}
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight: '100vh', background: '#F5F5F4'}}>

      {/* Top Bar */}
      <div style={{
        background: 'white', borderBottom: '1.5px solid #F0E0CC',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <span style={{fontSize: '24px'}}>🍊</span>
            <div>
              <p style={{fontWeight: 900, fontSize: '16px', color: '#1C1917'}}>Little Orange</p>
              <p style={{fontSize: '11px', color: '#78716C'}}>Admin Dashboard</p>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <a href="/" target="_blank" style={{
              fontSize: '13px', fontWeight: 600, color: '#78716C',
              textDecoration: 'none', padding: '8px 14px',
              borderRadius: '10px', background: '#F5F5F4',
            }}>
              View Store
            </a>
            <button
              onClick={() => setAuthed(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600, color: '#78716C',
                background: 'transparent', border: '1.5px solid #F0E0CC',
                borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '32px 24px'}}>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { icon: <ShoppingBag size={20} />, label: 'Total Orders', value: stats.total, color: '#F97316', bg: '#FFF7ED' },
            { icon: <AlertCircle size={20} />, label: 'Pending', value: stats.pending, color: '#D97706', bg: '#FEF3C7' },
            { icon: <CheckCircle size={20} />, label: 'Delivered', value: stats.delivered, color: '#16A34A', bg: '#DCFCE7' },
            { icon: <DollarSign size={20} />, label: 'Total Revenue', value: `NZ$${stats.revenue.toFixed(2)}`, color: '#2563EB', bg: '#DBEAFE' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '16px',
              padding: '20px 24px', border: '1.5px solid #F0E0CC',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: stat.bg, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{fontSize: '12px', color: '#78716C', fontWeight: 600}}>{stat.label}</p>
                <p style={{fontSize: '20px', fontWeight: 900, color: '#1C1917'}}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{
          display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px',
        }}>
          <button
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '8px 16px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 700,
              border: '2px solid',
              borderColor: filterStatus === 'all' ? '#F97316' : '#F0E0CC',
              background: filterStatus === 'all' ? '#F97316' : 'white',
              color: filterStatus === 'all' ? 'white' : '#78716C',
              cursor: 'pointer',
            }}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              style={{
                padding: '8px 16px', borderRadius: '999px',
                fontSize: '13px', fontWeight: 700,
                border: '2px solid',
                borderColor: filterStatus === s.value ? s.color : '#F0E0CC',
                background: filterStatus === s.value ? s.bg : 'white',
                color: filterStatus === s.value ? s.color : '#78716C',
                cursor: 'pointer',
              }}
            >
              {s.label} ({orders.filter(o => o.status === s.value).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div style={{textAlign: 'center', padding: '60px', color: '#78716C'}}>Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div style={{textAlign: 'center', padding: '60px', color: '#78716C'}}>
            <Package size={40} style={{margin: '0 auto 12px', opacity: 0.3, display: 'block'}} />
            <p style={{fontWeight: 600}}>No orders found</p>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {filtered.map(order => {
              const status = getStatus(order.status)
              const isExpanded = expanded === order.id
              return (
                <div key={order.id} style={{
                  background: 'white', borderRadius: '16px',
                  border: '1.5px solid #F0E0CC', overflow: 'hidden',
                }}>
                  {/* Order Row */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '16px', padding: '16px 20px',
                    flexWrap: 'wrap',
                  }}>
                    {/* Order info */}
                    <div style={{flex: 1, minWidth: '200px'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'}}>
                        <span style={{fontWeight: 900, fontSize: '15px', color: '#F97316'}}>
                          {order.order_number}
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '3px 10px', borderRadius: '999px',
                          fontSize: '11px', fontWeight: 700,
                          background: status.bg, color: status.color,
                        }}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <p style={{fontSize: '13px', color: '#1C1917', fontWeight: 600}}>{order.customer_name}</p>
                      <p style={{fontSize: '12px', color: '#78716C'}}>{order.customer_email}</p>
                    </div>

                    {/* Order meta */}
                    <div style={{textAlign: 'right', minWidth: '120px'}}>
                      <p style={{fontWeight: 900, fontSize: '16px', color: '#1C1917'}}>
                        NZ${order.total.toFixed(2)}
                      </p>
                      <p style={{fontSize: '11px', color: '#78716C'}}>
                        {new Date(order.created_at).toLocaleDateString('en-NZ', { dateStyle: 'medium' })}
                      </p>
                      <p style={{fontSize: '11px', color: '#78716C'}}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      
                        <a href={getWhatsAppUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', borderRadius: '10px',
                          background: '#DCFCE7', color: '#16A34A',
                          fontSize: '13px', fontWeight: 700,
                          textDecoration: 'none', border: '1.5px solid #BBF7D0',
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', borderRadius: '10px',
                          background: '#F5F5F4', color: '#78716C',
                          fontSize: '13px', fontWeight: 700,
                          border: '1.5px solid #F0E0CC', cursor: 'pointer',
                        }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1.5px solid #F0E0CC',
                      padding: '20px',
                      background: '#FFFBF5',
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '24px',
                      }}>
                        {/* Items */}
                        <div>
                          <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'}}>
                            Order Items
                          </p>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: '13px',
                              }}>
                                <span style={{color: '#1C1917'}}>{item.name} <span style={{color: '#78716C'}}>x{item.quantity}</span></span>
                                <span style={{fontWeight: 600, color: '#1C1917'}}>NZ${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div style={{borderTop: '1px solid #F0E0CC', paddingTop: '8px', marginTop: '4px'}}>
                              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#78716C', marginBottom: '4px'}}>
                                <span>Delivery</span>
                                <span>NZ${order.delivery_fee.toFixed(2)}</span>
                              </div>
                              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 900, color: '#1C1917'}}>
                                <span>Total</span>
                                <span style={{color: '#F97316'}}>NZ${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer */}
                        <div>
                          <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'}}>
                            Customer Info
                          </p>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px'}}>
                            <p><span style={{color: '#78716C'}}>Name: </span><span style={{fontWeight: 600, color: '#1C1917'}}>{order.customer_name}</span></p>
                            <p><span style={{color: '#78716C'}}>Email: </span><span style={{fontWeight: 600, color: '#1C1917'}}>{order.customer_email}</span></p>
                            <p><span style={{color: '#78716C'}}>Phone: </span><span style={{fontWeight: 600, color: '#1C1917'}}>{order.customer_phone || '—'}</span></p>
                            <p><span style={{color: '#78716C'}}>Payment: </span><span style={{fontWeight: 600, color: '#1C1917'}}>{order.payment_method === 'cash' ? 'Cash on delivery' : 'Bank transfer'}</span></p>
                            <p><span style={{color: '#78716C'}}>Address: </span><span style={{fontWeight: 600, color: '#1C1917'}}>{order.delivery_address}</span></p>
                            {order.notes && <p><span style={{color: '#78716C'}}>Notes: </span><span style={{fontWeight: 600, color: '#1C1917'}}>{order.notes}</span></p>}
                          </div>
                        </div>

                        {/* Update Status */}
                        <div>
                          <p style={{fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px'}}>
                            Update Status
                          </p>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {STATUS_OPTIONS.map(s => (
                              <button
                                key={s.value}
                                onClick={() => updateStatus(order.id, s.value)}
                                disabled={order.status === s.value || updating === order.id}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '8px',
                                  padding: '10px 14px', borderRadius: '10px',
                                  fontSize: '13px', fontWeight: 700,
                                  border: '2px solid',
                                  borderColor: order.status === s.value ? s.color : '#F0E0CC',
                                  background: order.status === s.value ? s.bg : 'white',
                                  color: order.status === s.value ? s.color : '#78716C',
                                  cursor: order.status === s.value ? 'default' : 'pointer',
                                  opacity: updating === order.id ? 0.6 : 1,
                                }}
                              >
                                {s.icon}
                                {s.label}
                                {order.status === s.value && (
                                  <span style={{marginLeft: 'auto', fontSize: '11px'}}>✓ Current</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}