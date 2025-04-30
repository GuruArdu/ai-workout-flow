
import { ReactNode } from "react";
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export type WorkoutStep = "muscles" | "style" | "duration" | "goal";

interface WorkoutStepsProps {
  step: WorkoutStep;
  children: ReactNode;
}

const stepTitles = {
  muscles: "Select Target Muscle Groups",
  style: "Choose Workout Style",
  duration: "Set Workout Duration",
  goal: "Define Your Goal"
};

const stepDescriptions = {
  muscles: "Select the muscle groups you want to focus on",
  style: "What type of workout do you prefer?",
  duration: "How much time do you have available?",
  goal: "What's your main goal for this session?"
};

export const getStepNumber = (step: WorkoutStep): number => {
  switch (step) {
    case "muscles": return 1;
    case "style": return 2;
    case "duration": return 3;
    case "goal": return 4;
  }
};

const WorkoutSteps = ({ step, children }: WorkoutStepsProps) => {
  return (
    <>
      <CardTitle>{stepTitles[step]}</CardTitle>
      <CardDescription>{stepDescriptions[step]}</CardDescription>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </>
  );
};

export default WorkoutSteps;
export { stepTitles, stepDescriptions };
