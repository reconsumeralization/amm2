export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          updated_at: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          updated_at?: string
          userId: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          updated_at?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          behavioural_traits: Json | null
          capabilities: Json | null
          compatible_tools: string[] | null
          configuration: Json | null
          created_at: string
          created_by: string | null
          current_task: string | null
          description: string | null
          id: string
          name: string
          performance_metrics: Json | null
          specialization: Json | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
        }
        Insert: {
          behavioural_traits?: Json | null
          capabilities?: Json | null
          compatible_tools?: string[] | null
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          current_task?: string | null
          description?: string | null
          id?: string
          name: string
          performance_metrics?: Json | null
          specialization?: Json | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
        }
        Update: {
          behavioural_traits?: Json | null
          capabilities?: Json | null
          compatible_tools?: string[] | null
          configuration?: Json | null
          created_at?: string
          created_by?: string | null
          current_task?: string | null
          description?: string | null
          id?: string
          name?: string
          performance_metrics?: Json | null
          specialization?: Json | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ai_situation_actions: {
        Row: {
          action_data: Json
          action_type: string
          created_at: string
          id: string
          result: Json | null
          situation_id: string
          status: string
          updated_at: string
        }
        Insert: {
          action_data: Json
          action_type: string
          created_at?: string
          id?: string
          result?: Json | null
          situation_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          action_data?: Json
          action_type?: string
          created_at?: string
          id?: string
          result?: Json | null
          situation_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_situation_actions_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "ai_situations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_situation_responses: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          response_type: string
          situation_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          response_type: string
          situation_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          response_type?: string
          situation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_situation_responses_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "ai_situations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_situations: {
        Row: {
          context: Json | null
          created_at: string
          description: string | null
          id: string
          severity: Database["public"]["Enums"]["ai_situation_severity"]
          situation_type: Database["public"]["Enums"]["ai_situation_type"]
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          severity: Database["public"]["Enums"]["ai_situation_severity"]
          situation_type: Database["public"]["Enums"]["ai_situation_type"]
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          severity?: Database["public"]["Enums"]["ai_situation_severity"]
          situation_type?: Database["public"]["Enums"]["ai_situation_type"]
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_configurations: {
        Row: {
          authentication: Json | null
          created_at: string
          docker_config_id: string | null
          endpoint: string | null
          id: string
          labels: Json | null
          metrics_path: string | null
          name: string
          provider: Database["public"]["Enums"]["analytics_provider"]
          scrape_interval: number | null
          status: string
          timeout: number | null
          updated_at: string
        }
        Insert: {
          authentication?: Json | null
          created_at?: string
          docker_config_id?: string | null
          endpoint?: string | null
          id?: string
          labels?: Json | null
          metrics_path?: string | null
          name: string
          provider: Database["public"]["Enums"]["analytics_provider"]
          scrape_interval?: number | null
          status?: string
          timeout?: number | null
          updated_at?: string
        }
        Update: {
          authentication?: Json | null
          created_at?: string
          docker_config_id?: string | null
          endpoint?: string | null
          id?: string
          labels?: Json | null
          metrics_path?: string | null
          name?: string
          provider?: Database["public"]["Enums"]["analytics_provider"]
          scrape_interval?: number | null
          status?: string
          timeout?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_configurations_docker_config_id_fkey"
            columns: ["docker_config_id"]
            isOneToOne: false
            referencedRelation: "docker_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_metrics: {
        Row: {
          config_id: string
          id: string
          labels: Json | null
          metric_name: string
          metric_type: string
          timestamp: string
          value: number
        }
        Insert: {
          config_id: string
          id?: string
          labels?: Json | null
          metric_name: string
          metric_type: string
          timestamp?: string
          value: number
        }
        Update: {
          config_id?: string
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_type?: string
          timestamp?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_metrics_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "analytics_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_thresholds: {
        Row: {
          component_type: string | null
          created_at: string
          critical_threshold: number
          description: string | null
          evaluation_period: string
          id: string
          metric_name: string
          severity: string | null
          updated_at: string
          warning_threshold: number
        }
        Insert: {
          component_type?: string | null
          created_at?: string
          critical_threshold: number
          description?: string | null
          evaluation_period: string
          id?: string
          metric_name: string
          severity?: string | null
          updated_at?: string
          warning_threshold: number
        }
        Update: {
          component_type?: string | null
          created_at?: string
          critical_threshold?: number
          description?: string | null
          evaluation_period?: string
          id?: string
          metric_name?: string
          severity?: string | null
          updated_at?: string
          warning_threshold?: number
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_title: string
          created_at: string
          customer_id: string | null
          date_time: string
          google_event_id: string | null
          id: string
          notes: string | null
          payment_status: string | null
          service: string
          status: string | null
          stripe_payment_intent_id: string | null
          stylist_id: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          appointment_title: string
          created_at?: string
          customer_id?: string | null
          date_time: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          service: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          stylist_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          appointment_title?: string
          created_at?: string
          customer_id?: string | null
          date_time?: string
          google_event_id?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          service?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
          stylist_id?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_stylist_id_fkey"
            columns: ["stylist_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changes: Json | null
          collection_name: string | null
          created_at: string
          doc_id: string | null
          duration: number | null
          error: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          payload: Json | null
          request_id: string | null
          severity: string | null
          tenant_id: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changes?: Json | null
          collection_name?: string | null
          created_at?: string
          doc_id?: string | null
          duration?: number | null
          error?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          payload?: Json | null
          request_id?: string | null
          severity?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changes?: Json | null
          collection_name?: string | null
          created_at?: string
          doc_id?: string | null
          duration?: number | null
          error?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          payload?: Json | null
          request_id?: string | null
          severity?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          analytics: Json | null
          author_id: string | null
          category: string | null
          content: Json | null
          created_at: string
          difficulty: string | null
          excerpt: string | null
          expires_at: string | null
          featured: boolean | null
          hero_id: string | null
          id: string
          is_public: boolean | null
          likes: number | null
          priority: string | null
          published: boolean | null
          published_at: string | null
          reading_time: number | null
          related_posts: Json | null
          scheduled_for: string | null
          seo: Json | null
          shares: number | null
          slug: string
          status: string | null
          tags: Json | null
          tenant_id: string | null
          title: string
          updated_at: string
          views: number | null
          workflow: Json | null
        }
        Insert: {
          analytics?: Json | null
          author_id?: string | null
          category?: string | null
          content?: Json | null
          created_at?: string
          difficulty?: string | null
          excerpt?: string | null
          expires_at?: string | null
          featured?: boolean | null
          hero_id?: string | null
          id?: string
          is_public?: boolean | null
          likes?: number | null
          priority?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          related_posts?: Json | null
          scheduled_for?: string | null
          seo?: Json | null
          shares?: number | null
          slug: string
          status?: string | null
          tags?: Json | null
          tenant_id?: string | null
          title: string
          updated_at?: string
          views?: number | null
          workflow?: Json | null
        }
        Update: {
          analytics?: Json | null
          author_id?: string | null
          category?: string | null
          content?: Json | null
          created_at?: string
          difficulty?: string | null
          excerpt?: string | null
          expires_at?: string | null
          featured?: boolean | null
          hero_id?: string | null
          id?: string
          is_public?: boolean | null
          likes?: number | null
          priority?: string | null
          published?: boolean | null
          published_at?: string | null
          reading_time?: number | null
          related_posts?: Json | null
          scheduled_for?: string | null
          seo?: Json | null
          shares?: number | null
          slug?: string
          status?: string | null
          tags?: Json | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
          views?: number | null
          workflow?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_hero_id_fkey"
            columns: ["hero_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      builder_animations: {
        Row: {
          categories: Json | null
          created_at: string
          created_by_id: string | null
          custom_iteration_count: number | null
          custom_timing_function: string | null
          delay: string | null
          description: string | null
          direction: string | null
          duration: string | null
          fill_mode: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          iteration_count: string | null
          keyframes: Json | null
          name: string
          preview: Json | null
          responsive: Json | null
          tags: Json | null
          tenant_id: string | null
          timing_function: string | null
          trigger: Json | null
          type: string | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          categories?: Json | null
          created_at?: string
          created_by_id?: string | null
          custom_iteration_count?: number | null
          custom_timing_function?: string | null
          delay?: string | null
          description?: string | null
          direction?: string | null
          duration?: string | null
          fill_mode?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          iteration_count?: string | null
          keyframes?: Json | null
          name: string
          preview?: Json | null
          responsive?: Json | null
          tags?: Json | null
          tenant_id?: string | null
          timing_function?: string | null
          trigger?: Json | null
          type?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          categories?: Json | null
          created_at?: string
          created_by_id?: string | null
          custom_iteration_count?: number | null
          custom_timing_function?: string | null
          delay?: string | null
          description?: string | null
          direction?: string | null
          duration?: string | null
          fill_mode?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          iteration_count?: string | null
          keyframes?: Json | null
          name?: string
          preview?: Json | null
          responsive?: Json | null
          tags?: Json | null
          tenant_id?: string | null
          timing_function?: string | null
          trigger?: Json | null
          type?: string | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "builder_animations_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_animations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      business_documentation: {
        Row: {
          acknowledgments: Json | null
          approved_at: string | null
          approved_by_id: string | null
          attachments: Json | null
          author_id: string | null
          category: string | null
          change_notes: string | null
          content: Json | null
          created_at: string
          download_count: number | null
          effective_date: string | null
          expiration_date: string | null
          id: string
          is_public: boolean | null
          keywords: string | null
          priority: string | null
          related_documents: Json | null
          requires_acknowledgment: boolean | null
          review_date: string | null
          reviewers: Json | null
          slug: string | null
          status: string | null
          subcategory: string | null
          summary: string | null
          tags: Json | null
          tenant_id: string | null
          title: string
          updated_at: string
          version: string | null
          version_history: Json | null
          view_count: number | null
        }
        Insert: {
          acknowledgments?: Json | null
          approved_at?: string | null
          approved_by_id?: string | null
          attachments?: Json | null
          author_id?: string | null
          category?: string | null
          change_notes?: string | null
          content?: Json | null
          created_at?: string
          download_count?: number | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_public?: boolean | null
          keywords?: string | null
          priority?: string | null
          related_documents?: Json | null
          requires_acknowledgment?: boolean | null
          review_date?: string | null
          reviewers?: Json | null
          slug?: string | null
          status?: string | null
          subcategory?: string | null
          summary?: string | null
          tags?: Json | null
          tenant_id?: string | null
          title: string
          updated_at?: string
          version?: string | null
          version_history?: Json | null
          view_count?: number | null
        }
        Update: {
          acknowledgments?: Json | null
          approved_at?: string | null
          approved_by_id?: string | null
          attachments?: Json | null
          author_id?: string | null
          category?: string | null
          change_notes?: string | null
          content?: Json | null
          created_at?: string
          download_count?: number | null
          effective_date?: string | null
          expiration_date?: string | null
          id?: string
          is_public?: boolean | null
          keywords?: string | null
          priority?: string | null
          related_documents?: Json | null
          requires_acknowledgment?: boolean | null
          review_date?: string | null
          reviewers?: Json | null
          slug?: string | null
          status?: string | null
          subcategory?: string | null
          summary?: string | null
          tags?: Json | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
          version?: string | null
          version_history?: Json | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_documentation_approved_by_id_fkey"
            columns: ["approved_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_documentation_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_documentation_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clock_records: {
        Row: {
          action: string
          created_at: string
          duration: number | null
          id: string
          is_manual_entry: boolean | null
          location: Json | null
          manual_entry_reason: string | null
          notes: string | null
          staff_id: string | null
          tenant_id: string | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          duration?: number | null
          id?: string
          is_manual_entry?: boolean | null
          location?: Json | null
          manual_entry_reason?: string | null
          notes?: string | null
          staff_id?: string | null
          tenant_id?: string | null
          timestamp: string
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          duration?: number | null
          id?: string
          is_manual_entry?: boolean | null
          location?: Json | null
          manual_entry_reason?: string | null
          notes?: string | null
          staff_id?: string | null
          tenant_id?: string | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clock_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clock_records_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      component_connections: {
        Row: {
          configuration: Json | null
          connection_type: string
          created_at: string
          id: string
          protocol: string | null
          source_component_id: string
          status: string
          target_component_id: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          connection_type: string
          created_at?: string
          id?: string
          protocol?: string | null
          source_component_id: string
          status?: string
          target_component_id: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          connection_type?: string
          created_at?: string
          id?: string
          protocol?: string | null
          source_component_id?: string
          status?: string
          target_component_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "component_connections_source_component_id_fkey"
            columns: ["source_component_id"]
            isOneToOne: false
            referencedRelation: "core_components"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "component_connections_target_component_id_fkey"
            columns: ["target_component_id"]
            isOneToOne: false
            referencedRelation: "core_components"
            referencedColumns: ["id"]
          },
        ]
      }
      context_monitors: {
        Row: {
          actions: string[]
          component_id: string
          configuration: Json | null
          created_at: string
          debounce_ms: number | null
          events: string[]
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          actions: string[]
          component_id: string
          configuration?: Json | null
          created_at?: string
          debounce_ms?: number | null
          events: string[]
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          actions?: string[]
          component_id?: string
          configuration?: Json | null
          created_at?: string
          debounce_ms?: number | null
          events?: string[]
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_monitors_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "core_components"
            referencedColumns: ["id"]
          },
        ]
      }
      context_providers: {
        Row: {
          component_id: string
          configuration: Json | null
          context_keys: Database["public"]["Enums"]["context_key"][]
          created_at: string
          id: string
          name: string
          processing_rules: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          component_id: string
          configuration?: Json | null
          context_keys: Database["public"]["Enums"]["context_key"][]
          created_at?: string
          id?: string
          name: string
          processing_rules?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          component_id?: string
          configuration?: Json | null
          context_keys?: Database["public"]["Enums"]["context_key"][]
          created_at?: string
          id?: string
          name?: string
          processing_rules?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_providers_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "core_components"
            referencedColumns: ["id"]
          },
        ]
      }
      core_components: {
        Row: {
          configuration: Json | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          id: string
          name: string
          status: string
          type: Database["public"]["Enums"]["component_type"]
          updated_at: string
          version: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          id?: string
          name: string
          status?: string
          type: Database["public"]["Enums"]["component_type"]
          updated_at?: string
          version?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          id?: string
          name?: string
          status?: string
          type?: Database["public"]["Enums"]["component_type"]
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean | null
          amount: number
          code: string
          created_at: string
          discount_type: string
          ends_at: string | null
          id: string
          max_uses: number | null
          starts_at: string | null
          tenant_id: string | null
          updated_at: string
          uses: number | null
        }
        Insert: {
          active?: boolean | null
          amount: number
          code: string
          created_at?: string
          discount_type: string
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          starts_at?: string | null
          tenant_id?: string | null
          updated_at?: string
          uses?: number | null
        }
        Update: {
          active?: boolean | null
          amount?: number
          code?: string
          created_at?: string
          discount_type?: string
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          starts_at?: string | null
          tenant_id?: string | null
          updated_at?: string
          uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      docker_configurations: {
        Row: {
          created_at: string
          daemon_type: Database["public"]["Enums"]["docker_daemon_type"]
          host: string
          id: string
          name: string
          port: number | null
          socket_path: string | null
          status: string
          tls_ca_path: string | null
          tls_cert_path: string | null
          tls_enabled: boolean
          tls_key_path: string | null
          tls_verify: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          daemon_type?: Database["public"]["Enums"]["docker_daemon_type"]
          host?: string
          id?: string
          name: string
          port?: number | null
          socket_path?: string | null
          status?: string
          tls_ca_path?: string | null
          tls_cert_path?: string | null
          tls_enabled?: boolean
          tls_key_path?: string | null
          tls_verify?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          daemon_type?: Database["public"]["Enums"]["docker_daemon_type"]
          host?: string
          id?: string
          name?: string
          port?: number | null
          socket_path?: string | null
          status?: string
          tls_ca_path?: string | null
          tls_cert_path?: string | null
          tls_enabled?: boolean
          tls_key_path?: string | null
          tls_verify?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component: string
          error_type: string
          id: string
          message: string
          metadata: Json | null
          span_id: string | null
          stack_trace: string | null
          timestamp: string
          trace_id: string | null
        }
        Insert: {
          component: string
          error_type: string
          id?: string
          message: string
          metadata?: Json | null
          span_id?: string | null
          stack_trace?: string | null
          timestamp?: string
          trace_id?: string | null
        }
        Update: {
          component?: string
          error_type?: string
          id?: string
          message?: string
          metadata?: Json | null
          span_id?: string | null
          stack_trace?: string | null
          timestamp?: string
          trace_id?: string | null
        }
        Relationships: []
      }
      gift_cards: {
        Row: {
          balance: number
          code: string
          created_at: string
          expiry_date: string | null
          id: string
          is_active: boolean | null
          issued_by_id: string | null
          issued_to: string | null
          tenant_id: string | null
          transactions: Json | null
          updated_at: string
        }
        Insert: {
          balance: number
          code: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issued_by_id?: string | null
          issued_to?: string | null
          tenant_id?: string | null
          transactions?: Json | null
          updated_at?: string
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          issued_by_id?: string | null
          issued_to?: string | null
          tenant_id?: string | null
          transactions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_issued_by_id_fkey"
            columns: ["issued_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      mcp_services: {
        Row: {
          configuration: Json | null
          created_at: string
          id: string
          methods: Json
          name: string
          namespace: string
          protocol: string
          status: string
          updated_at: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string
          id?: string
          methods: Json
          name: string
          namespace: string
          protocol?: string
          status?: string
          updated_at?: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string
          id?: string
          methods?: Json
          name?: string
          namespace?: string
          protocol?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          filename: string
          folder_id: string | null
          folder_path: string | null
          height: number | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          original_filename: string | null
          tags: Json | null
          tenant_id: string | null
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          folder_id?: string | null
          folder_path?: string | null
          height?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_filename?: string | null
          tags?: Json | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          folder_id?: string | null
          folder_path?: string | null
          height?: number | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          original_filename?: string | null
          tags?: Json | null
          tenant_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          component: string
          duration_ms: number | null
          id: string
          labels: Json | null
          metadata: Json | null
          metric_name: string
          metric_value: number
          timestamp: string
        }
        Insert: {
          component: string
          duration_ms?: number | null
          id?: string
          labels?: Json | null
          metadata?: Json | null
          metric_name: string
          metric_value: number
          timestamp?: string
        }
        Update: {
          component?: string
          duration_ms?: number | null
          id?: string
          labels?: Json | null
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          timestamp?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          expires_at: string | null
          granted: boolean
          granted_by: string | null
          id: string
          level: string
          resource: string
          revocation_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          expires_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          level: string
          resource: string
          revocation_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          expires_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          level?: string
          resource?: string
          revocation_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          published_at: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          published_at?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          birth_date: string | null
          created_at: string | null
          id: string
          location: string | null
          preferences: Json | null
          social_links: Json | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          id: string
          location?: string | null
          preferences?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          preferences?: Json | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding_vector: string | null
          id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding_vector?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding_vector?: string | null
          id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "rag_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      rag_documents: {
        Row: {
          content: string
          created_at: string
          document_type: Database["public"]["Enums"]["rag_document_type"]
          embedding_model: Database["public"]["Enums"]["rag_embedding_model"]
          embedding_vector: string | null
          id: string
          metadata: Json | null
          source_path: string | null
          source_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          document_type: Database["public"]["Enums"]["rag_document_type"]
          embedding_model: Database["public"]["Enums"]["rag_embedding_model"]
          embedding_vector?: string | null
          id?: string
          metadata?: Json | null
          source_path?: string | null
          source_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          document_type?: Database["public"]["Enums"]["rag_document_type"]
          embedding_model?: Database["public"]["Enums"]["rag_embedding_model"]
          embedding_vector?: string | null
          id?: string
          metadata?: Json | null
          source_path?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      rag_metadata_fields: {
        Row: {
          created_at: string
          data_type: string
          description: string | null
          id: string
          is_required: boolean | null
          name: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          data_type: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: []
      }
      rules: {
        Row: {
          created_at: string
          description: string
          guidance: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          name: string
          placeholders: Json | null
          priority: string
          rule_id: string | null
          trigger_condition: Json
          trigger_count: number
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          guidance: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name: string
          placeholders?: Json | null
          priority: string
          rule_id?: string | null
          trigger_condition: Json
          trigger_count?: number
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          guidance?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          name?: string
          placeholders?: Json | null
          priority?: string
          rule_id?: string | null
          trigger_condition?: Json
          trigger_count?: number
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      schema_properties: {
        Row: {
          created_at: string
          default_value: string | null
          description: string | null
          id: string
          is_required: boolean
          name: string
          schema_id: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          schema_id: string
          type: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          schema_id?: string
          type?: Database["public"]["Enums"]["property_type"]
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "schema_properties_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "tool_schemas"
            referencedColumns: ["id"]
          },
        ]
      }
      security_policies: {
        Row: {
          component_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          level: Database["public"]["Enums"]["security_level"]
          permissions: Json
          updated_at: string
        }
        Insert: {
          component_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level: Database["public"]["Enums"]["security_level"]
          permissions: Json
          updated_at?: string
        }
        Update: {
          component_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          level?: Database["public"]["Enums"]["security_level"]
          permissions?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_policies_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "core_components"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_minutes: number
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          expires: string
          id: string
          sessionToken: string
          updated_at: string
          userId: string
        }
        Insert: {
          created_at?: string
          expires: string
          id?: string
          sessionToken: string
          updated_at?: string
          userId: string
        }
        Update: {
          created_at?: string
          expires?: string
          id?: string
          sessionToken?: string
          updated_at?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_schedules: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_recurring: boolean | null
          location: string | null
          notes: string | null
          recurrence_pattern: Json | null
          staff_id: string | null
          start_time: string
          status: string | null
          tenant_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          notes?: string | null
          recurrence_pattern?: Json | null
          staff_id?: string | null
          start_time: string
          status?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          notes?: string | null
          recurrence_pattern?: Json | null
          staff_id?: string | null
          start_time?: string
          status?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_events: {
        Row: {
          component: string
          data: Json
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          timestamp: string
          trace_id: string | null
          user_id: string | null
        }
        Insert: {
          component: string
          data: Json
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string
          trace_id?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string
          data?: Json
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          timestamp?: string
          trace_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          email: string
          id: string
          last_activity: string | null
          name: string
          status: string
          subscription_plan: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_activity?: string | null
          name: string
          status?: string
          subscription_plan?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_activity?: string | null
          name?: string
          status?: string
          subscription_plan?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tool_calls: {
        Row: {
          call_id: string
          created_at: string
          id: string
          is_last_message: boolean
          is_streaming: boolean
          params: Json
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          call_id: string
          created_at?: string
          id?: string
          is_last_message?: boolean
          is_streaming?: boolean
          params: Json
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          call_id?: string
          created_at?: string
          id?: string
          is_last_message?: boolean
          is_streaming?: boolean
          params?: Json
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_calls_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_definitions: {
        Row: {
          category: Database["public"]["Enums"]["tool_category"]
          configuration: Json | null
          created_at: string
          description: string | null
          id: string
          is_streaming: boolean
          name: string
          requires_approval: boolean
          status: string
          type: Database["public"]["Enums"]["tool_type"]
          updated_at: string
          version: string
        }
        Insert: {
          category: Database["public"]["Enums"]["tool_category"]
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_streaming?: boolean
          name: string
          requires_approval?: boolean
          status?: string
          type: Database["public"]["Enums"]["tool_type"]
          updated_at?: string
          version?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["tool_category"]
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_streaming?: boolean
          name?: string
          requires_approval?: boolean
          status?: string
          type?: Database["public"]["Enums"]["tool_type"]
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      tool_errors: {
        Row: {
          client_message: string | null
          created_at: string
          error_type: string
          id: string
          model_message: string | null
          stack_trace: string | null
          tool_call_id: string
        }
        Insert: {
          client_message?: string | null
          created_at?: string
          error_type: string
          id?: string
          model_message?: string | null
          stack_trace?: string | null
          tool_call_id: string
        }
        Update: {
          client_message?: string | null
          created_at?: string
          error_type?: string
          id?: string
          model_message?: string | null
          stack_trace?: string | null
          tool_call_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_errors_tool_call_id_fkey"
            columns: ["tool_call_id"]
            isOneToOne: false
            referencedRelation: "tool_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_results: {
        Row: {
          created_at: string
          error: Json | null
          execution_time_ms: number | null
          id: string
          result: Json | null
          status: string
          tool_call_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error?: Json | null
          execution_time_ms?: number | null
          id?: string
          result?: Json | null
          status?: string
          tool_call_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error?: Json | null
          execution_time_ms?: number | null
          id?: string
          result?: Json | null
          status?: string
          tool_call_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_results_tool_call_id_fkey"
            columns: ["tool_call_id"]
            isOneToOne: false
            referencedRelation: "tool_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_schemas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          required_fields: string[] | null
          status: string
          tool_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          required_fields?: string[] | null
          status?: string
          tool_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          required_fields?: string[] | null
          status?: string
          tool_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_schemas_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tool_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          author: string | null
          created_at: string
          description: string | null
          execution_count: number
          id: string
          implementation: Json
          inputs: Json | null
          is_active: boolean
          name: string
          outputs: Json | null
          permissions: Json | null
          status: Database["public"]["Enums"]["tool_status"]
          tool_id: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          author?: string | null
          created_at?: string
          description?: string | null
          execution_count?: number
          id?: string
          implementation: Json
          inputs?: Json | null
          is_active?: boolean
          name: string
          outputs?: Json | null
          permissions?: Json | null
          status?: Database["public"]["Enums"]["tool_status"]
          tool_id?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          author?: string | null
          created_at?: string
          description?: string | null
          execution_count?: number
          id?: string
          implementation?: Json
          inputs?: Json | null
          is_active?: boolean
          name?: string
          outputs?: Json | null
          permissions?: Json | null
          status?: Database["public"]["Enums"]["tool_status"]
          tool_id?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string | null
          filename: string
          id: string
          mime_type: string
          original_name: string
          size: number
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filename: string
          id?: string
          mime_type: string
          original_name: string
          size: number
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filename?: string
          id?: string
          mime_type?: string
          original_name?: string
          size?: number
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: string | null
          id: string
          image: string | null
          name: string | null
          password: string | null
          role: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          password?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string | null
          password?: string | null
          role?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          created_at: string
          expires: string
          identifier: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires: string
          identifier: string
          token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires?: string
          identifier?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          endpoint_url: string
          events: string[] | null
          filter: Json | null
          headers: Json | null
          id: string
          name: string
          secret: string | null
          status: Database["public"]["Enums"]["webhook_status"]
          target_system: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          endpoint_url: string
          events?: string[] | null
          filter?: Json | null
          headers?: Json | null
          id?: string
          name: string
          secret?: string | null
          status?: Database["public"]["Enums"]["webhook_status"]
          target_system?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          endpoint_url?: string
          events?: string[] | null
          filter?: Json | null
          headers?: Json | null
          id?: string
          name?: string
          secret?: string | null
          status?: Database["public"]["Enums"]["webhook_status"]
          target_system?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          connections: Json | null
          created_at: string
          created_by: string | null
          definition: Json
          description: string | null
          id: string
          last_modified: string | null
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          steps: Json | null
          updated_at: string
          version: string | null
        }
        Insert: {
          connections?: Json | null
          created_at?: string
          created_by?: string | null
          definition: Json
          description?: string | null
          id?: string
          last_modified?: string | null
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          steps?: Json | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          connections?: Json | null
          created_at?: string
          created_by?: string | null
          definition?: Json
          description?: string | null
          id?: string
          last_modified?: string | null
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          steps?: Json | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      agent_status: "ACTIVE" | "INACTIVE" | "ERROR" | "MAINTENANCE"
      ai_situation_severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL"
      ai_situation_type:
        | "ERROR_HANDLING"
        | "USER_INTERACTION"
        | "SYSTEM_STATE"
        | "PERFORMANCE_ISSUE"
        | "SECURITY_ALERT"
        | "DATA_VALIDATION"
        | "API_INTEGRATION"
        | "CUSTOM"
      analytics_provider: "docker" | "prometheus" | "custom"
      component_interaction_type:
        | "tool_invocation"
        | "agent_assignment"
        | "workflow_step"
        | "webhook_trigger"
        | "rule_evaluation"
        | "resource_usage"
        | "mcp_request"
        | "database_query"
        | "file_system_access"
        | "api_call"
        | "cache_access"
      component_type:
        | "IDEExt"
        | "AICore"
        | "RulesEngine"
        | "AVB"
        | "CMPServer"
        | "MCPSrvs"
        | "Telemetry"
        | "Security"
        | "CtxProvider"
        | "MCPPool"
      context_key:
        | "editor"
        | "ws"
        | "diag"
        | "rules"
        | "codeIntel"
        | "telemetry"
      docker_daemon_type: "tcp" | "unix" | "npipe"
      log_level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "FATAL"
      log_source:
        | "AGENT"
        | "WORKFLOW"
        | "SYSTEM"
        | "TOOL"
        | "TELEMETRY"
        | "WEBHOOK"
        | "API"
        | "MCP"
      property_type: "string" | "number" | "boolean" | "array" | "object"
      rag_document_type:
        | "TEXT"
        | "CODE"
        | "MARKDOWN"
        | "JSON"
        | "YAML"
        | "SQL"
        | "CONFIG"
        | "LOG"
        | "OTHER"
      rag_embedding_model:
        | "OPENAI_ADA_002"
        | "COHERE_MULTILINGUAL"
        | "HUGGINGFACE_MINILM"
        | "CUSTOM"
      security_level: "RO" | "FSRead" | "FSWrite" | "ProcExec" | "Config"
      tool_category: "CLIENT_SIDE" | "BUILTIN" | "COMPOSER"
      tool_status: "ACTIVE" | "INACTIVE" | "DEPRECATED" | "BETA"
      tool_type:
        | "READ_SEMRCH_FILES"
        | "READ_FILE_FOR_IMPORTS"
        | "RIPGREP_RCH"
        | "RUN_TERMINAL_COMMAND"
        | "RUN_TERMINAL_COMMAND_V2"
        | "READ_FILE"
        | "LIST_DIR"
        | "EDIT_FILE"
        | "FILE_RCH"
        | "SEMANTIC_RCH_FULL"
        | "CREATE_FILE"
        | "DELETE_FILE"
        | "REAPPLY"
        | "GET_RELATED_FILES"
        | "PARALLEL_APPLY"
        | "FETCH_RULES"
        | "PLANNER"
        | "WEB_RCH"
        | "MCP"
        | "WEB_VIEWER"
        | "DIFF_HISTORY"
        | "IMPLEMENTER"
        | "RCH_SYMBOLS"
        | "BACKGROUND_COMPOSER_FOLLOWUP"
        | "RCH"
        | "READ_CHUNK"
        | "GOTODEF"
        | "EDIT"
        | "NEW_EDIT"
        | "UNDO_EDIT"
        | "END"
        | "NEW_FILE"
        | "ADD_TEST"
        | "RUN_TEST"
        | "DELETE_TEST"
        | "GET_TESTS"
        | "SAVE_FILE"
        | "GET_SYMBOLS"
        | "SEMANTIC_RCH"
        | "GET_PROJECT_STRUCTURE"
        | "CREATE_RM_FILES"
        | "RUN_TERMINAL_COMMANDS"
        | "READ_WITH_LINTER"
        | "ADD_FILE_TO_CONTEXT"
        | "REMOVE_FILE_FROM_CONTEXT"
        | "SEMANTIC_RCH_CODEBASE"
        | "ITERATE"
      trigger_type: "static" | "dynamic" | "context"
      webhook_status: "ACTIVE" | "INACTIVE" | "FAILED"
      workflow_status: "DRAFT" | "ACTIVE" | "PAUSED" | "ARCHIVED" | "ERROR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_status: ["ACTIVE", "INACTIVE", "ERROR", "MAINTENANCE"],
      ai_situation_severity: ["INFO", "WARNING", "ERROR", "CRITICAL"],
      ai_situation_type: [
        "ERROR_HANDLING",
        "USER_INTERACTION",
        "SYSTEM_STATE",
        "PERFORMANCE_ISSUE",
        "SECURITY_ALERT",
        "DATA_VALIDATION",
        "API_INTEGRATION",
        "CUSTOM",
      ],
      analytics_provider: ["docker", "prometheus", "custom"],
      component_interaction_type: [
        "tool_invocation",
        "agent_assignment",
        "workflow_step",
        "webhook_trigger",
        "rule_evaluation",
        "resource_usage",
        "mcp_request",
        "database_query",
        "file_system_access",
        "api_call",
        "cache_access",
      ],
      component_type: [
        "IDEExt",
        "AICore",
        "RulesEngine",
        "AVB",
        "CMPServer",
        "MCPSrvs",
        "Telemetry",
        "Security",
        "CtxProvider",
        "MCPPool",
      ],
      context_key: ["editor", "ws", "diag", "rules", "codeIntel", "telemetry"],
      docker_daemon_type: ["tcp", "unix", "npipe"],
      log_level: ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"],
      log_source: [
        "AGENT",
        "WORKFLOW",
        "SYSTEM",
        "TOOL",
        "TELEMETRY",
        "WEBHOOK",
        "API",
        "MCP",
      ],
      property_type: ["string", "number", "boolean", "array", "object"],
      rag_document_type: [
        "TEXT",
        "CODE",
        "MARKDOWN",
        "JSON",
        "YAML",
        "SQL",
        "CONFIG",
        "LOG",
        "OTHER",
      ],
      rag_embedding_model: [
        "OPENAI_ADA_002",
        "COHERE_MULTILINGUAL",
        "HUGGINGFACE_MINILM",
        "CUSTOM",
      ],
      security_level: ["RO", "FSRead", "FSWrite", "ProcExec", "Config"],
      tool_category: ["CLIENT_SIDE", "BUILTIN", "COMPOSER"],
      tool_status: ["ACTIVE", "INACTIVE", "DEPRECATED", "BETA"],
      tool_type: [
        "READ_SEMRCH_FILES",
        "READ_FILE_FOR_IMPORTS",
        "RIPGREP_RCH",
        "RUN_TERMINAL_COMMAND",
        "RUN_TERMINAL_COMMAND_V2",
        "READ_FILE",
        "LIST_DIR",
        "EDIT_FILE",
        "FILE_RCH",
        "SEMANTIC_RCH_FULL",
        "CREATE_FILE",
        "DELETE_FILE",
        "REAPPLY",
        "GET_RELATED_FILES",
        "PARALLEL_APPLY",
        "FETCH_RULES",
        "PLANNER",
        "WEB_RCH",
        "MCP",
        "WEB_VIEWER",
        "DIFF_HISTORY",
        "IMPLEMENTER",
        "RCH_SYMBOLS",
        "BACKGROUND_COMPOSER_FOLLOWUP",
        "RCH",
        "READ_CHUNK",
        "GOTODEF",
        "EDIT",
        "NEW_EDIT",
        "UNDO_EDIT",
        "END",
        "NEW_FILE",
        "ADD_TEST",
        "RUN_TEST",
        "DELETE_TEST",
        "GET_TESTS",
        "SAVE_FILE",
        "GET_SYMBOLS",
        "SEMANTIC_RCH",
        "GET_PROJECT_STRUCTURE",
        "CREATE_RM_FILES",
        "RUN_TERMINAL_COMMANDS",
        "READ_WITH_LINTER",
        "ADD_FILE_TO_CONTEXT",
        "REMOVE_FILE_FROM_CONTEXT",
        "SEMANTIC_RCH_CODEBASE",
        "ITERATE",
      ],
      trigger_type: ["static", "dynamic", "context"],
      webhook_status: ["ACTIVE", "INACTIVE", "FAILED"],
      workflow_status: ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED", "ERROR"],
    },
  },
} as const

