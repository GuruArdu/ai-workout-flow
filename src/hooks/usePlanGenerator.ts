
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useDevUser } from "@/hooks/useDevUser";

export const usePlanGenerator = (userId: string | null) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const devUser = useDevUser();
  const effectiveUserId = userId ?? devUser?.id ?? null;

  const generatePlan = async (period: "week" | "month") => {
    if (!effectiveUserId) {
      navigate("/auth");
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: "Generating training plan",
        description: `Creating your ${period} plan, please wait...`,
      });

      const { data, error } = await supabase.functions.invoke<{
        planId: string;
      }>("planPeriod", {
        method: "POST",
        body: { 
          userId: effectiveUserId, 
          period 
        }
      });

      if (error) {
        throw new Error(`Failed to generate ${period} plan: ${error.message}`);
      }

      toast({
        title: "Plan generated!",
        description: `Your ${period} plan is ready.`,
      });

      if (data?.planId) {
        navigate(`/plan/${data.planId}`);
      }

    } catch (error: any) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePlan, isGenerating };
};
