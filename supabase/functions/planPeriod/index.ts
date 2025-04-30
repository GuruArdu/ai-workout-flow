
// deno: edge runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://esm.sh/openai@4.11.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

const schema = {
  name: "build_training_plan",
  description: "Generate a workout plan for the specified period",
  parameters: {
    type: "object",
    properties: {
      workouts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            primary_muscles: { 
              type: "array", 
              items: { type: "string" },
              description: "Target muscle groups for this workout"
            },
            style: { type: "string", description: "Style of the workout (e.g. HIIT, Strength, Cardio)" },
            goal: { type: "string", description: "Goal of the workout (e.g. Strength, Hypertrophy, Endurance)" },
            duration_min: { type: "integer", description: "Duration in minutes" },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  sets: { type: "integer" },
                  reps: { type: "string" },
                  weight: { type: "string", description: "Weight suggestion or 'bodyweight'" }
                },
                required: ["name", "sets", "reps"]
              }
            }
          },
          required: ["date", "primary_muscles", "style", "goal", "duration_min", "exercises"]
        }
      }
    },
    required: ["workouts"]
  }
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse input
    const raw = await req.text();
    
    if (!raw) {
      console.error("Error: Empty request body");
      return jsonError("Empty request body", 400);
    }

    let input;
    try {
      input = JSON.parse(raw);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return jsonError("Invalid JSON in request body", 400);
    }
    
    // Extract userId and period from request body
    const { userId, period } = input;
    
    if (!userId) {
      return jsonError("userId missing", 400);
    }
    
    if (!period || (period !== "week" && period !== "month")) {
      return jsonError("Valid period (week or month) required", 400);
    }
    
    console.log(`Generating ${period} plan for user ${userId}`);
    
    // Step 1: Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return jsonError("Failed to fetch user profile", 500);
    }
    
    // Step 2: Fetch last 4 weeks of volume data
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const { data: volumeData, error: volumeError } = await supabase
      .from("v_weekly_volume")
      .select("wk, volume")
      .eq("user_id", userId)
      .gte("wk", fourWeeksAgo.toISOString())
      .order("wk", { ascending: false });
    
    if (volumeError) {
      console.error("Error fetching volume data:", volumeError);
      return jsonError("Failed to fetch training volume data", 500);
    }
    
    // Step 3: Fetch recent exercises to understand user's routine
    const { data: recentExercises, error: exercisesError } = await supabase
      .from("exercise_log")
      .select("exercise_name, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50);
    
    if (exercisesError) {
      console.error("Error fetching recent exercises:", exercisesError);
      return jsonError("Failed to fetch exercise history", 500);
    }
    
    // Calculate the number of days to plan based on period
    const daysToGenerate = period === "week" ? 7 : 30;
    
    // Generate dates for the plan (starting from tomorrow)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
    
    // Generate system prompt based on user data
    const systemPrompt = `
You are a strength-and-conditioning professor. Build a ${period} micro-cycle that respects fatigue management and progressive overload.

User profile:
- Age: ${profile.age || 'Unknown'}
- Gender: ${profile.gender || 'Unknown'}
- Height: ${profile.height || 'Unknown'} ${profile.height_unit || 'cm'}
- Weight: ${profile.weight || 'Unknown'} ${profile.weight_unit || 'kg'}
- Fitness level: ${profile.fitness_level || 'Intermediate'}
- Activity level: ${profile.activity_level || 'Moderate'}
- Goal: ${profile.goal || 'General fitness'}

Recent training volume:
${JSON.stringify(volumeData || [])}

Recently performed exercises:
${JSON.stringify(recentExercises?.map(e => e.exercise_name).slice(0, 20) || [])}

Create a comprehensive ${period === "week" ? "7-day" : "30-day"} workout plan optimized for the user's profile, starting on ${startDate.toISOString().split('T')[0]}.
Each workout should include realistic exercise recommendations with appropriate sets, reps, and weight guidelines.
Respect rest days and muscle recovery in your plan.
`;
    
    // Step 4: Call OpenAI with function calling
    console.log("Calling OpenAI to generate workout plan...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      functions: [schema],
      function_call: { name: "build_training_plan" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate a ${period} workout plan based on my profile and training history.` }
      ]
    });
    
    // Extract the workout plan from the OpenAI response
    if (!completion.choices[0].message.function_call) {
      return jsonError("Failed to generate workout plan", 500);
    }
    
    const planData = JSON.parse(
      completion.choices[0].message.function_call.arguments
    );
    
    if (!planData.workouts || !Array.isArray(planData.workouts) || planData.workouts.length === 0) {
      return jsonError("Generated workout plan is invalid", 500);
    }
    
    console.log(`Successfully generated ${planData.workouts.length} workouts`);
    
    // Step 5: Insert workouts into workout_session table with planned=true flag
    const workoutsToInsert = planData.workouts.map(workout => ({
      user_id: userId,
      date: new Date(workout.date),
      primary_muscles: workout.primary_muscles,
      style: workout.style,
      goal: workout.goal,
      duration_min: workout.duration_min,
      ai_plan: { exercises: workout.exercises },
      planned: true // This is a planned session
    }));
    
    const { data: insertedWorkouts, error: insertError } = await supabase
      .from("workout_session")
      .insert(workoutsToInsert)
      .select("id, date");
    
    if (insertError) {
      console.error("Error inserting workout sessions:", insertError);
      return jsonError("Failed to save workout plan", 500);
    }
    
    console.log(`Successfully inserted ${insertedWorkouts.length} planned workouts`);
    
    return new Response(
      JSON.stringify({
        message: `Successfully created ${period} workout plan with ${insertedWorkouts.length} sessions`,
        workouts: insertedWorkouts
      }),
      { 
        status: 200, 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
    
  } catch (err) {
    console.error("Error generating workout plan:", err);
    return jsonError(err.message, 500);
  }
});
