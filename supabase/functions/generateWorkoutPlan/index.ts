
import { OpenAI } from "lovable/ai";
import { sql } from "lovable/db";

export const POST = async ({ json, auth, error }) => {
  try {
    const input = await json();
    const userId = auth.userId;

    // Fetch recent exercise history for context
    const history = await sql`
      SELECT exercise_name, AVG(rpe) AS avg_rpe
      FROM exercise_log
      WHERE user_id = ${userId}
      GROUP BY exercise_name
      ORDER BY avg_rpe DESC
      LIMIT 30
    `;

    // Create OpenAI instance without explicitly passing the key
    // Lovable will automatically inject it from your secrets
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
                    sets: { 
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          reps: { type: "string" },
                          weight: { type: "string" }
                        }
                      }
                    }
                  },
                  required: ["name", "sets"]
                }
              }
            },
            required: ["exercises"]
          }
        }
      ],
      function_call: { name: "generate_workout_plan" }
    });

    // Parse the function call result to get the structured workout plan
    let parsedPlan;
    try {
      const functionCall = completion.choices[0].message.function_call;
      if (functionCall && functionCall.arguments) {
        parsedPlan = JSON.parse(functionCall.arguments);
        console.log("Successfully parsed workout plan from function call");
      } else {
        // Fallback if function call isn't available
        const content = completion.choices[0].message.content || "{}";
        // Try to extract JSON from the content 
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        parsedPlan = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : JSON.parse(content.trim());
        console.log("Parsed workout plan from content");
      }
    } catch (e) {
      console.error("Error parsing plan:", e);
      // If parsing fails, use a basic structure to avoid breaking the frontend
      parsedPlan = {
        exercises: [
          {
            name: "Default Exercise (parsing error)",
            sets: [
              { reps: "10", weight: "user determined" }
            ]
          }
        ]
      };
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

    return new Response(JSON.stringify({ sessionId, plan: parsedPlan }), { status: 200 });
  } catch (err) {
    console.error("Error generating workout plan:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
