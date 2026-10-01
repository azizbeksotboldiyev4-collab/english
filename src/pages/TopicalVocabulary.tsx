import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Volume2, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface VocabWord {
  word: string;
  translation: string;
  example: string;
  pronunciation: string;
}

interface VocabTopic {
  id: string;
  title: string;
  titleUz: string;
  emoji: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  words: VocabWord[];
}

const TOPICS: VocabTopic[] = [
  // BEGINNER
  {
    id: 'greetings', title: 'Greetings', titleUz: 'Salomlashish', emoji: '👋', level: 'beginner',
    words: [
      { word: 'Hello', translation: 'Salom', example: 'Hello, how are you?', pronunciation: '/həˈloʊ/' },
      { word: 'Goodbye', translation: 'Xayr', example: 'Goodbye, see you tomorrow!', pronunciation: '/ɡʊdˈbaɪ/' },
      { word: 'Please', translation: 'Iltimos', example: 'Please help me.', pronunciation: '/pliːz/' },
      { word: 'Thank you', translation: 'Rahmat', example: 'Thank you very much!', pronunciation: '/θæŋk juː/' },
      { word: 'Sorry', translation: 'Kechirasiz', example: "I'm sorry for being late.", pronunciation: '/ˈsɒri/' },
      { word: 'Welcome', translation: 'Xush kelibsiz', example: 'Welcome to our school!', pronunciation: '/ˈwelkəm/' },
      { word: 'Good morning', translation: 'Xayrli tong', example: 'Good morning, teacher!', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/' },
      { word: 'Good night', translation: 'Xayrli tun', example: 'Good night, sleep well.', pronunciation: '/ɡʊd naɪt/' },
    ],
  },
  {
    id: 'family', title: 'Family', titleUz: 'Oila', emoji: '👨‍👩‍👧‍👦', level: 'beginner',
    words: [
      { word: 'Father', translation: 'Ota', example: 'My father is a teacher.', pronunciation: '/ˈfɑːðər/' },
      { word: 'Mother', translation: 'Ona', example: 'My mother cooks well.', pronunciation: '/ˈmʌðər/' },
      { word: 'Brother', translation: 'Aka/uka', example: 'My brother is tall.', pronunciation: '/ˈbrʌðər/' },
      { word: 'Sister', translation: 'Opa/singil', example: 'My sister is smart.', pronunciation: '/ˈsɪstər/' },
      { word: 'Son', translation: "O'g'il", example: 'Their son is 5 years old.', pronunciation: '/sʌn/' },
      { word: 'Daughter', translation: 'Qiz', example: 'Her daughter studies medicine.', pronunciation: '/ˈdɔːtər/' },
      { word: 'Grandfather', translation: 'Buva', example: 'My grandfather is 80.', pronunciation: '/ˈɡrændfɑːðər/' },
      { word: 'Grandmother', translation: 'Buvi', example: 'Grandmother tells stories.', pronunciation: '/ˈɡrændmʌðər/' },
    ],
  },
  {
    id: 'food', title: 'Food & Drinks', titleUz: 'Ovqat va ichimliklar', emoji: '🍕', level: 'beginner',
    words: [
      { word: 'Bread', translation: 'Non', example: 'I eat bread every morning.', pronunciation: '/bred/' },
      { word: 'Water', translation: 'Suv', example: 'Can I have some water?', pronunciation: '/ˈwɔːtər/' },
      { word: 'Rice', translation: 'Guruch', example: 'We cook rice for lunch.', pronunciation: '/raɪs/' },
      { word: 'Meat', translation: "Go'sht", example: 'This meat is delicious.', pronunciation: '/miːt/' },
      { word: 'Fruit', translation: 'Meva', example: 'I love fresh fruit.', pronunciation: '/fruːt/' },
      { word: 'Tea', translation: 'Choy', example: 'Would you like some tea?', pronunciation: '/tiː/' },
      { word: 'Milk', translation: 'Sut', example: 'Children drink milk.', pronunciation: '/mɪlk/' },
      { word: 'Sugar', translation: 'Shakar', example: 'No sugar in my coffee.', pronunciation: '/ˈʃʊɡər/' },
    ],
  },
  {
    id: 'colors', title: 'Colors', titleUz: 'Ranglar', emoji: '🎨', level: 'beginner',
    words: [
      { word: 'Red', translation: 'Qizil', example: 'The apple is red.', pronunciation: '/red/' },
      { word: 'Blue', translation: "Ko'k", example: 'The sky is blue.', pronunciation: '/bluː/' },
      { word: 'Green', translation: 'Yashil', example: 'Grass is green.', pronunciation: '/ɡriːn/' },
      { word: 'Yellow', translation: 'Sariq', example: 'The sun is yellow.', pronunciation: '/ˈjeloʊ/' },
      { word: 'Black', translation: 'Qora', example: 'I have a black cat.', pronunciation: '/blæk/' },
      { word: 'White', translation: 'Oq', example: 'Snow is white.', pronunciation: '/waɪt/' },
      { word: 'Orange', translation: "To'q sariq", example: 'Oranges are orange.', pronunciation: '/ˈɔːrɪndʒ/' },
      { word: 'Purple', translation: 'Binafsha', example: 'She likes purple flowers.', pronunciation: '/ˈpɜːrpl/' },
    ],
  },
  // INTERMEDIATE
  {
    id: 'travel', title: 'Travel', titleUz: 'Sayohat', emoji: '✈️', level: 'intermediate',
    words: [
      { word: 'Airport', translation: 'Aeroport', example: 'We arrived at the airport.', pronunciation: '/ˈerpɔːrt/' },
      { word: 'Passport', translation: 'Pasport', example: 'Show me your passport, please.', pronunciation: '/ˈpæspɔːrt/' },
      { word: 'Luggage', translation: 'Yuk/bagaj', example: 'My luggage is heavy.', pronunciation: '/ˈlʌɡɪdʒ/' },
      { word: 'Ticket', translation: 'Chipta', example: 'I booked a round-trip ticket.', pronunciation: '/ˈtɪkɪt/' },
      { word: 'Hotel', translation: 'Mehmonxona', example: 'The hotel has a pool.', pronunciation: '/hoʊˈtel/' },
      { word: 'Reservation', translation: 'Bron qilish', example: 'I have a reservation for tonight.', pronunciation: '/ˌrezərˈveɪʃn/' },
      { word: 'Currency', translation: 'Valyuta', example: 'What currency do they use?', pronunciation: '/ˈkɜːrənsi/' },
      { word: 'Destination', translation: 'Manzil', example: 'Our destination is Paris.', pronunciation: '/ˌdestɪˈneɪʃn/' },
    ],
  },
  {
    id: 'education', title: 'Education', titleUz: "Ta'lim", emoji: '🎓', level: 'intermediate',
    words: [
      { word: 'University', translation: 'Universitet', example: 'She studies at a university.', pronunciation: '/ˌjuːnɪˈvɜːrsəti/' },
      { word: 'Exam', translation: 'Imtihon', example: 'The exam was difficult.', pronunciation: '/ɪɡˈzæm/' },
      { word: 'Homework', translation: 'Uy vazifasi', example: 'Did you finish your homework?', pronunciation: '/ˈhoʊmwɜːrk/' },
      { word: 'Lecture', translation: "Ma'ruza", example: 'The lecture was interesting.', pronunciation: '/ˈlektʃər/' },
      { word: 'Scholarship', translation: 'Stipendiya', example: 'He won a scholarship.', pronunciation: '/ˈskɑːlərʃɪp/' },
      { word: 'Diploma', translation: 'Diplom', example: 'She received her diploma.', pronunciation: '/dɪˈploʊmə/' },
      { word: 'Research', translation: 'Tadqiqot', example: 'I am doing research on AI.', pronunciation: '/rɪˈsɜːrtʃ/' },
      { word: 'Professor', translation: 'Professor', example: 'The professor explained clearly.', pronunciation: '/prəˈfesər/' },
    ],
  },
  {
    id: 'health', title: 'Health', titleUz: "Sog'liq", emoji: '🏥', level: 'intermediate',
    words: [
      { word: 'Doctor', translation: 'Shifokor', example: 'I need to see a doctor.', pronunciation: '/ˈdɑːktər/' },
      { word: 'Medicine', translation: 'Dori', example: 'Take this medicine twice a day.', pronunciation: '/ˈmedɪsn/' },
      { word: 'Hospital', translation: 'Kasalxona', example: 'He was taken to the hospital.', pronunciation: '/ˈhɑːspɪtl/' },
      { word: 'Headache', translation: "Bosh og'rig'i", example: 'I have a terrible headache.', pronunciation: '/ˈhedeɪk/' },
      { word: 'Fever', translation: 'Isitma', example: 'She has a high fever.', pronunciation: '/ˈfiːvər/' },
      { word: 'Prescription', translation: 'Retsept', example: 'The doctor wrote a prescription.', pronunciation: '/prɪˈskrɪpʃn/' },
      { word: 'Symptom', translation: 'Alomat', example: 'What are your symptoms?', pronunciation: '/ˈsɪmptəm/' },
      { word: 'Recovery', translation: 'Tuzalish', example: 'His recovery was quick.', pronunciation: '/rɪˈkʌvəri/' },
    ],
  },
  // ADVANCED
  {
    id: 'business', title: 'Business', titleUz: 'Biznes', emoji: '💼', level: 'advanced',
    words: [
      { word: 'Entrepreneur', translation: 'Tadbirkor', example: 'She is a successful entrepreneur.', pronunciation: '/ˌɑːntrəprəˈnɜːr/' },
      { word: 'Investment', translation: 'Investitsiya', example: 'This is a good investment.', pronunciation: '/ɪnˈvestmənt/' },
      { word: 'Revenue', translation: 'Daromad', example: 'Company revenue increased by 20%.', pronunciation: '/ˈrevənjuː/' },
      { word: 'Negotiation', translation: 'Muzokaralar', example: 'The negotiation lasted 3 hours.', pronunciation: '/nɪˌɡoʊʃiˈeɪʃn/' },
      { word: 'Stakeholder', translation: 'Manfaatdor tomon', example: 'All stakeholders must agree.', pronunciation: '/ˈsteɪkhoʊldər/' },
      { word: 'Merger', translation: "Qo'shilish", example: 'The merger was approved.', pronunciation: '/ˈmɜːrdʒər/' },
      { word: 'Bankruptcy', translation: 'Bankrotlik', example: 'The company filed for bankruptcy.', pronunciation: '/ˈbæŋkrʌptsi/' },
      { word: 'Profit margin', translation: 'Foyda darajasi', example: 'Our profit margin is 15%.', pronunciation: '/ˈprɑːfɪt ˈmɑːrdʒɪn/' },
    ],
  },
  {
    id: 'technology', title: 'Technology', titleUz: 'Texnologiya', emoji: '💻', level: 'advanced',
    words: [
      { word: 'Algorithm', translation: 'Algoritm', example: 'The algorithm sorts data fast.', pronunciation: '/ˈælɡərɪðəm/' },
      { word: 'Artificial Intelligence', translation: "Sun'iy intellekt", example: 'AI is changing the world.', pronunciation: '/ˌɑːrtɪˈfɪʃl ɪnˈtelɪdʒəns/' },
      { word: 'Database', translation: "Ma'lumotlar bazasi", example: 'The database stores user info.', pronunciation: '/ˈdeɪtəbeɪs/' },
      { word: 'Cybersecurity', translation: 'Kiberxavfsizlik', example: 'Cybersecurity is essential today.', pronunciation: '/ˌsaɪbərsɪˈkjʊrəti/' },
      { word: 'Bandwidth', translation: 'Tarmoq kengligi', example: 'We need more bandwidth.', pronunciation: '/ˈbændwɪdθ/' },
      { word: 'Cloud computing', translation: 'Bulutli hisoblash', example: 'Cloud computing reduces costs.', pronunciation: '/klaʊd kəmˈpjuːtɪŋ/' },
      { word: 'Encryption', translation: 'Shifrlash', example: 'Data encryption protects privacy.', pronunciation: '/ɪnˈkrɪpʃn/' },
      { word: 'Blockchain', translation: 'Blokcheyn', example: 'Blockchain is used in crypto.', pronunciation: '/ˈblɑːktʃeɪn/' },
    ],
  },
  {
    id: 'law', title: 'Law & Politics', titleUz: 'Huquq va siyosat', emoji: '⚖️', level: 'advanced',
    words: [
      { word: 'Constitution', translation: 'Konstitutsiya', example: 'The constitution protects rights.', pronunciation: '/ˌkɑːnstɪˈtuːʃn/' },
      { word: 'Legislation', translation: 'Qonunchilik', example: 'New legislation was passed.', pronunciation: '/ˌledʒɪsˈleɪʃn/' },
      { word: 'Verdict', translation: 'Hukm', example: 'The jury reached a verdict.', pronunciation: '/ˈvɜːrdɪkt/' },
      { word: 'Diplomat', translation: 'Diplomat', example: 'The diplomat gave a speech.', pronunciation: '/ˈdɪpləmæt/' },
      { word: 'Amendment', translation: "Tuzatish/o'zgartirish", example: 'The first amendment is important.', pronunciation: '/əˈmendmənt/' },
      { word: 'Sanction', translation: 'Sanktsiya', example: 'Economic sanctions were imposed.', pronunciation: '/ˈsæŋkʃn/' },
      { word: 'Prosecution', translation: "Jinoiy ta'qib", example: 'The prosecution presented evidence.', pronunciation: '/ˌprɑːsɪˈkjuːʃn/' },
      { word: 'Sovereignty', translation: 'Suverenitet', example: 'National sovereignty is respected.', pronunciation: '/ˈsɑːvrənti/' },
    ],
  },
];

const LEVEL_CONFIG = {
  beginner: { label: 'Beginner', labelUz: 'Boshlang\'ich', color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800' },
  intermediate: { label: 'Intermediate', labelUz: "O'rta", color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800' },
  advanced: { label: 'Advanced', labelUz: 'Yuqori', color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800' },
};

function speak(text: string) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  speechSynthesis.speak(u);
}

function TopicCard({ topic }: { topic: VocabTopic }) {
  const [open, setOpen] = useState(false);
  const lvl = LEVEL_CONFIG[topic.level];

  return (
    <motion.div
      layout
      className={`rounded-2xl border-2 ${lvl.border} overflow-hidden transition-shadow hover:shadow-lg`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 p-4 ${lvl.bgLight} transition-colors`}
      >
        <span className="text-3xl">{topic.emoji}</span>
        <div className="flex-1 text-left">
          <h3 className="font-bold text-foreground">{topic.title}</h3>
          <p className="text-sm text-muted-foreground">{topic.titleUz} · {topic.words.length} so'z</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border">
              {topic.words.map((w, i) => (
                <motion.div
                  key={w.word}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <button
                    onClick={() => speak(w.word)}
                    className="mt-1 flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Volume2 className="h-4 w-4 text-primary" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{w.word}</span>
                      <span className="text-xs text-muted-foreground font-mono">{w.pronunciation}</span>
                    </div>
                    <p className={`text-sm font-semibold ${lvl.textColor}`}>{w.translation}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 italic">"{w.example}"</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TopicalVocabulary() {
  const [activeLevel, setActiveLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return TOPICS
      .filter((t) => t.level === activeLevel)
      .filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.titleUz.toLowerCase().includes(q) ||
          t.words.some((w) => w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q))
        );
      });
  }, [activeLevel, search]);

  return (
    <div className="container max-w-2xl py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10"
        >
          <BookOpen className="h-8 w-8 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-extrabold text-foreground">Topical Vocabulary</h1>
        <p className="text-muted-foreground">Mavzular bo'yicha so'z boyligini oshiring</p>
      </div>

      {/* Level tabs */}
      <div className="flex gap-2 justify-center">
        {(Object.keys(LEVEL_CONFIG) as Array<keyof typeof LEVEL_CONFIG>).map((level) => {
          const cfg = LEVEL_CONFIG[level];
          const active = activeLevel === level;
          return (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`relative px-4 py-2 rounded-2xl font-bold text-sm transition-all ${
                active
                  ? 'text-white shadow-lg scale-105'
                  : 'text-muted-foreground bg-muted hover:bg-muted/80'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="vocab-level-tab"
                  className={`absolute inset-0 ${cfg.color} rounded-2xl`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{cfg.labelUz}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="So'z qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-2xl"
        />
      </div>

      {/* Topics */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Hech narsa topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
