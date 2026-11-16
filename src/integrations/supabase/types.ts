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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          candidate_email: string
          candidate_name: string | null
          code: string
          created_at: string
          exam_duration_minutes: number
          exam_question_count: number | null
          exam_type_id: string | null
          id: string
          is_used: boolean
        }
        Insert: {
          candidate_email: string
          candidate_name?: string | null
          code: string
          created_at?: string
          exam_duration_minutes?: number
          exam_question_count?: number | null
          exam_type_id?: string | null
          id?: string
          is_used?: boolean
        }
        Update: {
          candidate_email?: string
          candidate_name?: string | null
          code?: string
          created_at?: string
          exam_duration_minutes?: number
          exam_question_count?: number | null
          exam_type_id?: string | null
          id?: string
          is_used?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          question_id: number
          selected_option: string
          session_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct: boolean
          question_id: number
          selected_option: string
          session_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_id?: number
          selected_option?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_session_questions: {
        Row: {
          id: string
          question_id: number
          question_order: number
          session_id: string
        }
        Insert: {
          id?: string
          question_id: number
          question_order: number
          session_id: string
        }
        Update: {
          id?: string
          question_id?: number
          question_order?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_session_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      difficulty_levels: {
        Row: { created_at: string; description: string; id: string; name: string; sort_order: number }
        Insert: { created_at?: string; description: string; id?: string; name: string; sort_order: number }
        Update: { created_at?: string; description?: string; id?: string; name?: string; sort_order?: number }
        Relationships: []
      }
      exam_sessions: {
        Row: {
          access_code_id: string | null
          candidate_email: string
          candidate_name: string
          created_at: string
          duration_minutes: number
          exam_type_id: string | null
          finished_at: string | null
          id: string
          score: number | null
          session_token_hash: string | null
          started_at: string
          status: string
          total_questions: number
        }
        Insert: {
          access_code_id?: string | null
          candidate_email: string
          candidate_name: string
          created_at?: string
          duration_minutes?: number
          exam_type_id?: string | null
          finished_at?: string | null
          id?: string
          score?: number | null
          session_token_hash?: string | null
          started_at?: string
          status?: string
          total_questions?: number
        }
        Update: {
          access_code_id?: string | null
          candidate_email?: string
          candidate_name?: string
          created_at?: string
          duration_minutes?: number
          exam_type_id?: string | null
          finished_at?: string | null
          id?: string
          score?: number | null
          session_token_hash?: string | null
          started_at?: string
          status?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_sessions_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_type_categories: {
        Row: {
          category: string
          created_at: string
          exam_type_id: string
          id: string
        }
        Insert: {
          category: string
          created_at?: string
          exam_type_id: string
          id?: string
        }
        Update: {
          category?: string
          created_at?: string
          exam_type_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_type_categories_exam_type_id_fkey"
            columns: ["exam_type_id"]
            isOneToOne: false
            referencedRelation: "exam_types"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_types: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          question_count: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name: string
          question_count?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          question_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          category: string
          correct_option: string
          created_at: string
          difficulty_level_id: string
          exam_type_id: string
          id: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string | null
          option_e: string | null
          question_text: string
        }
        Insert: {
          category: string
          correct_option: string
          created_at?: string
          difficulty_level_id: string
          exam_type_id: string
          id?: number
          option_a: string
          option_b: string
          option_c: string
          option_d?: string | null
          option_e?: string | null
          question_text: string
        }
        Update: {
          category?: string
          correct_option?: string
          created_at?: string
          difficulty_level_id?: string
          exam_type_id?: string
          id?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string | null
          option_e?: string | null
          question_text?: string
        }
        Relationships: [
          { foreignKeyName: "questions_difficulty_level_fk"; columns: ["difficulty_level_id"]; isOneToOne: false; referencedRelation: "difficulty_levels"; referencedColumns: ["id"] },
          { foreignKeyName: "questions_exam_type_fk"; columns: ["exam_type_id"]; isOneToOne: false; referencedRelation: "exam_types"; referencedColumns: ["id"] },
          { foreignKeyName: "questions_type_category_fk"; columns: ["exam_type_id", "category"]; isOneToOne: false; referencedRelation: "exam_type_categories"; referencedColumns: ["exam_type_id", "category"] }
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      finish_exam: {
        Args: { p_session_id: string; p_session_token: string }
        Returns: Json
      }
      get_exam_questions: {
        Args: { p_session_id: string; p_session_token: string }
        Returns: {
          category: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          option_e: string
          question_id: number
          question_order: number
          question_text: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      start_exam: {
        Args: { p_candidate_name: string; p_code: string }
        Returns: Json
      }
      submit_exam_answer: {
        Args: {
          p_question_id: number
          p_selected_option: string
          p_session_id: string
          p_session_token: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
