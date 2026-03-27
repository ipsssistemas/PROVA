import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GMAIL_USER = "ipsssistema@gmail.com";

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function buildMimeMessage(from: string, to: string, subject: string, plainTextBody: string, htmlBody: string): string {
  const boundary = `boundary_${crypto.randomUUID().replace(/-/g, "")}`;
  const messageId = `<${crypto.randomUUID()}@gmail.com>`;

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${encodeBase64(subject)}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary=\"${boundary}\"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64(plainTextBody),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64(htmlBody),
    "",
    `--${boundary}--`,
    "",
  ].join("\r\n");
}

async function readSmtpResponse(conn: Deno.Conn, decoder: TextDecoder): Promise<string> {
  const buf = new Uint8Array(4096);
  let response = "";

  while (true) {
    const n = await conn.read(buf);
    if (n === null) {
      throw new Error(`Conexão SMTP encerrada inesperadamente. Resposta parcial: ${response || "<vazia>"}`);
    }

    response += decoder.decode(buf.subarray(0, n));
    const lines = response.split("\r\n").filter(Boolean);
    const lastLine = lines[lines.length - 1];

    if (lastLine && /^\d{3} /.test(lastLine)) {
      return response;
    }
  }
}

function ensureSmtpCode(response: string, expectedCodes: string[], context: string) {
  const trimmed = response.trim();
  const matched = expectedCodes.some((code) => trimmed.startsWith(code));

  if (!matched) {
    throw new Error(`Falha no SMTP em ${context}: ${trimmed}`);
  }
}

async function sendSmtpCommand(
  conn: Deno.Conn,
  encoder: TextEncoder,
  decoder: TextDecoder,
  command: string,
  expectedCodes: string[],
  context: string,
) {
  await conn.write(encoder.encode(`${command}\r\n`));
  const response = await readSmtpResponse(conn, decoder);
  ensureSmtpCode(response, expectedCodes, context);
  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateName, candidateEmail, accessCode, durationMinutes } = await req.json();
    const recipientEmail = String(candidateEmail || "").trim().toLowerCase();
    const normalizedCode = String(accessCode || "").trim().toUpperCase();
    const examDuration = Number(durationMinutes) || 45;
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!recipientEmail || !normalizedCode) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!gmailPassword) {
      throw new Error("Credencial de envio de e-mail não configurada.");
    }

    const plainTextBody = [
      `Olá${candidateName ? `, ${candidateName}` : ""}!`,
      "",
      "Você foi convidado(a) a realizar a avaliação técnica da Smart Home Premium.",
      `Código de acesso: ${normalizedCode}`,
      `Duração da prova: ${examDuration} minutos`,
      "",
      "Importante: o código é de uso único.",
    ].join("\n");

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
          <p style="color:#e0e7ff; margin:8px 0 0; font-size:14px;">Código de Acesso — Avaliação Técnica</p>
        </td></tr>
        <tr><td style="padding: 32px;">
          <p style="font-size:16px; color:#374151; margin:0 0 8px;">
            Olá${candidateName ? `, <strong>${candidateName}</strong>` : ""}!
          </p>
          <p style="font-size:14px; color:#6b7280; margin:0 0 24px;">
            Você foi convidado(a) a realizar a avaliação técnica da <strong>Smart Home Premium</strong>.
            Use o código abaixo para acessar a prova:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff; border: 2px dashed #0066ff; border-radius:12px; margin-bottom:24px;">
            <tr><td style="padding:24px; text-align:center;">
              <p style="margin:0 0 8px; font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:2px;">Seu Código de Acesso</p>
              <p style="margin:0; font-size:32px; font-weight:bold; color:#0066ff; letter-spacing:4px; font-family: monospace;">${normalizedCode}</p>
            </td></tr>
          </table>
          <h3 style="font-size:15px; color:#111827; margin:0 0 12px;">📋 Instruções:</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">1. Acesse a plataforma de avaliação</td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">2. Digite seu <strong>nome completo</strong> e o <strong>código de acesso</strong></td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">3. Clique em <strong>\"Iniciar Prova\"</strong></td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">4. A prova contém <strong>30 perguntas</strong> técnicas avançadas</td></tr>
            <tr><td style="padding:6px 0; font-size:14px; color:#4b5563;">5. Você terá <strong>${examDuration} minutos</strong> para concluir</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7; border-radius:8px; margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0; font-size:13px; color:#92400e;">
                ⚠️ <strong>Importante:</strong> O código é de uso único. Ao iniciar a prova, o tempo começará a contar imediatamente.
              </p>
            </td></tr>
          </table>
          <p style="font-size:14px; color:#6b7280; margin:0;">Boa sorte! 🍀</p>
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

    const fromHeader = `Smart Home Premium <${GMAIL_USER}>`;
    const rawMessage = buildMimeMessage(
      fromHeader,
      recipientEmail,
      "Código de Acesso — Avaliação Técnica Smart Home Premium",
      plainTextBody,
      htmlBody,
    );

    const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const greeting = await readSmtpResponse(conn, decoder);
    ensureSmtpCode(greeting, ["220"], "abertura da conexão");
    await sendSmtpCommand(conn, encoder, decoder, "EHLO localhost", ["250"], "EHLO");
    await sendSmtpCommand(conn, encoder, decoder, "AUTH LOGIN", ["334"], "AUTH LOGIN");
    await sendSmtpCommand(conn, encoder, decoder, btoa(GMAIL_USER), ["334"], "usuário SMTP");
    await sendSmtpCommand(conn, encoder, decoder, btoa(gmailPassword), ["235"], "senha SMTP");
    await sendSmtpCommand(conn, encoder, decoder, `MAIL FROM:<${GMAIL_USER}>`, ["250"], "MAIL FROM");
    await sendSmtpCommand(conn, encoder, decoder, `RCPT TO:<${recipientEmail}>`, ["250", "251"], "RCPT TO");
    await sendSmtpCommand(conn, encoder, decoder, "DATA", ["354"], "DATA");
    await sendSmtpCommand(conn, encoder, decoder, `${rawMessage}\r\n.`, ["250"], "envio da mensagem");
    await sendSmtpCommand(conn, encoder, decoder, "QUIT", ["221"], "QUIT");
    conn.close();

    console.log(`SMTP aceitou o e-mail de código para ${recipientEmail}`);

    return new Response(JSON.stringify({ success: true, message: "Email enviado" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no envio do código:", error);
    return new Response(JSON.stringify({ error: "Erro ao enviar email", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});