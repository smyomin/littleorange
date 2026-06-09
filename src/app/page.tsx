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

  const { cart, addToCart, updateQuantity, removeFromCart, cartCount } = useCart()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [{ data: productsData }, { data: categoriesData }, { data: settingsData }] = await Promise.all([
      supabase.from('products').select('*, categories(name)').eq('in_stock', true),
      supabase.from('categories').select('*').order('name'),
      supabase.from('settings').select('*').single()
    ])
    setProducts(productsData || [])
    setCategories(categoriesData || [])
    if (settingsData) {
      setDeliveryFee(settingsData.delivery_fee)
      setMinimumOrder(settingsData.minimum_order)
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
    <div className="min-h-screen flex flex-col">
      <Header cartCount={cartCount} onCartClick={() => setCartOpen(true)} />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Hero */}
        <div className="rounded-2xl p-8 mb-8 text-white text-center" style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">🍊 Little Orange</h1>
          <p className="text-orange-100 text-lg">Specialty Asian pantry essentials — delivered to your door</p>
          <p className="text-orange-200 text-sm mt-1">Cash or Bank Transfer on delivery · NZD</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-400 bg-white text-sm"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
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