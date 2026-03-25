import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { candidateName, candidateEmail, accessCode, durationMinutes } = await req.json();

    if (!candidateEmail || !accessCode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          <p style="color:#e0e7ff; margin:8px 0 0; font-size:14px;">Código de Acesso — Avaliação Técnica</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding: 32px;">
          <p style="font-size:16px; color:#374151; margin:0 0 8px;">
            Olá${candidateName ? `, <strong>${candidateName}</strong>` : ""}!
          </p>
          <p style="font-size:14px; color:#6b7280; margin:0 0 24px;">
            Você foi convidado(a) a realizar a avaliação técnica da <strong>Smart Home Premium</strong>. 
            Use o código abaixo para acessar a prova:
          </p>

          <!-- Code Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff; border: 2px dashed #0066ff; border-radius:12px; margin-bottom:24px;">
            <tr><td style="padding:24px; text-align:center;">
              <p style="margin:0 0 8px; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:2px;">Seu Código de Acesso</p>
              <p style="margin:0; font-size:32px; font-weight:bold; color:#0066ff; letter-spacing:4px; font-family: monospace;">${accessCode}</p>
            </td></tr>
          </table>

          <!-- Instructions -->
          <h3 style="font-size:15px; color:#111827; margin:0 0 12px;">📋 Instruções:</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">1. Acesse a plataforma de avaliação</td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">2. Digite seu <strong>nome completo</strong> e o <strong>código de acesso</strong></td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">3. Clique em <strong>"Iniciar Prova"</strong></td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">4. A prova contém <strong>30 perguntas</strong> técnicas avançadas</td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">5. Você terá <strong>${durationMinutes || 45} minutos</strong> para concluir</td></tr>
          </table>

          <!-- Warning -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7; border-radius:8px; margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0; font-size:13px; color:#92400e;">
                ⚠️ <strong>Importante:</strong> O código é de uso único. Ao iniciar a prova, o tempo começará a contar imediatamente. Certifique-se de estar em um ambiente tranquilo e com boa conexão à internet.
              </p>
            </td></tr>
          </table>

          <p style="font-size:14px; color:#6b7280; margin:0;">Boa sorte! 🍀</p>
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

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_USER,
      password: Deno.env.get("GMAIL_APP_PASSWORD")!,
    });

    await client.send({
      from: `Smart Home Premium <${GMAIL_USER}>`,
      to: candidateEmail,
      subject: `Código de Acesso — Avaliação Técnica Smart Home Premium`,
      content: `Seu código de acesso: ${accessCode}. Use-o para acessar a prova.`,
      html: htmlBody,
    });

    await client.close();

    console.log(`Access code email sent to ${candidateEmail}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email enviado" }),
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
