
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseLog, WorkoutSession, ExerciseSet } from "@/types/workout";

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
      const response = await fetch(`/api/workout_sessions/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch workout session");
      }
      return response.json() as Promise<WorkoutSession>;
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
        expanded: !prev[exerciseIndex]?.expanded,
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
        // Make sure we have session and session.ai_plan exists and is an object with exercises
        const exercises = typeof session?.ai_plan === 'object' && session?.ai_plan?.exercises 
          ? session.ai_plan.exercises 
          : [];
          
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

  const getExerciseSetsCount = (exercise: Exercise): number => {
    if (typeof exercise.sets === 'number') {
      return exercise.sets;
    } else if (Array.isArray(exercise.sets)) {
      return exercise.sets.length;
    }
    return 3; // Default to 3 sets if undefined
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
        {session?.ai_plan && typeof session.ai_plan === 'string' ? (
          <Card>
            <CardContent className="p-4">
              <pre className="whitespace-pre-wrap">{session.ai_plan}</pre>
            </CardContent>
          </Card>
        ) : session?.ai_plan && typeof session.ai_plan === 'object' && session.ai_plan.exercises ? (
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
                      {Array.from({ length: getExerciseSetsCount(exercise) }).map((_, setIndex) => {
                        // Get preset values from exercise.sets if available
                        let presetReps = "";
                        let presetWeight = "";
                        
                        if (Array.isArray(exercise.sets) && exercise.sets[setIndex]) {
                          presetReps = exercise.sets[setIndex].reps || "";
                          presetWeight = exercise.sets[setIndex].weight || "";
                        } else if (exercise.reps) {
                          presetReps = exercise.reps.toString();
                        }
                        
                        return (
                          <div key={setIndex} className="flex items-center gap-2">
                            <div className="font-medium w-10">#{setIndex + 1}</div>
                            
                            <div className="flex-1">
                              <Label htmlFor={`weight-${index}-${setIndex}`} className="sr-only">Weight</Label>
                              <Input
                                id={`weight-${index}-${setIndex}`}
                                placeholder={presetWeight || "Weight"}
                                value={exerciseState[index]?.sets?.[setIndex]?.weight || ""}
                                onChange={(e) => updateSet(index, setIndex, "weight", e.target.value)}
                              />
                            </div>
                            
                            <div className="flex-1">
                              <Label htmlFor={`reps-${index}-${setIndex}`} className="sr-only">Reps</Label>
                              <Input
                                id={`reps-${index}-${setIndex}`}
                                placeholder={presetReps || "Reps"}
                                value={exerciseState[index]?.sets?.[setIndex]?.reps || ""}
                                onChange={(e) => updateSet(index, setIndex, "reps", e.target.value)}
                              />
                            </div>
                            
                            <Button
                              variant={exerciseState[index]?.sets?.[setIndex]?.completed ? "default" : "outline"}
                              size="sm"
                              className="w-24"
                              onClick={() => updateSet(
                                index, 
                                setIndex, 
                                "completed", 
                                (!exerciseState[index]?.sets?.[setIndex]?.completed).toString()
                              )}
                            >
                              {exerciseState[index]?.sets?.[setIndex]?.completed ? "Done" : "Mark Done"}
                            </Button>
                          </div>
                        );
                      })}
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
