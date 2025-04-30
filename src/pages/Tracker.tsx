
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, LineChart, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import WorkoutCalendar from "@/components/workout/WorkoutCalendar";
import WorkoutVolumeChart from "@/components/workout/WorkoutVolumeChart";
import WorkoutOneRepMaxChart from "@/components/workout/WorkoutOneRepMaxChart";

type Tab = "calendar" | "volume" | "records";

interface WeeklyVolume {
  wk: string;
  volume: number;
}

interface ExerciseSession {
  exercise_name: string;
  date: string;
  sets: {
    weight: string;
    reps: string;
  }[];
}

const Tracker = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  
  // Fetch workout sessions for calendar
  const { data: workoutSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["workoutSessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("workout_session")
        .select("id, date, goal, style, primary_muscles")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      
      if (error) {
        console.error("Error fetching workout sessions:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });
  
  // Fetch weekly volume data
  const { data: volumeData, isLoading: isLoadingVolume } = useQuery({
    queryKey: ["weeklyVolume", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("v_weekly_volume")
        .select("wk, volume")
        .eq("user_id", user.id)
        .order("wk", { ascending: true });
      
      if (error) {
        console.error("Error fetching volume data:", error);
        throw error;
      }
      
      return data?.map(item => ({
        wk: item.wk ? format(parseISO(item.wk), 'MMM d, yyyy') : 'Unknown',
        volume: item.volume || 0
      })) || [];
    },
    enabled: !!user?.id && activeTab === "volume",
  });
  
  // Fetch all exercise names for the dropdown
  const { data: exerciseNames, isLoading: isLoadingExercises } = useQuery({
    queryKey: ["exerciseNames", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("exercise_log")
        .select("exercise_name")
        .eq("user_id", user.id)
        .order("exercise_name")
        .distinct();
      
      if (error) {
        console.error("Error fetching exercise names:", error);
        throw error;
      }
      
      return data?.map(item => item.exercise_name) || [];
    },
    enabled: !!user?.id && activeTab === "records",
  });
  
  // Fetch exercise log data for selected exercise
  const { data: exerciseData, isLoading: isLoadingExerciseData } = useQuery({
    queryKey: ["exerciseLogs", user?.id, selectedExercise],
    queryFn: async () => {
      if (!user?.id || !selectedExercise) return [];
      
      const { data, error } = await supabase
        .from("exercise_log")
        .select("exercise_name, date, sets")
        .eq("user_id", user.id)
        .eq("exercise_name", selectedExercise)
        .order("date", { ascending: true });
      
      if (error) {
        console.error("Error fetching exercise data:", error);
        throw error;
      }
      
      return data as ExerciseSession[] || [];
    },
    enabled: !!user?.id && !!selectedExercise && activeTab === "records",
  });
  
  // Set a default exercise when the list is loaded
  useEffect(() => {
    if (exerciseNames?.length && !selectedExercise) {
      setSelectedExercise(exerciseNames[0]);
    }
  }, [exerciseNames, selectedExercise]);
  
  // Handle API errors
  const handleError = (error: any) => {
    console.error("API Error:", error);
    toast({
      title: "Error",
      description: "Failed to load workout data. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="mr-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Workout Tracker</h1>
      </div>
      
      <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-6">
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setActiveTab("calendar")}
        >
          <Calendar className="h-4 w-4" />
          Calendar
        </Button>
        <Button
          variant={activeTab === "volume" ? "default" : "ghost"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setActiveTab("volume")}
        >
          <LineChart className="h-4 w-4" />
          Volume
        </Button>
        <Button
          variant={activeTab === "records" ? "default" : "ghost"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={() => setActiveTab("records")}
        >
          <TrendingUp className="h-4 w-4" />
          1RM Estimates
        </Button>
      </div>
      
      {activeTab === "calendar" && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Calendar</CardTitle>
            <CardDescription>
              View your workout history
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isLoadingSessions ? (
              <div className="flex justify-center items-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : workoutSessions?.length ? (
              <WorkoutCalendar sessions={workoutSessions} />
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">Complete your first workout to see your calendar!</p>
                <Button onClick={() => navigate("/start-workout")}>
                  Start Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === "volume" && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Volume</CardTitle>
            <CardDescription>
              Track your total volume (weight × reps) over time
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {isLoadingVolume ? (
              <div className="flex justify-center items-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : volumeData?.length ? (
              <WorkoutVolumeChart volumeData={volumeData} />
            ) : (
              <div className="text-center">
                <p className="text-gray-500 mb-4">Complete workouts to generate your volume chart!</p>
                <Button onClick={() => navigate("/start-workout")}>
                  Start Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === "records" && (
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
      )}
    </div>
  );
};

export default Tracker;
