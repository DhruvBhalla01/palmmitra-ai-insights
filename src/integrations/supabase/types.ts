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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
          id: string
          pack_questions_remaining: number
          report_id: string | null
          subscription_expires_at: string | null
          subscription_month_reset_at: string | null
          subscription_month_usage: number
          subscription_plan: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          free_questions_remaining?: number
          granted_report_ids?: string[]
          id?: string
          pack_questions_remaining?: number
          report_id?: string | null
          subscription_expires_at?: string | null
          subscription_month_reset_at?: string | null
          subscription_month_usage?: number
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          free_questions_remaining?: number
          granted_report_ids?: string[]
          id?: string
          pack_questions_remaining?: number
          report_id?: string | null
          subscription_expires_at?: string | null
          subscription_month_reset_at?: string | null
          subscription_month_usage?: number
          subscription_plan?: string | null
          updated_at?: string
          user_id?: string | null
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
          report_id: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          input_tokens?: number
          message_id?: string | null
          output_tokens?: number
          report_id?: string | null
          source: string
          user_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          input_tokens?: number
          message_id?: string | null
          output_tokens?: number
          report_id?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          anonymous_id: string | null
          browser: string | null
          device_type: string | null
          environment: string
          event_id: string
          event_name: string
          first_touch: Json
          id: string
          landing_page: string | null
          language: string | null
          latest_touch: Json
          occurred_at: string
          os: string | null
          page_path: string | null
          page_title: string | null
          page_url: string | null
          previous_page: string | null
          properties: Json
          received_at: string
          referrer: string | null
          screen_height: number | null
          screen_width: number | null
          session_id: string | null
          source: string
          timezone: string | null
          user_email: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          anonymous_id?: string | null
          browser?: string | null
          device_type?: string | null
          environment?: string
          event_id: string
          event_name: string
          first_touch?: Json
          id?: string
          landing_page?: string | null
          language?: string | null
          latest_touch?: Json
          occurred_at?: string
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          page_url?: string | null
          previous_page?: string | null
          properties?: Json
          received_at?: string
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          source?: string
          timezone?: string | null
          user_email?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          anonymous_id?: string | null
          browser?: string | null
          device_type?: string | null
          environment?: string
          event_id?: string
          event_name?: string
          first_touch?: Json
          id?: string
          landing_page?: string | null
          language?: string | null
          latest_touch?: Json
          occurred_at?: string
          os?: string | null
          page_path?: string | null
          page_title?: string | null
          page_url?: string | null
          previous_page?: string | null
          properties?: Json
          received_at?: string
          referrer?: string | null
          screen_height?: number | null
          screen_width?: number | null
          session_id?: string | null
          source?: string
          timezone?: string | null
          user_email?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
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
          expires_at: string | null
          id: string
          payment_id: string | null
          plan: string
          started_at: string
          status: string
          user_email: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          plan?: string
          started_at?: string
          status?: string
          user_email: string
        }
        Update: {
          expires_at?: string | null
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
      analytics_funnel: {
        Row: {
          analysis_completed: number | null
          checkout_started: number | null
          day: string | null
          device_type: string | null
          environment: string | null
          palm_image_uploaded: number | null
          palm_reading_started: number | null
          payment_initiated: number | null
          payment_success: number | null
          pdf_downloaded: number | null
          plan_selected: number | null
          preview_viewed: number | null
          pricing_viewed: number | null
          report_unlocked: number | null
          visitors: number | null
        }
        Relationships: []
      }
      analytics_page_exits: {
        Row: {
          active_time_on_page_seconds: number | null
          anonymous_id: string | null
          device_type: string | null
          environment: string | null
          exit_type: string | null
          first_touch: Json | null
          landing_page: string | null
          last_interaction_element: string | null
          last_interaction_type: string | null
          latest_touch: Json | null
          max_scroll_depth_percent: number | null
          occurred_at: string | null
          page_path: string | null
          pages_in_session: number | null
          previous_page: string | null
          session_duration_seconds: number | null
          session_id: string | null
          time_on_page_seconds: number | null
          user_id: string | null
        }
        Insert: {
          active_time_on_page_seconds?: never
          anonymous_id?: string | null
          device_type?: string | null
          environment?: string | null
          exit_type?: never
          first_touch?: Json | null
          landing_page?: string | null
          last_interaction_element?: never
          last_interaction_type?: never
          latest_touch?: Json | null
          max_scroll_depth_percent?: never
          occurred_at?: string | null
          page_path?: string | null
          pages_in_session?: never
          previous_page?: string | null
          session_duration_seconds?: never
          session_id?: string | null
          time_on_page_seconds?: never
          user_id?: string | null
        }
        Update: {
          active_time_on_page_seconds?: never
          anonymous_id?: string | null
          device_type?: string | null
          environment?: string | null
          exit_type?: never
          first_touch?: Json | null
          landing_page?: string | null
          last_interaction_element?: never
          last_interaction_type?: never
          latest_touch?: Json | null
          max_scroll_depth_percent?: never
          occurred_at?: string | null
          page_path?: string | null
          pages_in_session?: never
          previous_page?: string | null
          session_duration_seconds?: never
          session_id?: string | null
          time_on_page_seconds?: never
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_page_report: {
        Row: {
          avg_active_time_seconds: number | null
          avg_scroll_depth_percent: number | null
          avg_time_on_page_seconds: number | null
          cta_rate: number | null
          device_type: string | null
          exit_rate: number | null
          median_active_time_seconds: number | null
          page_path: string | null
          page_visits: number | null
          sessions: number | null
        }
        Relationships: []
      }
      analytics_session_journey: {
        Row: {
          anonymous_id: string | null
          device_type: string | null
          event_name: string | null
          first_touch: Json | null
          landing_page: string | null
          latest_touch: Json | null
          occurred_at: string | null
          page_path: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          anonymous_id?: string | null
          device_type?: string | null
          event_name?: string | null
          first_touch?: Json | null
          landing_page?: string | null
          latest_touch?: Json | null
          occurred_at?: string | null
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          anonymous_id?: string | null
          device_type?: string | null
          event_name?: string | null
          first_touch?: Json | null
          landing_page?: string | null
          latest_touch?: Json | null
          occurred_at?: string | null
          page_path?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      debit_ai_question: {
        Args: { _user_id: string }
        Returns: {
          ok: boolean
          source: string
        }[]
      }
      debit_ai_question_by_report: {
        Args: { _report_id: string }
        Returns: {
          ok: boolean
          source: string
        }[]
      }
      grant_free_questions_by_report: {
        Args: { _n: number; _report_id: string }
        Returns: undefined
      }
      grant_report_free_questions: {
        Args: { _n: number; _report_id: string; _user_id: string }
        Returns: undefined
      }
      refund_ai_question: {
        Args: { _source: string; _user_id: string }
        Returns: undefined
      }
      refund_ai_question_by_report: {
        Args: { _report_id: string; _source: string }
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
