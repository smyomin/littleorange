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
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingBag size={20} style={{color: 'var(--orange)'}} />
            Your Cart
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-2xl">
                    🍱
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">NZ${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-400 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-400 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors ml-1"
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
          <div className="px-5 py-4 border-t bg-gray-50">
            {belowMinimum && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 mb-3 text-sm text-orange-700">
                Minimum order is NZ${minimumOrder.toFixed(2)}. Add NZ${(minimumOrder - subtotal).toFixed(2)} more.
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span>
              <span>NZ${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Delivery fee</span>
              <span>NZ${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base mb-4">
              <span>Total</span>
              <span style={{color: 'var(--orange)'}}>NZ${total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className={`btn-primary w-full text-center block text-sm ${belowMinimum ? 'opacity-50 pointer-events-none' : ''}`}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  )
}