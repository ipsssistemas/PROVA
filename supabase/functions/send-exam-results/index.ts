import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GMAIL_USER = "ipsssistema@gmail.com";

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

    // Get answers with question details for category breakdown
    const { data: answers } = await supabase
      .from("answers")
      .select("is_correct, question_id")
      .eq("session_id", sessionId);

    const { data: questions } = await supabase
      .from("questions")
      .select("id, category");

    const score = session.score ?? 0;
    const total = session.total_questions ?? 30;
    const percentage = Math.round((score / total) * 100);
    const status = session.status === "timed_out" ? "Tempo esgotado" : "Concluída";

    // Build category breakdown
    const categoryMap: Record<string, { correct: number; total: number }> = {};
    if (answers && questions) {
      const questionCategoryMap: Record<number, string> = {};
      questions.forEach((q: any) => { questionCategoryMap[q.id] = q.category; });

      answers.forEach((a: any) => {
        const cat = questionCategoryMap[a.question_id] || "Outros";
        if (!categoryMap[cat]) categoryMap[cat] = { correct: 0, total: 0 };
        categoryMap[cat].total++;
        if (a.is_correct) categoryMap[cat].correct++;
      });
    }

    let categoryRows = "";
    for (const [cat, data] of Object.entries(categoryMap)) {
      const catPct = Math.round((data.correct / data.total) * 100);
      categoryRows += `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${cat}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${data.correct}/${data.total}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${catPct}%</td>
        </tr>`;
    }

    const passColor = percentage >= 70 ? "#16a34a" : percentage >= 50 ? "#d97706" : "#dc2626";
    const passText = percentage >= 70 ? "APROVADO" : percentage >= 50 ? "EM ANÁLISE" : "NÃO APROVADO";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding: 32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <tr><td style="background: linear-gradient(135deg, #0066ff, #0044cc); padding: 32px; text-align: center;">
          <h1 style="color:#ffffff; margin:0; font-size:24px;">🏠 Smart Home Premium</h1>
          <p style="color:#e0e7ff; margin:8px 0 0; font-size:14px;">Resultado da Avaliação Técnica</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding: 32px;">
          <p style="font-size:16px; color:#374151; margin:0 0 8px;">Olá, <strong>${session.candidate_name}</strong>!</p>
          <p style="font-size:14px; color:#6b7280; margin:0 0 24px;">
            ${status === "Tempo esgotado" 
              ? "O tempo da sua prova se encerrou. Veja abaixo o seu desempenho:" 
              : "Sua avaliação técnica foi concluída com sucesso. Confira o resultado:"}
          </p>

          <!-- Score Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:8px; border: 1px solid #e5e7eb; margin-bottom:24px;">
            <tr>
              <td style="padding:24px; text-align:center; border-right: 1px solid #e5e7eb;">
                <p style="margin:0; font-size:36px; font-weight:bold; color:#111827;">${score}<span style="font-size:18px; color:#9ca3af;">/${total}</span></p>
                <p style="margin:4px 0 0; font-size:12px; color:#6b7280;">ACERTOS</p>
              </td>
              <td style="padding:24px; text-align:center; border-right: 1px solid #e5e7eb;">
                <p style="margin:0; font-size:36px; font-weight:bold; color:#111827;">${percentage}%</p>
                <p style="margin:4px 0 0; font-size:12px; color:#6b7280;">APROVEITAMENTO</p>
              </td>
              <td style="padding:24px; text-align:center;">
                <p style="margin:0; font-size:18px; font-weight:bold; color:${passColor};">${passText}</p>
                <p style="margin:4px 0 0; font-size:12px; color:#6b7280;">STATUS</p>
              </td>
            </tr>
          </table>

          <!-- Category Breakdown -->
          ${categoryRows ? `
          <h3 style="font-size:16px; color:#111827; margin:0 0 12px;">📊 Desempenho por Categoria</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius:8px; overflow:hidden; margin-bottom:24px;">
            <tr style="background:#f3f4f6;">
              <th style="padding:10px 12px; text-align:left; font-size:13px; color:#374151;">Categoria</th>
              <th style="padding:10px 12px; text-align:center; font-size:13px; color:#374151;">Acertos</th>
              <th style="padding:10px 12px; text-align:center; font-size:13px; color:#374151;">%</th>
            </tr>
            ${categoryRows}
          </table>
          ` : ""}

          <!-- Info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff; border-radius:8px; padding:16px; margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0; font-size:14px; color:#1e40af;">
                📞 A equipe da <strong>Smart Home Premium</strong> entrará em contato com você em breve para os próximos passos do processo seletivo.
              </p>
            </td></tr>
          </table>

          <p style="font-size:12px; color:#9ca3af; margin:0;">Status da prova: ${status}</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb; padding:20px 32px; text-align:center; border-top: 1px solid #e5e7eb;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} Smart Home Premium — Todos os direitos reservados
          </p>
          <p style="margin:4px 0 0; font-size:11px; color:#d1d5db;">
            Este é um e-mail automático, por favor não responda.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send email via Gmail SMTP
    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_USER,
      password: Deno.env.get("GMAIL_APP_PASSWORD")!,
    });

    await client.send({
      from: `Smart Home Premium <${GMAIL_USER}>`,
      to: session.candidate_email,
      subject: `Resultado da Avaliação Técnica — ${score}/${total} (${percentage}%)`,
      content: `Resultado: ${score}/${total} (${percentage}%)`,
      html: htmlBody,
    });

    await client.close();

    console.log(`Email sent to ${session.candidate_email}: ${score}/${total} (${percentage}%)`);

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado", score, total, percentage }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao enviar email", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
