
// deno: edge runtime
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { OpenAI } from "https://deno.land/x/openai@4.7.0/mod.ts";

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
  name: "build_workout_plan",
  description: "Return a structured workout",
  parameters: {
    type: "object",
    properties: {
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name:   { type:"string" },
            sets:   { type:"integer" },
            reps:   { type:"integer" },
            weight: { type:"string" }
          },
          required:["name","sets","reps"]
        }
      }
    },
    required:["exercises"]
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
    // ── 1. parse body ──────────────────────────────────
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
    
    const userId = user.id;
    console.log("Authenticated user:", userId);

    const {
      muscles, style, duration, goal,    // wizard
      age, gender, height, height_unit,
      weight, weight_unit, activity_level
    } = input;

    console.log("Received workout request:", input);

    // ── 2. fetch recent RPE for auto-progression ───────
    const { data: history } = await supabase
      .from("exercise_log")
      .select("exercise_name, avg_rpe:avg(rpe)")
      .eq("user_id", userId)
      .order("avg_rpe",{ ascending:false })
      .limit(30);

    // ── 3. call OpenAI with function-calling ────────────
    const chat = await openai.chat.completions.create({
      model:"gpt-4o-mini",
      temperature:0.7,
      messages:[
        { role:"system",
          content:"You are a certified strength-and-conditioning coach. "
                + "Use ACSM guidelines and progressive overload." },
        { role:"user",
          content:
            `Profile → age ${age}, gender ${gender}, height ${height}${height_unit}, `
          + `weight ${weight}${weight_unit}, activity ${activity_level}\n`
          + `Request → muscles ${muscles.join(",")}, style ${style}, `
          + `goal ${goal}, duration ${duration}min\n`
          + `Recent_RPE: ${JSON.stringify(history ?? [])}`
        }
      ],
      functions:[schema],
      function_call:{ name:"build_workout_plan" }
    });

    if (!chat.choices[0].message.function_call) {
      return jsonError("Failed to generate workout plan", 500);
    }

    const plan = JSON.parse(
      chat.choices[0].message.function_call.arguments
    );

    // ── 4. store workout_session ────────────────────────
    const { data: inserted, error: insErr } = await supabase
      .from("workout_session")
      .insert({
        user_id: userId,
        goal, style, duration_min:duration,
        primary_muscles: muscles,
        ai_plan: plan
      })
      .select("id")
      .single();
    
    if (insErr) {
      console.error("Error inserting workout session:", insErr);
      return jsonError(insErr.message, 500);
    }

    return new Response(
      JSON.stringify({ sessionId: inserted.id, plan }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (err) {
    console.error("Error generating workout plan:", err);
    return jsonError(err.message, 500);
  }
});
