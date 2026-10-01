import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Sen professional ingliz tili insho tekshiruvchisisisan. Foydalanuvchi ingliz tilida insho yozadi, sen uni tekshirib, o'zbek tilida batafsil fikr-mulohaza berasan.

JAVOB FORMATI (aynan shu formatda ber):
## 📊 Umumiy Ball: [0-100]/100

## ✅ Yaxshi tomonlari:
- ...

## ❌ Xatolar va kamchiliklar:
1. **Xato:** "[xato matni]" → **To'g'ri:** "[to'g'ri variant]"
   - Sabab: ...

## 📝 Grammatika tahlili:
- Ball: [0-25]/25
- ...

## 🎨 Uslub va so'z boyligi:
- Ball: [0-25]/25
- ...

## 🧠 Mantiq va tuzilma:
- Ball: [0-25]/25
- ...

## 📖 Umumiy taassurot:
- Ball: [0-25]/25
- ...

## 💡 Tavsiyalar:
1. ...
2. ...
3. ...

Har doim o'zbek tilida javob ber. Inglizcha misollar bilan tushuntir.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Tizimga kiring." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Tizimga kiring." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { essay, topic } = await req.json();
    
    if (!essay || typeof essay !== "string" || essay.length < 10 || essay.length > 10000) {
      return new Response(JSON.stringify({ error: "Insho 10-10000 belgi orasida bo'lishi kerak." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Xizmat vaqtincha ishlamayapti." }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = topic 
      ? `Mavzu: "${topic}"\n\nInsho:\n${essay}`
      : `Insho:\n${essay}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Juda ko'p so'rov. Biroz kuting." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Xizmat limitiga yetildi." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI xatoligi." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("essay-checker error:", e);
    return new Response(JSON.stringify({ error: "Xatolik yuz berdi." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
