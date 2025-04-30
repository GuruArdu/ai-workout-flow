
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
      profile: {
        Row: {
          user_id: string
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          activity_level: string | null
          fitness_level: string | null
          goal: string | null
          updated_at: string | null
          height_unit: string | null
          weight_unit: string | null
          username: string | null
        }
        Insert: {
          user_id: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          fitness_level?: string | null
          goal?: string | null
          updated_at?: string | null
          height_unit?: string | null
          weight_unit?: string | null
          username?: string | null
        }
        Update: {
          user_id?: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          fitness_level?: string | null
          goal?: string | null
          updated_at?: string | null
          height_unit?: string | null
          weight_unit?: string | null
          username?: string | null
        }
      },
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
        }
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
  }
}
