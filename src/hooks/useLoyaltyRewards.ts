import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoyaltyReward {
  id: string
  name: string
  description?: string
  type: 'discount_percentage' | 'discount_fixed' | 'free_service' | 'free_product'
  pointsRequired: number
  value?: number // For discount amounts
  isActive: boolean
  maxRedemptions?: number
  redemptionsUsed?: number
  createdAt: string
  updatedAt: string
}

export function useLoyaltyRewards() {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRewards = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setRewards(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loyalty rewards')
    } finally {
      setLoading(false)
    }
  }

  const createReward = async (rewardData: Omit<LoyaltyReward, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('loyalty_rewards')
        .insert(rewardData)
        .select()
        .single()

      if (error) throw error

      setRewards(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err
    }
  }

  const updateReward = async (id: string, updates: Partial<LoyaltyReward>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('loyalty_rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setRewards(prev => prev.map(reward =>
        reward.id === id ? data : reward
      ))
      return data
    } catch (err) {
      throw err
    }
  }

  const deleteReward = async (id: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('loyalty_rewards')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRewards(prev => prev.filter(reward => reward.id !== id))
    } catch (err) {
      throw err
    }
  }

  const redeemReward = async (rewardId: string, customerId: string) => {
    try {
      const supabase = createClient()

      // Get reward details
      const { data: reward, error: rewardError } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('id', rewardId)
        .single()

      if (rewardError) throw rewardError

      // Get customer loyalty
      const { data: loyalty, error: loyaltyError } = await supabase
        .from('customer_loyalty')
        .select('*')
        .eq('customer_id', customerId)
        .single()

      if (loyaltyError) throw loyaltyError

      // Check if customer has enough points
      if (loyalty.current_points < reward.points_required) {
        throw new Error('Insufficient points for this reward')
      }

      // Check max redemptions
      if (reward.max_redemptions && (reward.redemptions_used || 0) >= reward.max_redemptions) {
        throw new Error('This reward has reached maximum redemptions')
      }

      // Redeem points
      await supabase
        .from('customer_loyalty')
        .update({
          current_points: loyalty.current_points - reward.points_required
        })
        .eq('id', loyalty.id)

      // Update redemption count
      await supabase
        .from('loyalty_rewards')
        .update({
          redemptions_used: (reward.redemptions_used || 0) + 1
        })
        .eq('id', rewardId)

      // Log transaction
      await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: customerId,
          points_change: -reward.points_required,
          reason: `Redeemed ${reward.name}`,
          transaction_type: 'redeemed'
        })

      // Create redemption record
      const { data: redemption, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert({
          customer_id: customerId,
          reward_id: rewardId,
          points_used: reward.points_required
        })
        .select()
        .single()

      if (redemptionError) throw redemptionError

      return redemption
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  return {
    rewards,
    loading,
    error,
    refetch: fetchRewards,
    createReward,
    updateReward,
    deleteReward,
    redeemReward
  }
}
