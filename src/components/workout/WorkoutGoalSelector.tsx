
import { Button } from "@/components/ui/button";

interface WorkoutGoalSelectorProps {
  selectedGoal: string;
  onGoalSelect: (goal: string) => void;
  goals: string[];
}

const WorkoutGoalSelector = ({ 
  selectedGoal, 
  onGoalSelect, 
  goals 
}: WorkoutGoalSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {goals.map((goal) => (
        <Button
          key={goal}
          variant={selectedGoal === goal.toLowerCase() ? "default" : "outline"}
          className="py-6"
          onClick={() => onGoalSelect(goal.toLowerCase())}
        >
          {goal}
        </Button>
      ))}
    </div>
  );
};

export default WorkoutGoalSelector;
