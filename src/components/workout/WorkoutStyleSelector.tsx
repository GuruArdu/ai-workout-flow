
import { Button } from "@/components/ui/button";

interface WorkoutStyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (style: string) => void;
  workoutStyles: string[];
}

const WorkoutStyleSelector = ({ 
  selectedStyle, 
  onStyleSelect, 
  workoutStyles 
}: WorkoutStyleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {workoutStyles.map((style) => (
        <Button
          key={style}
          variant={selectedStyle === style.toLowerCase() ? "default" : "outline"}
          className="py-6"
          onClick={() => onStyleSelect(style.toLowerCase())}
        >
          {style}
        </Button>
      ))}
    </div>
  );
};

export default WorkoutStyleSelector;
