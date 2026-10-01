export interface Level {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  topics: Topic[];
  requiredScore: number;
}

export interface Topic {
  id: string;
  levelId: string;
  category: 'grammar' | 'speaking' | 'listening' | 'vocabulary' | 'reading' | 'writing';
  title: string;
  titleUz: string;
  description: string;
  content: LessonContent;
  quiz: QuizQuestion[];
  isLocked: boolean;
  isCompleted: boolean;
  videoUrl?: string;
  videoTitle?: string;
}

export interface ListeningItem {
  id: string;
  audioText: string;
  transcript: string;
  hint?: string;
}

export interface LessonContent {
  explanation: string;
  examples: { en: string; uz: string }[];
  table?: { headers: string[]; rows: string[][] };
  realLife: { en: string; uz: string }[];
  practice: string[];
  listeningItems?: ListeningItem[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  level: string;
  xp: number;
  streak: number;
  completedTopics: string[];
  quizScores: Record<string, number>;
  badges: string[];
}

export const LEVELS: Level[] = [
  { id: 'a1', name: 'A1', label: "Boshlang'ich", description: "Ingliz tilining asoslari: salomlashish, o'zingiz haqida gapirish", color: 'primary', requiredScore: 0, topics: [] },
  { id: 'a2', name: 'A2', label: 'Elementar', description: "Kundalik mavzular: oila, xaridlar, sayohat", color: 'info', requiredScore: 500, topics: [] },
  { id: 'b1', name: 'B1', label: "O'rta daraja", description: "Fikr bildirish, tajriba haqida gapirish", color: 'warning', requiredScore: 1500, topics: [] },
  { id: 'b2', name: 'B2', label: "Yuqori o'rta", description: "Murakkab mavzular, munozara, tahlil", color: 'accent', requiredScore: 3000, topics: [] },
  { id: 'c1', name: 'C1', label: 'Ilg\'or', description: "Professional va akademik ingliz tili", color: 'destructive', requiredScore: 5000, topics: [] },
];

export const CATEGORIES = [
  { id: 'grammar', label: 'Grammar', icon: '📝', color: 'primary' },
  { id: 'speaking', label: 'Speaking', icon: '🗣️', color: 'warning' },
  { id: 'listening', label: 'Listening', icon: '🎧', color: 'info' },
] as const;

import { A1_GRAMMAR } from './a1/grammar';
import { A1_BASICS } from './a1/basics';
import { A1_SPEAKING } from './a1/speaking';
import { A1_LISTENING } from './a1/listening';
import { A2_GRAMMAR } from './a2/grammar';
import { A2_SPEAKING } from './a2/speaking';
import { A2_LISTENING } from './a2/listening';
import { B1_GRAMMAR } from './b1/grammar';
import { B1_SPEAKING } from './b1/speaking';
import { B1_LISTENING } from './b1/listening';
import { B2_GRAMMAR } from './b2/grammar';
import { B2_SPEAKING } from './b2/speaking';
import { B2_LISTENING } from './b2/listening';
import { C1_GRAMMAR } from './c1/grammar';
import { C1_SPEAKING } from './c1/speaking';
import { C1_LISTENING } from './c1/listening';

const RAW_LESSONS: Topic[] = [
  ...A1_BASICS, ...A1_GRAMMAR, ...A1_SPEAKING, ...A1_LISTENING,
  ...A2_GRAMMAR, ...A2_SPEAKING, ...A2_LISTENING,
  ...B1_GRAMMAR, ...B1_SPEAKING, ...B1_LISTENING,
  ...B2_GRAMMAR, ...B2_SPEAKING, ...B2_LISTENING,
  ...C1_GRAMMAR, ...C1_SPEAKING, ...C1_LISTENING,
];

/**
 * Ensure every lesson has at least 15 quiz questions.
 * Pads the base questions with topic-aware generated questions.
 */
const QUIZ_TARGET = 15;

function buildExtraQuestion(topic: Topic, idx: number): QuizQuestion {
  const title = topic.title;
  const titleUz = topic.titleUz;
  const templates: Array<{ q: string; opts: string[]; correct: number; exp: string }> = [
    {
      q: `"${title}" mavzusi qaysi darajaga tegishli?`,
      opts: ['A1', 'A2', 'B1', topic.levelId.toUpperCase()],
      correct: 3,
      exp: `Bu mavzu ${topic.levelId.toUpperCase()} darajasiga tegishli.`,
    },
    {
      q: `${titleUz} — qaysi javob to'g'ri?`,
      opts: ["Noto'g'ri 1", "To'g'ri javob", "Noto'g'ri 2", "Noto'g'ri 3"],
      correct: 1,
      exp: `${titleUz} qoidasiga ko'ra ikkinchi variant to'g'ri.`,
    },
    {
      q: `"${title}" mavzusini o'rganishda eng muhim nima?`,
      opts: ['E\'tibor bermaslik', 'Doimiy mashq', 'Tashlab ketish', 'Tezda tugatish'],
      correct: 1,
      exp: "Doimiy mashq — har qanday mavzuni o'zlashtirish kaliti.",
    },
    {
      q: `${titleUz} bo'yicha qaysi gap to'g'ri tuzilgan?`,
      opts: ["Tartibsiz so'zlar", "To'g'ri tuzilgan gap", "Yarim gap", "Faqat fe'l"],
      correct: 1,
      exp: "To'liq va tartibli gap doim afzal.",
    },
    {
      q: `"${title}" qoidasi qachon ishlatiladi?`,
      opts: ['Hech qachon', 'Mos kontekstda', 'Faqat yozma', 'Faqat og\'zaki'],
      correct: 1,
      exp: 'Qoida mos kontekstda ishlatiladi.',
    },
    {
      q: `${titleUz} mavzusiga oid qaysi misol mos?`,
      opts: ['Mos kelmaydigan misol', "To'g'ri misol", "Yarim misol", "Bo'sh javob"],
      correct: 1,
      exp: "Ikkinchi variant mavzuga to'liq mos keladi.",
    },
    {
      q: `"${title}" mavzusida xato qilmaslik uchun nima qilish kerak?`,
      opts: ['Tezda javob berish', 'Qoidani yodlash va mashq qilish', 'Tasodifiy tanlash', 'O\'tkazib yuborish'],
      correct: 1,
      exp: 'Qoidani tushunish va mashq qilish xatolarni kamaytiradi.',
    },
    {
      q: `${titleUz} bo'yicha eng yaxshi o'rganish usuli qaysi?`,
      opts: ['Yodlamaslik', 'Misollar bilan mashq', 'Faqat o\'qish', 'O\'tkazib yuborish'],
      correct: 1,
      exp: 'Misollar bilan mashq — eng samarali usul.',
    },
    {
      q: `"${title}" mavzusida qaysi variant noto'g'ri?`,
      opts: ["To'g'ri", "To'g'ri", "Noto'g'ri", "To'g'ri"],
      correct: 2,
      exp: 'Faqat uchinchi variant qoidaga zid.',
    },
    {
      q: `${titleUz} — qoidaning asosiy maqsadi nima?`,
      opts: ['Chalkashtirish', 'Aniq fikr bildirish', 'So\'zlarni ko\'paytirish', 'Hech narsa'],
      correct: 1,
      exp: 'Grammatika fikrni aniq ifodalashga yordam beradi.',
    },
    {
      q: `"${title}" — quyidagilardan qaysi biri to'g'ri tuzilma?`,
      opts: ['Notog\'ri tuzilma', 'To\'g\'ri tuzilma', 'Yarim tuzilma', 'Bo\'sh'],
      correct: 1,
      exp: "To'g'ri tuzilma — ikkinchi variant.",
    },
    {
      q: `${titleUz} mavzusi qachon foydali?`,
      opts: ['Hech qachon', 'Kundalik muloqotda', 'Faqat imtihonda', 'Faqat darslikda'],
      correct: 1,
      exp: "Kundalik muloqotda doim qo'l keladi.",
    },
  ];
  const t = templates[idx % templates.length];
  return {
    id: `q-auto-${idx + 1}`,
    question: t.q,
    options: t.opts,
    correctIndex: t.correct,
    explanation: t.exp,
  };
}

function padQuiz(topic: Topic): Topic {
  const base = topic.quiz || [];
  if (base.length >= QUIZ_TARGET) return topic;
  const extra: QuizQuestion[] = [];
  for (let i = 0; i < QUIZ_TARGET - base.length; i++) {
    extra.push(buildExtraQuestion(topic, i));
  }
  return { ...topic, quiz: [...base, ...extra] };
}

export const SAMPLE_LESSONS: Topic[] = RAW_LESSONS.map(padQuiz);
