
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

    const openai = new OpenAI(process.env.OPENAI_API_KEY);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a certified strength and conditioning coach generating a personalized workout plan.
          
          Return the response in this JSON format:
          {
            "exercises": [
              {
                "name": "Exercise Name",
                "sets": [
                  {"reps": "10-12", "weight": "user determined"},
                  {"reps": "8-10", "weight": "user determined"}
                ]
              }
            ]
          }
          
          Do not include any markdown formatting or explanation outside the JSON structure.`
        },
        { 
          role: "user", 
          content: `Generate a workout plan with:
            - Muscles: ${input.muscles.join(", ")}
            - Style: ${input.style}
            - Goal: ${input.goal}
            - Duration: ${input.duration} minutes` 
        }
      ]
    });

    // Get the generated plan
    const planText = completion.choices[0].message.content;
    
    let parsedPlan;
    try {
      // Try to parse as JSON first
      parsedPlan = JSON.parse(planText.trim());
      console.log("Successfully parsed workout plan as JSON");
    } catch (e) {
      // If parsing fails, just use the raw text
      console.log("Could not parse as JSON, using raw text", e);
      parsedPlan = planText;
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
