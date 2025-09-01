import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Sale {
  id: string
  customerId?: string
  items: Array<{
    serviceId?: string
    productId?: string
    quantity: number
    price: number
    name: string
  }>
  total: number
  paymentMethod: 'cash' | 'card' | 'online'
  status: 'completed' | 'pending' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSales = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSales(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  const createSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single()

      if (error) throw error

      setSales(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err
    }
  }

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setSales(prev => prev.map(sale =>
        sale.id === id ? data : sale
      ))
      return data
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchSales()
  }, [])

  return {
    sales,
    loading,
    error,
    refetch: fetchSales,
    createSale,
    updateSale
  }
}
