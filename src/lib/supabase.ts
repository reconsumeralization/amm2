import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to create a Supabase client with custom options
export function createSupabaseClient(accessToken?: string) {
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        ...(accessToken && { accessToken })
      }
    }
  )
}

// Database helper functions
export const db = {
  // User management
  users: {
    async getProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    },

    async updateProfile(userId: string, updates: any) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async createProfile(profile: any) {
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Appointments
  appointments: {
    async getUserAppointments(userId: string) {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          stylist:stylist_id (
            id,
            name,
            specialty
          )
        `)
        .eq('user_id', userId)
        .order('appointment_date', { ascending: true })

      if (error) throw error
      return data
    },

    async createAppointment(appointment: any) {
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async updateAppointment(appointmentId: string, updates: any) {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async cancelAppointment(appointmentId: string) {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  // Services
  services: {
    async getAllServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },

    async getServiceById(serviceId: string) {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (error) throw error
      return data
    }
  },

  // Stylists
  stylists: {
    async getAllStylists() {
      const { data, error } = await supabase
        .from('stylists')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },

    async getStylistById(stylistId: string) {
      const { data, error } = await supabase
        .from('stylists')
        .select('*')
        .eq('id', stylistId)
        .single()

      if (error) throw error
      return data
    },

    async getStylistAvailability(stylistId: string, date: string) {
      const { data, error } = await supabase
        .from('stylist_availability')
        .select('*')
        .eq('stylist_id', stylistId)
        .eq('date', date)

      if (error) throw error
      return data
    }
  },

  // Reviews
  reviews: {
    async getServiceReviews(serviceId: string) {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async createReview(review: any) {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }
}

// Realtime subscriptions
export const realtime = {
  // Subscribe to user appointments
  subscribeToUserAppointments(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_appointments_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to stylist availability
  subscribeToStylistAvailability(stylistId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`stylist_availability_${stylistId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stylist_availability',
          filter: `stylist_id=eq.${stylistId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to new reviews
  subscribeToServiceReviews(serviceId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`service_reviews_${serviceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reviews',
          filter: `service_id=eq.${serviceId}`
        },
        callback
      )
      .subscribe()
  }
}

// Storage helpers
export const storage = {
  // Upload file to storage
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (error) throw error
    return data
  },

  // Get public URL for file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  },

  // Delete file from storage
  async deleteFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return data
  }
}
