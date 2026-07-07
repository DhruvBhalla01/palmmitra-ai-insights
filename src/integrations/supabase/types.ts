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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          message_count: number
          report_id: string
          title: string
          total_input_tokens: number
          total_output_tokens: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          message_count?: number
          report_id: string
          title?: string
          total_input_tokens?: number
          total_output_tokens?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          message_count?: number
          report_id?: string
          title?: string
          total_input_tokens?: number
          total_output_tokens?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "palm_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_entitlements: {
        Row: {
          free_questions_remaining: number
          granted_report_ids: string[]
          pack_questions_remaining: number
          subscription_expires_at: string | null
          subscription_month_reset_at: string | null
          subscription_month_usage: number
          subscription_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          free_questions_remaining?: number
          granted_report_ids?: string[]
          pack_questions_remaining?: number
          subscription_expires_at?: string | null
          subscription_month_reset_at?: string | null
          subscription_month_usage?: number
          subscription_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          free_questions_remaining?: number
          granted_report_ids?: string[]
          pack_questions_remaining?: number
          subscription_expires_at?: string | null
          subscription_month_reset_at?: string | null
          subscription_month_usage?: number
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          input_tokens: number
          model: string | null
          output_tokens: number
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          input_tokens?: number
          model?: string | null
          output_tokens?: number
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          input_tokens?: number
          model?: string | null
          output_tokens?: number
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_pricing_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      ai_usage_events: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          input_tokens: number
          message_id: string | null
          output_tokens: number
          source: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          input_tokens?: number
          message_id?: string | null
          output_tokens?: number
          source: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          input_tokens?: number
          message_id?: string | null
          output_tokens?: number
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
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
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          palmmatch_report_id: string | null
          plan_type: string
          razorpay_order_id: string
          razorpay_payment_id: string | null
          report_id: string | null
          status: string
          user_email: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          palmmatch_report_id?: string | null
          plan_type: string
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          report_id?: string | null
          status?: string
          user_email: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          palmmatch_report_id?: string | null
          plan_type?: string
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          report_id?: string | null
          status?: string
          user_email?: string
          user_id?: string | null
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
          user_email: string
        }
        Insert: {
          id?: string
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
          user_email: string
        }
        Update: {
          id?: string
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
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
      debit_ai_question: {
        Args: { _user_id: string }
        Returns: {
          ok: boolean
          source: string
        }[]
      }
      grant_report_free_questions: {
        Args: { _n: number; _report_id: string; _user_id: string }
        Returns: undefined
      }
      refund_ai_question: {
        Args: { _source: string; _user_id: string }
        Returns: undefined
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
