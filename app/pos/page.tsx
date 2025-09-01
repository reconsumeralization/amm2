"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Minus,
  Trash2,
  CreditCard,
  DollarSign,
  Receipt,
  User,
  Scissors,
  Package,
  Calculator,
  Printer,
  Save,
  Loader2,
  Search,
  Clock,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Service {
  id: string
  name: string
  price: number
  duration: number
  category: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
}

interface CartItem {
  id: string
  type: 'service' | 'product'
  name: string
  price: number
  quantity: number
  stylist?: string
  discount?: number
}

interface Customer {
  id?: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

interface Transaction {
  id: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'card' | 'split'
  status: 'pending' | 'completed' | 'cancelled'
  timestamp: string
  notes?: string
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customer, setCustomer] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'split'>('card')
  const [cashReceived, setCashReceived] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Mock data - in a real app, this would come from API
  useEffect(() => {
    setServices([
      { id: '1', name: 'Haircut', price: 35, duration: 30, category: 'Hair' },
      { id: '2', name: 'Beard Trim', price: 20, duration: 15, category: 'Beard' },
      { id: '3', name: 'Haircut & Beard', price: 50, duration: 45, category: 'Hair' },
      { id: '4', name: 'Premium Shave', price: 45, duration: 30, category: 'Shave' }
    ])

    setProducts([
      { id: 'p1', name: 'Hair Gel', price: 15, category: 'Styling', stock: 25 },
      { id: 'p2', name: 'Beard Oil', price: 25, category: 'Beard Care', stock: 15 },
      { id: 'p3', name: 'Shampoo', price: 12, category: 'Hair Care', stock: 30 },
      { id: 'p4', name: 'Aftershave', price: 18, category: 'Skincare', stock: 20 }
    ])

    // Load recent transactions
    setTransactions([
      {
        id: 'TXN001',
        customer: { firstName: 'John', lastName: 'Doe', phone: '(555) 123-4567' },
        items: [
          { id: '1', type: 'service', name: 'Haircut', price: 35, quantity: 1 },
          { id: 'p1', type: 'product', name: 'Hair Gel', price: 15, quantity: 1 }
        ],
        subtotal: 50,
        tax: 4,
        discount: 0,
        total: 54,
        paymentMethod: 'card',
        status: 'completed',
        timestamp: new Date().toISOString()
      }
    ])
  }, [])

  const addToCart = (item: Service | Product, type: 'service' | 'product') => {
    setCart(prev => {
      const existing = prev.find(cartItem =>
        cartItem.id === item.id && cartItem.type === type
      )

      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id && cartItem.type === type
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prev, {
          id: item.id,
          type,
          name: item.name,
          price: item.price,
          quantity: 1
        }]
      }
    })
  }

  const updateQuantity = (id: string, type: 'service' | 'product', quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, type)
      return
    }

    setCart(prev =>
      prev.map(item =>
        item.id === id && item.type === type
          ? { ...item, quantity }
          : item
      )
    )
  }

  const removeFromCart = (id: string, type: 'service' | 'product') => {
    setCart(prev => prev.filter(item => !(item.id === id && item.type === type)))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setCustomer({ firstName: '', lastName: '', email: '', phone: '' })
    setNotes('')
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = subtotal * (discount / 100)
    return (subtotal - discountAmount) * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = subtotal * (discount / 100)
    const tax = calculateTax()
    return subtotal - discountAmount + tax
  }

  const calculateChange = () => {
    if (paymentMethod !== 'cash' || !cashReceived) return 0
    const total = calculateTotal()
    return parseFloat(cashReceived) - total
  }

  const processPayment = async () => {
    if (cart.length === 0) return
    if (!customer.firstName || !customer.lastName) return

    setLoading(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const transaction: Transaction = {
        id: `TXN${Date.now()}`,
        customer,
        items: cart,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        discount,
        total: calculateTotal(),
        paymentMethod,
        status: 'completed',
        timestamp: new Date().toISOString(),
        notes
      }

      setTransactions(prev => [transaction, ...prev])
      clearCart()

      // In a real app, you would print receipt here
      alert(`Payment processed successfully! Transaction ID: ${transaction.id}`)

    } catch (error) {
      console.error('Payment processing error:', error)
      alert('Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const printReceipt = (transaction: Transaction) => {
    const receiptContent = `
MODERN MEN BARBERSHOP
Point of Sale Receipt

Transaction ID: ${transaction.id}
Date: ${new Date(transaction.timestamp).toLocaleString()}

Customer: ${transaction.customer.firstName} ${transaction.customer.lastName}
${transaction.customer.phone ? `Phone: ${transaction.customer.phone}` : ''}
${transaction.customer.email ? `Email: ${transaction.customer.email}` : ''}

Items:
${transaction.items.map(item =>
  `${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}`
).join('\n')}

Subtotal: $${transaction.subtotal.toFixed(2)}
Tax: $${transaction.tax.toFixed(2)}
${transaction.discount > 0 ? `Discount: -$${((transaction.subtotal * transaction.discount) / 100).toFixed(2)}` : ''}
Total: $${transaction.total.toFixed(2)}

Payment Method: ${transaction.paymentMethod.toUpperCase()}

Thank you for your business!
Modern Men Barbershop
(555) 123-4567
    `

    // Create and download receipt
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${transaction.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const subtotal = calculateSubtotal()
  const tax = calculateTax()
  const total = calculateTotal()
  const change = calculateChange()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600">Process customer transactions and manage sales</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main POS Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customer.firstName}
                      onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customer.lastName}
                      onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customer.phone}
                      onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services and Products */}
            <Tabs defaultValue="services" className="space-y-4">
              <TabsList>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.category}</p>
                          </div>
                          <Badge variant="outline">${service.price}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{service.duration} min</p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => addToCart(service, 'service')}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <Badge variant="outline">${product.price}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Stock: {product.stock}</p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => addToCart(product, 'product')}
                          disabled={product.stock === 0}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Shopping Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>Items in current transaction</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cart is empty</p>
                    <p className="text-sm">Add services or products to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${item.type}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id, item.type)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="discount">Discount (%):</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                          className="w-20"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment & Transaction Summary */}
          <div className="space-y-6">
            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'split') => setPaymentMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="split">Split Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="space-y-2">
                    <Label htmlFor="cashReceived">Cash Received</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    {cashReceived && (
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Change:</span>
                          <span className={cn(change < 0 ? "text-red-600" : "text-green-600")}>
                            ${change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={processPayment}
                disabled={cart.length === 0 || !customer.firstName || !customer.lastName || loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="mr-2 h-4 w-4" />
                )}
                Process Payment - ${total.toFixed(2)}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
                disabled={cart.length === 0}
              >
                Clear Cart
              </Button>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            {transaction.customer.firstName} {transaction.customer.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant="outline">${transaction.total.toFixed(2)}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => printReceipt(transaction)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print Receipt
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}