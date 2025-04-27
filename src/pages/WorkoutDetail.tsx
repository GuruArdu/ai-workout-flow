
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Sample workout data - in a real app, this would come from the API
const sampleWorkout = {
  id: "generated-123456",
  title: "Full Body Strength Workout",
  exercises: [
    {
      name: "Barbell Squat",
      sets: 4,
      reps: 8,
      weight_suggestion: "70% of 1RM",
      video_url: "https://example.com/squat",
    },
    {
      name: "Bench Press",
      sets: 3,
      reps: 10,
      weight_suggestion: "65% of 1RM",
      video_url: "https://example.com/bench",
    },
    {
      name: "Bent Over Row",
      sets: 3,
      reps: 12,
      weight_suggestion: "60% of 1RM",
      video_url: "https://example.com/row",
    },
    {
      name: "Overhead Press",
      sets: 3,
      reps: 10,
      weight_suggestion: "60% of 1RM",
      video_url: "https://example.com/overhead",
    },
    {
      name: "Deadlift",
      sets: 3,
      reps: 8,
      weight_suggestion: "75% of 1RM",
      video_url: "https://example.com/deadlift",
    }
  ]
};

type ExerciseLog = {
  setIndex: number;
  weight: string;
  reps: string;
  rpe: string;
}

type ExerciseState = {
  [exerciseIndex: number]: {
    expanded: boolean;
    sets: ExerciseLog[];
  }
}

const WorkoutDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [workout] = useState(sampleWorkout); // In a real app, fetch based on ID
  
  const [exerciseState, setExerciseState] = useState<ExerciseState>(() => {
    // Initialize state for all exercises
    const initialState: ExerciseState = {};
    workout.exercises.forEach((exercise, index) => {
      initialState[index] = {
        expanded: false,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          setIndex: i + 1,
          weight: "",
          reps: "",
          rpe: "7",
        })),
      };
    });
    return initialState;
  });

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
        <h1 className="text-2xl font-bold">{workout.title}</h1>
      </div>
      
      <div className="space-y-4 mb-8">
        {workout.exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.name}>
            <CardHeader 
              className="cursor-pointer flex flex-row items-center justify-between py-3 px-4"
              onClick={() => toggleExercise(exerciseIndex)}
            >
              <CardTitle className="text-lg font-medium flex items-center">
                {exercise.name}
              </CardTitle>
              {exerciseState[exerciseIndex]?.expanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CardHeader>
            
            {exerciseState[exerciseIndex]?.expanded && (
              <CardContent>
                <div className="text-sm text-gray-600 mb-4">
                  <p>Target: {exercise.reps} reps per set</p>
                  <p>Suggested weight: {exercise.weight_suggestion}</p>
                </div>
                
                <div className="space-y-4">
                  {exerciseState[exerciseIndex]?.sets.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-4 gap-2 items-end">
                      <div>
                        <Label className="text-xs">Set {set.setIndex}</Label>
                        <div className="h-10 flex items-center">
                          <span className="font-medium">{set.setIndex}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`} className="text-xs">Weight</Label>
                        <Input
                          id={`weight-${exerciseIndex}-${setIndex}`}
                          value={set.weight}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", e.target.value)}
                          type="number"
                          placeholder="kg"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`} className="text-xs">Reps</Label>
                        <Input
                          id={`reps-${exerciseIndex}-${setIndex}`}
                          value={set.reps}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", e.target.value)}
                          type="number"
                          placeholder="#"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`rpe-${exerciseIndex}-${setIndex}`} className="text-xs">RPE (1-10)</Label>
                        <Input
                          id={`rpe-${exerciseIndex}-${setIndex}`}
                          value={set.rpe}
                          onChange={(e) => updateSet(exerciseIndex, setIndex, "rpe", e.target.value)}
                          type="number"
                          min="1"
                          max="10"
                          placeholder="7"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
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
