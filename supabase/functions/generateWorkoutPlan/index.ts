
import { OpenAI } from "lovable/ai";
import { sql } from "lovable/db";

export const POST = async ({ json, auth, error }) => {
  try {
    const input = await json();
    const userId = auth.userId;

    console.log("Received workout request:", input);

    // Create OpenAI instance - Lovable automatically injects the API key
    const openai = new OpenAI();

    // Use function calling for guaranteed JSON format
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { 
          role: "system", 
          content: "You are a certified strength and conditioning coach generating a personalized workout plan based on the user's goals, style preferences, and target muscle groups."
        },
        { 
          role: "user", 
          content: `Generate a workout plan with:
            - Muscles: ${input.muscles.join(", ")}
            - Style: ${input.style}
            - Goal: ${input.goal}
            - Duration: ${input.duration} minutes`
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
    });

    // Parse the function call result
    let parsedPlan;
    if (completion.choices[0].message.function_call?.arguments) {
      parsedPlan = JSON.parse(completion.choices[0].message.function_call.arguments);
      console.log("Successfully parsed workout plan from function call");
    } else {
      throw new Error("Failed to get workout plan from OpenAI");
    }

    // Store workout session
    const [{ id: sessionId }] = await sql`
      INSERT INTO workout_session 
        (user_id, goal, style, duration_min, primary_muscles, ai_plan)
      VALUES 
        (${userId}, ${input.goal}, ${input.style}, ${input.duration}, 
         ${JSON.stringify(input.muscles)}, ${JSON.stringify(parsedPlan)})
      RETURNING id
    `;

    return new Response(JSON.stringify({ sessionId, plan: parsedPlan }), { 
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Error generating workout plan:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
