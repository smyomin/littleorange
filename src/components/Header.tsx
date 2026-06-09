'use client'
import { ShoppingCart, Store, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  cartCount?: number
  onCartClick?: () => void
}

export default function Header({ cartCount = 0, onCartClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--orange)'}}>
            <Store size={20} color="white" />
          </div>
          <span className="font-bold text-xl" style={{color: 'var(--orange)'}}>Little Orange</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-orange-500 transition-colors">Shop</Link>
          <Link href="/track" className="hover:text-orange-500 transition-colors">Track Order</Link>
        </nav>

        {/* Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 btn-primary text-sm"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-600">
          <Link href="/" onClick={() => setMenuOpen(false)} className="hover:text-orange-500">Shop</Link>
          <Link href="/track" onClick={() => setMenuOpen(false)} className="hover:text-orange-500">Track Order</Link>
        </div>
      )}
    </header>
  )
}