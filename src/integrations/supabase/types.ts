export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          responded_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          responded_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          responded_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          category: Database["public"]["Enums"]["lesson_category"]
          content_en: string | null
          content_fr: string | null
          content_rw: string | null
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_rw: string | null
          display_order: number
          file_url: string | null
          id: string
          is_active: boolean
          is_premium: boolean
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          title_en: string
          title_fr: string
          title_rw: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["lesson_category"]
          content_en?: string | null
          content_fr?: string | null
          content_rw?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_rw?: string | null
          display_order?: number
          file_url?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          title_en: string
          title_fr: string
          title_rw: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["lesson_category"]
          content_en?: string | null
          content_fr?: string | null
          content_rw?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_rw?: string | null
          display_order?: number
          file_url?: string | null
          id?: string
          is_active?: boolean
          is_premium?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          title_en?: string
          title_fr?: string
          title_rw?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_rwf: number
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone_number: string | null
          plan_id: string
          status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_rwf: number
          created_at?: string
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone_number?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_rwf?: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone_number?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          attempts_included: number | null
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_rw: string | null
          display_order: number
          duration_days: number
          features_en: Json
          features_fr: Json
          features_rw: Json
          id: string
          is_active: boolean
          name_en: string
          name_fr: string
          name_rw: string
          price_rwf: number
          updated_at: string
        }
        Insert: {
          attempts_included?: number | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_rw?: string | null
          display_order?: number
          duration_days: number
          features_en?: Json
          features_fr?: Json
          features_rw?: Json
          id?: string
          is_active?: boolean
          name_en: string
          name_fr: string
          name_rw: string
          price_rwf: number
          updated_at?: string
        }
        Update: {
          attempts_included?: number | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_rw?: string | null
          display_order?: number
          duration_days?: number
          features_en?: Json
          features_fr?: Json
          features_rw?: Json
          id?: string
          is_active?: boolean
          name_en?: string
          name_fr?: string
          name_rw?: string
          price_rwf?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          attempts_left: number | null
          created_at: string
          current_plan_id: string | null
          email: string
          full_name: string
          id: string
          is_admin: boolean
          language: string
          plan_expires_at: string | null
          total_attempts_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_left?: number | null
          created_at?: string
          current_plan_id?: string | null
          email: string
          full_name: string
          id?: string
          is_admin?: boolean
          language?: string
          plan_expires_at?: string | null
          total_attempts_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts_left?: number | null
          created_at?: string
          current_plan_id?: string | null
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          language?: string
          plan_expires_at?: string | null
          total_attempts_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_current_plan"
            columns: ["current_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          display_order: number
          explanation_en: string | null
          explanation_fr: string | null
          explanation_rw: string | null
          id: string
          image_url: string | null
          options_en: Json
          options_fr: Json
          options_rw: Json
          quiz_id: string
          text_en: string
          text_fr: string
          text_rw: string
          updated_at: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          display_order?: number
          explanation_en?: string | null
          explanation_fr?: string | null
          explanation_rw?: string | null
          id?: string
          image_url?: string | null
          options_en: Json
          options_fr: Json
          options_rw: Json
          quiz_id: string
          text_en: string
          text_fr: string
          text_rw: string
          updated_at?: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          display_order?: number
          explanation_en?: string | null
          explanation_fr?: string | null
          explanation_rw?: string | null
          id?: string
          image_url?: string | null
          options_en?: Json
          options_fr?: Json
          options_rw?: Json
          quiz_id?: string
          text_en?: string
          text_fr?: string
          text_rw?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          completed_at: string
          correct_answers: number
          created_at: string
          id: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          submitted_answers: Json
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          correct_answers: number
          created_at?: string
          id?: string
          passed: boolean
          quiz_id: string
          score: number
          started_at: string
          submitted_answers: Json
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string
          correct_answers?: number
          created_at?: string
          id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          submitted_answers?: Json
          time_taken_seconds?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_rw: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          display_order: number
          duration_minutes: number
          id: string
          is_active: boolean
          is_premium: boolean
          pass_percentage: number
          title_en: string
          title_fr: string
          title_rw: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_rw?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_premium?: boolean
          pass_percentage?: number
          title_en: string
          title_fr: string
          title_rw: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_rw?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          display_order?: number
          duration_minutes?: number
          id?: string
          is_active?: boolean
          is_premium?: boolean
          pass_percentage?: number
          title_en?: string
          title_fr?: string
          title_rw?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          attempts_remaining: number | null
          created_at: string
          expires_at: string
          id: string
          plan_id: string
          starts_at: string
          status: Database["public"]["Enums"]["plan_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_remaining?: number | null
          created_at?: string
          expires_at: string
          id?: string
          plan_id: string
          starts_at?: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts_remaining?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          plan_id?: string
          starts_at?: string
          status?: Database["public"]["Enums"]["plan_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      lesson_category:
        | "road_signs"
        | "traffic_rules"
        | "safety"
        | "vehicle_control"
        | "emergency_procedures"
      lesson_type: "markdown" | "video" | "pdf"
      payment_method: "mtn_mobile_money" | "airtel_money" | "card"
      payment_status: "pending" | "completed" | "failed" | "cancelled"
      plan_status: "active" | "expired" | "cancelled"
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
      difficulty_level: ["easy", "medium", "hard"],
      lesson_category: [
        "road_signs",
        "traffic_rules",
        "safety",
        "vehicle_control",
        "emergency_procedures",
      ],
      lesson_type: ["markdown", "video", "pdf"],
      payment_method: ["mtn_mobile_money", "airtel_money", "card"],
      payment_status: ["pending", "completed", "failed", "cancelled"],
      plan_status: ["active", "expired", "cancelled"],
    },
  },
} as const
