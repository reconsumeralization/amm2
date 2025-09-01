"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Package, AlertTriangle, DollarSign, TrendingUp, Search, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  costPrice: number
  sellingPrice: number
  supplier: string
  location: string
  status: 'active' | 'inactive'
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data
  useEffect(() => {
    setProducts([
      {
        id: '1',
        name: 'Hair Gel - Premium',
        sku: 'HG-PREM-001',
        category: 'Styling',
        currentStock: 25,
        minStock: 10,
        maxStock: 50,
        costPrice: 8.50,
        sellingPrice: 15.99,
        supplier: 'Beauty Supply Co',
        location: 'Shelf A-1',
        status: 'active'
      },
      {
        id: '2',
        name: 'Beard Oil - Sandalwood',
        sku: 'BO-SAND-002',
        category: 'Beard Care',
        currentStock: 8,
        minStock: 15,
        maxStock: 40,
        costPrice: 12.00,
        sellingPrice: 24.99,
        supplier: 'Natural Products Ltd',
        location: 'Shelf B-2',
        status: 'active'
      },
      {
        id: '3',
        name: 'Shampoo - Anti-Dandruff',
        sku: 'SH-ANTI-003',
        category: 'Hair Care',
        currentStock: 45,
        minStock: 20,
        maxStock: 80,
        costPrice: 6.25,
        sellingPrice: 12.99,
        supplier: 'Medical Supplies Inc',
        location: 'Shelf C-1',
        status: 'active'
      }
    ])
  }, [])

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) return { status: 'Out of Stock', color: 'destructive' }
    if (product.currentStock <= product.minStock) return { status: 'Low Stock', color: 'secondary' }
    if (product.currentStock > product.maxStock) return { status: 'Overstock', color: 'outline' }
    return { status: 'In Stock', color: 'default' }
  }

  const getStockLevel = (product: Product) => {
    if (product.currentStock === 0) return 0
    return Math.min((product.currentStock / product.maxStock) * 100, 100)
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0)
  const lowStockItems = products.filter(p => p.currentStock <= p.minStock).length
  const outOfStockItems = products.filter(p => p.currentStock === 0).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track products, manage stock levels, and monitor suppliers</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.filter(p => p.status === 'active').length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total cost value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items below minimum
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Items unavailable
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Controls */}
        <div className="flex gap-4 items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Manage your product catalog and stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const stockLevel = getStockLevel(product)

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.category}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              product.currentStock <= product.minStock && "text-orange-600",
                              product.currentStock === 0 && "text-red-600"
                            )}>
                              {product.currentStock}
                            </span>
                            <span className="text-sm text-gray-600">units</span>
                          </div>
                          <Progress value={stockLevel} className="w-20 h-2" />
                          <div className="text-xs text-gray-600">
                            Min: {product.minStock} • Max: {product.maxStock}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${product.sellingPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">Cost: ${product.costPrice.toFixed(2)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.color as any}>
                          {stockStatus.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Stock In
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        {lowStockItems > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts ({lowStockItems} items)
              </CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products
                  .filter(p => p.currentStock <= p.minStock)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {product.currentStock} • Minimum: {product.minStock} • Supplier: {product.supplier}
                        </p>
                      </div>
                      <Badge variant="secondary">Needs Restock</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}