
import { sql } from "lovable/db";

export const GET = async ({ params, auth, error }) => {
  try {
    const { id } = params;
    const userId = auth.userId;

    console.log("Fetching workout session:", id);

    // Fetch the workout session from the database
    const [session] = await sql`
      SELECT *
      FROM workout_session
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!session) {
      return new Response(JSON.stringify({ error: "Workout session not found" }), { 
        status: 404,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }

    console.log("Found workout session:", session);

    return new Response(JSON.stringify(session), { 
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Error fetching workout session:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
