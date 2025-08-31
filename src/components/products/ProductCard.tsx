import React from 'react'
import Link from 'next/link'
import { Product } from '../../payload-types'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = typeof product.image === 'object' && product.image !== null ? product.image.url : ''

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link href={`/products/${product.id}`} legacyBehavior>
        <a>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
          )}
        </a>
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">${product.price}</p>
        <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard
