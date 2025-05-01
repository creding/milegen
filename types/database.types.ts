export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      mileage_log_entries: {
        Row: {
          business_type: string | null;
          created_at: string | null;
          date: string;
          end_mileage: number;
          id: string;
          location: string | null;
          log_id: string | null;
          miles: number;
          purpose: string;
          start_mileage: number;
          type: string;
          updated_at: string | null;
          vehicle_info: string;
        };
        Insert: {
          business_type?: string | null;
          created_at?: string | null;
          date: string;
          end_mileage: number;
          id?: string;
          location?: string | null;
          log_id?: string | null;
          miles: number;
          purpose: string;
          start_mileage: number;
          type: string;
          updated_at?: string | null;
          vehicle_info: string;
        };
        Update: {
          business_type?: string | null;
          created_at?: string | null;
          date?: string;
          end_mileage?: number;
          id?: string;
          location?: string | null;
          log_id?: string | null;
          miles?: number;
          purpose?: string;
          start_mileage?: number;
          type?: string;
          updated_at?: string | null;
          vehicle_info?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mileage_log_entries_log_id_fkey";
            columns: ["log_id"];
            isOneToOne: false;
            referencedRelation: "mileage_logs";
            referencedColumns: ["id"];
          }
        ];
      };
      mileage_logs: {
        Row: {
          business_deduction_amount: number;
          business_deduction_rate: number;
          created_at: string;
          end_date: string;
          end_mileage: number;
          id: string;
          log_name: string;
          start_date: string;
          start_mileage: number;
          total_business_miles: number;
          total_mileage: number;
          total_personal_miles: number;
          user_id: string;
          vehicle_info: string;
          year: number;
        };
        Insert: {
          business_deduction_amount: number;
          business_deduction_rate: number;
          created_at?: string;
          end_date: string;
          end_mileage: number;
          id?: string;
          log_name: string;
          start_date: string;
          start_mileage: number;
          total_business_miles: number;
          total_mileage: number;
          total_personal_miles: number;
          user_id?: string;
          vehicle_info: string;
          year: number;
        };
        Update: {
          business_deduction_amount?: number;
          business_deduction_rate?: number;
          created_at?: string;
          end_date?: string;
          end_mileage?: number;
          id?: string;
          log_name?: string;
          start_date?: string;
          start_mileage?: number;
          total_business_miles?: number;
          total_mileage?: number;
          total_personal_miles?: number;
          user_id?: string;
          vehicle_info?: string;
          year?: number;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          owner_user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_user_id?: string;
        };
        Relationships: [];
      };
      stripe_products: {
        Row: {
          description: string | null;
          id: string;
          image: string | null;
          metadata: Json | null;
          name: string | null;
        };
        Insert: {
          description?: string | null;
          id: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Update: {
          description?: string | null;
          id?: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          created: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          id: string;
          interval: string | null;
          interval_count: number | null;
          metadata: Json | null;
          price_id: string;
          status: Database["public"]["Enums"]["subscription_status"] | null;
          trial_end: string | null;
          trial_start: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id: string;
          interval?: string | null;
          interval_count?: number | null;
          metadata?: Json | null;
          price_id: string;
          status?: Database["public"]["Enums"]["subscription_status"] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id?: string;
        };
        Update: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id?: string;
          interval?: string | null;
          interval_count?: number | null;
          metadata?: Json | null;
          price_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_price_id_fkey";
            columns: ["price_id"];
            isOneToOne: false;
            referencedRelation: "stripe_prices";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      save_mileage_log_with_entries: {
        Args: {
          log_data: {
            log_name: string;
            year: number;
            start_date: string;
            end_date: string;
            start_mileage: number;
            end_mileage: number;
            total_mileage: number;
            total_business_miles: number;
            total_personal_miles: number;
            business_type: string;
            business_deduction_rate: number;
            business_deduction_amount: number;
            vehicle_info: string;
            log_entries: unknown[];
          };
          entries_data: {
            date: string;
            start_mileage: number;
            end_mileage: number;
            miles: number;
            purpose: string;
            type: string;
            vehicle_info: string;
            location?: string;
            business_type?: string;
          }[];
        };
        Returns: string;
      };
    };
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year";
      pricing_type: "one_time" | "recurring";
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
