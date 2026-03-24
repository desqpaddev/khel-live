import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { messages, conversationId } = await req.json();

    // Fetch events data for context
    const { data: events } = await supabase
      .from("events")
      .select("title, sport, category, city, venue, event_date, event_time, age_groups, price, total_spots, description, status, image_url")
      .order("event_date", { ascending: true });

    // Fetch app settings for org context
    const { data: settings } = await supabase
      .from("app_settings")
      .select("setting_key, setting_value");

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.setting_key] = s.setting_value; });

    const eventsContext = events?.map(e =>
      `• ${e.title} — ${e.sport} (${e.category}) in ${e.city} at ${e.venue} on ${e.event_date} at ${e.event_time}. Age groups: ${e.age_groups?.join(", ")}. Price: ₹${e.price}. Spots: ${e.total_spots}. Status: ${e.status}. ${e.description || ""}`
    ).join("\n") || "No events available.";

    const systemPrompt = `You are KHELIUM Sports Assistant, a friendly and knowledgeable AI chatbot for the KHELIUM sports events platform. You help users with information about upcoming events, registrations, and general queries about sports events.

Here are the current events:
${eventsContext}

Key information:
- Platform: KHELIUM — India's premier youth sports events platform
- Contact email: ${settingsMap.smtp_from_email || "support@khelium.com"}
- Website features: Event registration, online payment via Cashfree, digital tickets with QR codes, live results & leaderboard
- Registration process: Browse events → Select ticket → Fill form → Pay online → Get digital ticket
- Supported payment: UPI, Cards, Net Banking via Cashfree

Guidelines:
- Be enthusiastic about sports and encouraging to young athletes
- Answer event-specific questions using the data above
- For registration issues, suggest visiting the Events page or Dashboard
- If asked something you don't know, politely say so and suggest contacting support
- Keep responses concise (2-4 sentences unless details are needed)
- Use emojis sparingly to keep it friendly 🏆
- If an admin is chatting, help with any operational questions too`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
