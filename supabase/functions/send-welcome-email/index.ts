import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SMTP_KEYS = ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_email", "smtp_from_name"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, fullName } = await req.json();
    if (!to) throw new Error("Recipient email is required");

    const { data: settings } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", SMTP_KEYS);

    if (!settings || settings.length === 0) throw new Error("SMTP settings not configured");

    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.setting_key] = s.setting_value; });

    if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
      throw new Error("SMTP host, user, and password are required");
    }

    const fromName = cfg.smtp_from_name || "KHELIUM";
    const fromEmail = cfg.smtp_from_email || cfg.smtp_user;
    const name = fullName || "Athlete";

    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:0;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#e53e3e,#c53030);padding:40px 30px;text-align:center;border-radius:12px 12px 0 0;">
        <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:2px;">KHELIUM</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;letter-spacing:1px;">SPORTS EVENTS PLATFORM</p>
      </div>
      
      <div style="padding:35px 30px;">
        <h2 style="color:#1a1a1a;font-size:22px;margin:0 0 15px;">Welcome aboard, ${name}! 🎉</h2>
        <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 20px;">
          Thank you for creating your KHELIUM account. You're now part of an amazing community of athletes and sports enthusiasts.
        </p>
        
        <div style="background:#fef2f2;border-left:4px solid #e53e3e;padding:18px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
          <p style="color:#333;font-size:14px;margin:0;font-weight:600;">What you can do now:</p>
          <ul style="color:#555;font-size:14px;line-height:1.8;margin:10px 0 0;padding-left:18px;">
            <li>Browse and register for upcoming events</li>
            <li>Get your digital ticket with QR code</li>
            <li>Track your results and achievements</li>
            <li>Download participation certificates</li>
          </ul>
        </div>

        <div style="text-align:center;margin:30px 0;">
          <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}" 
             style="display:inline-block;background:#e53e3e;color:#ffffff;text-decoration:none;padding:14px 35px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:1px;">
            EXPLORE EVENTS
          </a>
        </div>

        <p style="color:#888;font-size:13px;line-height:1.6;margin:25px 0 0;text-align:center;">
          If you have any questions, feel free to reach out to us.<br/>
          We're excited to have you on board!
        </p>
      </div>

      <div style="background:#f8f8f8;padding:20px 30px;text-align:center;border-radius:0 0 12px 12px;border-top:1px solid #eee;">
        <p style="color:#999;font-size:11px;margin:0;">© ${new Date().getFullYear()} KHELIUM. All rights reserved.</p>
      </div>
    </div>`;

    const isGmailHost = /(^|\.)gmail\.com$/i.test(cfg.smtp_host) || /(^|\.)googlemail\.com$/i.test(cfg.smtp_host);
    const configuredPort = Number.parseInt(cfg.smtp_port || "587", 10);

    const attempts = isGmailHost
      ? [{ port: 465, tls: true }]
      : [{ port: configuredPort, tls: configuredPort === 465 }];

    if (!isGmailHost && configuredPort === 587) {
      attempts.push({ port: 465, tls: true });
    }

    let lastError: unknown = null;

    for (const attempt of attempts) {
      try {
        const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
        const client = new SMTPClient({
          connection: {
            hostname: cfg.smtp_host,
            port: attempt.port,
            tls: attempt.tls,
            auth: { username: cfg.smtp_user, password: cfg.smtp_pass },
          },
        });

        await client.send({
          from: `${fromName} <${fromEmail}>`,
          to,
          subject: `Welcome to KHELIUM, ${name}! 🏅`,
          content: `Welcome to KHELIUM, ${name}! Your account has been created successfully.`,
          html,
        });

        await client.close();

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isStartTlsFailure =
          message.includes("InvalidContentType") ||
          message.includes("Bad resource ID") ||
          message.toLowerCase().includes("starttls");
        if (!(configuredPort === 587 && attempt.port === 587 && isStartTlsFailure)) {
          throw error;
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Email send failed");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Welcome email error:", error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
