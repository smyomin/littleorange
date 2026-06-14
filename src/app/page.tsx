'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import CategoryFilter from '@/components/CategoryFilter'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/context/CartContext'
import { Search } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  in_stock: boolean
  category_id: string
  categories?: { name: string }
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deliveryFee, setDeliveryFee] = useState(5.00)
  const [minimumOrder, setMinimumOrder] = useState(30.00)
  const [popularIds, setPopularIds] = useState<string[]>([])

  const { cart, addToCart, updateQuantity, removeFromCart, cartCount } = useCart()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: productsData }, { data: categoriesData }, { data: settingsData }, { data: ordersData }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').eq('in_stock', true),
      supabase.from('categories').select('*').order('name'),
      supabase.from('settings').select('*').single(),
      supabase.from('orders').select('items').eq('status', 'delivered'),
    ])
    setProducts(productsData || [])
    setCategories(categoriesData || [])
    if (settingsData) {
      setDeliveryFee(settingsData.delivery_fee)
      setMinimumOrder(settingsData.minimum_order)
    }

    // Calculate popular items from delivered orders
    if (ordersData) {
      const counts: Record<string, number> = {}
      ordersData.forEach((order: { items: { id: string; quantity: number }[] }) => {
        order.items.forEach(item => {
          counts[item.id] = (counts[item.id] || 0) + item.quantity
        })
      })
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([id]) => id)
      setPopularIds(sorted)
    }

    setLoading(false)
  }

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' ||
      categories.find(c => c.slug === selectedCategory && c.id === p.category_id)
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFBF5'}}>
      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />

      <main style={{flex: 1}}>

        {/* ── Hero ── */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1C1917 0%, #292524 60%, #3C1F0A 100%)',
        }}>
          {/* Dot pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          {/* Glow top-right */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '400px', height: '400px', opacity: 0.2,
            background: 'radial-gradient(circle at top right, #F97316, transparent 65%)',
          }} />
          {/* Glow bottom-left */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            width: '300px', height: '300px', opacity: 0.1,
            background: 'radial-gradient(circle at bottom left, #FED7AA, transparent 65%)',
          }} />

          <div style={{
            position: 'relative',
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '40px 24px',
            textAlign: 'center',
          }}>
            {/* Top tag */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '999px',
              background: 'rgba(249,115,22,0.15)',
              border: '1px solid rgba(249,115,22,0.25)',
              color: '#FDBA74', fontSize: '12px', fontWeight: 700,
              marginBottom: '20px',
            }}>
              🔥 Authentic Asian Flavours · Auckland NZ
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 900, color: 'white',
              lineHeight: 1.15, marginBottom: '16px',
            }}>
              Bold Flavours,{' '}
              <span style={{color: '#F97316'}}>Delivered.</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '1rem', color: '#A8A29E',
              marginBottom: '32px', lineHeight: 1.6,
              maxWidth: '480px', margin: '0 auto 32px',
            }}>
              Mala, tom yam, curry pastes &amp; more — pay on delivery.
            </p>

            {/* Feature badges */}
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              gap: '12px', justifyContent: 'center',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#E7E5E4', fontSize: '13px', fontWeight: 600,
              }}>
                🚚 Delivery NZ${deliveryFee.toFixed(2)} · Min NZ${minimumOrder.toFixed(2)}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#E7E5E4', fontSize: '13px', fontWeight: 600,
              }}>
                💵 Cash or bank transfer on delivery
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#E7E5E4', fontSize: '13px', fontWeight: 600,
              }}>
                ✅ Quality Guaranteed
              </div>
            </div>
          </div>
        </div>

        {/* ── Shop Section ── */}
        <div style={{maxWidth: '1100px', margin: '0 auto', padding: '40px 24px'}}>

          {/* Search */}
          <div style={{position: 'relative', marginBottom: '24px'}}>
            <Search size={17} style={{
              position: 'absolute', left: '16px',
              top: '50%', transform: 'translateY(-50%)',
              color: '#78716C', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search for mala, tom yam, curry paste..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', paddingLeft: '44px',
                paddingRight: '16px', paddingTop: '14px', paddingBottom: '14px',
                borderRadius: '14px', border: '2px solid #F0E0CC',
                background: 'white', fontSize: '14px', fontWeight: 500,
                color: '#1C1917', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#F97316')}
              onBlur={e => (e.target.style.borderColor = '#F0E0CC')}
            />
          </div>

          {/* Categories */}
          <div style={{marginBottom: '28px', overflowX: 'auto'}}>
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
{/* Popular Items */}
          {popularIds.length > 0 && (
            <div style={{marginBottom: '40px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
                <span style={{fontSize: '20px'}}>🔥</span>
                <h2 style={{fontWeight: 900, fontSize: '18px', color: '#1C1917'}}>Most Popular</h2>
                <span style={{
                  padding: '3px 10px', borderRadius: '999px',
                  background: '#FFF7ED', color: '#F97316',
                  fontSize: '11px', fontWeight: 700, border: '1px solid #FED7AA',
                }}>
                  Customer Favourites
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px',
              }}>
                {products
                  .filter(p => popularIds.includes(p.id))
                  .sort((a, b) => popularIds.indexOf(a.id) - popularIds.indexOf(b.id))
                  .map((product, index) => (
                    <div key={product.id} style={{position: 'relative'}}>
                      {index === 0 && (
                        <div style={{
                          position: 'absolute', top: '-10px', left: '12px',
                          zIndex: 10, background: '#F97316', color: 'white',
                          fontSize: '10px', fontWeight: 900, padding: '3px 10px',
                          borderRadius: '999px', letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}>
                          ⭐ #1 Best Seller
                        </div>
                      )}
                      <ProductCard product={product} onAddToCart={addToCart} />
                    </div>
                  ))
                }
              </div>
              <div style={{borderBottom: '1.5px solid #F0E0CC', marginTop: '40px', marginBottom: '8px'}} />
            </div>
          )}
          
          {/* Result count */}
          {!loading && (
            <p style={{fontSize: '13px', color: '#78716C', marginBottom: '20px', fontWeight: 500}}>
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  height: '280px', borderRadius: '20px',
                  background: '#F0E0CC', animation: 'pulse 1.5s infinite',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign: 'center', padding: '80px 0'}}>
              <span style={{fontSize: '48px', display: 'block', marginBottom: '16px'}}>🔍</span>
              <p style={{fontWeight: 700, fontSize: '18px', marginBottom: '4px'}}>No products found</p>
              <p style={{fontSize: '14px', color: '#78716C'}}>Try a different search or category</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
            }}>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        deliveryFee={deliveryFee}
        minimumOrder={minimumOrder}
      />
    </div>
  )
}