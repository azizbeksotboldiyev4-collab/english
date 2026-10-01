import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, titleUz, levelId, category, baseExplanation, mode, variant } = await req.json();
    if (!title || typeof title !== "string") {
      return new Response(JSON.stringify({ error: "title required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI xizmati sozlanmagan" }), {
        status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const modeStr = ["beginner", "standard", "advanced"].includes(mode) ? mode : "standard";
    const modeNote = {
      beginner: "USLUB: 🟢 Boshlang'ich. Juda sodda o'zbekcha, qisqa gaplar, ko'p taqqoslash va kundalik hayotdan misollar. Grammatik atamalarni albatta oddiy so'z bilan izohla.",
      standard: "USLUB: 🔵 Standart. Muvozanatli tushuntirish, aniq qoidalar va yetarlicha misollar.",
      advanced: "USLUB: 🟣 Yuqori. Nozik farqlar, istisnolar, rasmiy/norasmiy uslub farqi va murakkabroq misollar qo'sh.",
    }[modeStr];

    const system = `Sen "Azizbek EDU" ingliz tili o'qituvchisisan. O'quvchi o'zbek tilida so'zlashadi va mavzuni noldan o'rganadi.
${modeNote}

Sen FAQAT JSON qaytarasan (hech qanday matn, izoh yoki \`\`\` belgisi yo'q). JSON sxemasi:
{
  "intro": { "title": string, "simple": string, "analogy": string, "realLife": string, "emoji": string },
  "usage": [ { "emoji": string, "title": string, "desc": string, "example": string } ],   // 4-5 ta
  "formulas": [ { "type": "Tasdiq"|"Inkor"|"So'roq", "formula": string, "example": string, "note": string } ],
  "examples": [ { "en": string, "uz": string, "note": string } ],  // KAMIDA 10 ta
  "scenarios": [ { "emoji": string, "place": string, "dialog": [ { "en": string, "uz": string } ] } ], // 5-7 ta joy: Maktab, Ish, Sayohat, Xarid, Shifoxona, Oila, Restoran
  "mistakes": [ { "wrong": string, "right": string, "why": string } ], // 5 ta
  "quiz": [ { "question": string, "options": [string,string,string,string], "correctIndex": number, "explanation": string } ], // aniq 5 ta
  "vocab": [ { "word": string, "ipa": string, "uz": string, "example": string } ], // 8-12 ta
  "summary": { "learned": [string], "keyPoints": [string], "tip": string }
}

Qoidalar:
- Barcha izoh va tarjimalar o'zbek tilida, misol gaplar ingliz tilida.
- Mavzuga MOS bo'lsin: agar mavzu grammatik bo'lmasa "formulas" ni foydali qoliplar (patterns) sifatida to'ldir.
- Quizda savol o'zbekcha yoki aralash bo'lishi mumkin, variantlar ingliz tilida.
- JSONdan boshqa hech narsa yozma.`;

    const user = `Mavzu: "${title}"${titleUz ? ` (${titleUz})` : ""}
Daraja: ${levelId?.toUpperCase() || "A1"}
Bo'lim: ${category || "grammar"}
${variant ? `Variant: ${variant} — avvalgidan FARQLI misollar va boshqacha tushuntirish ber.` : ""}
${baseExplanation ? `\nQisqa ma'lumot:\n${String(baseExplanation).slice(0, 800)}` : ""}

Ushbu mavzu uchun to'liq JSON o'quv rejasini qaytar.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Juda ko'p so'rov, biroz kuting." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI limiti tugadi." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("explain-lesson gateway error", response.status, t);
      return new Response(JSON.stringify({ error: "AI xizmatida xatolik" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const s = cleaned.indexOf("{");
      const e = cleaned.lastIndexOf("}");
      if (s === -1 || e === -1) {
        return new Response(JSON.stringify({ error: "AI javobini o'qib bo'lmadi" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        parsed = JSON.parse(cleaned.slice(s, e + 1));
      } catch {
        return new Response(JSON.stringify({ error: "AI javobini o'qib bo'lmadi" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("explain-lesson error", e);
    return new Response(JSON.stringify({ error: "Ichki xatolik" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});