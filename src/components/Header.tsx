'use client'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  cartCount?: number
  onCartClick?: () => void
}

export default function Header({ cartCount = 0, onCartClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(255,251,245,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #F0E0CC',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <Link href="/" style={{display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none'}}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0,
          }}>
            🍊
          </div>
          <div>
            <div style={{fontWeight: 900, fontSize: '17px', color: '#F97316', lineHeight: 1.1}}>Little Orange</div>
            <div style={{fontSize: '11px', color: '#A8A29E', lineHeight: 1}}>Asian Pantry Essentials</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
          {[
            { href: '/', label: 'Shop' },
            { href: '/about', label: 'About' },
            { href: '/why-us', label: 'Why Us' },
            { href: '/faq', label: 'FAQ' },
            { href: '/contact', label: 'Contact' },
            { href: '/track', label: 'Track Order' },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              padding: '8px 14px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600, color: '#78716C',
              textDecoration: 'none', transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF7ED')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right — Cart + Mobile menu */}
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <button
            onClick={onCartClick}
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#F97316', color: 'white',
              border: 'none', borderRadius: '12px',
              padding: '10px 18px', fontWeight: 700,
              fontSize: '14px', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#EA6C0A'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#F97316'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <ShoppingCart size={17} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#DC2626', color: 'white',
                fontSize: '11px', fontWeight: 900,
                borderRadius: '999px', width: '20px', height: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white',
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none',
              padding: '8px', borderRadius: '10px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#1C1917',
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
     {menuOpen && (
        <div style={{
          borderTop: '1px solid #F0E0CC',
          background: '#FFFBF5',
          padding: '12px 24px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {[
            { href: '/', label: '🛍️ Shop' },
            { href: '/about', label: '🍊 About Us' },
            { href: '/why-us', label: '💡 Why Us' },
            { href: '/faq', label: '❓ FAQ' },
            { href: '/contact', label: '📬 Contact' },
            { href: '/track', label: '📦 Track Order' },
          ].map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} style={{
              padding: '10px 12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600, color: '#1C1917',
              textDecoration: 'none',
            }}>{link.label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .mobile-menu-btn { display: flex !important; }
          nav { display: none !important; }
        }
      `}</style>
    </header>
  )
}