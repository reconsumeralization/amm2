'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import {
  Star,
  ShoppingCart,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Heart,
  Eye,
  Award,
  Package,
  Filter,
  Grid3X3,
  List,
  X,
  Minus,
  Plus
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice?: number;
  category: string;
  stock: number;
  images: Array<{
    image: {
      url: string;
      alt?: string;
    };
  }>;
  tags: Array<{ tag: string }>;
  featured: boolean;
  bestseller: boolean;
  loyaltyPoints: number;
  specifications?: Array<{ name: string; value: string }>;
  benefits?: Array<{ benefit: string }>;
}

interface ProductShopProps {
  userId?: string;
  limit?: number;
  showRecommendations?: boolean;
}

export default function ProductShop({ userId, limit = 12, showRecommendations = true }: ProductShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        isActive: 'true',
        sort: sortBy,
      });

      if (category) {
        params.append('category', category);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.docs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [limit, sortBy, category, searchTerm]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/recommend?userId=${userId}&limit=6`);
      if (response.ok) {
        const data = await response.json();
        setRecommendedProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchProducts();
    if (showRecommendations && userId) {
      fetchRecommendations();
    }
  }, [category, searchTerm, sortBy, userId, showRecommendations, fetchProducts, fetchRecommendations]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create checkout session');

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      try {
        const stripe = await import('@stripe/stripe-js');
        const stripeInstance = await stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripeInstance) {
          await stripeInstance.redirectToCheckout({ sessionId });
        } else {
          throw new Error('Failed to load Stripe');
        }
      } catch (stripeError) {
        console.error('Stripe loading error:', stripeError);
        // Fallback: redirect to a custom checkout page or show error
        window.location.href = `/checkout/${sessionId}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate checkout');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const getDiscountPercentage = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grooming Products</h2>
          <p className="text-gray-600">Premium products for the modern gentleman</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCart(!showCart)}
            className="relative"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({cart.length})
            {cart.length > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* AI Recommendations */}
      {showRecommendations && recommendedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                formatPrice={formatPrice}
                getDiscountPercentage={getDiscountPercentage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="beard">Beard Care</SelectItem>
            <SelectItem value="hair">Hair Care</SelectItem>
            <SelectItem value="skin">Skin Care</SelectItem>
            <SelectItem value="styling">Styling Products</SelectItem>
            <SelectItem value="tools">Tools & Accessories</SelectItem>
            <SelectItem value="gifts">Gift Sets</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchProducts} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              formatPrice={formatPrice}
              getDiscountPercentage={getDiscountPercentage}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Shopping Cart</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCart(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src={item.product.images[0]?.image.url}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-500">{formatPrice(item.product.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold">{formatPrice(getCartTotal())}</span>
                    </div>
                    <Button onClick={handleCheckout} className="w-full">
                      Checkout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  formatPrice: (price: number) => string;
  getDiscountPercentage: (price: number, comparePrice?: number) => number;
}

function ProductCard({ product, onAddToCart, formatPrice, getDiscountPercentage }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const discountPercentage = getDiscountPercentage(product.price, product.comparePrice);

  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.images[0]?.image.url}
          alt={product.images[0]?.image.alt || product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          {product.featured && (
            <Badge className="bg-yellow-500 text-white text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {product.bestseller && (
            <Badge className="bg-orange-500 text-white text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Bestseller
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge className="bg-red-500 text-white text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute top-2 right-2 space-y-1 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Loyalty Points */}
        {product.loyaltyPoints > 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              <Award className="h-3 w-3 mr-1" />
              +{product.loyaltyPoints} pts
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <p className="text-xs text-gray-500 line-clamp-2">{product.shortDescription}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{formatPrice(product.price)}</span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {product.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag.tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
            
            <Button
              size="sm"
              onClick={() => onAddToCart(product)}
              disabled={product.stock === 0}
              className="text-xs"
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
