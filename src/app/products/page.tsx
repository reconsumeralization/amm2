import React from 'react'
import ProductGrid from '../../components/products/ProductGrid'

const ProductsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <ProductGrid />
    </div>
  )
}

export default ProductsPage
