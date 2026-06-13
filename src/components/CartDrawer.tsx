'use client'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { CartItem } from '@/context/CartContext'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  deliveryFee: number
  minimumOrder: number
}

const getEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('mala')) return '🌶️'
  if (n.includes('tom yam')) return '🍋'
  if (n.includes('curry')) return '🍛'
  if (n.includes('laksa') || n.includes('pho') || n.includes('soup')) return '🍲'
  if (n.includes('sauce') || n.includes('hoisin') || n.includes('xo')) return '🫙'
  return '🍱'
}

export default function CartDrawer({
  isOpen, onClose, cart, onUpdateQuantity, onRemove, deliveryFee, minimumOrder
}: CartDrawerProps) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0)
  const belowMinimum = subtotal < minimumOrder && subtotal > 0

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        height: '100%', width: '100%', maxWidth: '400px',
        background: 'white', zIndex: 50,
        boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1.5px solid #F0E0CC',
          background: '#FFFBF5',
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingBag size={18} color="white" />
            </div>
            <div>
              <p style={{fontWeight: 900, fontSize: '16px', color: '#1C1917'}}>Your Cart</p>
              <p style={{fontSize: '12px', color: '#78716C'}}>
                {cart.length === 0 ? 'Empty' : `${cart.reduce((s, i) => s + i.quantity, 0)} items`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: '#F5F5F4', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#78716C',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{flex: 1, overflowY: 'auto', padding: '16px 24px'}}>
          {cart.length === 0 ? (
            <div style={{textAlign: 'center', padding: '60px 0', color: '#A8A29E'}}>
              <ShoppingBag size={48} style={{margin: '0 auto 12px', opacity: 0.3, display: 'block'}} />
              <p style={{fontWeight: 600, fontSize: '15px'}}>Your cart is empty</p>
              <p style={{fontSize: '13px', marginTop: '4px'}}>Add some products to get started</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {cart.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: '14px', alignItems: 'center',
                  padding: '14px', borderRadius: '16px',
                  background: '#FFFBF5', border: '1.5px solid #F0E0CC',
                }}>
                  {/* Image */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                    border: '1px solid #F0E0CC',
                  }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      : <span style={{fontSize: '26px'}}>{getEmoji(item.name)}</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{flex: 1, minWidth: 0}}>
                    <p style={{fontWeight: 700, fontSize: '13px', color: '#1C1917', lineHeight: 1.3, marginBottom: '2px'}}>{item.name}</p>
                    <p style={{fontSize: '13px', color: '#F97316', fontWeight: 700}}>NZ${item.price.toFixed(2)}</p>
                  </div>

                  {/* Controls */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0}}>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        border: '1.5px solid #F0E0CC', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#78716C',
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{fontSize: '14px', fontWeight: 700, color: '#1C1917', minWidth: '16px', textAlign: 'center'}}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        border: '1.5px solid #F0E0CC', background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#78716C',
                      }}
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        border: 'none', background: 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#D1C5BC', marginLeft: '2px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#D1C5BC')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1.5px solid #F0E0CC',
            background: '#FFFBF5',
          }}>
            {belowMinimum && (
              <div style={{
                background: '#FFF7ED', border: '1.5px solid #FED7AA',
                borderRadius: '12px', padding: '12px 14px',
                marginBottom: '16px', fontSize: '13px', color: '#C2410C',
                fontWeight: 600,
              }}>
                ⚠️ Minimum order is NZ${minimumOrder.toFixed(2)}. Add NZ${(minimumOrder - subtotal).toFixed(2)} more.
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
              <span style={{fontSize: '13px', color: '#78716C'}}>Subtotal</span>
              <span style={{fontSize: '13px', color: '#1C1917', fontWeight: 600}}>NZ${subtotal.toFixed(2)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
              <span style={{fontSize: '13px', color: '#78716C'}}>Delivery fee</span>
              <span style={{fontSize: '13px', color: '#1C1917', fontWeight: 600}}>NZ${deliveryFee.toFixed(2)}</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: '14px', borderTop: '1.5px solid #F0E0CC',
              marginBottom: '20px',
            }}>
              <span style={{fontSize: '16px', fontWeight: 900, color: '#1C1917'}}>Total</span>
              <span style={{fontSize: '16px', fontWeight: 900, color: '#F97316'}}>NZ${total.toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              style={{
                display: 'block', textAlign: 'center',
                background: belowMinimum ? '#D1C5BC' : '#F97316',
                color: 'white', borderRadius: '14px',
                padding: '16px', fontWeight: 700, fontSize: '15px',
                textDecoration: 'none',
                pointerEvents: belowMinimum ? 'none' : 'auto',
              }}
            >
              Proceed to Checkout →
            </Link>
            <p style={{textAlign: 'center', fontSize: '12px', color: '#A8A29E', marginTop: '10px'}}>
              💵 Pay on delivery · Cash or bank transfer
            </p>
          </div>
        )}
      </div>
    </>
  )
}