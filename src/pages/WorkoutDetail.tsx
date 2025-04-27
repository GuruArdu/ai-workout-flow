import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exerciseState, setExerciseState] = useState({});

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["workout_session", id],
    queryFn: async () => {
      const response = await fetch(`/api/workout_sessions/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workout session");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading workout plan...</div>;
  }

  if (error) {
    return <div className="p-4">Error loading workout plan. Please try again.</div>;
  }

  const toggleExercise = (exerciseIndex: number) => {
    setExerciseState(prev => ({
      ...prev,
      [exerciseIndex]: {
        ...prev[exerciseIndex],
        expanded: !prev[exerciseIndex].expanded,
      }
    }));
  };

  const updateSet = (
    exerciseIndex: number, 
    setIndex: number, 
    field: keyof ExerciseLog, 
    value: string
  ) => {
    setExerciseState(prev => {
      const newSets = [...prev[exerciseIndex].sets];
      newSets[setIndex] = {
        ...newSets[setIndex],
        [field]: value,
      };
      
      return {
        ...prev,
        [exerciseIndex]: {
          ...prev[exerciseIndex],
          sets: newSets,
        }
      };
    });
  };

  const handleSaveWorkout = () => {
    // Here you would save the completed workout data to your backend
    console.log("Saving workout:", {
      workoutId: id,
      exercises: Object.entries(exerciseState).map(([exerciseIndex, data]) => ({
        exercise: workout.exercises[Number(exerciseIndex)].name,
        sets: data.sets,
      })),
    });
    
    toast({
      title: "Workout saved!",
      description: "Your workout has been successfully logged.",
    });
    
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{session.goal} Workout</h1>
      </div>
      
      <div className="space-y-4 mb-8">
        {session.ai_plan && typeof session.ai_plan === 'string' ? (
          <Card>
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap">{session.ai_plan}</pre>
            </CardContent>
          </Card>
        ) : (
          <div>Invalid workout plan format</div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="flex items-center gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <Check className="h-4 w-4" />
          Complete Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutDetail;
