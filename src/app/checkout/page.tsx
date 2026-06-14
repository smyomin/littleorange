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
  const [settings, setSettings] = useState<Settings>({ delivery_fee: 5, minimum_order: 30, store_phone: '', store_email: '' })
  const [loading, setLoading] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    payment_method: 'cash',
    notes: ''
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
  }, [cart, orderPlaced])

  const total = subtotal + settings.delivery_fee

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function generateOrderNumber() {
    return 'LO-' + Date.now().toString().slice(-6)
  }

  function buildWhatsappMessage(orderNum: string) {
    const items = cart.map(item => `• ${item.name} x${item.quantity} — NZ$${(item.price * item.quantity).toFixed(2)}`).join('\n')
    const message = `🍊 *Little Orange Order Confirmation*\n\n` +
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

    // Reduce stock count for each item
    for (const item of cart) {
      await supabase.rpc('decrement_stock', {
        product_id: item.id,
        amount: item.quantity
      })
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

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-lg mx-auto px-4 py-12 w-full">
          <div className="card p-8 text-center">
            <CheckCircle size={64} className="mx-auto mb-4" style={{color: 'var(--orange)'}} />
            <h1 className="text-2xl font-bold mb-2">Order Placed! 🎉</h1>
            <p className="text-gray-500 mb-1">Your order number is:</p>
            <p className="text-2xl font-bold mb-6" style={{color: 'var(--orange)'}}>{orderNumber}</p>
            <p className="text-gray-600 text-sm mb-6">
              We'll confirm your order shortly. Share your order on WhatsApp to speed things up!
            </p>
            
              <a href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 w-full mb-4 text-white no-underline"
            >
              <MessageCircle size={20} />
              Share Order on WhatsApp
            </a>
            <button
              onClick={() => router.push('/')}
              className="btn-outline w-full"
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag size={24} style={{color: 'var(--orange)'}} />
          Checkout
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left — Form */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <h2 className="font-bold mb-4 text-gray-700">Delivery Details</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Phone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+64 21 123 4567"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Delivery Address *</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street address, suburb, city"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold mb-4 text-gray-700">Payment Method</h2>
              <div className="flex flex-col gap-2">
                {['cash', 'bank_transfer'].map(method => (
                  <label key={method} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${form.payment_method === method ? 'border-orange-400 bg-orange-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value={method}
                      checked={form.payment_method === method}
                      onChange={handleChange}
                      className="accent-orange-500"
                    />
                    <span className="text-sm font-medium">
                      {method === 'cash' ? '💵 Cash on Delivery' : '🏦 Bank Transfer on Delivery'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold mb-3 text-gray-700">Notes (optional)</h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any special instructions..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold mb-4 text-gray-700">Order Summary</h2>
              <div className="flex flex-col gap-3 mb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                    <span className="font-medium">NZ${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>NZ${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery fee</span>
                  <span>NZ${settings.delivery_fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1">
                  <span>Total</span>
                  <span style={{color: 'var(--orange)'}}>NZ${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full mt-5 text-sm"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                Payment collected on delivery · NZD
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}