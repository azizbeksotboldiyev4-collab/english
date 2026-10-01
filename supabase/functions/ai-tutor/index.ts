import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_PROMPT = `You are "Azizbek EDU AI Tutor" — a friendly, professional English teacher for Uzbek-speaking students.

CORE RULES:
- Reply primarily in English. Add brief Uzbek explanations in parentheses when a concept is hard.
- Adapt your vocabulary and grammar complexity to the student's CEFR level.
- ALWAYS correct grammar mistakes. Format: original sentence → corrected version → short reason.
- Suggest better word choices or more natural phrasings.
- Recommend useful vocabulary with a short Uzbek gloss.
- Be encouraging and patient. Use markdown (lists, **bold**, code blocks for example sentences).
- Keep answers focused and not overly long.`;

const MODE_PROMPTS: Record<string, string> = {
  free: "Mode: Free conversation. Help the student with any English question.",
  grammar: "Mode: GRAMMAR PRACTICE. Explain rules with tables and examples, then give 2-3 short exercises. Wait for the student's answers and check them.",
  speaking: "Mode: SPEAKING SIMULATION. Act as a conversation partner. Ask one question at a time. Correct pronunciation hints (in IPA) and natural phrasing. Keep replies short and conversational.",
  vocabulary: "Mode: VOCABULARY PRACTICE. Teach 5-8 themed words: word, IPA, Uzbek meaning, example sentence. Then quiz the student with fill-in-the-blank or matching.",
  ielts: "Mode: IELTS PRACTICE. Help with IELTS Speaking, Writing Task 1/2, and Reading strategies. Band-aware feedback (target band 6.5-7.5). For writing, give band score + improvements.",
  daily: "Mode: DAILY CONVERSATION. Simulate everyday situations (café, airport, small talk). Stay in character. Correct mistakes gently after each exchange.",
  writing: "Mode: WRITING CORRECTION. The student sends text; you return: (1) corrected version, (2) line-by-line feedback, (3) vocabulary upgrades, (4) overall score /10.",
  interview: "Mode: INTERVIEW PRACTICE. Act as a recruiter (tech / general). Ask one interview question at a time. After the student answers, give feedback on content + language.",
};

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 50;

function validateBody(body: unknown):
  | { messages: Array<{ role: string; content: string }>; mode: string; userLevel: string; completedTopics: string[]; lessonContext?: string }
  | null {
  if (!body || typeof body !== "object" || !("messages" in body)) return null;
  const { messages, lessonContext, mode, userLevel, completedTopics } = body as {
    messages: unknown; lessonContext?: unknown; mode?: unknown; userLevel?: unknown; completedTopics?: unknown;
  };
  if (!Array.isArray(messages)) return null;
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return null;

  const validated: Array<{ role: string; content: string }> = [];
  for (const msg of messages) {
    if (!msg || typeof msg !== "object") return null;
    const { role, content } = msg as { role: unknown; content: unknown };
    if (typeof role !== "string" || typeof content !== "string") return null;
    if (role !== "user" && role !== "assistant") return null;
    if (content.length === 0 || content.length > MAX_MESSAGE_LENGTH) return null;
    validated.push({ role, content });
  }

  const ctx = typeof lessonContext === "string" && lessonContext.length > 0 && lessonContext.length < 5000
    ? lessonContext
    : undefined;

  const modeStr = typeof mode === "string" && MODE_PROMPTS[mode] ? mode : "free";
  const levelStr = typeof userLevel === "string" && /^(a1|a2|b1|b2|c1|c2)$/i.test(userLevel) ? userLevel.toUpperCase() : "A1";
  const topics = Array.isArray(completedTopics)
    ? (completedTopics as unknown[]).filter((t) => typeof t === "string").slice(0, 50) as string[]
    : [];

  return { messages: validated, lessonContext: ctx, mode: modeStr, userLevel: levelStr, completedTopics: topics };
}

function buildSystemPrompt(opts: { mode: string; userLevel: string; completedTopics: string[]; lessonContext?: string }): string {
  if (opts.lessonContext?.includes("VOICE CHAT MODE")) return opts.lessonContext;

  const parts = [
    BASE_PROMPT,
    `Student CEFR level: ${opts.userLevel}.`,
    opts.completedTopics.length > 0
      ? `Recently completed lesson topics (use these to personalize and avoid repeating basics): ${opts.completedTopics.slice(-10).join(", ")}.`
      : "Student has not completed any lessons yet — start with basics.",
    MODE_PROMPTS[opts.mode] ?? MODE_PROMPTS.free,
  ];

  if (opts.lessonContext) {
    parts.push(`Current lesson context:\n${opts.lessonContext}`);
  }

  return parts.join("\n\n");
}

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
    const { data, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !data?.claims) {
      return new Response(
        JSON.stringify({ error: "Tizimga kiring." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Noto'g'ri so'rov formati." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validated = validateBody(body);
    if (!validated) {
      return new Response(
        JSON.stringify({ error: "Xabar formati noto'g'ri yoki juda uzun." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("CRITICAL: LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Xizmat vaqtincha ishlamayapti." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(validated);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...validated.messages,
          ],
          stream: true,
        }),
      }
    );

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
      const t = await response.text();
      console.error(`AI Gateway error: status=${response.status}, body=${t}`);
      return new Response(
        JSON.stringify({ error: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-tutor error:", e);
    return new Response(
      JSON.stringify({ error: "Xatolik yuz berdi. Iltimos qayta urinib ko'ring." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
