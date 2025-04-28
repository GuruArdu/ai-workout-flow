
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

