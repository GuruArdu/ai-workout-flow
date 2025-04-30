
import { Button } from "@/components/ui/button";

type MuscleGroup = {
  name: string;
  icon: string;
};

interface WorkoutMuscleSelectorProps {
  selectedMuscles: string[];
  onMuscleToggle: (muscle: string) => void;
  muscleGroups: MuscleGroup[];
}

const WorkoutMuscleSelector = ({ 
  selectedMuscles, 
  onMuscleToggle, 
  muscleGroups 
}: WorkoutMuscleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {muscleGroups.map((muscle) => (
        <div key={muscle.name}>
          <Button
            variant={selectedMuscles.includes(muscle.name) ? "default" : "outline"}
            className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${selectedMuscles.includes(muscle.name) ? "bg-blue-600 text-white" : ""}`}
            onClick={() => onMuscleToggle(muscle.name)}
          >
            <span className="text-2xl">{muscle.icon}</span>
            <span>{muscle.name}</span>
          </Button>
        </div>
      ))}
    </div>
  );
};

export default WorkoutMuscleSelector;
