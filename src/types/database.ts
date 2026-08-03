export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      og_audit_logs: {
        Row: {
          action: string
          actor_email: string
          actor_id: string | null
          actor_role: string
          created_at: string
          id: string
          metadata: Json
          summary: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_email: string
          actor_id?: string | null
          actor_role: string
          created_at?: string
          id?: string
          metadata?: Json
          summary: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_email?: string
          actor_id?: string | null
          actor_role?: string
          created_at?: string
          id?: string
          metadata?: Json
          summary?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      og_catalog_terms: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          label: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      og_custom_guide_sections: {
        Row: {
          body: string
          cta_href: string
          cta_label: string
          hero_image: string
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          subtitle: string
          summary: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string
          cta_href?: string
          cta_label?: string
          hero_image?: string
          id: string
          is_published?: boolean
          slug: string
          sort_order?: number
          subtitle?: string
          summary?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          cta_href?: string
          cta_label?: string
          hero_image?: string
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          subtitle?: string
          summary?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      og_custom_headwear_options: {
        Row: {
          description: string
          id: string
          is_published: boolean
          label: string
          option_group: string
          order_sheet_product_type: string
          price_modifier: number
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string
          id: string
          is_published?: boolean
          label?: string
          option_group: string
          order_sheet_product_type?: string
          price_modifier?: number
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string
          id?: string
          is_published?: boolean
          label?: string
          option_group?: string
          order_sheet_product_type?: string
          price_modifier?: number
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      og_custom_template_slots: {
        Row: {
          category: string
          description: string
          file_name: string
          file_url: string
          format: string
          id: string
          is_published: boolean
          name: string
          preview_image_url: string | null
          storage_kind: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          description?: string
          file_name?: string
          file_url?: string
          format?: string
          id: string
          is_published?: boolean
          name?: string
          preview_image_url?: string | null
          storage_kind?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          description?: string
          file_name?: string
          file_url?: string
          format?: string
          id?: string
          is_published?: boolean
          name?: string
          preview_image_url?: string | null
          storage_kind?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      og_product_reviews: {
        Row: {
          id: string
          product_id: string
          product_name: string
          order_id: string
          customer_id: string | null
          customer_name: string
          customer_email: string
          rating: number
          title: string
          body: string
          image_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          product_name: string
          order_id: string
          customer_id?: string | null
          customer_name: string
          customer_email: string
          rating: number
          title: string
          body: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          product_name?: string
          order_id?: string
          customer_id?: string | null
          customer_name?: string
          customer_email?: string
          rating?: number
          title?: string
          body?: string
          image_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      og_orders: {
        Row: {
          created_at: string
          currency: string
          custom_payload: Json | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          line_items: Json | null
          order_type: string
          payment_method: string | null
          payment_proof_url: string | null
          payment_provider: string | null
          payment_provider_ref: string | null
          payment_status: string
          shipping_centavos: number
          shipping_info: Json | null
          status: string
          subtotal_centavos: number | null
          tax_centavos: number
          total_centavos: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          custom_payload?: Json | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id: string
          line_items?: Json | null
          order_type: string
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_provider?: string | null
          payment_provider_ref?: string | null
          payment_status?: string
          shipping_centavos?: number
          shipping_info?: Json | null
          status: string
          subtotal_centavos?: number | null
          tax_centavos?: number
          total_centavos?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          custom_payload?: Json | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          line_items?: Json | null
          order_type?: string
          payment_method?: string | null
          payment_proof_url?: string | null
          payment_provider?: string | null
          payment_provider_ref?: string | null
          payment_status?: string
          shipping_centavos?: number
          shipping_info?: Json | null
          status?: string
          subtotal_centavos?: number | null
          tax_centavos?: number
          total_centavos?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "og_order_quote_internal_notes_order_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "og_order_quote_internal_notes"
            referencedColumns: ["order_id"]
          },
        ]
      }
      og_order_quote_internal_notes: {
        Row: {
          order_id: string
          notes: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          order_id: string
          notes?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          order_id?: string
          notes?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "og_order_quote_internal_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "og_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      og_payment_settings: {
        Row: {
          cod_checkout_description: string
          cod_enabled: boolean
          gcash_instructions: string
          gcash_qr_image_url: string
          id: string
          paymongo_checkout_description: string
          paymongo_enabled: boolean
          paymongo_mode: string
          paymongo_public_key: string | null
          updated_at: string
        }
        Insert: {
          cod_checkout_description?: string
          cod_enabled?: boolean
          gcash_instructions?: string
          gcash_qr_image_url?: string
          id?: string
          paymongo_checkout_description?: string
          paymongo_enabled?: boolean
          paymongo_mode?: string
          paymongo_public_key?: string | null
          updated_at?: string
        }
        Update: {
          cod_checkout_description?: string
          cod_enabled?: boolean
          gcash_instructions?: string
          gcash_qr_image_url?: string
          id?: string
          paymongo_checkout_description?: string
          paymongo_enabled?: boolean
          paymongo_mode?: string
          paymongo_public_key?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      og_payment_transactions: {
        Row: {
          amount_centavos: number
          created_at: string
          currency: string
          id: string
          metadata: Json
          order_id: string
          order_type: string
          payment_method: string | null
          provider: string
          provider_checkout_session_id: string | null
          provider_payment_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_centavos: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          order_id: string
          order_type: string
          payment_method?: string | null
          provider?: string
          provider_checkout_session_id?: string | null
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_centavos?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          order_id?: string
          order_type?: string
          payment_method?: string | null
          provider?: string
          provider_checkout_session_id?: string | null
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      og_plan_cards: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          label: string
          notes: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          label?: string
          notes?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          label?: string
          notes?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      og_portal_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          last_login_at: string | null
          name: string
          phone: string | null
          role: string
          shipping_info: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          last_login_at?: string | null
          name: string
          phone?: string | null
          role: string
          shipping_info?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          last_login_at?: string | null
          name?: string
          phone?: string | null
          role?: string
          shipping_info?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      og_products: {
        Row: {
          base_price: number
          category: string
          collection_ids: string[] | null
          colors: Json | null
          created_at: string
          cut: string
          description: string
          fabric_type: string
          fit: string | null
          gallery: string[] | null
          home_best_seller_rank: number | null
          id: string
          image: string
          material: string
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          short_description: string | null
          size_range: string | null
          sizes: string[] | null
          slug: string
          sold: number
          sports: string[]
          status: string
          stock: number | null
          tag: string | null
          tags: string[]
          updated_at: string
          variants: Json | null
        }
        Insert: {
          base_price: number
          category: string
          collection_ids?: string[] | null
          colors?: Json | null
          created_at?: string
          cut?: string
          description?: string
          fabric_type?: string
          fit?: string | null
          gallery?: string[] | null
          home_best_seller_rank?: number | null
          id: string
          image?: string
          material?: string
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price: number
          short_description?: string | null
          size_range?: string | null
          sizes?: string[] | null
          slug: string
          sold?: number
          sports?: string[]
          status?: string
          stock?: number | null
          tag?: string | null
          tags?: string[]
          updated_at?: string
          variants?: Json | null
        }
        Update: {
          base_price?: number
          category?: string
          collection_ids?: string[] | null
          colors?: Json | null
          created_at?: string
          cut?: string
          description?: string
          fabric_type?: string
          fit?: string | null
          gallery?: string[] | null
          home_best_seller_rank?: number | null
          id?: string
          image?: string
          material?: string
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          short_description?: string | null
          size_range?: string | null
          sizes?: string[] | null
          slug?: string
          sold?: number
          sports?: string[]
          status?: string
          stock?: number | null
          tag?: string | null
          tags?: string[]
          updated_at?: string
          variants?: Json | null
        }
        Relationships: []
      }
      og_notifications: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          metadata: Json
          read_at: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          body: string
          category?: string
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          metadata?: Json
          read_at?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      og_push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys_auth: string
          keys_p256dh: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys_auth: string
          keys_p256dh: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys_auth?: string
          keys_p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      og_event_registrations: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
          name: string
          phone: string
          skill_level: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
          name: string
          phone?: string
          skill_level?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          name?: string
          phone?: string
          skill_level?: string
        }
        Relationships: []
      }
      og_events: {
        Row: {
          id: string
          title: string
          subtitle: string
          event_date: string
          event_time: string
          location: string
          address: string
          description: string
          image: string
          category: string
          status: string
          featured: boolean
          price: string
          capacity: number | null
          registered: number | null
          highlights: Json
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title?: string
          subtitle?: string
          event_date?: string
          event_time?: string
          location?: string
          address?: string
          description?: string
          image?: string
          category?: string
          status?: string
          featured?: boolean
          price?: string
          capacity?: number | null
          registered?: number | null
          highlights?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          event_date?: string
          event_time?: string
          location?: string
          address?: string
          description?: string
          image?: string
          category?: string
          status?: string
          featured?: boolean
          price?: string
          capacity?: number | null
          registered?: number | null
          highlights?: Json
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      og_site_custom_pages: {
        Row: {
          content: Json
          scope: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          scope: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          scope?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      og_site_featured_spotlight: {
        Row: {
          content: Json
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      og_testimonials: {
        Row: {
          author: string
          created_at: string
          featured: boolean
          handle: string
          id: string
          image: string
          location: string
          outcome: string
          published: boolean
          quote: string
          rating: number
          sort_order: number
          tag: string
          updated_at: string
        }
        Insert: {
          author?: string
          created_at?: string
          featured?: boolean
          handle?: string
          id: string
          image?: string
          location?: string
          outcome?: string
          published?: boolean
          quote?: string
          rating?: number
          sort_order?: number
          tag?: string
          updated_at?: string
        }
        Update: {
          author?: string
          created_at?: string
          featured?: boolean
          handle?: string
          id?: string
          image?: string
          location?: string
          outcome?: string
          published?: boolean
          quote?: string
          rating?: number
          sort_order?: number
          tag?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      og_admin_override_order_payment: {
        Args: {
          p_order_id: string
          p_payment_status: string
          p_fulfillment_status?: string | null
        }
        Returns: undefined
      }
      og_claim_my_guest_orders: { Args: Record<string, never>; Returns: number }
      og_customer_cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      og_customer_request_revision: {
        Args: { p_order_id: string; p_note?: string }
        Returns: undefined
      }
      og_delete_catalog_term: {
        Args: { p_kind: string; p_label: string }
        Returns: undefined
      }
      og_portal_role: { Args: Record<string, never>; Returns: string }
      og_rename_catalog_term: {
        Args: { p_kind: string; p_from_label: string; p_to_label: string }
        Returns: undefined
      }
      og_staff_admin_user_ids: { Args: Record<string, never>; Returns: string[] }
      og_submit_payment_proof: { Args: { p_order_id: string; p_proof_url: string }; Returns: undefined }
      og_upsert_my_push_subscription: {
        Args: { p_endpoint: string; p_keys_p256dh: string; p_keys_auth: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
