
// deno: edge runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Helper function for returning JSON errors
const jsonError = (message: string, status: number) => {
  return new Response(
    JSON.stringify({ error: message }), 
    { 
      status: status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
};

// Calculate Mifflin-St Jeor BMR formula
function calculateBMR(weight: number, height: number, age: number, gender: string) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(bmr: number, activityLevel: string) {
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,      // Little or no exercise
    'light': 1.375,        // Light exercise 1-3 days a week
    'moderate': 1.55,      // Moderate exercise 3-5 days a week
    'active': 1.725,       // Hard exercise 6-7 days a week
    'very_active': 1.9,    // Very hard exercise & physical job
  };
  
  const multiplier = activityMultipliers[activityLevel] || 1.2;
  return bmr * multiplier;
}

// Calculate target macros based on goal
function calculateTargetMacros(tdee: number, goal: string) {
  let targetCalories: number;
  let proteinPct: number;
  let carbsPct: number;
  let fatPct: number;
  
  switch (goal) {
    case 'lose_weight':
      targetCalories = tdee * 0.8; // 20% deficit
      proteinPct = 0.4;  // Higher protein for weight loss
      carbsPct = 0.3;
      fatPct = 0.3;
      break;
    case 'gain_muscle':
      targetCalories = tdee * 1.1; // 10% surplus
      proteinPct = 0.3;
      carbsPct = 0.5;  // Higher carbs for muscle building
      fatPct = 0.2;
      break;
    case 'maintain':
    default:
      targetCalories = tdee;
      proteinPct = 0.3;
      carbsPct = 0.4;
      fatPct = 0.3;
      break;
  }
  
  return {
    calories: Math.round(targetCalories),
    protein: Math.round((targetCalories * proteinPct) / 4), // 4 calories per gram of protein
    carbs: Math.round((targetCalories * carbsPct) / 4),     // 4 calories per gram of carbs
    fat: Math.round((targetCalories * fatPct) / 9)          // 9 calories per gram of fat
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return jsonError("userId is required", 400);
    }
    
    // Special handling for dev mode
    const isDevUser = userId === "0000-preview-user";
    
    // Only verify authentication for non-dev users
    if (!isDevUser) {
      // Get authentication token from request header
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        return jsonError("Authentication required", 401);
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      // Verify the token and get user info
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return jsonError("Invalid token or user not found", 401);
      }
      
      // Ensure the userId matches the authenticated user
      if (userId !== user.id) {
        return jsonError("Unauthorized: User ID mismatch", 403);
      }
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('age, gender, height, height_unit, weight, weight_unit, activity_level, goal')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return jsonError("Failed to fetch user profile", 500);
    }

    if (!profile) {
      return jsonError("User profile not found", 404);
    }
    
    // Convert to standard units if needed
    let weightKg = profile.weight;
    let heightCm = profile.height;
    
    if (profile.weight_unit === 'lb') {
      weightKg = profile.weight * 0.453592;
    }
    
    if (profile.height_unit === 'in') {
      heightCm = profile.height * 2.54;
    }
    
    // Calculate target calories and macros
    const bmr = calculateBMR(weightKg, heightCm, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activity_level || 'moderate');
    const targets = calculateTargetMacros(tdee, profile.goal || 'maintain');

    // Get food logs for the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const { data: foodLogs, error: foodLogsError } = await supabase
      .from('food_log')
      .select(`
        id, date, meal, grams,
        food:food_id (name, kcal, protein, carbs, fat)
      `)
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (foodLogsError) {
      console.error("Error fetching food logs:", foodLogsError);
      return jsonError("Failed to fetch food logs", 500);
    }

    // Aggregate by day
    const dailyTotals: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    
    // Initialize past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      dailyTotals[dateString] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    // Populate with actual data
    foodLogs.forEach(log => {
      const dateStr = log.date;
      if (!dailyTotals[dateStr]) {
        dailyTotals[dateStr] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      
      // Calculate nutritional values based on grams consumed
      const multiplier = log.grams / 100; // Convert to percentage of 100g
      dailyTotals[dateStr].calories += log.food.kcal * multiplier;
      dailyTotals[dateStr].protein += log.food.protein * multiplier;
      dailyTotals[dateStr].carbs += log.food.carbs * multiplier;
      dailyTotals[dateStr].fat += log.food.fat * multiplier;
    });
    
    // Format for chart display
    const chartData = Object.entries(dailyTotals).map(([date, values]) => ({
      date,
      calories: Math.round(values.calories),
      protein: Math.round(values.protein),
      carbs: Math.round(values.carbs),
      fat: Math.round(values.fat),
      targetCalories: targets.calories
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    // Today's totals
    const todayStr = today.toISOString().split('T')[0];
    const todayNutrition = dailyTotals[todayStr] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    // Generate simple recommendations based on today's intake
    let recommendations = [];
    
    if (todayNutrition.calories < targets.calories * 0.8) {
      recommendations.push("Your calorie intake is significantly below your target. Consider adding more nutrient-dense foods to your diet.");
    } else if (todayNutrition.calories > targets.calories * 1.2) {
      recommendations.push("Your calorie intake is above your target. Consider reducing portion sizes or choosing lower-calorie options.");
    }
    
    if (todayNutrition.protein < targets.protein * 0.8) {
      recommendations.push("Your protein intake is below the recommended amount. Consider adding more lean protein sources like chicken, fish, or plant-based proteins.");
    }
    
    // Return analysis results
    return new Response(
      JSON.stringify({
        dailyTotals: chartData,
        todayNutrition: {
          current: todayNutrition,
          target: targets
        },
        recommendations
      }),
      { 
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
    
  } catch (error) {
    console.error("Error analyzing nutrition:", error);
    return jsonError(error.message, 500);
  }
});
