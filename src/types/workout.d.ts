
// Define the types for workout-related data

export interface ExerciseLog {
  weight?: string;
  reps?: string;
  completed?: boolean;
}

export interface ExerciseSet {
  weight?: string;
  reps?: string;
  completed?: boolean;
}

export interface Exercise {
  name: string;
  sets: number;  // Changed to number for better compatibility with function call response
  reps: string;
  weight?: string;
}

export interface WorkoutSession {
  id: string;
  goal: string;
  style: string;
  duration_min: number;
  primary_muscles: string[];
  ai_plan: {
    exercises: Exercise[];
  };
}
