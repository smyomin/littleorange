'use client'
import { ShoppingCart, Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  in_stock: boolean
  categories?: { name: string }
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="card flex flex-col">
      {/* Image */}
      <div className="bg-orange-50 h-48 flex items-center justify-center">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-orange-300">
            <Package size={48} />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {product.categories?.name && (
          <span className="text-xs font-semibold uppercase tracking-wide mb-1" style={{color: 'var(--orange)'}}>
            {product.categories.name}
          </span>
        )}
        <h3 className="font-bold text-gray-800 mb-1 leading-tight">{product.name}</h3>
        <p className="text-sm text-gray-500 flex-1 mb-3 leading-relaxed">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-gray-800">
            NZ${product.price.toFixed(2)}
          </span>
          {product.in_stock ? (
            <button
              onClick={() => onAddToCart(product)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <ShoppingCart size={16} />
              Add
            </button>
          ) : (
            <span className="text-sm text-gray-400 font-medium">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  )
}