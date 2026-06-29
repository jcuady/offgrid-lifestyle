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
        Relationships: []
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
      og_portal_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          email: string
          id: string
          last_login_at: string | null
          name: string
          role: string
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
          role: string
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
          role?: string
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
          status: string
          stock: number | null
          tag: string | null
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
          status?: string
          stock?: number | null
          tag?: string | null
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
          status?: string
          stock?: number | null
          tag?: string | null
          updated_at?: string
          variants?: Json | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      og_portal_role: { Args: Record<string, never>; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
