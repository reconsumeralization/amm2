export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          stylist_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          total_price: number
          duration_minutes: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          stylist_id: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          total_price: number
          duration_minutes: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          stylist_id?: string
          service_id?: string
          appointment_date?: string
          appointment_time?: string
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          total_price?: number
          duration_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          address: Json | null
          preferences: Json | null
          is_active: boolean
          last_login: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: Json | null
          preferences?: Json | null
          is_active?: boolean
          last_login?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          address?: Json | null
          preferences?: Json | null
          is_active?: boolean
          last_login?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          service_id: string
          stylist_id: string | null
          rating: number
          comment: string | null
          is_verified: boolean
          helpful_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          service_id: string
          stylist_id?: string | null
          rating: number
          comment?: string | null
          is_verified?: boolean
          helpful_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          service_id?: string
          stylist_id?: string | null
          rating?: number
          comment?: string | null
          is_verified?: boolean
          helpful_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          category: string
          is_active: boolean
          image_url: string | null
          features: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          duration_minutes: number
          category: string
          is_active?: boolean
          image_url?: string | null
          features?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          category?: string
          is_active?: boolean
          image_url?: string | null
          features?: Json | null
        }
        Relationships: []
      }
      stylist_availability: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          stylist_id: string
          date: string
          start_time: string
          end_time: string
          is_available: boolean
          booked_slots: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          stylist_id: string
          date: string
          start_time: string
          end_time: string
          is_available?: boolean
          booked_slots?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          stylist_id?: string
          date?: string
          start_time?: string
          end_time?: string
          is_available?: boolean
          booked_slots?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "stylist_availability_stylist_id_fkey"
            columns: ["stylist_id"]
            referencedRelation: "stylists"
            referencedColumns: ["id"]
          }
        ]
      }
      stylists: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          bio: string | null
          specialty: string[]
          experience_years: number
          rating: number
          review_count: number
          avatar_url: string | null
          is_active: boolean
          working_hours: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          bio?: string | null
          specialty?: string[]
          experience_years?: number
          rating?: number
          review_count?: number
          avatar_url?: string | null
          is_active?: boolean
          working_hours?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          bio?: string | null
          specialty?: string[]
          experience_years?: number
          rating?: number
          review_count?: number
          avatar_url?: string | null
          is_active?: boolean
          working_hours?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Common types
export type Profile = Tables<'profiles'>
export type Appointment = Tables<'appointments'>
export type Service = Tables<'services'>
export type Stylist = Tables<'stylists'>
export type Review = Tables<'reviews'>
export type StylistAvailability = Tables<'stylist_availability'>

// Insert types
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertAppointment = Database['public']['Tables']['appointments']['Insert']
export type InsertService = Database['public']['Tables']['services']['Insert']
export type InsertStylist = Database['public']['Tables']['stylists']['Insert']
export type InsertReview = Database['public']['Tables']['reviews']['Insert']

// Update types
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateAppointment = Database['public']['Tables']['appointments']['Update']
export type UpdateService = Database['public']['Tables']['services']['Update']
export type UpdateStylist = Database['public']['Tables']['stylists']['Update']
export type UpdateReview = Database['public']['Tables']['reviews']['Update']
