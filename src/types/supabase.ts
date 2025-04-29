
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          activity_level: string | null
          goals: string[] | null
          created_at: string | null
          updated_at: string | null
          height_unit: string | null
          weight_unit: string | null
        }
        Insert: {
          id: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          goals?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          height_unit?: string | null
          weight_unit?: string | null
        }
        Update: {
          id?: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          goals?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          height_unit?: string | null
          weight_unit?: string | null
        }
      }
      workout_session: {
        Row: {
          id: string
          user_id: string
          date: string
          goal: string
          style: string
          duration_min: number
          primary_muscles: string[]
          ai_plan: Json
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          goal: string
          style: string
          duration_min: number
          primary_muscles: string[]
          ai_plan: Json
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          goal?: string
          style?: string
          duration_min?: number
          primary_muscles?: string[]
          ai_plan?: Json
        }
      }
      exercise_log: {
        Row: {
          id: string
          user_id: string
          workout_session_id: string | null
          exercise_name: string
          sets: Json[]
          date: string
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          workout_session_id?: string | null
          exercise_name: string
          sets: Json[]
          date?: string
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          workout_session_id?: string | null
          exercise_name?: string
          sets?: Json[]
          date?: string
          notes?: string | null
        }
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
  }
}
