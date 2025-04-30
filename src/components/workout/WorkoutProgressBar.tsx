
import { WorkoutStep, getStepNumber } from "./WorkoutSteps";

interface WorkoutProgressBarProps {
  currentStep: WorkoutStep;
}

const WorkoutProgressBar = ({ currentStep }: WorkoutProgressBarProps) => {
  const steps: WorkoutStep[] = ["muscles", "style", "duration", "goal"];
  const currentStepNumber = getStepNumber(currentStep);
  
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-500">Step {currentStepNumber} of 4</div>
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div 
            key={s}
            className={`h-1 w-6 rounded-full ${
              currentStepNumber > i + 1 ? "bg-blue-600" : 
              currentStepNumber === i + 1 ? "bg-blue-400" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkoutProgressBar;
