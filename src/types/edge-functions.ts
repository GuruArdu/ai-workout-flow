
// Define edge function response types
export type GenerateWorkoutPlanResponse = {
  sessionId: string;
  plan: {
    exercises: {
      name: string;
      sets: number;
      reps: string;
      weight?: string;
    }[];
  }
};
