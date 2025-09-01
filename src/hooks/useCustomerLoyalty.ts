import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CustomerLoyalty {
  id: string
  customerId: string
  programId: string
  currentPoints: number
  totalPointsEarned: number
  tier: string
  status: 'active' | 'inactive'
  customer?: {
    name: string
    email: string
  }
  program?: {
    name: string
  }
  createdAt: string
  updatedAt: string
}

export function useCustomerLoyalty() {
  const [customerLoyalty, setCustomerLoyalty] = useState<CustomerLoyalty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomerLoyalty = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('customer_loyalty')
        .select(`
          *,
          customer:customer_id (
            name:full_name,
            email
          ),
          program:program_id (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setCustomerLoyalty(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer loyalty data')
    } finally {
      setLoading(false)
    }
  }

  const addPoints = async (customerId: string, points: number, reason: string) => {
    try {
      const supabase = createClient()

      // First, get current loyalty record
      const { data: loyaltyRecord, error: fetchError } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      if (loyaltyRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('customer_loyalty')
          .update({
            current_points: loyaltyRecord.current_points + points,
            total_points_earned: loyaltyRecord.total_points_earned + points
          })
          .eq('id', loyaltyRecord.id)
          .select()
          .single()

        if (error) throw error

        setCustomerLoyalty(prev => prev.map(item =>
          item.id === loyaltyRecord.id ? data : item
        ))

        // Log the transaction
        await supabase
          .from('loyalty_transactions')
          .insert({
            customer_id: customerId,
            points_change: points,
            reason,
            transaction_type: 'earned'
          })

        return data
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('customer_loyalty')
          .insert({
            customer_id: customerId,
            current_points: points,
            total_points_earned: points,
            tier: 'Bronze',
            status: 'active'
          })
          .select()
          .single()

        if (error) throw error

        setCustomerLoyalty(prev => [data, ...prev])

        // Log the transaction
        await supabase
          .from('loyalty_transactions')
          .insert({
            customer_id: customerId,
            points_change: points,
            reason,
            transaction_type: 'earned'
          })

        return data
      }
    } catch (err) {
      throw err
    }
  }

  const redeemPoints = async (customerId: string, points: number, reason: string) => {
    try {
      const supabase = createClient()

      // Get current loyalty record
      const { data: loyaltyRecord, error: fetchError } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single()

      if (fetchError) throw fetchError

      if (loyaltyRecord.current_points < points) {
        throw new Error('Insufficient points')
      }

      // Update points
      const { data, error } = await supabase
        .from('customer_loyalty')
        .update({
          current_points: loyaltyRecord.current_points - points
        })
        .eq('id', loyaltyRecord.id)
        .select()
        .single()

      if (error) throw error

      setCustomerLoyalty(prev => prev.map(item =>
        item.id === loyaltyRecord.id ? data : item
      ))

      // Log the transaction
      await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: customerId,
          points_change: -points,
          reason,
          transaction_type: 'redeemed'
        })

      return data
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchCustomerLoyalty()
  }, [])

  return {
    customerLoyalty,
    loading,
    error,
    refetch: fetchCustomerLoyalty,
    addPoints,
    redeemPoints
  }
}
