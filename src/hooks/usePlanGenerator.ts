
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type PlanPeriod = "week" | "month";

export const usePlanGenerator = (userId: string | null) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const generatePlan = async (period: PlanPeriod) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate a workout plan.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: `Generating ${period} workout plan`,
        description: "Please wait while we create your personalized training plan.",
      });

      const { data, error } = await supabase.functions.invoke('planPeriod', {
        method: 'POST',
        body: {
          userId,
          period
        }
      });

      if (error) {
        console.error("Error generating plan:", error);
        throw new Error(`Failed to generate workout plan: ${error.message}`);
      }

      console.log("Plan generated:", data);

      toast({
        title: "Workout plan created!",
        description: `Successfully created a ${period} workout plan with ${data.workouts?.length || 0} sessions.`,
      });

      // Navigate to tracker to view the plan
      navigate("/tracker");
      
      return data;
    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePlan, isGenerating };
};
