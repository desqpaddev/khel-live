import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, subject, html, isTest } = await req.json();

    // Fetch SMTP settings
    const { data: settings } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_email", "smtp_from_name"]);

    if (!settings || settings.length === 0) {
      throw new Error("SMTP settings not configured");
    }

    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.setting_key] = s.setting_value; });

    if (!cfg.smtp_host || !cfg.smtp_user || !cfg.smtp_pass) {
      throw new Error("SMTP host, user, and password are required");
    }

    // Use Deno's built-in SMTP via denopkg
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    const client = new SMTPClient({
      connection: {
        hostname: cfg.smtp_host,
        port: parseInt(cfg.smtp_port || "587"),
        tls: true,
        auth: {
          username: cfg.smtp_user,
          password: cfg.smtp_pass,
        },
      },
    });

    await client.send({
      from: cfg.smtp_from_email ? `${cfg.smtp_from_name || "Event"} <${cfg.smtp_from_email}>` : cfg.smtp_user,
      to,
      subject: subject || "Your Event Ticket",
      content: "Your ticket is attached",
      html: html || "<p>Your ticket</p>",
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
