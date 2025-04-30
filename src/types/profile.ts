
export type HeightUnit = "cm" | "in";
export type WeightUnit = "kg" | "lbs";

export interface UserProfile {
  user_id: string;
  username: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  height_unit: HeightUnit | null;
  weight: number | null;
  weight_unit: WeightUnit | null;
  fitness_level: string | null;
  activity_level: string | null;
  goal: string | null;
  inserted_at: string | null;
  updated_at: string | null;
}
