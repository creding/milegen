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
      mileage_log_entries: {
        Row: {
          business_type: string | null
          created_at: string | null
          date: string
          end_mileage: number
          id: string
          location: string | null
          log_id: string | null
          miles: number
          purpose: string
          start_mileage: number
          type: string
          updated_at: string | null
          vehicle_info: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string | null
          date: string
          end_mileage: number
          id?: string
          location?: string | null
          log_id?: string | null
          miles: number
          purpose: string
          start_mileage: number
          type: string
          updated_at?: string | null
          vehicle_info: string
        }
        Update: {
          business_type?: string | null
          created_at?: string | null
          date?: string
          end_mileage?: number
          id?: string
          location?: string | null
          log_id?: string | null
          miles?: number
          purpose?: string
          start_mileage?: number
          type?: string
          updated_at?: string | null
          vehicle_info?: string
        }
        Relationships: [
          {
            foreignKeyName: "mileage_log_entries_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "mileage_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      mileage_logs: {
        Row: {
          business_deduction_amount: number
          business_deduction_rate: number
          business_type: string
          created_at: string
          end_date: string
          end_mileage: number
          id: string
          log_name: string
          start_date: string
          start_mileage: number
          total_business_miles: number
          total_mileage: number
          total_personal_miles: number
          user_id: string
          vehicle_info: string
        }
        Insert: {
          business_deduction_amount: number
          business_deduction_rate: number
          business_type: string
          created_at?: string
          end_date: string
          end_mileage: number
          id?: string
          log_name: string
          start_date: string
          start_mileage: number
          total_business_miles: number
          total_mileage: number
          total_personal_miles: number
          user_id: string
          vehicle_info: string
        }
        Update: {
          business_deduction_amount?: number
          business_deduction_rate?: number
          business_type?: string
          created_at?: string
          end_date?: string
          end_mileage?: number
          id?: string
          log_name?: string
          start_date?: string
          start_mileage?: number
          total_business_miles?: number
          total_mileage?: number
          total_personal_miles?: number
          user_id?: string
          vehicle_info?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          id: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
        }
        Insert: {
          email: string
          id: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
        }
        Update: {
          email?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type Views<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"]
export type Functions<T extends keyof PublicSchema["Functions"]> =
  PublicSchema["Functions"][T]["Args"]

export type TableInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TableUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T]