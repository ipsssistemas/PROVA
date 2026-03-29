import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "Smart Home Premium <noreply@smarthomepremium.com>";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY não configurada.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: session, error: sessionError } = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipientEmail = String(session.candidate_email || "").trim().toLowerCase();
    if (!recipientEmail) {
      throw new Error("Sessão sem e-mail de candidato.");
    }

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

    const categoryMap: Record<string, { correct: number; total: number }> = {};
    if (answers && questions) {
      const questionCategoryMap: Record<number, string> = {};
      questions.forEach((q: { id: number; category: string }) => {
        questionCategoryMap[q.id] = q.category;
      });

      answers.forEach((answer: { is_correct: boolean; question_id: number }) => {
        const category = questionCategoryMap[answer.question_id] || "Outros";
        if (!categoryMap[category]) categoryMap[category] = { correct: 0, total: 0 };
        categoryMap[category].total += 1;
        if (answer.is_correct) categoryMap[category].correct += 1;
      });
    }

    let categoryRows = "";
    for (const [category, data] of Object.entries(categoryMap)) {
      const categoryPct = Math.round((data.correct / data.total) * 100);
      categoryRows += `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${category}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${data.correct}/${data.total}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${categoryPct}%</td>
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
        <tr><td style="background: linear-gradient(135deg, #0066ff, #0044cc); padding: 32px; text-align: center;">
          <h1 style="color:#ffffff; margin:0; font-size:24px;">🏠 Smart Home Premium</h1>
          <p style="color:#e0e7ff; margin:8px 0 0; font-size:14px;">Resultado da Avaliação Técnica</p>
        </td></tr>
        <tr><td style="padding: 32px;">
          <p style="font-size:16px; color:#374151; margin:0 0 8px;">Olá, <strong>${session.candidate_name}</strong>!</p>
          <p style="font-size:14px; color:#6b7280; margin:0 0 24px;">
            ${status === "Tempo esgotado"
              ? "O tempo da sua prova se encerrou. Veja abaixo o seu desempenho:"
              : "Sua avaliação técnica foi concluída com sucesso. Confira o resultado:"}
          </p>
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
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff; border-radius:8px; margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0; font-size:14px; color:#1e40af;">
                📞 A equipe da <strong>Smart Home Premium</strong> entrará em contato com você em breve.
              </p>
            </td></tr>
          </table>
          <p style="font-size:12px; color:#9ca3af; margin:0;">Status da prova: ${status}</p>
        </td></tr>
        <tr><td style="background:#f9fafb; padding:20px 32px; text-align:center; border-top: 1px solid #e5e7eb;">
          <p style="margin:0; font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} Smart Home Premium — Todos os direitos reservados
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const subject = `Resultado da Avaliação Técnica — ${score}/${total} (${percentage}%)`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [recipientEmail],
        subject,
        html: htmlBody,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      throw new Error(`Resend API error: ${JSON.stringify(resData)}`);
    }

    console.log(`Email de resultado enviado para ${recipientEmail} via Resend`);

    return new Response(JSON.stringify({ success: true, message: "Email enviado", score, total, percentage }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no envio do resultado:", error);
    return new Response(JSON.stringify({ error: "Erro ao enviar email", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
