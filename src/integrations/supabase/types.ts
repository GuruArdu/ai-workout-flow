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
      exercise_log: {
        Row: {
          date: string | null
          exercise_name: string
          id: string
          notes: string | null
          sets: Json[]
          user_id: string
          workout_session_id: string | null
        }
        Insert: {
          date?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          sets: Json[]
          user_id: string
          workout_session_id?: string | null
        }
        Update: {
          date?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          sets?: Json[]
          user_id?: string
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_log_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_session"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          activity_level: string | null
          age: number | null
          fitness_level: string | null
          gender: string | null
          goal: string | null
          height: number | null
          height_unit: string | null
          inserted_at: string | null
          updated_at: string | null
          user_id: string
          username: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          fitness_level?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string | null
          inserted_at?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          fitness_level?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          height_unit?: string | null
          inserted_at?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          fitness_level: string | null
          gender: string | null
          height: number | null
          height_unit: string | null
          id: string
          updated_at: string | null
          username: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          height_unit?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          fitness_level?: string | null
          gender?: string | null
          height?: number | null
          height_unit?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: []
      }
      workout_session: {
        Row: {
          ai_plan: Json
          date: string | null
          duration_min: number
          goal: string
          id: string
          primary_muscles: string[]
          style: string
          user_id: string
        }
        Insert: {
          ai_plan: Json
          date?: string | null
          duration_min: number
          goal: string
          id?: string
          primary_muscles: string[]
          style: string
          user_id: string
        }
        Update: {
          ai_plan?: Json
          date?: string | null
          duration_min?: number
          goal?: string
          id?: string
          primary_muscles?: string[]
          style?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dev_or_owner: {
        Args: { uid: string; row_uid: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
