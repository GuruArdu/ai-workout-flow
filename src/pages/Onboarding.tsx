
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

type OnboardingStep = 
  | "personal" 
  | "measurements" 
  | "goals" 
  | "experience";

type OnboardingData = {
  age: string;
  gender: string;
  height: string;
  heightUnit: "cm" | "in";
  weight: string;
  weightUnit: "kg" | "lb";
  activityLevel: string;
  goal: string[];
  focusAreas: string[];
}

const Onboarding = () => {
  const [step, setStep] = useState<OnboardingStep>("personal");
  const [data, setData] = useState<OnboardingData>({
    age: "",
    gender: "",
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    activityLevel: "moderate",
    goal: [],
    focusAreas: [],
  });
  const navigate = useNavigate();

  const updateData = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    // Here you would normally save the data to your backend
    console.log("Onboarding data:", data);
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch(step) {
      case "personal":
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input 
                id="age" 
                type="number" 
                value={data.age} 
                onChange={e => updateData("age", e.target.value)}
                placeholder="Enter your age"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="grid grid-cols-3 gap-2">
                {["Male", "Female", "Other"].map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={data.gender === option ? "default" : "outline"}
                    className="w-full"
                    onClick={() => updateData("gender", option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        );
      case "measurements":
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <div className="flex gap-2">
                <Input
                  id="height"
                  type="number"
                  value={data.height}
                  onChange={e => updateData("height", e.target.value)}
                  placeholder="Height"
                  className="flex-1"
                />
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant={data.heightUnit === "cm" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => updateData("heightUnit", "cm")}
                  >
                    cm
                  </Button>
                  <Button
                    type="button"
                    variant={data.heightUnit === "in" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => updateData("heightUnit", "in")}
                  >
                    in
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="weight"
                  type="number"
                  value={data.weight}
                  onChange={e => updateData("weight", e.target.value)}
                  placeholder="Weight"
                  className="flex-1"
                />
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    type="button"
                    variant={data.weightUnit === "kg" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => updateData("weightUnit", "kg")}
                  >
                    kg
                  </Button>
                  <Button
                    type="button"
                    variant={data.weightUnit === "lb" ? "default" : "outline"}
                    className="rounded-none flex-1"
                    onClick={() => updateData("weightUnit", "lb")}
                  >
                    lb
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        );
      case "goals":
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Fitness Goals (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Build Muscle", 
                  "Lose Weight", 
                  "Improve Endurance", 
                  "Increase Strength",
                  "Better Flexibility",
                  "Overall Health"
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`goal-${goal}`}
                      checked={data.goal.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("goal", [...data.goal, goal]);
                        } else {
                          updateData(
                            "goal", 
                            data.goal.filter(g => g !== goal)
                          );
                        }
                      }}
                    />
                    <label 
                      htmlFor={`goal-${goal}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        );
      case "experience":
        return (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Activity Level</Label>
              <div className="grid gap-2">
                {[
                  { id: "sedentary", label: "Sedentary (little or no exercise)" },
                  { id: "light", label: "Light (exercise 1-3 days/week)" },
                  { id: "moderate", label: "Moderate (exercise 3-5 days/week)" },
                  { id: "active", label: "Active (exercise 6-7 days/week)" },
                  { id: "very-active", label: "Very Active (professional athlete level)" },
                ].map((option) => (
                  <Button
                    key={option.id}
                    type="button"
                    variant={data.activityLevel === option.id ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => updateData("activityLevel", option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Focus Areas (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Upper Body", 
                  "Lower Body", 
                  "Core", 
                  "Back",
                  "Arms",
                  "Cardio"
                ].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`area-${area}`}
                      checked={data.focusAreas.includes(area)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData("focusAreas", [...data.focusAreas, area]);
                        } else {
                          updateData(
                            "focusAreas", 
                            data.focusAreas.filter(a => a !== area)
                          );
                        }
                      }}
                    />
                    <label 
                      htmlFor={`area-${area}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {area}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        );
    }
  };

  const handleNext = () => {
    switch(step) {
      case "personal":
        setStep("measurements");
        break;
      case "measurements":
        setStep("goals");
        break;
      case "goals":
        setStep("experience");
        break;
      case "experience":
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch(step) {
      case "measurements":
        setStep("personal");
        break;
      case "goals":
        setStep("measurements");
        break;
      case "experience":
        setStep("goals");
        break;
    }
  };

  const getStepNumber = () => {
    switch(step) {
      case "personal": return 1;
      case "measurements": return 2;
      case "goals": return 3;
      case "experience": return 4;
    }
  };

  const stepTitles = {
    personal: "Personal Information",
    measurements: "Body Measurements",
    goals: "Fitness Goals",
    experience: "Experience & Focus Areas"
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-500">Step {getStepNumber()} of 4</div>
              <div className="flex gap-1">
                {["personal", "measurements", "goals", "experience"].map((s, i) => (
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
              Help us personalize your fitness journey
            </CardDescription>
          </CardHeader>
          
          {renderStep()}
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={step === "personal" ? () => navigate("/") : handleBack}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleNext}
              className="flex items-center gap-1"
            >
              {step === "experience" ? "Finish" : "Next"}
              {step !== "experience" && <ArrowRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
