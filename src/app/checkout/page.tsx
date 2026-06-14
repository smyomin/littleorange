'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShoppingBag, MessageCircle, CheckCircle } from 'lucide-react'

interface Settings {
  delivery_fee: number
  minimum_order: number
  store_phone: string
  store_email: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart, subtotal } = useCart()
  const [settings, setSettings] = useState<Settings>({
    delivery_fee: 5, minimum_order: 30, store_phone: '', store_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', payment_method: 'cash', notes: ''
  })

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('settings').select('*').single()
      if (data) setSettings(data)
    }
    fetchSettings()
  }, [])

  useEffect(() => {
    if (cart.length === 0 && !orderPlaced) router.push('/')
  }, [cart, orderPlaced, router])

  const total = subtotal + settings.delivery_fee

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function generateOrderNumber() {
    return 'LO-' + Date.now().toString().slice(-6)
  }

  function buildWhatsappMessage(orderNum: string) {
    const items = cart.map(item => `• ${item.name} x${item.quantity} — NZ$${(item.price * item.quantity).toFixed(2)}`).join('\n')
    const message =
      `🍊 *Little Orange Order Confirmation*\n\n` +
      `Order: *${orderNum}*\n\n` +
      `*Items:*\n${items}\n\n` +
      `Subtotal: NZ$${subtotal.toFixed(2)}\n` +
      `Delivery: NZ$${settings.delivery_fee.toFixed(2)}\n` +
      `*Total: NZ$${total.toFixed(2)}*\n\n` +
      `*Delivery to:* ${form.address}\n` +
      `*Payment:* ${form.payment_method === 'cash' ? 'Cash on delivery' : 'Bank transfer on delivery'}\n\n` +
      `Thank you, ${form.name}! We'll be in touch shortly. 🙏`
    return `https://wa.me/${settings.store_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
  }

  async function handleSubmit() {
    if (!form.name || !form.email || !form.address) {
      alert('Please fill in all required fields.')
      return
    }
    setLoading(true)
    const orderNum = generateOrderNumber()

    const { error } = await supabase.from('orders').insert({
      order_number: orderNum,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      delivery_address: form.address,
      items: cart,
      subtotal,
      delivery_fee: settings.delivery_fee,
      total,
      payment_method: form.payment_method,
      status: 'pending',
      notes: form.notes
    })

    if (error) {
      alert('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Reduce stock
    for (const item of cart) {
      await supabase.rpc('decrement_stock', { product_id: item.id, amount: item.quantity })
    }

    // Send email notification
    try {
      await fetch('/api/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            order_number: orderNum,
            customer_name: form.name,
            customer_email: form.email,
            customer_phone: form.phone,
            delivery_address: form.address,
            items: cart,
            subtotal,
            delivery_fee: settings.delivery_fee,
            total,
            payment_method: form.payment_method,
          },
          storeEmail: settings.store_email
        })
      })
    } catch (e) {
      console.log('Email notification failed:', e)
    }

    const waUrl = buildWhatsappMessage(orderNum)
    setWhatsappUrl(waUrl)
    setOrderNumber(orderNum)
    setOrderPlaced(true)
    clearCart()
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    borderRadius: '12px', border: '2px solid #F0E0CC',
    fontSize: '14px', color: '#1C1917',
    background: 'white', outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  }

  const labelStyle = {
    fontSize: '13px', fontWeight: 600 as const,
    color: '#78716C', display: 'block' as const,
    marginBottom: '6px',
  }

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFBF5' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div style={{
            background: 'white', borderRadius: '24px',
            padding: '48px 40px', maxWidth: '480px', width: '100%',
            border: '1.5px solid #F0E0CC', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          }}>
            <CheckCircle size={64} style={{ margin: '0 auto 16px', display: 'block', color: '#16A34A' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1C1917', marginBottom: '8px' }}>
              Order Placed! 🎉
            </h1>
            <p style={{ color: '#78716C', marginBottom: '6px', fontSize: '14px' }}>Your order number is:</p>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#F97316', marginBottom: '20px' }}>
              {orderNumber}
            </p>
            <p style={{ color: '#78716C', fontSize: '14px', marginBottom: '28px', lineHeight: 1.6 }}>
              We&apos;ll confirm your order shortly. Share your order on WhatsApp to speed things up!
            </p>
            
              <a href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: '#16A34A', color: 'white',
                padding: '16px', borderRadius: '14px',
                fontWeight: 700, fontSize: '15px',
                textDecoration: 'none', marginBottom: '12px',
              }}
            >
              <MessageCircle size={20} />
              Share Order on WhatsApp
            </a>
            <button
              onClick={() => router.push('/')}
              style={{
                width: '100%', background: 'transparent',
                border: '2px solid #F0E0CC', borderRadius: '14px',
                padding: '14px', fontWeight: 700, fontSize: '14px',
                color: '#78716C', cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFBF5' }}>
      <Header />

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

          <h1 style={{
            fontSize: '1.75rem', fontWeight: 900, color: '#1C1917',
            marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <ShoppingBag size={24} style={{ color: '#F97316' }} />
            Checkout
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}>

            {/* Left — Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Delivery Details */}
              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1.5px solid #F0E0CC' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
                  Delivery Details
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      placeholder="Your full name" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#F97316')}
                      onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="your@email.com" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#F97316')}
                      onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+64 21 123 4567" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#F97316')}
                      onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                  </div>
                  <div>
                    <label style={labelStyle}>Delivery Address *</label>
                    <textarea name="address" value={form.address} onChange={handleChange}
                      placeholder="Street address, suburb, city" rows={3}
                      style={{ ...inputStyle, resize: 'none' }}
                      onFocus={e => (e.target.style.borderColor = '#F97316')}
                      onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1.5px solid #F0E0CC' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
                  Payment Method
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { value: 'cash', label: '💵 Cash on Delivery' },
                    { value: 'bank_transfer', label: '🏦 Bank Transfer on Delivery' },
                  ].map(method => (
                    <label key={method.value} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 16px', borderRadius: '12px',
                      border: `2px solid ${form.payment_method === method.value ? '#F97316' : '#F0E0CC'}`,
                      background: form.payment_method === method.value ? '#FFF7ED' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <input
                        type="radio" name="payment_method"
                        value={method.value}
                        checked={form.payment_method === method.value}
                        onChange={handleChange}
                        style={{ accentColor: '#F97316', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1C1917' }}>{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1.5px solid #F0E0CC' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
                  Notes (optional)
                </p>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Any special instructions..."
                  rows={3} style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => (e.target.style.borderColor = '#F97316')}
                  onBlur={e => (e.target.style.borderColor = '#F0E0CC')} />
              </div>
            </div>

            {/* Right — Order Summary */}
            <div style={{
              background: 'white', borderRadius: '20px',
              padding: '24px', border: '1.5px solid #F0E0CC',
              position: 'sticky', top: '80px',
            }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#F97316', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '18px' }}>
                Order Summary
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#78716C' }}>
                      {item.name}
                      <span style={{ color: '#A8A29E', marginLeft: '4px' }}>x{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 600, color: '#1C1917' }}>
                      NZ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1.5px solid #F0E0CC', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#78716C' }}>
                  <span>Subtotal</span>
                  <span>NZ${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#78716C' }}>
                  <span>Delivery fee</span>
                  <span>NZ${settings.delivery_fee.toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: '17px', fontWeight: 900,
                  paddingTop: '10px', borderTop: '1.5px solid #F0E0CC',
                  marginTop: '4px',
                }}>
                  <span style={{ color: '#1C1917' }}>Total</span>
                  <span style={{ color: '#F97316' }}>NZ${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', background: '#F97316', color: 'white',
                  border: 'none', borderRadius: '14px', padding: '16px',
                  fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                  marginTop: '20px', opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#EA6C0A' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F97316' }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#A8A29E', marginTop: '10px' }}>
                💵 Payment collected on delivery · NZD
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}