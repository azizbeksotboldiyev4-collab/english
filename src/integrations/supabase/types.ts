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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          mode: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mode?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mode?: string
          title?: string
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
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
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
      custom_lessons: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          examples: Json
          explanation: string
          id: string
          is_locked: boolean
          level_id: string
          practice: Json
          quiz: Json
          real_life: Json
          title: string
          title_uz: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          examples?: Json
          explanation?: string
          id?: string
          is_locked?: boolean
          level_id?: string
          practice?: Json
          quiz?: Json
          real_life?: Json
          title: string
          title_uz: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          examples?: Json
          explanation?: string
          id?: string
          is_locked?: boolean
          level_id?: string
          practice?: Json
          quiz?: Json
          real_life?: Json
          title?: string
          title_uz?: string
          updated_at?: string
        }
        Relationships: []
      }
      level_exams: {
        Row: {
          can_retake_at: string | null
          id: string
          level: string
          passed: boolean
          score: number
          taken_at: string
          user_id: string
        }
        Insert: {
          can_retake_at?: string | null
          id?: string
          level: string
          passed?: boolean
          score: number
          taken_at?: string
          user_id: string
        }
        Update: {
          can_retake_at?: string | null
          id?: string
          level?: string
          passed?: boolean
          score?: number
          taken_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listening_exercises: {
        Row: {
          audio_text: string
          correct_answer: string | null
          created_at: string
          created_by: string | null
          id: string
          level: string
          options: string[] | null
          question: string | null
          title: string
          updated_at: string
        }
        Insert: {
          audio_text: string
          correct_answer?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          options?: string[] | null
          question?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          audio_text?: string
          correct_answer?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          options?: string[] | null
          question?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_premium: boolean
          premium_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_premium?: boolean
          premium_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_premium?: boolean
          premium_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      speaking_exercises: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          level: string
          text: string
          title: string
          translation: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          text: string
          title: string
          translation?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          text?: string
          title?: string
          translation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          badges: string[]
          completed_topics: string[]
          created_at: string
          current_level: string
          id: string
          last_accessed_at: string | null
          last_lesson_id: string | null
          last_level_id: string | null
          last_streak_date: string | null
          quiz_scores: Json
          streak: number
          updated_at: string
          user_id: string
          weekly_activity: Json
          xp: number
        }
        Insert: {
          badges?: string[]
          completed_topics?: string[]
          created_at?: string
          current_level?: string
          id?: string
          last_accessed_at?: string | null
          last_lesson_id?: string | null
          last_level_id?: string | null
          last_streak_date?: string | null
          quiz_scores?: Json
          streak?: number
          updated_at?: string
          user_id: string
          weekly_activity?: Json
          xp?: number
        }
        Update: {
          badges?: string[]
          completed_topics?: string[]
          created_at?: string
          current_level?: string
          id?: string
          last_accessed_at?: string | null
          last_lesson_id?: string | null
          last_level_id?: string | null
          last_streak_date?: string | null
          quiz_scores?: Json
          streak?: number
          updated_at?: string
          user_id?: string
          weekly_activity?: Json
          xp?: number
        }
        Relationships: []
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
      vocab_lessons: {
        Row: {
          category: string
          created_at: string
          id: number
          lesson_order: number
          title: string
          title_uz: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: number
          lesson_order?: number
          title: string
          title_uz: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          lesson_order?: number
          title?: string
          title_uz?: string
        }
        Relationships: []
      }
      vocab_words: {
        Row: {
          emoji: string
          en: string
          id: number
          lesson_id: number
          pronunciation: string
          uz: string
          word_order: number
        }
        Insert: {
          emoji?: string
          en: string
          id?: number
          lesson_id: number
          pronunciation?: string
          uz: string
          word_order?: number
        }
        Update: {
          emoji?: string
          en?: string
          id?: number
          lesson_id?: number
          pronunciation?: string
          uz?: string
          word_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "vocab_words_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "vocab_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_items: {
        Row: {
          created_at: string
          created_by: string | null
          example: string | null
          id: string
          level: string
          translation: string
          updated_at: string
          word: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          example?: string | null
          id?: string
          level?: string
          translation: string
          updated_at?: string
          word: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          example?: string | null
          id?: string
          level?: string
          translation?: string
          updated_at?: string
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      listening_exercises_public: {
        Row: {
          audio_text: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          level: string | null
          options: string[] | null
          question: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          audio_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          level?: string | null
          options?: string[] | null
          question?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          level?: string | null
          options?: string[] | null
          question?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
