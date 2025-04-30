
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

// Function to classify food items from voice transcript
async function classifyFoodTranscript(transcript: string) {
  const schema = {
    name: "classify_food_recordings",
    description: "Extract food items with their quantities from a transcript",
    parameters: {
      type: "object",
      properties: {
        foods: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Food item name" },
              quantity: { type: "string", description: "Amount with unit, e.g. '100g', '1 cup'" },
              meal: { type: "string", description: "Meal type (breakfast, lunch, dinner, or snack)" }
            },
            required: ["name", "quantity", "meal"]
          }
        }
      },
      required: ["foods"]
    }
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      functions: [schema],
      function_call: { name: "classify_food_recordings" },
      messages: [
        {
          role: "system",
          content: "You are a nutritionist that helps identify food items from transcripts. Extract all food items mentioned along with quantities and which meal they're for. If meal is not specified, make a reasonable guess based on the food types."
        },
        {
          role: "user",
          content: transcript
        }
      ]
    });

    if (!completion.choices[0].message.function_call) {
      throw new Error("Failed to classify food items");
    }

    return JSON.parse(completion.choices[0].message.function_call.arguments);
  } catch (error) {
    console.error("Error classifying food:", error);
    throw error;
  }
}

// Function to find food items in the database
async function findFoodInDatabase(foodName: string) {
  const { data, error } = await supabase
    .from('food')
    .select('id, name, kcal, protein, carbs, fat')
    .ilike('name', `%${foodName}%`)
    .limit(1);

  if (error) {
    console.error("Error finding food:", error);
    throw error;
  }

  return data[0] || null;
}

// Function to parse quantity string to grams
function parseQuantity(quantityStr: string): number {
  const cleanedStr = quantityStr.toLowerCase().trim();
  
  // Direct gram specification
  if (cleanedStr.includes('g') || cleanedStr.includes('gram')) {
    const match = cleanedStr.match(/(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[0]);
  }
  
  // Common conversions (very simplified)
  if (cleanedStr.includes('cup')) {
    const match = cleanedStr.match(/(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[0]) * 240; // ~240g per cup
  }
  
  if (cleanedStr.includes('tbsp') || cleanedStr.includes('tablespoon')) {
    const match = cleanedStr.match(/(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[0]) * 15; // ~15g per tablespoon
  }
  
  if (cleanedStr.includes('tsp') || cleanedStr.includes('teaspoon')) {
    const match = cleanedStr.match(/(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[0]) * 5; // ~5g per teaspoon
  }
  
  if (cleanedStr.includes('oz') || cleanedStr.includes('ounce')) {
    const match = cleanedStr.match(/(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[0]) * 28.35; // ~28.35g per oz
  }
  
  // If we can't determine, assume 100g serving
  return 100;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, transcript } = await req.json();
    
    if (!userId || !transcript) {
      return jsonError("userId and transcript are required", 400);
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

    // Classify the food items from the transcript
    const classification = await classifyFoodTranscript(transcript);
    const today = new Date().toISOString().split('T')[0];
    const results = [];

    // Process each identified food item
    if (classification.foods && classification.foods.length > 0) {
      for (const item of classification.foods) {
        // Find the food in the database
        let foodItem = await findFoodInDatabase(item.name);
        
        // If not found, insert a placeholder with estimated values
        if (!foodItem) {
          console.log(`Food item not found: ${item.name}, creating placeholder`);
          const { data, error } = await supabase
            .from('food')
            .insert({
              name: item.name,
              kcal: 100,    // placeholder values
              protein: 5,
              carbs: 10,
              fat: 2
            })
            .select('id, name')
            .single();
            
          if (error) {
            console.error("Error creating placeholder food:", error);
            continue;
          }
          
          foodItem = data;
        }
        
        // Parse the quantity
        const grams = parseQuantity(item.quantity);
        
        // Log the food item
        const { data: logData, error: logError } = await supabase
          .from('food_log')
          .insert({
            user_id: userId,
            date: today,
            meal: item.meal.toLowerCase(),
            food_id: foodItem.id,
            grams
          })
          .select('id')
          .single();
          
        if (logError) {
          console.error("Error logging food:", logError);
          continue;
        }
        
        results.push({
          id: logData.id,
          name: foodItem.name,
          meal: item.meal,
          grams
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        identified: classification.foods.length,
        logged: results.length,
        items: results
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
    console.error("Error processing food transcript:", error);
    return jsonError(error.message, 500);
  }
});
