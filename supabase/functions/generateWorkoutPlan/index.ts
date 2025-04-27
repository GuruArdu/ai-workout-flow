
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
          content: "You are a certified strength and conditioning coach generating a personalized workout plan." 
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

    const plan = completion.choices[0].message.content;

    // Store workout session
    const [{ id: sessionId }] = await sql`
      INSERT INTO workout_session 
        (user_id, goal, style, duration_min, primary_muscles, ai_plan)
      VALUES 
        (${userId}, ${input.goal}, ${input.style}, ${input.duration}, 
         ${JSON.stringify(input.muscles)}, ${plan})
      RETURNING id
    `;

    return new Response(JSON.stringify({ sessionId, plan }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
