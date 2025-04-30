
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, Loader2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { usePlanGenerator } from "@/hooks/usePlanGenerator";

interface GeneratePlanButtonProps {
  userId: string | null;
  variant?: "default" | "outline" | "secondary"; 
}

const GeneratePlanButton = ({ userId, variant = "default" }: GeneratePlanButtonProps) => {
  const { generatePlan, isGenerating } = usePlanGenerator(userId);
  
  const handleGeneratePlan = async (period: "week" | "month") => {
    await generatePlan(period);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} disabled={isGenerating} className="flex items-center gap-2">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
          Generate Training Plan
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleGeneratePlan("week")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
          <span>Generate Week Plan</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleGeneratePlan("month")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <CalendarDays className="h-4 w-4" />
          <span>Generate Month Plan</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GeneratePlanButton;
