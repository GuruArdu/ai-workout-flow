
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NutritionData, FoodLog } from "@/types/nutrition";

export const useNutritionData = (userId: string | undefined) => {
  // Fetch nutrition data
  const { 
    data: nutritionData, 
    isLoading: isLoadingNutrition, 
    refetch: refetchNutrition 
  } = useQuery({
    queryKey: ["nutritionAnalysis", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase.functions.invoke("analyze_nutrition", {
        body: { userId: userId }
      });
      
      if (error) throw new Error(error.message);
      return data as NutritionData;
    },
    enabled: !!userId
  });
  
  // Fetch food logs for today
  const { 
    data: foodLogs, 
    isLoading: isLoadingFoodLogs, 
    refetch: refetchFoodLogs 
  } = useQuery({
    queryKey: ["foodLogs", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('food_log')
        .select(`
          id, meal, date, grams,
          food:food_id (id, name, kcal, protein, carbs, fat)
        `)
        .eq('user_id', userId)
        .eq('date', today);
        
      if (error) throw new Error(error.message);
      
      // Explicitly cast the data to ensure proper type conversion
      return (data || []) as unknown as FoodLog[];
    },
    enabled: !!userId
  });
  
  // Group food logs by meal
  const groupedByMeal = foodLogs ? foodLogs.reduce((acc, log) => {
    const meal = log.meal.toLowerCase();
    if (!acc[meal]) acc[meal] = [];
    acc[meal].push(log);
    return acc;
  }, {} as Record<string, FoodLog[]>) : {};
  
  const refreshData = () => {
    refetchFoodLogs();
    refetchNutrition();
  };
  
  return {
    nutritionData,
    foodLogs,
    groupedByMeal,
    isLoadingNutrition,
    isLoadingFoodLogs,
    refreshData
  };
};
