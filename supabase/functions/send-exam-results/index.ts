import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const score = session.score ?? 0;
    const total = session.total_questions ?? 30;
    const percentage = Math.round((score / total) * 100);
    const status = session.status === "timed_out" ? "Tempo esgotado" : "Concluída";

    // For now, log the result (email sending will be configured with email domain)
    console.log(`Exam result for ${session.candidate_name}: ${score}/${total} (${percentage}%) - ${status}`);
    console.log(`Email would be sent to: ${session.candidate_email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Resultado processado",
        score,
        total,
        percentage 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
