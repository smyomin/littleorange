'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/admin/AdminLayout'
import { ShoppingBag, DollarSign, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface Order { id: string; total: number; status: string; items: {name: string; quantity: number; price: number}[]; created_at: string }

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  }

  // Most popular items
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {}
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
      itemCounts[item.name].count += item.quantity
      itemCounts[item.name].revenue += item.price * item.quantity
    })
  })
  const popularItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  // Recent orders
  const recentOrders = orders.slice(0, 5)

  const statusConfig: Record<string, { color: string; bg: string }> = {
    pending: { color: '#D97706', bg: '#FEF3C7' },
    confirmed: { color: '#2563EB', bg: '#DBEAFE' },
    out_for_delivery: { color: '#7C3AED', bg: '#EDE9FE' },
    delivered: { color: '#16A34A', bg: '#DCFCE7' },
    cancelled: { color: '#DC2626', bg: '#FEE2E2' },
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px'}}>
        {[
          { icon: <ShoppingBag size={20} />, label: 'Total Orders', value: stats.total, color: '#F97316', bg: '#FFF7ED' },
          { icon: <AlertCircle size={20} />, label: 'Pending', value: stats.pending, color: '#D97706', bg: '#FEF3C7' },
          { icon: <CheckCircle size={20} />, label: 'Delivered', value: stats.delivered, color: '#16A34A', bg: '#DCFCE7' },
          { icon: <DollarSign size={20} />, label: 'Revenue', value: `NZ$${stats.revenue.toFixed(2)}`, color: '#2563EB', bg: '#DBEAFE' },
        ].map(stat => (
          <div key={stat.label} style={{background: 'white', borderRadius: '16px', padding: '20px', border: '1.5px solid #F0E0CC', display: 'flex', alignItems: 'center', gap: '14px'}}>
            <div style={{width: '44px', height: '44px', borderRadius: '12px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
              {stat.icon}
            </div>
            <div>
              <p style={{fontSize: '12px', color: '#78716C', fontWeight: 600}}>{stat.label}</p>
              <p style={{fontSize: '20px', fontWeight: 900, color: '#1C1917'}}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'}}>

        {/* Popular Items */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', border: '1.5px solid #F0E0CC'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px'}}>
            <TrendingUp size={18} color="#F97316" />
            <p style={{fontWeight: 800, fontSize: '15px', color: '#1C1917'}}>Most Popular Items</p>
          </div>
          {loading ? (
            <p style={{color: '#78716C', fontSize: '14px'}}>Loading...</p>
          ) : popularItems.length === 0 ? (
            <p style={{color: '#A8A29E', fontSize: '14px'}}>No orders yet</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {popularItems.map((item, i) => (
                <div key={item.name} style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: i === 0 ? '#FEF3C7' : '#F5F5F4',
                    color: i === 0 ? '#D97706' : '#78716C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 900, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <p style={{fontSize: '13px', fontWeight: 700, color: '#1C1917', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.name}</p>
                    <p style={{fontSize: '12px', color: '#78716C'}}>{item.count} sold · NZ${item.revenue.toFixed(2)}</p>
                  </div>
                  <div style={{width: `${Math.round((item.count / popularItems[0].count) * 100)}%`, maxWidth: '60px', height: '6px', borderRadius: '999px', background: '#F97316', opacity: 0.7}} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{background: 'white', borderRadius: '16px', padding: '24px', border: '1.5px solid #F0E0CC'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
            <p style={{fontWeight: 800, fontSize: '15px', color: '#1C1917'}}>Recent Orders</p>
            <a href="/admin/orders" style={{fontSize: '13px', fontWeight: 600, color: '#F97316', textDecoration: 'none'}}>View all</a>
          </div>
          {loading ? (
            <p style={{color: '#78716C', fontSize: '14px'}}>Loading...</p>
          ) : recentOrders.length === 0 ? (
            <p style={{color: '#A8A29E', fontSize: '14px'}}>No orders yet</p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {recentOrders.map(order => {
                const s = statusConfig[order.status] ?? { color: '#78716C', bg: '#F5F5F4' }
                return (
                  <div key={order.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px'}}>
                    <div>
                      <p style={{fontSize: '13px', fontWeight: 700, color: '#F97316'}}>{order.id.slice(0,8).toUpperCase()}</p>
                      <p style={{fontSize: '12px', color: '#78716C'}}>{new Date(order.created_at).toLocaleDateString('en-NZ')}</p>
                    </div>
                    <span style={{padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color}}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <p style={{fontWeight: 700, fontSize: '14px', color: '#1C1917'}}>NZ${order.total.toFixed(2)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}