export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ac_dashboard_summary: {
        Row: {
          eduzz_receita_bruta: number | null
          eduzz_receita_liquida: number | null
          eduzz_tentativas: number | null
          eduzz_vendas: number | null
          funil_leads: number | null
          funil_oportunidades: number | null
          funil_vendas: number | null
          last_updated: string | null
          leads_rd_station: number | null
          rd_period: string | null
          taxa_checkout_to_sale: number | null
          taxa_lead_to_checkout: number | null
          taxa_lead_to_sale: number | null
        }
        Insert: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Update: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Relationships: []
      }
      access_groups: {
        Row: {
          can_see_all_deals: boolean | null
          can_see_all_tasks: boolean | null
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_system_default: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          can_see_all_deals?: boolean | null
          can_see_all_tasks?: boolean | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_default?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          can_see_all_deals?: boolean | null
          can_see_all_tasks?: boolean | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_system_default?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_groups_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      app_features: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      client_table_registry: {
        Row: {
          channel: string
          client_id: string
          created_at: string | null
          id: string
          table_name: string
          table_type: string
        }
        Insert: {
          channel: string
          client_id: string
          created_at?: string | null
          id?: string
          table_name: string
          table_type: string
        }
        Update: {
          channel?: string
          client_id?: string
          created_at?: string | null
          id?: string
          table_name?: string
          table_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_table_registry_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          address: string | null
          city: string | null
          client_id: string
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_id: string
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_id?: string
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_companies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          avatar_url: string | null
          client_id: string
          company_id: string | null
          created_at: string
          email: string | null
          id: string
          mobile_phone: string | null
          name: string
          phone: string | null
          position: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          client_id: string
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile_phone?: string | null
          name: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          client_id?: string
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          mobile_phone?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_custom_field_definitions: {
        Row: {
          client_id: string
          created_at: string | null
          entity_type: string
          field_type: string
          id: string
          is_required: boolean | null
          name: string
          options: Json | null
          order: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          entity_type: string
          field_type: string
          id?: string
          is_required?: boolean | null
          name: string
          options?: Json | null
          order?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          entity_type?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          name?: string
          options?: Json | null
          order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_custom_field_definitions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_companies: {
        Row: {
          client_id: string
          company_id: string
          created_at: string | null
          deal_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string | null
          deal_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_companies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_companies_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_companies_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals_with_pending_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_contacts: {
        Row: {
          client_id: string
          contact_id: string
          created_at: string | null
          deal_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          client_id: string
          contact_id: string
          created_at?: string | null
          deal_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          client_id?: string
          contact_id?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_contacts_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals_with_pending_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_files: {
        Row: {
          client_id: string
          created_at: string | null
          deal_id: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          uploaded_by_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deal_id: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          uploaded_by_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deal_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          uploaded_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_files_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_files_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_files_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals_with_pending_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deal_products: {
        Row: {
          client_id: string
          created_at: string | null
          deal_id: string
          id: string
          product_id: string
          quantity: number | null
          unit_price: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deal_id: string
          id?: string
          product_id: string
          quantity?: number | null
          unit_price?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deal_id?: string
          id?: string
          product_id?: string
          quantity?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deal_products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_products_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals_with_pending_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deal_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "crm_products"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          assigned_to_id: string | null
          client_id: string
          closed_at: string | null
          contact_id: string | null
          created_at: string
          created_by_id: string | null
          custom_fields: Json | null
          days_without_interaction: number | null
          expected_close_date: string | null
          id: string
          lost_reason: string | null
          name: string
          probability: number
          source: string | null
          source_lead_id: string | null
          stage_id: string
          status: string | null
          updated_at: string
          value: number
        }
        Insert: {
          assigned_to_id?: string | null
          client_id: string
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_id?: string | null
          custom_fields?: Json | null
          days_without_interaction?: number | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          name: string
          probability?: number
          source?: string | null
          source_lead_id?: string | null
          stage_id: string
          status?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          assigned_to_id?: string | null
          client_id?: string
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string
          created_by_id?: string | null
          custom_fields?: Json | null
          days_without_interaction?: number | null
          expected_close_date?: string | null
          id?: string
          lost_reason?: string | null
          name?: string
          probability?: number
          source?: string | null
          source_lead_id?: string | null
          stage_id?: string
          status?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "crm_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_funnel_stages: {
        Row: {
          client_id: string
          color: string
          created_at: string
          funnel_id: string | null
          id: string
          is_lost: boolean | null
          is_won: boolean | null
          name: string
          order: number
        }
        Insert: {
          client_id: string
          color?: string
          created_at?: string
          funnel_id?: string | null
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name: string
          order?: number
        }
        Update: {
          client_id?: string
          color?: string
          created_at?: string
          funnel_id?: string | null
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "crm_funnel_stages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_funnel_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "crm_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_funnels: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_funnels_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_goal_notifications: {
        Row: {
          client_id: string
          created_at: string
          email_to: string
          goal_id: string | null
          id: string
          metadata: Json | null
          notification_type: string
          seller_id: string | null
          sent_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email_to: string
          goal_id?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          seller_id?: string | null
          sent_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email_to?: string
          goal_id?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          seller_id?: string | null
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_goal_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_goal_notifications_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "crm_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_goal_notifications_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "crm_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_goals: {
        Row: {
          client_id: string
          created_at: string
          id: string
          lead_to_opportunity_rate: number | null
          lead_to_sale_rate: number | null
          leads_goal: number
          opportunities_goal: number
          opportunity_to_sale_rate: number | null
          period_end: string
          period_start: string
          period_type: string
          sales_quantity_goal: number
          sales_value_goal: number
          seller_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          lead_to_opportunity_rate?: number | null
          lead_to_sale_rate?: number | null
          leads_goal?: number
          opportunities_goal?: number
          opportunity_to_sale_rate?: number | null
          period_end: string
          period_start: string
          period_type?: string
          sales_quantity_goal?: number
          sales_value_goal?: number
          seller_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          lead_to_opportunity_rate?: number | null
          lead_to_sale_rate?: number | null
          leads_goal?: number
          opportunities_goal?: number
          opportunity_to_sale_rate?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          sales_quantity_goal?: number
          sales_value_goal?: number
          seller_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_goals_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "crm_sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_loss_reasons: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_loss_reasons_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_products: {
        Row: {
          category: string | null
          client_id: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          client_id: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          client_id?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_sellers: {
        Row: {
          avatar_url: string | null
          client_id: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          client_id: string
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          client_id?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_sellers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to_id: string | null
          client_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          deal_id: string | null
          description: string | null
          due_date: string | null
          duration_minutes: number | null
          id: string
          task_type: string | null
          title: string
        }
        Insert: {
          assigned_to_id?: string | null
          client_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          task_type?: string | null
          title: string
        }
        Update: {
          assigned_to_id?: string | null
          client_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          task_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals_with_pending_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_timeline_events: {
        Row: {
          client_id: string
          created_at: string
          deal_id: string | null
          description: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          deal_id?: string | null
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          deal_id?: string | null
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_timeline_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_timeline_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_timeline_events_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals_with_pending_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_timeline_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_crm_deals: {
        Row: {
          client_id: string
          contacts_created_same_day: number | null
          date_closed: string | null
          date_created: string | null
          deal_id: number
          deal_name: string | null
          extracted_at: string | null
          id: number
          lost_reason_id: number | null
          lost_reason_name: string | null
          origin: string | null
          pipeline_id: number | null
          pipeline_name: string | null
          price: number | null
          responsible_id: number | null
          source: string | null
          stage_id: number | null
          stage_name: string | null
          status: string | null
        }
        Insert: {
          client_id?: string
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id?: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      dm_crm_metrics: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          id: number
          leads: number | null
          opportunities: number | null
          revenue: number | null
          sales: number | null
          source: string
        }
        Insert: {
          client_id?: string
          created_at?: string | null
          date: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source?: string
        }
        Relationships: []
      }
      dm_dashboard_summary: {
        Row: {
          eduzz_receita_bruta: number | null
          eduzz_receita_liquida: number | null
          eduzz_tentativas: number | null
          eduzz_vendas: number | null
          funil_leads: number | null
          funil_oportunidades: number | null
          funil_vendas: number | null
          last_updated: string | null
          leads_rd_station: number | null
          rd_period: string | null
          taxa_checkout_to_sale: number | null
          taxa_lead_to_checkout: number | null
          taxa_lead_to_sale: number | null
        }
        Insert: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Update: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Relationships: []
      }
      dm_google_ad_metrics: {
        Row: {
          ad_name: string | null
          adset_name: string | null
          campaign_name: string | null
          clicks: number | null
          client_id: string
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          leads: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          revenue: number | null
          source: string
          status: string | null
        }
        Insert: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string
          status?: string | null
        }
        Update: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      dm_google_keywords: {
        Row: {
          campaign_name: string | null
          clicks: number | null
          client_id: string
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          keyword: string
          match_type: string | null
          quality_score: number | null
          status: string | null
        }
        Insert: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          keyword: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Update: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          keyword?: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Relationships: []
      }
      dm_meta_ads: {
        Row: {
          account_id: string
          ad_id: string
          ad_name: string | null
          adset_id: string
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          creative_id: string | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          image_url: string | null
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
          thumbnail_url: string | null
          video_id: string | null
        }
        Insert: {
          account_id: string
          ad_id: string
          ad_name?: string | null
          adset_id: string
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          ad_name?: string | null
          adset_id?: string
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      dm_meta_ads_breakdowns: {
        Row: {
          account_id: string
          ad_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          ad_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      dm_meta_adsets: {
        Row: {
          account_id: string
          adset_id: string
          adset_name: string | null
          billing_event: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          optimization_goal: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          adset_id: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      dm_meta_adsets_breakdowns: {
        Row: {
          account_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      dm_meta_campaigns: {
        Row: {
          account_id: string
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          objective: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      dm_meta_campaigns_breakdowns: {
        Row: {
          account_id: string
          age: string | null
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          age?: string | null
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          age?: string | null
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      dm_meta_campaigns_regions: {
        Row: {
          account_id: string | null
          campaign_id: string
          campaign_name: string | null
          cost_per_result: number | null
          date_end: string | null
          date_start: string | null
          extracted_at: string | null
          id: number
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id?: string | null
          campaign_id: string
          campaign_name?: string | null
          cost_per_result?: number | null
          date_end?: string | null
          date_start?: string | null
          extracted_at?: string | null
          id?: number
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string | null
          campaign_id?: string
          campaign_name?: string | null
          cost_per_result?: number | null
          date_end?: string | null
          date_start?: string | null
          extracted_at?: string | null
          id?: number
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      dm_meta_sync_control: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          last_sync_date: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          last_sync_date: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          last_sync_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dm_rdstation_leads: {
        Row: {
          city: string | null
          client_id: string
          company: string | null
          conversion_campaign: string | null
          conversion_content: string | null
          conversion_medium: string | null
          conversion_source: string | null
          conversion_term: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_conversion_event: string | null
          first_conversion_url: string | null
          id: string
          job_title: string | null
          lead_scoring: number | null
          lifecycle_stage: string | null
          name: string | null
          phone: string | null
          rd_created_at: string | null
          rd_lead_id: string | null
          rd_updated_at: string | null
          state: string | null
          synced_at: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          client_id?: string
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dm_rdstation_metrics: {
        Row: {
          created_at: string | null
          id: string
          period: string
          period_end: string | null
          period_start: string | null
          segmentation_id: number | null
          segmentation_name: string | null
          source: string | null
          synced_at: string | null
          total_leads: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Relationships: []
      }
      group_permissions: {
        Row: {
          created_at: string | null
          feature_id: string
          group_id: string
          id: string
          is_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          feature_id: string
          group_id: string
          id?: string
          is_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          feature_id?: string
          group_id?: string
          id?: string
          is_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "group_permissions_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "app_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_permissions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      lo_crm_deals: {
        Row: {
          client_id: string
          contacts_created_same_day: number | null
          date_closed: string | null
          date_created: string | null
          deal_id: number
          deal_name: string | null
          extracted_at: string | null
          id: number
          lost_reason_id: number | null
          lost_reason_name: string | null
          origin: string | null
          pipeline_id: number | null
          pipeline_name: string | null
          price: number | null
          responsible_id: number | null
          source: string | null
          stage_id: number | null
          stage_name: string | null
          status: string | null
        }
        Insert: {
          client_id?: string
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id?: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      lo_crm_metrics: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          id: number
          leads: number | null
          opportunities: number | null
          revenue: number | null
          sales: number | null
          source: string
        }
        Insert: {
          client_id?: string
          created_at?: string | null
          date: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source?: string
        }
        Relationships: []
      }
      lo_dashboard_summary: {
        Row: {
          eduzz_receita_bruta: number | null
          eduzz_receita_liquida: number | null
          eduzz_tentativas: number | null
          eduzz_vendas: number | null
          funil_leads: number | null
          funil_oportunidades: number | null
          funil_vendas: number | null
          last_updated: string | null
          leads_rd_station: number | null
          rd_period: string | null
          taxa_checkout_to_sale: number | null
          taxa_lead_to_checkout: number | null
          taxa_lead_to_sale: number | null
        }
        Insert: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Update: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Relationships: []
      }
      lo_google_ad_metrics: {
        Row: {
          ad_name: string | null
          adset_name: string | null
          campaign_name: string | null
          clicks: number | null
          client_id: string
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          leads: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          revenue: number | null
          source: string
          status: string | null
        }
        Insert: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string
          status?: string | null
        }
        Update: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      lo_google_keywords: {
        Row: {
          campaign_name: string | null
          clicks: number | null
          client_id: string
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          keyword: string
          match_type: string | null
          quality_score: number | null
          status: string | null
        }
        Insert: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          keyword: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Update: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          keyword?: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Relationships: []
      }
      lo_meta_ads: {
        Row: {
          account_id: string
          ad_id: string
          ad_name: string | null
          adset_id: string
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          creative_id: string | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          image_url: string | null
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
          thumbnail_url: string | null
          video_id: string | null
        }
        Insert: {
          account_id: string
          ad_id: string
          ad_name?: string | null
          adset_id: string
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          ad_name?: string | null
          adset_id?: string
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      lo_meta_ads_breakdowns: {
        Row: {
          account_id: string
          ad_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          ad_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      lo_meta_adsets: {
        Row: {
          account_id: string
          adset_id: string
          adset_name: string | null
          billing_event: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          optimization_goal: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          adset_id: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      lo_meta_adsets_breakdowns: {
        Row: {
          account_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      lo_meta_campaigns: {
        Row: {
          account_id: string
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          objective: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      lo_meta_campaigns_breakdowns: {
        Row: {
          account_id: string
          age: string | null
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          age?: string | null
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          age?: string | null
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      lo_meta_campaigns_regions: {
        Row: {
          account_id: string | null
          campaign_id: string
          campaign_name: string | null
          cost_per_result: number | null
          date_end: string | null
          date_start: string | null
          extracted_at: string | null
          id: number
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id?: string | null
          campaign_id: string
          campaign_name?: string | null
          cost_per_result?: number | null
          date_end?: string | null
          date_start?: string | null
          extracted_at?: string | null
          id?: number
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string | null
          campaign_id?: string
          campaign_name?: string | null
          cost_per_result?: number | null
          date_end?: string | null
          date_start?: string | null
          extracted_at?: string | null
          id?: number
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      lo_meta_sync_control: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          last_sync_date: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          last_sync_date: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          last_sync_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lo_rdstation_leads: {
        Row: {
          city: string | null
          client_id: string
          company: string | null
          conversion_campaign: string | null
          conversion_content: string | null
          conversion_medium: string | null
          conversion_source: string | null
          conversion_term: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_conversion_event: string | null
          first_conversion_url: string | null
          id: string
          job_title: string | null
          lead_scoring: number | null
          lifecycle_stage: string | null
          name: string | null
          phone: string | null
          rd_created_at: string | null
          rd_lead_id: string | null
          rd_updated_at: string | null
          state: string | null
          synced_at: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          client_id?: string
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lo_rdstation_metrics: {
        Row: {
          created_at: string | null
          id: string
          period: string
          period_end: string | null
          period_start: string | null
          segmentation_id: number | null
          segmentation_name: string | null
          source: string | null
          synced_at: string | null
          total_leads: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Relationships: []
      }
      sm_crm_deals: {
        Row: {
          client_id: string
          contacts_created_same_day: number | null
          date_closed: string | null
          date_created: string | null
          deal_id: number
          deal_name: string | null
          extracted_at: string | null
          id: number
          lost_reason_id: number | null
          lost_reason_name: string | null
          origin: string | null
          pipeline_id: number | null
          pipeline_name: string | null
          price: number | null
          responsible_id: number | null
          source: string | null
          stage_id: number | null
          stage_name: string | null
          status: string | null
        }
        Insert: {
          client_id?: string
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id?: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sm_crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sm_crm_metrics: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          id: number
          leads: number | null
          opportunities: number | null
          revenue: number | null
          sales: number | null
          source: string
        }
        Insert: {
          client_id?: string
          created_at?: string | null
          date: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "sm_crm_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sm_dashboard_summary: {
        Row: {
          eduzz_receita_bruta: number | null
          eduzz_receita_liquida: number | null
          eduzz_tentativas: number | null
          eduzz_vendas: number | null
          funil_leads: number | null
          funil_oportunidades: number | null
          funil_vendas: number | null
          last_updated: string | null
          leads_rd_station: number | null
          rd_period: string | null
          taxa_checkout_to_sale: number | null
          taxa_lead_to_checkout: number | null
          taxa_lead_to_sale: number | null
        }
        Insert: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Update: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Relationships: []
      }
      sm_google_ad_metrics: {
        Row: {
          ad_name: string | null
          adset_name: string | null
          campaign_name: string | null
          clicks: number | null
          client_id: string
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          leads: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          revenue: number | null
          source: string
          status: string | null
        }
        Insert: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string
          status?: string | null
        }
        Update: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sm_google_ad_metrics_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sm_google_keywords: {
        Row: {
          campaign_name: string | null
          clicks: number | null
          client_id: string
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          keyword: string
          match_type: string | null
          quality_score: number | null
          status: string | null
        }
        Insert: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          keyword: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Update: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          keyword?: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sm_google_keywords_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sm_meta_ads: {
        Row: {
          account_id: string
          ad_id: string
          ad_name: string | null
          adset_id: string
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          creative_id: string | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          image_url: string | null
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
          thumbnail_url: string | null
          video_id: string | null
        }
        Insert: {
          account_id: string
          ad_id: string
          ad_name?: string | null
          adset_id: string
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          ad_name?: string | null
          adset_id?: string
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      sm_meta_ads_breakdowns: {
        Row: {
          account_id: string
          ad_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          ad_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      sm_meta_adsets: {
        Row: {
          account_id: string
          adset_id: string
          adset_name: string | null
          billing_event: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          optimization_goal: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          adset_id: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      sm_meta_adsets_breakdowns: {
        Row: {
          account_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      sm_meta_campaigns: {
        Row: {
          account_id: string
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          objective: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      sm_meta_campaigns_breakdowns: {
        Row: {
          account_id: string
          age: string | null
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          age?: string | null
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          age?: string | null
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      sm_meta_campaigns_regions: {
        Row: {
          account_id: string | null
          campaign_id: string
          campaign_name: string | null
          cost_per_result: number | null
          date_end: string | null
          date_start: string | null
          extracted_at: string | null
          id: number
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id?: string | null
          campaign_id: string
          campaign_name?: string | null
          cost_per_result?: number | null
          date_end?: string | null
          date_start?: string | null
          extracted_at?: string | null
          id?: number
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string | null
          campaign_id?: string
          campaign_name?: string | null
          cost_per_result?: number | null
          date_end?: string | null
          date_start?: string | null
          extracted_at?: string | null
          id?: number
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      sm_meta_sync_control: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          last_sync_date: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          last_sync_date: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          last_sync_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sm_rdstation_leads: {
        Row: {
          city: string | null
          client_id: string
          company: string | null
          conversion_campaign: string | null
          conversion_content: string | null
          conversion_medium: string | null
          conversion_source: string | null
          conversion_term: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_conversion_event: string | null
          first_conversion_url: string | null
          id: string
          job_title: string | null
          lead_scoring: number | null
          lifecycle_stage: string | null
          name: string | null
          phone: string | null
          rd_created_at: string | null
          rd_lead_id: string | null
          rd_updated_at: string | null
          state: string | null
          synced_at: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          client_id?: string
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sm_rdstation_metrics: {
        Row: {
          created_at: string | null
          id: string
          period: string
          period_end: string | null
          period_start: string | null
          segmentation_id: number | null
          segmentation_name: string | null
          source: string | null
          synced_at: string | null
          total_leads: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          attachment_urls: string[] | null
          client_id: string | null
          company: string
          created_at: string | null
          id: string
          name: string
          problem: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["support_ticket_status"] | null
          ticket_number: string
          updated_at: string | null
          user_id: string | null
          whatsapp_sent: boolean | null
        }
        Insert: {
          attachment_urls?: string[] | null
          client_id?: string | null
          company: string
          created_at?: string | null
          id?: string
          name: string
          problem: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_sent?: boolean | null
        }
        Update: {
          attachment_urls?: string[] | null
          client_id?: string | null
          company?: string
          created_at?: string | null
          id?: string
          name?: string
          problem?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      system_performance_logs: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          user_id?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      tr_crm_deals: {
        Row: {
          client_id: string | null
          contacts_created_same_day: number | null
          date_closed: string | null
          date_created: string | null
          deal_id: number
          deal_name: string | null
          extracted_at: string | null
          id: number
          lost_reason_id: number | null
          lost_reason_name: string | null
          origin: string | null
          pipeline_id: number | null
          pipeline_name: string | null
          price: number | null
          responsible_id: number | null
          source: string | null
          stage_id: number | null
          stage_name: string | null
          status: string | null
        }
        Insert: {
          client_id?: string | null
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Update: {
          client_id?: string | null
          contacts_created_same_day?: number | null
          date_closed?: string | null
          date_created?: string | null
          deal_id?: number
          deal_name?: string | null
          extracted_at?: string | null
          id?: number
          lost_reason_id?: number | null
          lost_reason_name?: string | null
          origin?: string | null
          pipeline_id?: number | null
          pipeline_name?: string | null
          price?: number | null
          responsible_id?: number | null
          source?: string | null
          stage_id?: number | null
          stage_name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tr_crm_metrics: {
        Row: {
          client_id: string | null
          created_at: string | null
          date: string
          id: number
          leads: number | null
          opportunities: number | null
          revenue: number | null
          sales: number | null
          source: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          date: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          date?: string
          id?: number
          leads?: number | null
          opportunities?: number | null
          revenue?: number | null
          sales?: number | null
          source?: string
        }
        Relationships: []
      }
      tr_dashboard_summary: {
        Row: {
          eduzz_receita_bruta: number | null
          eduzz_receita_liquida: number | null
          eduzz_tentativas: number | null
          eduzz_vendas: number | null
          funil_leads: number | null
          funil_oportunidades: number | null
          funil_vendas: number | null
          last_updated: string | null
          leads_rd_station: number | null
          rd_period: string | null
          taxa_checkout_to_sale: number | null
          taxa_lead_to_checkout: number | null
          taxa_lead_to_sale: number | null
        }
        Insert: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Update: {
          eduzz_receita_bruta?: number | null
          eduzz_receita_liquida?: number | null
          eduzz_tentativas?: number | null
          eduzz_vendas?: number | null
          funil_leads?: number | null
          funil_oportunidades?: number | null
          funil_vendas?: number | null
          last_updated?: string | null
          leads_rd_station?: number | null
          rd_period?: string | null
          taxa_checkout_to_sale?: number | null
          taxa_lead_to_checkout?: number | null
          taxa_lead_to_sale?: number | null
        }
        Relationships: []
      }
      tr_google_ad_metrics: {
        Row: {
          ad_name: string | null
          adset_name: string | null
          campaign_name: string | null
          clicks: number | null
          client_id: string | null
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          leads: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          revenue: number | null
          source: string | null
          status: string | null
        }
        Insert: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string | null
          status?: string | null
        }
        Update: {
          ad_name?: string | null
          adset_name?: string | null
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          leads?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          revenue?: number | null
          source?: string | null
          status?: string | null
        }
        Relationships: []
      }
      tr_google_keywords: {
        Row: {
          campaign_name: string | null
          clicks: number | null
          client_id: string | null
          conversions: number | null
          cost: number | null
          created_at: string | null
          date: string
          id: number
          impressions: number | null
          keyword: string
          match_type: string | null
          quality_score: number | null
          status: string | null
        }
        Insert: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date: string
          id?: number
          impressions?: number | null
          keyword: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Update: {
          campaign_name?: string | null
          clicks?: number | null
          client_id?: string | null
          conversions?: number | null
          cost?: number | null
          created_at?: string | null
          date?: string
          id?: number
          impressions?: number | null
          keyword?: string
          match_type?: string | null
          quality_score?: number | null
          status?: string | null
        }
        Relationships: []
      }
      tr_meta_ads: {
        Row: {
          account_id: string
          ad_id: string
          ad_name: string | null
          adset_id: string
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          creative_id: string | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          image_url: string | null
          impressions: number | null
          leads: number | null
          messages: number | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
          thumbnail_url: string | null
          video_id: string | null
        }
        Insert: {
          account_id: string
          ad_id: string
          ad_name?: string | null
          adset_id: string
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          ad_name?: string | null
          adset_id?: string
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          creative_id?: string | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          leads?: number | null
          messages?: number | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
          thumbnail_url?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      tr_meta_ads_breakdowns: {
        Row: {
          account_id: string
          ad_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          ad_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          ad_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      tr_meta_adsets: {
        Row: {
          account_id: string
          adset_id: string
          adset_name: string | null
          billing_event: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          optimization_goal: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          adset_id: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          adset_name?: string | null
          billing_event?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          optimization_goal?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      tr_meta_adsets_breakdowns: {
        Row: {
          account_id: string
          adset_id: string
          age: string | null
          campaign_id: string
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          adset_id: string
          age?: string | null
          campaign_id: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          adset_id?: string
          age?: string | null
          campaign_id?: string
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      tr_meta_campaigns: {
        Row: {
          account_id: string
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          created_time: string | null
          daily_budget: number | null
          date_end: string
          date_start: string
          effective_status: string | null
          extracted_at: string | null
          id: string
          impressions: number | null
          leads: number | null
          lifetime_budget: number | null
          messages: number | null
          objective: string | null
          page_views: number | null
          reach: number | null
          result_type: string | null
          results: number | null
          spend: number | null
          status: string | null
        }
        Insert: {
          account_id: string
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end: string
          date_start: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Update: {
          account_id?: string
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          created_time?: string | null
          daily_budget?: number | null
          date_end?: string
          date_start?: string
          effective_status?: string | null
          extracted_at?: string | null
          id?: string
          impressions?: number | null
          leads?: number | null
          lifetime_budget?: number | null
          messages?: number | null
          objective?: string | null
          page_views?: number | null
          reach?: number | null
          result_type?: string | null
          results?: number | null
          spend?: number | null
          status?: string | null
        }
        Relationships: []
      }
      tr_meta_campaigns_breakdowns: {
        Row: {
          account_id: string
          age: string | null
          campaign_id: string
          campaign_name: string | null
          conversions: number | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          date_end: string
          date_start: string
          extracted_at: string | null
          gender: string | null
          id: string
          impressions: number | null
          platform_position: string | null
          publisher_platform: string | null
          reach: number | null
          region: string | null
          results: number | null
          spend: number | null
        }
        Insert: {
          account_id: string
          age?: string | null
          campaign_id: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end: string
          date_start: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Update: {
          account_id?: string
          age?: string | null
          campaign_id?: string
          campaign_name?: string | null
          conversions?: number | null
          cost_per_conversion?: number | null
          cost_per_result?: number | null
          date_end?: string
          date_start?: string
          extracted_at?: string | null
          gender?: string | null
          id?: string
          impressions?: number | null
          platform_position?: string | null
          publisher_platform?: string | null
          reach?: number | null
          region?: string | null
          results?: number | null
          spend?: number | null
        }
        Relationships: []
      }
      tr_rdstation_leads: {
        Row: {
          city: string | null
          client_id: string | null
          company: string | null
          conversion_campaign: string | null
          conversion_content: string | null
          conversion_medium: string | null
          conversion_source: string | null
          conversion_term: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_conversion_event: string | null
          first_conversion_url: string | null
          id: string
          job_title: string | null
          lead_scoring: number | null
          lifecycle_stage: string | null
          name: string | null
          phone: string | null
          rd_created_at: string | null
          rd_lead_id: string | null
          rd_updated_at: string | null
          state: string | null
          synced_at: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          client_id?: string | null
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string | null
          company?: string | null
          conversion_campaign?: string | null
          conversion_content?: string | null
          conversion_medium?: string | null
          conversion_source?: string | null
          conversion_term?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_conversion_event?: string | null
          first_conversion_url?: string | null
          id?: string
          job_title?: string | null
          lead_scoring?: number | null
          lifecycle_stage?: string | null
          name?: string | null
          phone?: string | null
          rd_created_at?: string | null
          rd_lead_id?: string | null
          rd_updated_at?: string | null
          state?: string | null
          synced_at?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tr_rdstation_metrics: {
        Row: {
          created_at: string | null
          id: string
          period: string
          period_end: string | null
          period_start: string | null
          segmentation_id: number | null
          segmentation_name: string | null
          source: string | null
          synced_at: string | null
          total_leads: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string
          period_end?: string | null
          period_start?: string | null
          segmentation_id?: number | null
          segmentation_name?: string | null
          source?: string | null
          synced_at?: string | null
          total_leads?: number | null
        }
        Relationships: []
      }
      tryvia_analytics_client_credentials: {
        Row: {
          channel: string
          channel_name: string | null
          client_id: string
          connection_status: string | null
          created_at: string | null
          id: string
          last_error_message: string | null
          last_sync_at: string | null
          login: string | null
          n8n_workflow_url: string | null
          notes: string | null
          password_encrypted: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          channel: string
          channel_name?: string | null
          client_id: string
          connection_status?: string | null
          created_at?: string | null
          id?: string
          last_error_message?: string | null
          last_sync_at?: string | null
          login?: string | null
          n8n_workflow_url?: string | null
          notes?: string | null
          password_encrypted?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          channel?: string
          channel_name?: string | null
          client_id?: string
          connection_status?: string | null
          created_at?: string | null
          id?: string
          last_error_message?: string | null
          last_sync_at?: string | null
          login?: string | null
          n8n_workflow_url?: string | null
          notes?: string | null
          password_encrypted?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryvia_analytics_client_credentials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tryvia_analytics_clients: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          state: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          state?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          state?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      tryvia_analytics_profiles: {
        Row: {
          client_id: string | null
          created_at: string | null
          email: string
          id: string
          password_hash: string
          role: string
          whatsapp: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          email: string
          id: string
          password_hash?: string
          role?: string
          whatsapp?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          role?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryvia_analytics_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      tryvia_analytics_reports: {
        Row: {
          client_id: string
          created_at: string | null
          created_by_user_id: string | null
          file_url: string
          id: string
          period_end: string
          period_start: string
          title: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by_user_id?: string | null
          file_url: string
          id?: string
          period_end: string
          period_start: string
          title: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by_user_id?: string | null
          file_url?: string
          id?: string
          period_end?: string
          period_start?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryvia_analytics_reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryvia_analytics_reports_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tryvia_analytics_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["analytics_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["analytics_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["analytics_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_access_groups: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_access_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "access_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      crm_deals_with_pending_tasks: {
        Row: {
          assigned_to_id: string | null
          client_id: string | null
          closed_at: string | null
          contact_id: string | null
          created_at: string | null
          created_by_id: string | null
          days_without_interaction: number | null
          expected_close_date: string | null
          id: string | null
          lost_reason: string | null
          name: string | null
          pending_tasks_count: number | null
          probability: number | null
          source: string | null
          source_lead_id: string | null
          stage_id: string | null
          status: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to_id?: string | null
          client_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          days_without_interaction?: number | null
          expected_close_date?: string | null
          id?: string | null
          lost_reason?: string | null
          name?: string | null
          pending_tasks_count?: never
          probability?: number | null
          source?: string | null
          source_lead_id?: string | null
          stage_id?: string | null
          status?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          assigned_to_id?: string | null
          client_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by_id?: string | null
          days_without_interaction?: number | null
          expected_close_date?: string | null
          id?: string | null
          lost_reason?: string | null
          name?: string | null
          pending_tasks_count?: never
          probability?: number | null
          source?: string | null
          source_lead_id?: string | null
          stage_id?: string | null
          status?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "crm_sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      v_crm_funnel_metrics: {
        Row: {
          client_id: string | null
          date: string | null
          lost_deals: number | null
          lost_value: number | null
          open_deals: number | null
          source: string | null
          total_deals: number | null
          total_value: number | null
          won_deals: number | null
          won_value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "tryvia_analytics_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      v_google_ads_daily_summary: {
        Row: {
          avg_cpc: number | null
          client_id: string | null
          ctr: number | null
          date: string | null
          total_clicks: number | null
          total_conversions: number | null
          total_cost: number | null
          total_impressions: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      v_meta_ads_daily_summary: {
        Row: {
          account_id: string | null
          avg_cpl: number | null
          avg_cpr: number | null
          date_start: string | null
          total_conversions: number | null
          total_impressions: number | null
          total_leads: number | null
          total_messages: number | null
          total_page_views: number | null
          total_reach: number | null
          total_results: number | null
          total_spend: number | null
        }
        Relationships: []
      }
      v_meta_campaigns_summary: {
        Row: {
          account_id: string | null
          campaign_id: string | null
          campaign_name: string | null
          cost_per_conversion: number | null
          cost_per_result: number | null
          objective: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          total_conversions: number | null
          total_impressions: number | null
          total_leads: number | null
          total_messages: number | null
          total_page_views: number | null
          total_reach: number | null
          total_results: number | null
          total_spend: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_vacuum_table: { Args: { p_table_name: string }; Returns: Json }
      can_view_all_crm_data: { Args: { _user_id: string }; Returns: boolean }
      check_database_health: { Args: never; Returns: Json }
      delete_client_credentials: {
        Args: { p_client_id: string }
        Returns: number
      }
      delete_client_crm_data: { Args: { p_client_id: string }; Returns: Json }
      delete_client_record: { Args: { p_client_id: string }; Returns: boolean }
      delete_client_table_registry: {
        Args: { p_client_id: string }
        Returns: number
      }
      delete_client_users: { Args: { p_client_id: string }; Returns: Json }
      exec_sql: { Args: { sql: string }; Returns: undefined }
      get_client_deletion_preview: {
        Args: { p_client_id: string }
        Returns: Json
      }
      get_client_tables_for_deletion: {
        Args: { p_client_id: string }
        Returns: {
          table_name: string
        }[]
      }
      get_client_users_for_deletion: {
        Args: { p_client_id: string }
        Returns: {
          user_email: string
          user_id: string
          user_whatsapp: string
        }[]
      }
      get_crm_dashboard_metrics: {
        Args: { client_id_param: string }
        Returns: Json
      }
      get_crm_overview_metrics:
        | { Args: { client_id_param: string }; Returns: Json }
        | {
            Args: {
              client_id_param: string
              end_date?: string
              start_date?: string
            }
            Returns: Json
          }
      get_crm_period_metrics: {
        Args: { p_client_id: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_ticket: number
          conversion_rate: number
          lost_deals: number
          lost_value: number
          open_deals: number
          total_deals: number
          total_value: number
          won_deals: number
          won_value: number
        }[]
      }
      get_google_ads_kpis: {
        Args: { p_client_id: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_cpc: number
          ctr: number
          total_clicks: number
          total_conversions: number
          total_cost: number
          total_impressions: number
          total_leads: number
        }[]
      }
      get_lost_opportunities_report: {
        Args: { client_id_param: string }
        Returns: Json[]
      }
      get_lost_opportunities_report_filtered: {
        Args: {
          client_id_param: string
          end_date?: string
          start_date?: string
        }
        Returns: Json[]
      }
      get_meta_ads_kpis: {
        Args: { p_account_id: string; p_end_date: string; p_start_date: string }
        Returns: {
          avg_cpl: number
          avg_cpr: number
          total_impressions: number
          total_leads: number
          total_messages: number
          total_page_views: number
          total_reach: number
          total_results: number
          total_spend: number
        }[]
      }
      get_metrics_by_salesperson: {
        Args: { client_id_param: string }
        Returns: Json[]
      }
      get_metrics_by_salesperson_filtered: {
        Args: {
          client_id_param: string
          end_date?: string
          start_date?: string
        }
        Returns: Json[]
      }
      get_performance_summary: { Args: { hours_back?: number }; Returns: Json }
      get_productivity_evolution: {
        Args: {
          client_id_param: string
          end_date?: string
          seller_id_param?: string
          start_date?: string
        }
        Returns: {
          completed_tasks: number
          task_date: string
          total_tasks: number
        }[]
      }
      get_sales_by_period_report: {
        Args: { client_id_param: string; group_by?: string }
        Returns: Json[]
      }
      get_sales_by_period_report_filtered: {
        Args: {
          client_id_param: string
          end_date?: string
          group_by?: string
          start_date?: string
        }
        Returns: Json[]
      }
      get_sales_funnel_data: {
        Args: { client_id_param: string }
        Returns: Json[]
      }
      get_sales_funnel_data_filtered: {
        Args: {
          client_id_param: string
          end_date?: string
          start_date?: string
        }
        Returns: Json[]
      }
      get_seller_productivity_ranking: {
        Args: {
          client_id_param: string
          end_date?: string
          start_date?: string
        }
        Returns: {
          completed_tasks: number
          completion_rate: number
          overdue_tasks: number
          pending_tasks: number
          seller_email: string
          seller_id: string
          seller_name: string
          total_tasks: number
        }[]
      }
      get_table_statistics: { Args: never; Returns: Json }
      get_tasks_with_details: {
        Args: {
          client_id_param: string
          end_date?: string
          seller_id_param?: string
          start_date?: string
          task_type_param?: string
        }
        Returns: {
          company_name: string
          contact_name: string
          deal_id: string
          deal_name: string
          seller_id: string
          seller_name: string
          task_completed: boolean
          task_completed_at: string
          task_due_date: string
          task_id: string
          task_title: string
          task_type: string
        }[]
      }
      get_team_productivity_metrics: {
        Args: {
          client_id_param: string
          end_date?: string
          seller_id_param?: string
          start_date?: string
        }
        Returns: {
          completed_tasks: number
          completion_rate: number
          pending_tasks: number
          seller_email: string
          seller_id: string
          seller_name: string
          task_type: string
          total_tasks: number
        }[]
      }
      get_user_group_info: {
        Args: { _user_id: string }
        Returns: {
          can_see_all_deals: boolean
          can_see_all_tasks: boolean
          group_id: string
          group_name: string
          group_slug: string
        }[]
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          feature_slug: string
          is_enabled: boolean
        }[]
      }
      global_search: {
        Args: { client_id_param: string; search_term: string }
        Returns: {
          id: string
          name: string
          path: string
          type: string
        }[]
      }
      has_ac_client_access: { Args: { _user_id: string }; Returns: boolean }
      has_analytics_role: {
        Args: {
          _role: Database["public"]["Enums"]["analytics_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_crm_client_access: {
        Args: { _client_id: string; _user_id: string }
        Returns: boolean
      }
      has_dm_client_access: { Args: { _user_id: string }; Returns: boolean }
      has_lo_client_access: { Args: { _user_id: string }; Returns: boolean }
      has_mo_client_access: { Args: { _user_id: string }; Returns: boolean }
      has_sm_client_access: { Args: { _user_id: string }; Returns: boolean }
      has_tr_client_access: { Args: { _user_id: string }; Returns: boolean }
      is_seller_only: { Args: { _user_id: string }; Returns: boolean }
      log_performance_metric: {
        Args: {
          p_metadata?: Json
          p_metric_name: string
          p_metric_type: string
          p_value: number
        }
        Returns: string
      }
      mo_eduzz_upsert_invoice: {
        Args: {
          p_buyer_email: string
          p_buyer_name: string
          p_buyer_phone: string
          p_created_at: string
          p_ganho: number
          p_invoice_id: string
          p_is_abandonment: boolean
          p_paid_at: string
          p_parcelas: number
          p_product_id: string
          p_product_name: string
          p_product_type: string
          p_raw_data: Json
          p_status: string
          p_valor_item: number
        }
        Returns: string
      }
      suggest_missing_indexes: {
        Args: { p_table_name?: string }
        Returns: Json
      }
      user_can_see_all_deals: { Args: { _user_id: string }; Returns: boolean }
      user_can_see_all_tasks: { Args: { _user_id: string }; Returns: boolean }
      user_has_permission: {
        Args: { _feature_slug: string; _user_id: string }
        Returns: boolean
      }
      warm_up_function: { Args: { p_function_name: string }; Returns: Json }
    }
    Enums: {
      analytics_role:
        | "admin"
        | "analyst"
        | "user"
        | "crm_admin"
        | "crm_user"
        | "manager"
        | "seller"
      support_ticket_status: "pending" | "in_progress" | "completed"
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
  public: {
    Enums: {
      analytics_role: [
        "admin",
        "analyst",
        "user",
        "crm_admin",
        "crm_user",
        "manager",
        "seller",
      ],
      support_ticket_status: ["pending", "in_progress", "completed"],
    },
  },
} as const
