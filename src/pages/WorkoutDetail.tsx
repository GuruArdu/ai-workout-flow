
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseLog, WorkoutSession } from "@/types/workout";

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [exerciseState, setExerciseState] = useState<Record<number, {
    expanded: boolean;
    sets: ExerciseLog[];
  }>>({});

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["workout_session", id],
    queryFn: async () => {
      try {
        console.log("Fetching workout session:", id);
        // Use the correct path for the Edge Function
        const response = await fetch(`/functions/v1/workout_sessions/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch workout session: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Workout session data:", data);
        return data as WorkoutSession;
      } catch (err) {
        console.error("Error fetching workout session:", err);
        throw err;
      }
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading workout plan...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Error loading workout plan</h2>
        <p className="text-red-500">{error.message}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/start-workout")}
        >
          Create New Workout
        </Button>
      </div>
    );
  }

  const toggleExercise = (exerciseIndex: number) => {
    setExerciseState(prev => {
      // Initialize exercise sets if not already done
      if (!prev[exerciseIndex]) {
        const exercise = session?.ai_plan?.exercises?.[exerciseIndex];
        if (exercise) {
          const setCount = typeof exercise.sets === 'number' ? exercise.sets : 3;
          const initialSets: ExerciseLog[] = Array(setCount).fill(0).map(() => ({
            weight: '',
            reps: exercise.reps || '',
            completed: false
          }));
          
          return {
            ...prev,
            [exerciseIndex]: {
              expanded: true,
              sets: initialSets,
            }
          };
        }
      }
      
      return {
        ...prev,
        [exerciseIndex]: {
          ...prev[exerciseIndex],
          expanded: !prev[exerciseIndex]?.expanded,
        }
      };
    });
  };

  const updateSet = (
    exerciseIndex: number, 
    setIndex: number, 
    field: keyof ExerciseLog, 
    value: string | boolean
  ) => {
    setExerciseState(prev => {
      const newSets = [...(prev[exerciseIndex]?.sets || [])];
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
      exercises: Object.entries(exerciseState).map(([exerciseIndex, data]) => {
        const exercises = session?.ai_plan?.exercises || [];
        
        return {
          exercise: exercises[Number(exerciseIndex)]?.name || "Unknown exercise",
          sets: data.sets,
        };
      }),
    });
    
    toast({
      title: "Workout saved!",
      description: "Your workout has been successfully logged.",
    });
    
    navigate("/dashboard");
  };

  // Helper function to get the number of sets for an exercise
  const getExerciseSets = (exercise: Exercise): ExerciseLog[] => {
    if (typeof exercise.sets === 'number') {
      return Array(exercise.sets).fill(0).map(() => ({
        reps: exercise.reps || '',
        weight: exercise.weight || '',
        completed: false
      }));
    }
    
    return Array(3).fill(0).map(() => ({
      reps: exercise.reps || '',
      weight: exercise.weight || '',
      completed: false
    }));
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
        <h1 className="text-2xl font-bold">{session?.goal || "Workout"} Workout</h1>
      </div>
      
      <div className="space-y-4 mb-8">
        {session?.ai_plan?.exercises ? (
          <div className="space-y-4">
            {session.ai_plan.exercises.map((exercise, index) => (
              <Card key={index}>
                <CardHeader 
                  className="p-4 cursor-pointer flex flex-row justify-between items-center"
                  onClick={() => toggleExercise(index)}
                >
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  {exerciseState[index]?.expanded ? 
                    <ChevronUp className="h-5 w-5" /> : 
                    <ChevronDown className="h-5 w-5" />
                  }
                </CardHeader>
                
                {exerciseState[index]?.expanded && (
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-4">
                      {exerciseState[index].sets.map((set, setIndex) => (
                        <div key={setIndex} className="flex items-center gap-2">
                          <div className="font-medium w-10">#{setIndex + 1}</div>
                          
                          <div className="flex-1">
                            <Label htmlFor={`weight-${index}-${setIndex}`} className="sr-only">Weight</Label>
                            <Input
                              id={`weight-${index}-${setIndex}`}
                              placeholder="Weight"
                              value={set.weight || ""}
                              onChange={(e) => updateSet(index, setIndex, "weight", e.target.value)}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <Label htmlFor={`reps-${index}-${setIndex}`} className="sr-only">Reps</Label>
                            <Input
                              id={`reps-${index}-${setIndex}`}
                              placeholder={exercise.reps || "Reps"}
                              value={set.reps || ""}
                              onChange={(e) => updateSet(index, setIndex, "reps", e.target.value)}
                            />
                          </div>
                          
                          <Button
                            variant={set.completed ? "default" : "outline"}
                            size="sm"
                            className="w-24"
                            onClick={() => updateSet(index, setIndex, "completed", !set.completed)}
                          >
                            {set.completed ? "Done" : "Mark Done"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div>Invalid workout plan format</div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="flex items-center gap-2"
          onClick={handleSaveWorkout}
        >
          <Check className="h-4 w-4" />
          Complete Workout
        </Button>
      </div>
    </div>
  );
};

export default WorkoutDetail;
