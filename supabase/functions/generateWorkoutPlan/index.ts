// Import from Deno standard library and third-party modules with proper URLs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Define the Edge Function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // First get raw text - this won't throw on empty body
    const rawBody = await req.text();
    
    if (!rawBody) {
      console.error("Error: Empty request body");
      return jsonError("Empty request body", 400);
    }

    let input;
    try {
      input = JSON.parse(rawBody);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return jsonError("Invalid JSON in request body", 400);
    }
    
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return jsonError("Authentication required", 401);
    }
    
    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client using the API URL and anon key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://iaycwyrtkkzltzmwubja.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheWN3eXJ0a2t6bHR6bXd1YmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NTU0OTUsImV4cCI6MjA2MTEzMTQ5NX0.Wp-xgFZwsoSQral_MDAw6INjwu-HuQarzKlkgOUijEY';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
    
    // Get the user ID from the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return jsonError("Invalid token or user not found", 401);
    }
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Normalize measurements to metric system for consistency
    const normalizedProfile = profile ? {
      age: profile.age,
      gender: profile.gender,
      height: profile.height_unit === 'in' ? profile.height * 2.54 : profile.height,
      weight: profile.weight_unit === 'lbs' ? profile.weight * 0.453592 : profile.weight,
      activity_level: profile.activity_level,
      fitness_level: profile.fitness_level
    } : null;
    
    const userId = user.id;
    console.log("Received workout request in Edge Function:", input);
    console.log("Authenticated user:", userId);
    console.log("User profile:", normalizedProfile);

    // Fix #7: Ensure style and goal are lowercase for consistency
    const normalizedInput = {
      ...input,
      style: input.style.toLowerCase(),
      goal: input.goal.toLowerCase(),
      profile: normalizedProfile
    };

    // Create OpenAI instance with the API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return jsonError("OpenAI API key not configured", 500);
    }

    // Use function calling for guaranteed JSON format
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { 
            role: "system", 
            content: `You are a certified strength and conditioning coach generating a personalized workout plan. 
            Consider the following user profile:
            ${normalizedProfile ? `
            - Age: ${normalizedProfile.age}
            - Gender: ${normalizedProfile.gender}
            - Weight: ${normalizedProfile.weight}kg
            - Height: ${normalizedProfile.height}cm
            - Activity Level: ${normalizedProfile.activity_level}
            - Fitness Level: ${normalizedProfile.fitness_level}` : 'No profile data available'}
            
            Adjust the exercise selection, intensity, and progression based on these factors.
            For older adults (>50), focus on joint-friendly exercises.
            For beginners, start with basic movement patterns.
            For advanced users, incorporate progressive overload.
            Consider gender-specific strength differences and goals.
            Account for the user's current fitness level based on their activity level.`
          },
          { 
            role: "user", 
            content: `Generate a workout plan with:
              - Muscles: ${normalizedInput.muscles.join(", ")}
              - Style: ${normalizedInput.style}
              - Goal: ${normalizedInput.goal}
              - Duration: ${normalizedInput.duration} minutes`
          }
        ],
        functions: [
          {
            name: "generate_workout_plan",
            description: "Generate a structured workout plan based on user parameters",
            parameters: {
              type: "object",
              properties: {
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      sets: { type: "integer", minimum: 1 },
                      reps: { type: "string" },
                      weight: { type: "string" }
                    },
                    required: ["name", "sets", "reps"]
                  }
                }
              },
              required: ["exercises"]
            }
          }
        ],
        function_call: { name: "generate_workout_plan" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      return jsonError(`OpenAI API error: ${response.status}`, 500);
    }

    const completion = await response.json();

    // Parse the function call result
    let parsedPlan;
    if (completion.choices && 
        completion.choices[0]?.message?.function_call?.arguments) {
      parsedPlan = JSON.parse(completion.choices[0].message.function_call.arguments);
      console.log("Successfully parsed workout plan from function call");
    } else {
      console.error("Failed to get workout plan from OpenAI:", completion);
      return jsonError("Failed to get workout plan from OpenAI", 500);
    }

    // Store workout session
    const { data: sessionData, error: insertError } = await supabase
      .from('workout_session')
      .insert({
        user_id: userId,
        goal: normalizedInput.goal,
        style: normalizedInput.style,
        duration_min: normalizedInput.duration,
        primary_muscles: normalizedInput.muscles,
        ai_plan: parsedPlan
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing workout session:", insertError);
      return jsonError(`Failed to store workout session: ${insertError.message}`, 500);
    }

    return new Response(JSON.stringify({ 
      sessionId: sessionData.id, 
      plan: parsedPlan 
    }), { 
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Error generating workout plan:", err);
    return jsonError(err.message, 500);
  }
});
