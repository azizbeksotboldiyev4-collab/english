import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function validateLesson(parsed: any): boolean {
  return (
    typeof parsed.title === 'string' &&
    parsed.title.length > 0 &&
    parsed.title.length <= 200 &&
    typeof (parsed.titleUz || parsed.title_uz) === 'string' &&
    (parsed.titleUz || parsed.title_uz || '').length <= 200 &&
    Array.isArray(parsed.words) &&
    parsed.words.length >= 1 &&
    parsed.words.length <= 20 &&
    parsed.words.every((w: any) =>
      typeof w.en === 'string' &&
      w.en.length > 0 &&
      w.en.length <= 100 &&
      typeof w.uz === 'string' &&
      w.uz.length > 0 &&
      w.uz.length <= 100 &&
      (typeof w.emoji === 'string' ? w.emoji.length <= 10 : true)
    )
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin role check
    const userId = claimsData.claims.sub;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { startFrom = 1, count = 10 } = await req.json().catch(() => ({}));

    // Validate input parameters
    const safeCount = Math.min(Math.max(1, Number(count) || 1), 10);
    const safeStartFrom = Math.max(1, Number(startFrom) || 1);

    // Check how many lessons exist
    const { count: existingCount } = await supabase
      .from("vocab_lessons")
      .select("*", { count: "exact", head: true });

    const startOrder = (existingCount || 0) + 1;

    const topics = [
      "Greetings", "Family", "Colors", "Numbers", "Animals", "Food", "Drinks", "Body Parts",
      "Clothes", "Weather", "Days of Week", "Months", "Seasons", "School", "Professions",
      "Transport", "House & Rooms", "Furniture", "Kitchen Items", "Fruits", "Vegetables",
      "Sports", "Hobbies", "Emotions", "Nature", "City Places", "Shopping", "Time",
      "Directions", "Adjectives (Size)", "Adjectives (Quality)", "Verbs (Daily)", "Verbs (Movement)",
      "Verbs (Communication)", "Technology", "Social Media", "Music", "Art", "Travel",
      "Hotel", "Restaurant", "Health", "Medicine", "Money & Banking", "Office",
      "Celebrations", "Holidays", "Relationships", "Personality", "Education"
    ];

    const results: any[] = [];

    for (let i = 0; i < safeCount; i++) {
      const topicIndex = ((safeStartFrom - 1 + i) % topics.length);
      const lessonNum = startOrder + i;
      const topic = topics[topicIndex];
      const variation = Math.ceil(lessonNum / topics.length);
      const levelHint = lessonNum <= 50 ? "A1 beginner" : lessonNum <= 100 ? "A2 elementary" : "B1 intermediate";

      const prompt = `Generate exactly 10 English-Uzbek vocabulary words for the topic "${topic}" (variation ${variation}, ${levelHint} level).
Return ONLY a valid JSON object with this exact structure, no markdown:
{
  "title": "Topic Name in English",
  "titleUz": "Topic Name in Uzbek",
  "category": "${topic.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "words": [
    {"en": "English word", "uz": "Uzbek translation", "emoji": "relevant emoji"},
    ... (exactly 10 words)
  ]
}
Use simple, common words appropriate for ${levelHint} English learners. Each word must have a relevant emoji. Words should be unique and practical.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are a vocabulary generator. Return ONLY valid JSON, no markdown formatting." },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`AI error for lesson ${lessonNum}:`, response.status);
        continue;
      }

      const aiData = await response.json();
      let content = aiData.choices?.[0]?.message?.content || "";
      
      content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        console.error("Failed to parse AI response");
        continue;
      }

      // Validate AI output
      if (!validateLesson(parsed)) {
        console.error("AI response failed validation");
        continue;
      }

      const { data: lessonData, error: lessonError } = await supabase
        .from("vocab_lessons")
        .insert({
          title: parsed.title.slice(0, 200),
          title_uz: (parsed.titleUz || parsed.title_uz || `Dars ${lessonNum}`).slice(0, 200),
          category: (parsed.category || "general").slice(0, 50),
          lesson_order: lessonNum,
        })
        .select("id")
        .single();

      if (lessonError) {
        console.error("Lesson insert error:", lessonError);
        continue;
      }

      const words = (parsed.words || []).slice(0, 10).map((w: any, idx: number) => ({
        lesson_id: lessonData.id,
        en: String(w.en).slice(0, 100),
        uz: String(w.uz).slice(0, 100),
        emoji: String(w.emoji || "📝").slice(0, 10),
        word_order: idx + 1,
      }));

      const { error: wordsError } = await supabase.from("vocab_words").insert(words);
      if (wordsError) console.error("Words insert error:", wordsError);

      results.push({ lessonNum, title: parsed.title, wordCount: words.length });

      if (i < safeCount - 1) await new Promise(r => setTimeout(r, 500));
    }

    return new Response(
      JSON.stringify({ success: true, generated: results.length, lessons: results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-vocab error:", e);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
