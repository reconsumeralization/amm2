import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoyaltyProgram {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
  pointsPerDollar: number
  pointsValue: number
  activeMembers?: number
  totalPointsIssued?: number
  tiers?: Array<{
    name: string
    minPoints: number
    benefits?: string[]
  }>
  createdAt: string
  updatedAt: string
}

export function useLoyaltyPrograms() {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setPrograms(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loyalty programs')
    } finally {
      setLoading(false)
    }
  }

  const createProgram = async (programData: Omit<LoyaltyProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('loyalty_programs')
        .insert(programData)
        .select()
        .single()

      if (error) throw error

      setPrograms(prev => [data, ...prev])
      return data
    } catch (err) {
      throw err
    }
  }

  const updateProgram = async (id: string, updates: Partial<LoyaltyProgram>) => {
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('loyalty_programs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setPrograms(prev => prev.map(program =>
        program.id === id ? data : program
      ))
      return data
    } catch (err) {
      throw err
    }
  }

  const deleteProgram = async (id: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('loyalty_programs')
        .delete()
        .eq('id', id)

      if (error) throw error

      setPrograms(prev => prev.filter(program => program.id !== id))
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  return {
    programs,
    loading,
    error,
    refetch: fetchPrograms,
    createProgram,
    updateProgram,
    deleteProgram
  }
}
