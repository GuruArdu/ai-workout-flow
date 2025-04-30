
import { Button } from "@/components/ui/button";

interface WorkoutDurationSelectorProps {
  selectedDuration: number;
  onDurationSelect: (duration: number) => void;
  durations: number[];
}

const WorkoutDurationSelector = ({ 
  selectedDuration, 
  onDurationSelect, 
  durations 
}: WorkoutDurationSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {durations.map((mins) => (
        <Button
          key={mins}
          variant={selectedDuration === mins ? "default" : "outline"}
          className="py-6"
          onClick={() => onDurationSelect(mins)}
        >
          {mins} min
        </Button>
      ))}
    </div>
  );
};

export default WorkoutDurationSelector;
