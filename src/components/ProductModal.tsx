'use client'
import { useEffect, useState } from 'react'
import { X, ShoppingCart, Tag, CheckCircle, XCircle } from 'lucide-react'
import { CartItem } from '@/context/CartContext'

interface ProductModalProps {
  product: Omit<CartItem, 'quantity'> | null
  onClose: () => void
  onAddToCart: (product: Omit<CartItem, 'quantity'>) => void
}

const categoryEmoji: Record<string, string> = {
  'Mala': '🌶️',
  'Tom Yam': '🍋',
  'Curry Paste': '🍛',
  'Sauce & Condiments': '🫙',
  'Soup Base': '🍲',
}

function AddToCartButton({ onAddToCart, onClose }: { onAddToCart: () => void; onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'added'>('idle')

  function handleClick() {
    onAddToCart()
    setState('added')
    setTimeout(() => {
      setState('idle')
      onClose()
    }, 1000)
  }

  return (
    <button
      onClick={handleClick}
      style={{
        flex: 2, padding: '16px',
        borderRadius: '14px', border: 'none',
        background: state === 'added' ? '#16A34A' : '#F97316',
        color: 'white', fontSize: '15px', fontWeight: 700,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px',
        transition: 'all 0.3s ease',
        transform: state === 'added' ? 'scale(0.97)' : 'scale(1)',
      }}
    >
      {state === 'added' ? (
        <><CheckCircle size={18} /> Added to Cart!</>
      ) : (
        <><ShoppingCart size={18} /> Add to Cart</>
      )}
    </button>
  )
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [product])

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!product) return null

  const emoji = product.categories?.name
    ? categoryEmoji[product.categories.name] ?? '🍱'
    : '🍱'

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 60, backdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '24px',
        width: 'calc(100% - 32px)',
        maxWidth: '620px',
        maxHeight: '92vh',
        overflowY: 'auto',
        zIndex: 70,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
      }}>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: '16px',
            float: 'right',
            marginRight: '16px',
            marginTop: '16px',
            width: '36px', height: '36px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            zIndex: 10, flexShrink: 0,
          }}
        >
          <X size={18} />
        </button>

        {/* Image */}
        <div style={{
          width: '100%',
          aspectRatio: '4/3',
          background: 'linear-gradient(145deg, #FFF7ED, #FFEDD5, #FED7AA)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: '24px 24px 0 0',
          marginTop: '-52px',
        }}>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
              }}
            />
          ) : (
            <span style={{ fontSize: '100px', lineHeight: 1 }}>{emoji}</span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px 32px' }}>

          {/* Category */}
          {product.categories?.name && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: '#FFF7ED', color: '#F97316',
              border: '1.5px solid #FED7AA',
              padding: '4px 12px', borderRadius: '999px',
              fontSize: '12px', fontWeight: 700,
              marginBottom: '12px',
            }}>
              <Tag size={12} />
              {product.categories.name}
            </div>
          )}

          {/* Name */}
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 900,
            color: '#1C1917', marginBottom: '6px',
            lineHeight: 1.3,
          }}>
            {product.name}
          </h2>

          {/* Price */}
          <p style={{
            fontSize: '1.75rem', fontWeight: 900,
            color: '#F97316', marginBottom: '20px',
          }}>
            NZ${product.price.toFixed(2)}
          </p>

          {/* Stock Status */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '12px',
            background: product.in_stock ? '#DCFCE7' : '#FEE2E2',
            border: `1.5px solid ${product.in_stock ? '#BBF7D0' : '#FECACA'}`,
            marginBottom: '20px',
          }}>
            {product.in_stock
              ? <CheckCircle size={16} color="#16A34A" />
              : <XCircle size={16} color="#DC2626" />
            }
            <span style={{
              fontSize: '13px', fontWeight: 700,
              color: product.in_stock ? '#16A34A' : '#DC2626',
            }}>
              {product.in_stock ? 'In Stock — Ready to deliver' : 'Currently Out of Stock'}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{
              background: '#FFFBF5', borderRadius: '16px',
              padding: '18px 20px', border: '1.5px solid #F0E0CC',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 700, color: '#F97316',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: '10px',
              }}>
                Product Details
              </p>
              <p style={{
                fontSize: '14px', color: '#78716C',
                lineHeight: 1.85, whiteSpace: 'pre-line', margin: 0,
              }}>
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 16px', borderRadius: '12px',
            background: '#F5F5F4', marginBottom: '24px',
          }}>
            <span style={{ fontSize: '18px' }}>🚚</span>
            <p style={{ fontSize: '13px', color: '#78716C', fontWeight: 600, margin: 0 }}>
              Cash or bank transfer on delivery · Auckland NZ
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '16px',
                borderRadius: '14px', border: '2px solid #F0E0CC',
                background: 'white', fontSize: '14px',
                fontWeight: 700, color: '#78716C', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#F97316')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#F0E0CC')}
            >
              Back
            </button>
            {product.in_stock && (
              <AddToCartButton
                onAddToCart={() => onAddToCart(product)}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}