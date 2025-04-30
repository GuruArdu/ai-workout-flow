
export interface WorkoutSession {
  id: string;
  date: string;
  goal: string;
  style: string;
  primary_muscles: string[];
}

export interface WeeklyVolumeData {
  wk: string;
  volume: number;
}

export interface ExerciseSession {
  exercise_name: string;
  date: string;
  sets: {
    weight: string;
    reps: string;
  }[];
}

export interface OneRepMaxData {
  date: string;
  displayDate: string;
  oneRepMax: number;
  bestSet: string;
}
