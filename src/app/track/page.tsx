'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Search, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  status: string
  total: number
  subtotal: number
  delivery_fee: number
  payment_method: string
  delivery_address: string
  items: OrderItem[]
  notes: string
  created_at: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Order Received', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock size={18} /> },
  confirmed: { label: 'Confirmed', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Package size={18} /> },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Truck size={18} /> },
  delivered: { label: 'Delivered', color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCircle size={18} /> },
  cancelled: { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', icon: <XCircle size={18} /> },
}

const statusSteps = ['pending', 'confirmed', 'out_for_delivery', 'delivered']

export default function TrackPage() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setNotFound(false)
    setOrder(null)

    const { data } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.ilike.%${query.trim()}%,customer_email.ilike.%${query.trim()}%`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data) {
      setOrder(data)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }

  const currentStepIndex = order ? statusSteps.indexOf(order.status) : -1

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main style={{flex: 1, maxWidth: '760px', margin: '0 auto', padding: '48px 24px', width: '100%'}}>
        <h1 style={{fontSize: '1.75rem', fontWeight: 900, color: '#1C1917', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Package size={24} style={{color: '#F97316'}} />
          Track Your Order
        </h1>
        <p style={{color: '#78716C', fontSize: '14px', marginBottom: '28px'}}>Enter your order number or email address</p>

        {/* Search */}
<div style={{display: 'flex', gap: '10px', marginBottom: '32px'}}>
          <div style={{position: 'relative', flex: 1}}>
            <Search size={17} style={{
              position: 'absolute', left: '14px',
              top: '50%', transform: 'translateY(-50%)',
              color: '#78716C', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="e.g. LO-123456 or your@email.com"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%', paddingLeft: '42px',
                paddingRight: '16px', paddingTop: '14px', paddingBottom: '14px',
                borderRadius: '14px', border: '2px solid #F0E0CC',
                fontSize: '14px', color: '#1C1917',
                background: 'white', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#F97316')}
              onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              background: '#F97316', color: 'white',
              border: 'none', borderRadius: '14px',
              padding: '14px 24px', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loading ? '...' : 'Track'}
          </button>
        </div>

        {/* Not Found */}
        {notFound && (
          <div className="card p-6 text-center text-gray-500">
            <XCircle size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No order found</p>
            <p className="text-sm mt-1">Check your order number or email and try again.</p>
          </div>
        )}

        {/* Order Found */}
        {order && (
          <div className="flex flex-col gap-4">
            {/* Status Badge */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-bold text-lg" style={{color: 'var(--orange)'}}>{order.order_number}</p>
                </div>
                {statusConfig[order.status] && (
                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusConfig[order.status].color}`}>
                    {statusConfig[order.status].icon}
                    {statusConfig[order.status].label}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {order.status !== 'cancelled' && (
                <div className="flex items-center gap-1 mt-2">
                  {statusSteps.map((step, index) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`h-2 rounded-full w-full transition-all ${index <= currentStepIndex ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Received</span>
                <span>Confirmed</span>
                <span>On the way</span>
                <span>Delivered</span>
              </div>
            </div>

            {/* Order Details */}
            <div className="card p-5">
              <h2 className="font-bold mb-3 text-gray-700">Order Details</h2>
              <div className="flex flex-col gap-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                    <span className="font-medium">NZ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex flex-col gap-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>NZ${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery fee</span>
                  <span>NZ${order.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Total</span>
                  <span style={{color: 'var(--orange)'}}>NZ${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card p-5">
              <h2 className="font-bold mb-3 text-gray-700">Delivery Info</h2>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Address</span>
                  <span className="text-right max-w-xs">{order.delivery_address}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment</span>
                  <span>{order.payment_method === 'cash' ? 'Cash on delivery' : 'Bank transfer on delivery'}</span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span>Notes</span>
                    <span className="text-right max-w-xs">{order.notes}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ordered</span>
                  <span>{new Date(order.created_at).toLocaleDateString('en-NZ', { dateStyle: 'medium' })}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}