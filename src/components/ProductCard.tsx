'use client'
import { ShoppingCart } from 'lucide-react'
import { CartItem } from '@/context/CartContext'

interface ProductCardProps {
  product: Omit<CartItem, 'quantity'>
  onAddToCart: (product: Omit<CartItem, 'quantity'>) => void
}

const categoryEmoji: Record<string, string> = {
  'Mala': '🌶️',
  'Tom Yam': '🍋',
  'Curry Paste': '🍛',
  'Sauce & Condiments': '🫙',
  'Soup Base': '🍲',
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const emoji = product.categories?.name ? categoryEmoji[product.categories.name] ?? '🍱' : '🍱'

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      border: '1.5px solid #F0E0CC',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.25s ease',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(249,115,22,0.15)'
        e.currentTarget.style.borderColor = '#FED7AA'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
        e.currentTarget.style.borderColor = '#F0E0CC'
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative',
        height: '180px',
        background: 'linear-gradient(145deg, #FFF7ED, #FFEDD5, #FED7AA)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        ) : (
          <span style={{fontSize: '56px', lineHeight: 1}}>{emoji}</span>
        )}
        {product.categories?.name && (
          <span style={{
            position: 'absolute', bottom: '10px', left: '10px',
            background: '#F97316', color: 'white',
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            padding: '3px 10px', borderRadius: '999px',
          }}>
            {product.categories.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: '16px',
        display: 'flex', flexDirection: 'column',
        flex: 1, gap: '6px',
      }}>
        <h3 style={{
          fontWeight: 700, fontSize: '14px',
          lineHeight: 1.4, color: '#1C1917', margin: 0,
        }}>
          {product.name}
        </h3>
        <p style={{
          fontSize: '12px', color: '#78716C',
          lineHeight: 1.6, flex: 1, margin: 0,
        }}>
          {product.description}
        </p>

        {/* Price + Button */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          marginTop: '4px',
          borderTop: '1px solid #F5E6D3',
        }}>
          <span style={{fontSize: '16px', fontWeight: 900, color: '#1C1917'}}>
            NZ${product.price.toFixed(2)}
          </span>
          {product.in_stock ? (
            <button
              onClick={() => onAddToCart(product)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: '#F97316', color: 'white',
                border: 'none', borderRadius: '10px',
                padding: '8px 14px', fontSize: '13px',
                fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#EA6C0A'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#F97316'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <ShoppingCart size={14} />
              Add
            </button>
          ) : (
            <span style={{
              fontSize: '12px', fontWeight: 600,
              background: '#F5F5F4', color: '#A8A29E',
              padding: '6px 12px', borderRadius: '8px',
            }}>
              Sold out
            </span>
          )}
        </div>
      </div>
    </div>
  )
}