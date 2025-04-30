
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { WorkoutSession, WeeklyVolumeData, ExerciseSession } from "@/types/workout-tracking";

export const useTrackerData = (activeTab: string) => {
  const { user } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  
  // Fetch workout sessions for calendar
  const { 
    data: workoutSessions, 
    isLoading: isLoadingSessions 
  } = useQuery({
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
  const { 
    data: volumeData, 
    isLoading: isLoadingVolume 
  } = useQuery({
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
  const { 
    data: exerciseNames, 
    isLoading: isLoadingExercises 
  } = useQuery({
    queryKey: ["exerciseNames", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("exercise_log")
        .select('exercise_name', { count: 'exact', head: false })
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Error fetching exercise names:", error);
        throw error;
      }
      
      // Get unique exercise names
      const uniqueNames = [...new Set(data?.map(item => item.exercise_name))];
      return uniqueNames.sort() || [];
    },
    enabled: !!user?.id && activeTab === "records",
  });
  
  // Fetch exercise log data for selected exercise
  const { 
    data: exerciseData, 
    isLoading: isLoadingExerciseData 
  } = useQuery({
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

  return {
    workoutSessions,
    isLoadingSessions,
    volumeData,
    isLoadingVolume,
    exerciseNames,
    isLoadingExercises,
    exerciseData,
    isLoadingExerciseData,
    selectedExercise,
    setSelectedExercise
  };
};
