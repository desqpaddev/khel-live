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

    const { phone, message, registrationNumber, participantName } = await req.json();

    // Fetch WhatsApp settings
    const { data: settings } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["whatsapp_api_url", "whatsapp_api_key", "whatsapp_from_number"]);

    if (!settings || settings.length === 0) {
      throw new Error("WhatsApp settings not configured");
    }

    const cfg: Record<string, string> = {};
    settings.forEach((s: any) => { cfg[s.setting_key] = s.setting_value; });

    if (!cfg.whatsapp_api_url || !cfg.whatsapp_api_key) {
      throw new Error("WhatsApp API URL and API Key are required");
    }

    const whatsappMessage = message || `🎉 Registration Confirmed!\n\nHi ${participantName},\n\nYour registration (${registrationNumber}) has been confirmed.\n\nPlease check your email for the full ticket with QR code.\n\nSee you at the event! 🏊‍♂️`;

    const response = await fetch(cfg.whatsapp_api_url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cfg.whatsapp_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace(/[^0-9]/g, ""),
        type: "text",
        text: { body: whatsappMessage },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`WhatsApp API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
