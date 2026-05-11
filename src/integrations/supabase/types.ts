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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      palm_reports: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          reading_type: string | null
          report_json: Json | null
          user_age: string | null
          user_email: string | null
          user_name: string
          validation_confidence: number | null
          validation_quality: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          reading_type?: string | null
          report_json?: Json | null
          user_age?: string | null
          user_email?: string | null
          user_name: string
          validation_confidence?: number | null
          validation_quality?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          reading_type?: string | null
          report_json?: Json | null
          user_age?: string | null
          user_email?: string | null
          user_name?: string
          validation_confidence?: number | null
          validation_quality?: string | null
        }
        Relationships: []
      }
      palmmatch_reports: {
        Row: {
          id: string
          report_id: string
          person1_name: string
          person1_age: number
          person2_name: string
          person2_age: number
          relationship_type: string
          email: string
          overall_score: number
          reading: Json
          is_unlocked: boolean
          payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_id: string
          person1_name: string
          person1_age: number
          person2_name: string
          person2_age: number
          relationship_type: string
          email: string
          overall_score: number
          reading: Json
          is_unlocked?: boolean
          payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_id?: string
          person1_name?: string
          person1_age?: number
          person2_name?: string
          person2_age?: number
          relationship_type?: string
          email?: string
          overall_score?: number
          reading?: Json
          is_unlocked?: boolean
          payment_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "palmmatch_reports_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          coupon_code: string | null
          discount_amount: number
          created_at: string
          id: string
          plan_type: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          report_id: string | null
          status: string
          user_email: string
        }
        Insert: {
          amount: number
          coupon_code?: string | null
          discount_amount?: number
          created_at?: string
          id?: string
          plan_type: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          report_id?: string | null
          status?: string
          user_email: string
        }
        Update: {
          amount?: number
          coupon_code?: string | null
          discount_amount?: number
          created_at?: string
          id?: string
          plan_type?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          report_id?: string | null
          status?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "palm_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_unlocks: {
        Row: {
          id: string
          payment_id: string | null
          report_id: string
          unlocked_at: string
          user_email: string
        }
        Insert: {
          id?: string
          payment_id?: string | null
          report_id: string
          unlocked_at?: string
          user_email: string
        }
        Update: {
          id?: string
          payment_id?: string | null
          report_id?: string
          unlocked_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_unlocks_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_unlocks_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "palm_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          id: string
          payment_id: string | null
          plan: string
          started_at: string
          status: string
          expires_at: string | null
          user_email: string
        }
        Insert: {
          id?: string
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
          expires_at?: string | null
          user_email: string
        }
        Update: {
          id?: string
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
          expires_at?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
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
    Enums: {},
  },
} as const
