import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Dumbbell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type WorkoutStep = "muscles" | "style" | "duration" | "goal";

type WorkoutData = {
  muscles: string[];
  style: string;
  duration: number;
  goal: string;
};

const StartWorkout = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [step, setStep] = useState<WorkoutStep>("muscles");
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    muscles: [],
    style: "gym",
    duration: 30,
    goal: "strength",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!session) {
    navigate("/auth");
    return null;
  }

  const updateData = <K extends keyof WorkoutData>(key: K, value: WorkoutData[K]) => {
    setWorkoutData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateWorkout = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Generating workout plan",
        description: "Please wait while we create your personalized workout plan.",
      });

      console.log("Sending workout request:", workoutData);

      const { data: payload, error } = await supabase.functions.invoke('generateWorkoutPlan', {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...workoutData,
        }),
      });

      if (error) {
        console.error("Error response:", error);
        throw new Error(`Failed to generate workout plan: ${error.message}`);
      }

      console.log("Workout generated:", payload);

      if (!payload?.sessionId) {
        throw new Error("No session ID returned from API");
      }

      toast({
        title: "Workout generated!",
        description: "Your personalized workout plan is ready.",
      });

      navigate(`/workout/${payload.sessionId}`);
    } catch (error) {
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

  const muscleGroups = [
    { name: "Chest", icon: "💪" },
    { name: "Back", icon: "🔙" },
    { name: "Shoulders", icon: "🤸" },
    { name: "Arms", icon: "💪" },
    { name: "Core", icon: "🧠" },
    { name: "Legs", icon: "🦵" },
    { name: "Glutes", icon: "🍑" },
    { name: "Full Body", icon: "👤" },
  ];

  const workoutStyles = [
    "Gym", "Bodyweight", "Yoga", "Pilates", "HIIT", "Functional"
  ];

  const durations = [5, 15, 30, 45, 60, 90];

  const goals = [
    "Muscle Endurance", "Power", "Strength", "Hypertrophy", "Stretch", "Fat Loss"
  ];

  const renderStep = () => {
    switch (step) {
      case "muscles":
        return (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {muscleGroups.map((muscle) => (
                <div key={muscle.name}>
                  <Button
                    variant={workoutData.muscles.includes(muscle.name) ? "default" : "outline"}
                    className={`w-full h-24 flex flex-col items-center justify-center gap-2 ${workoutData.muscles.includes(muscle.name) ? "bg-blue-600 text-white" : ""}`}
                    onClick={() => {
                      if (workoutData.muscles.includes(muscle.name)) {
                        updateData("muscles", workoutData.muscles.filter(m => m !== muscle.name));
                      } else {
                        updateData("muscles", [...workoutData.muscles, muscle.name]);
                      }
                    }}
                  >
                    <span className="text-2xl">{muscle.icon}</span>
                    <span>{muscle.name}</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        );
      case "style":
        return (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {workoutStyles.map((style) => (
                <Button
                  key={style}
                  variant={workoutData.style === style.toLowerCase() ? "default" : "outline"}
                  className="py-6"
                  onClick={() => updateData("style", style.toLowerCase())}
                >
                  {style}
                </Button>
              ))}
            </div>
          </CardContent>
        );
      case "duration":
        return (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {durations.map((mins) => (
                <Button
                  key={mins}
                  variant={workoutData.duration === mins ? "default" : "outline"}
                  className="py-6"
                  onClick={() => updateData("duration", mins)}
                >
                  {mins} min
                </Button>
              ))}
            </div>
          </CardContent>
        );
      case "goal":
        return (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <Button
                  key={goal}
                  variant={workoutData.goal === goal.toLowerCase() ? "default" : "outline"}
                  className="py-6"
                  onClick={() => updateData("goal", goal.toLowerCase())}
                >
                  {goal}
                </Button>
              ))}
            </div>
          </CardContent>
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
        handleGenerateWorkout();
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

  const getStepNumber = () => {
    switch (step) {
      case "muscles": return 1;
      case "style": return 2;
      case "duration": return 3;
      case "goal": return 4;
    }
  };

  const stepTitles = {
    muscles: "Select Target Muscle Groups",
    style: "Choose Workout Style",
    duration: "Set Workout Duration",
    goal: "Define Your Goal"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Dumbbell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Step {getStepNumber()} of 4</div>
              <div className="flex gap-1">
                {["muscles", "style", "duration", "goal"].map((s, i) => (
                  <div 
                    key={s}
                    className={`h-1 w-6 rounded-full ${
                      getStepNumber() > i + 1 ? "bg-blue-600" : 
                      getStepNumber() === i + 1 ? "bg-blue-400" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
            <CardTitle>{stepTitles[step]}</CardTitle>
            <CardDescription>
              {step === "muscles" && "Select the muscle groups you want to focus on"}
              {step === "style" && "What type of workout do you prefer?"}
              {step === "duration" && "How much time do you have available?"}
              {step === "goal" && "What's your main goal for this session?"}
            </CardDescription>
          </CardHeader>
          
          {renderStep()}
          
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
