
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { GenerateWorkoutPlanResponse } from "@/types/edge-functions";
import { useNavigate } from "react-router-dom";
import { useDevUser } from "@/hooks/useDevUser";

type WorkoutData = {
  muscles: string[];
  style: string;
  duration: number;
  goal: string;
};

export const useWorkoutGenerator = (userId: string | null) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const devUser = useDevUser();
  const effectiveUserId = userId ?? devUser?.id ?? null;

  const generateWorkout = async (workoutData: WorkoutData) => {
    if (!effectiveUserId) {
      navigate("/auth");
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: "Generating workout plan",
        description: "Please wait while we create your personalized workout plan.",
      });

      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Failed to get user profile: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error("Profile not found. Please complete your profile first.");
      }

      console.log("Sending workout request with data:", { userId: effectiveUserId, ...workoutData, ...profile });

      const { data, error } = await supabase.functions.invoke<GenerateWorkoutPlanResponse>(
        'generateWorkoutPlan',
        {
          method: "POST",
          body: {
            userId: effectiveUserId,
            ...workoutData,
            age: profile.age,
            gender: profile.gender,
            height: profile.height,
            height_unit: profile.height_unit || "cm",
            weight: profile.weight,
            weight_unit: profile.weight_unit || "kg",
            activity_level: profile.activity_level
          },
        }
      );

      if (error) {
        console.error("Error response:", error);
        throw new Error(`Failed to generate workout plan: ${error.message}`);
      }

      console.log("Workout generated:", data);

      if (!data?.sessionId) {
        throw new Error("No session ID returned from API");
      }

      toast({
        title: "Workout generated!",
        description: "Your personalized workout plan is ready.",
      });

      navigate(`/workout/${data.sessionId}`);
    } catch (error: any) {
      console.error("Error generating workout:", error);
      toast({
        title: "Error",
        description: `Failed to generate workout plan: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateWorkout, isGenerating };
};
