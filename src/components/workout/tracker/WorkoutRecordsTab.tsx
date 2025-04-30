
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WorkoutOneRepMaxChart from "@/components/workout/WorkoutOneRepMaxChart";
import { ExerciseSession } from "@/types/workout-tracking";

interface WorkoutRecordsTabProps {
  isLoadingExercises: boolean;
  isLoadingExerciseData: boolean;
  exerciseNames: string[] | undefined;
  exerciseData: ExerciseSession[] | undefined;
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
}

const WorkoutRecordsTab = ({
  isLoadingExercises,
  isLoadingExerciseData,
  exerciseNames,
  exerciseData,
  selectedExercise,
  setSelectedExercise
}: WorkoutRecordsTabProps) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimated One-Rep Maxes</CardTitle>
        <CardDescription>
          Track your strength progress over time
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[400px]">
        {isLoadingExercises ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : exerciseNames?.length ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Exercise
              </label>
              <Select
                value={selectedExercise}
                onValueChange={setSelectedExercise}
              >
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exerciseNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isLoadingExerciseData ? (
              <div className="flex justify-center items-center h-60">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : exerciseData?.length ? (
              <WorkoutOneRepMaxChart exerciseData={exerciseData} />
            ) : (
              <div className="text-center pt-8">
                <p className="text-gray-500">No data available for this exercise.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">Log strength workouts to generate 1RM estimates!</p>
            <Button onClick={() => navigate("/start-workout")}>
              Start Workout
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutRecordsTab;
