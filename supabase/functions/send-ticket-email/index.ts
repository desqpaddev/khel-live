import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_email", "smtp_from_name"];

type SendPayload = {
  to: string;
  subject?: string;
  html?: string;
};

type SmtpAttempt = {
  port: number;
  tls: boolean;
};

const toConfigMap = (settings: Array<{ setting_key: string; setting_value: string }>) => {
  const cfg: Record<string, string> = {};
  settings.forEach((s) => {
    cfg[s.setting_key] = s.setting_value;
  });
  return cfg;
};

const sendWithAttempt = async (cfg: Record<string, string>, payload: SendPayload, attempt: SmtpAttempt) => {
  const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

  const client = new SMTPClient({
    connection: {
      hostname: cfg.smtp_host,
      port: attempt.port,
      tls: attempt.tls,
      auth: {
        username: cfg.smtp_user,
        password: cfg.smtp_pass,
      },
    },
  });

  try {
    await client.send({
      from: cfg.smtp_from_email ? `${cfg.smtp_from_name || "Event"} <${cfg.smtp_from_email}>` : cfg.smtp_user,
      to: payload.to,
      subject: payload.subject || "Your Event Ticket",
      content: "Your ticket details are included below",
      html: payload.html || "<p>Your ticket</p>",
    });
  } finally {
    await client.close();
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = (await req.json()) as SendPayload;
    if (!payload?.to) {
      throw new Error("Recipient email is required");
    }

    const { data: settings } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", SMTP_KEYS);

    if (!settings || settings.length === 0) {
      throw new Error("SMTP settings not configured");
    }

    const cfg = toConfigMap(settings as Array<{ setting_key: string; setting_value: string }>);
    if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
      throw new Error("SMTP host, user, and password are required");
    }

    const configuredPort = Number.parseInt(cfg.smtp_port || "587", 10);
    if (!Number.isFinite(configuredPort) || configuredPort <= 0) {
      throw new Error("SMTP port is invalid");
    }

    const isGmailHost = /(^|\.)gmail\.com$/i.test(cfg.smtp_host) || /(^|\.)googlemail\.com$/i.test(cfg.smtp_host);

    // Denomailer + STARTTLS on 587 is unstable in edge runtime for some providers (including Gmail).
    // For Gmail we force implicit TLS on 465 even if admin entered 587.
    const attempts: SmtpAttempt[] = isGmailHost
      ? [{ port: 465, tls: true }]
      : [{ port: configuredPort, tls: configuredPort === 465 }];

    if (!isGmailHost && configuredPort === 587) {
      attempts.push({ port: 465, tls: true });
    }

    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        await sendWithAttempt(cfg, payload, attempt);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isStartTlsFailure =
          message.includes("InvalidContentType") ||
          message.includes("Bad resource ID") ||
          message.toLowerCase().includes("starttls") ||
          message.toLowerCase().includes("invalid cmd");
        const shouldRetry = !isGmailHost && configuredPort === 587 && attempt.port === 587 && isStartTlsFailure;

        if (!shouldRetry) {
          throw error;
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Email send failed. Please verify SMTP host/port and credentials.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Email send error:", error);

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
