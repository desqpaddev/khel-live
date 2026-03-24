import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CASHFREE_APP_ID = Deno.env.get("CASHFREE_APP_ID");
    const CASHFREE_SECRET_KEY = Deno.env.get("CASHFREE_SECRET_KEY");
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      throw new Error("Cashfree credentials not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    // Use service role for updates
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, registrationId } = await req.json();
    if (!orderId || !registrationId) throw new Error("Missing orderId or registrationId");

    // Verify payment with Cashfree (Production)
    const cfResponse = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        "x-api-version": "2023-08-01",
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
      },
    });

    const cfData = await cfResponse.json();
    if (!cfResponse.ok) {
      throw new Error(cfData.message || "Failed to verify order");
    }

    const isPaid = cfData.order_status === "PAID";

    // Update registration payment status
    await supabase.from("registrations").update({
      payment_status: isPaid ? "paid" : "failed",
      status: isPaid ? "confirmed" : "payment_failed",
    } as any).eq("id", registrationId);

    // If paid, increment discount usage if applicable
    if (isPaid) {
      // Fetch app settings for sending confirmation email
      const { data: settings } = await supabase.from("app_settings").select("setting_key, setting_value");
      const settingsMap: Record<string, string> = {};
      settings?.forEach((s: any) => { settingsMap[s.setting_key] = s.setting_value; });
    }

    return new Response(JSON.stringify({
      success: isPaid,
      orderStatus: cfData.order_status,
      paymentStatus: isPaid ? "paid" : "failed",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
