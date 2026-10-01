import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { lessonId, title, titleUz, levelId, category, explanation } = await req.json();
    if (!title || !titleUz) {
      return new Response(JSON.stringify({ error: 'title and titleUz required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY missing');

    const systemPrompt = `Siz ingliz tili o'qituvchisisiz. Talaba o'zbek tilida so'zlashadi.
Vazifa: berilgan mavzuga oid 15 ta sifatli, mavzuga aniq mos quiz savol va batafsil tushuntirish yarating.

TALABLAR:
- Savollar mavzuni chuqur tekshirsin (yodlash emas, tushunish).
- Variantlar real va chalg'ituvchi (distractors) bo'lsin — barchasi ishonarli ko'rinsin.
- Savol matni o'zbekcha yoki inglizcha bo'lishi mumkin, lekin ingliz tili namunalari bilan.
- Har bir savolda aniq bitta to'g'ri javob.
- Tushuntirish (explanation) o'zbek tilida, qisqa va aniq — nima uchun to'g'ri ekanini ko'rsatsin.
- Mavzu darajasiga mos murakkablikda.
- Takrorlanmas savollar. Generic "qaysi darajaga tegishli" kabi savollar QILMANG.
- Qamrov: ta'rif, struktura, ishlatilish, misol tahlili, xatolarni topish, gap to'ldirish, tarjima.

Tushuntirish (lessonExplanation): 4-6 paragraf, batafsil, tushunarli o'zbek tilida. Qoidalar, misollar, eslab qolish uchun maslahatlar.`;

    const userPrompt = `Mavzu: ${title} (${titleUz})
Daraja: ${levelId?.toUpperCase()}
Kategoriya: ${category}
Mavjud qisqacha tushuntirish: ${explanation?.slice(0, 800) || '(yo\'q)'}

15 ta quiz savol va kengaytirilgan tushuntirish yarating.`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'submit_quiz',
            description: 'Submit 15 quiz questions and expanded lesson explanation',
            parameters: {
              type: 'object',
              properties: {
                lessonExplanation: { type: 'string' },
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      options: { type: 'array', items: { type: 'string' } },
                      correctIndex: { type: 'number' },
                      explanation: { type: 'string' },
                    },
                    required: ['question', 'options', 'correctIndex', 'explanation'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['lessonExplanation', 'questions'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'submit_quiz' } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error('AI gateway error', resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ error: 'Rate limit. Birozdan keyin urinib ko\'ring.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: 'AI kredit tugadi.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ error: 'AI xatosi' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) return new Response(JSON.stringify({ error: 'No tool call' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const parsed = JSON.parse(call.function.arguments);

    const questions = (parsed.questions || []).slice(0, 15).map((q: any, i: number) => ({
      id: `ai-${lessonId}-${i}`,
      question: String(q.question),
      options: Array.isArray(q.options) ? q.options.map(String) : [],
      correctIndex: Math.max(0, Math.min(3, Number(q.correctIndex) || 0)),
      explanation: String(q.explanation || ''),
    })).filter((q: any) => q.options.length >= 2);

    return new Response(JSON.stringify({
      lessonExplanation: parsed.lessonExplanation || '',
      questions,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('generate-quiz error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});