
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDevUser } from "@/hooks/useDevUser";
import WorkoutMuscleSelector from "@/components/workout/WorkoutMuscleSelector";
import WorkoutStyleSelector from "@/components/workout/WorkoutStyleSelector";
import WorkoutDurationSelector from "@/components/workout/WorkoutDurationSelector";
import WorkoutGoalSelector from "@/components/workout/WorkoutGoalSelector";
import WorkoutSteps, { WorkoutStep } from "@/components/workout/WorkoutSteps";
import WorkoutProgressBar from "@/components/workout/WorkoutProgressBar";
import { useWorkoutGenerator } from "@/hooks/useWorkoutGenerator";

type WorkoutData = {
  muscles: string[];
  style: string;
  duration: number;
  goal: string;
};

const StartWorkout = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const devUser = useDevUser();
  const [step, setStep] = useState<WorkoutStep>("muscles");
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    muscles: [],
    style: "gym",
    duration: 30,
    goal: "strength",
  });

  // Use either authenticated user or dev user
  const userId = session?.user?.id ?? devUser?.id ?? null;
  const { generateWorkout, isGenerating } = useWorkoutGenerator(userId);
  
  if (!userId) {
    navigate("/auth");
    return null;
  }

  const updateData = <K extends keyof WorkoutData>(key: K, value: WorkoutData[K]) => {
    setWorkoutData((prev) => ({ ...prev, [key]: value }));
  };

  // Memoize the muscle groups to improve performance
  const muscleGroups = useMemo(() => [
    { name: "Chest", icon: "💪" },
    { name: "Back", icon: "🔙" },
    { name: "Shoulders", icon: "🤸" },
    { name: "Arms", icon: "💪" },
    { name: "Core", icon: "🧠" },
    { name: "Legs", icon: "🦵" },
    { name: "Glutes", icon: "🍑" },
    { name: "Full Body", icon: "👤" },
  ], []);

  // Memoize the workout styles to improve performance - Updated list
  const workoutStyles = useMemo(() => [
    "Gym", "Body-Weight", "Calisthenics", "Yoga", "Pilates", "HIIT"
  ], []);

  // Memoize the durations to improve performance
  const durations = useMemo(() => [5, 15, 30, 45, 60, 90], []);

  // Memoize the goals to improve performance - Updated list
  const goals = useMemo(() => [
    "Muscle Endurance", "Hypertrophy", "Strength", "Fat Loss"
  ], []);

  const handleMuscleToggle = (muscleName: string) => {
    if (workoutData.muscles.includes(muscleName)) {
      updateData("muscles", workoutData.muscles.filter(m => m !== muscleName));
    } else {
      updateData("muscles", [...workoutData.muscles, muscleName]);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "muscles":
        return (
          <WorkoutMuscleSelector
            selectedMuscles={workoutData.muscles}
            onMuscleToggle={handleMuscleToggle}
            muscleGroups={muscleGroups}
          />
        );
      case "style":
        return (
          <WorkoutStyleSelector
            selectedStyle={workoutData.style}
            onStyleSelect={(style) => updateData("style", style)}
            workoutStyles={workoutStyles}
          />
        );
      case "duration":
        return (
          <WorkoutDurationSelector
            selectedDuration={workoutData.duration}
            onDurationSelect={(duration) => updateData("duration", duration)}
            durations={durations}
          />
        );
      case "goal":
        return (
          <WorkoutGoalSelector
            selectedGoal={workoutData.goal}
            onGoalSelect={(goal) => updateData("goal", goal)}
            goals={goals}
          />
        );
    }
  };

  const handleNext = () => {
    switch (step) {
      case "muscles":
        setStep("style");
        break;
      case "style":
        setStep("duration");
        break;
      case "duration":
        setStep("goal");
        break;
      case "goal":
        generateWorkout(workoutData);
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "style":
        setStep("muscles");
        break;
      case "duration":
        setStep("style");
        break;
      case "goal":
        setStep("duration");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-blue-600" />
            </div>
            <WorkoutProgressBar currentStep={step} />
            <WorkoutSteps step={step}>
              {renderStepContent()}
            </WorkoutSteps>
          </CardHeader>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={step === "muscles" ? () => navigate("/dashboard") : handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={
                (step === "muscles" && workoutData.muscles.length === 0) ||
                isGenerating
              }
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                "Generating..."
              ) : (
                step === "goal" ? "Generate Plan" : "Continue"
              )}
              {step !== "goal" && <ArrowRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StartWorkout;
