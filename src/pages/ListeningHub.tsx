import { useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import ListeningPractice from '@/components/ListeningPractice';

const LISTENING_DATA: Record<string, { title: string; items: { id: string; audioText: string; transcript: string; hint: string }[] }[]> = {
  a1: [
    {
      title: "Greetings — Salomlashish",
      items: [
        { id: 'a1l1', audioText: 'Hello, my name is Sara.', transcript: 'Hello, my name is Sara.', hint: "Tanishish" },
        { id: 'a1l2', audioText: 'How are you today?', transcript: 'How are you today?', hint: "Hol so'rash" },
        { id: 'a1l3', audioText: 'I am fine, thank you.', transcript: 'I am fine, thank you.', hint: "Javob berish" },
        { id: 'a1l4', audioText: 'Nice to meet you.', transcript: 'Nice to meet you.', hint: "Tanishish" },
        { id: 'a1l5', audioText: 'Good morning, teacher.', transcript: 'Good morning, teacher.', hint: "Ertalab" },
      ],
    },
    {
      title: "Family — Oila",
      items: [
        { id: 'a1l6', audioText: 'This is my mother.', transcript: 'This is my mother.', hint: "Oila a'zosi" },
        { id: 'a1l7', audioText: 'I have two brothers.', transcript: 'I have two brothers.', hint: "Raqam + oila" },
        { id: 'a1l8', audioText: 'My sister is a student.', transcript: 'My sister is a student.', hint: "Kasb" },
        { id: 'a1l9', audioText: 'We live in a big house.', transcript: 'We live in a big house.', hint: "Uy" },
        { id: 'a1l10', audioText: 'My father works at a hospital.', transcript: 'My father works at a hospital.', hint: "Ish joyi" },
      ],
    },
  ],
  a2: [
    {
      title: "Daily Routine — Kundalik tartib",
      items: [
        { id: 'a2l1', audioText: 'I usually wake up at seven o\'clock.', transcript: 'I usually wake up at seven o\'clock.', hint: "Vaqt" },
        { id: 'a2l2', audioText: 'After breakfast, I go to school by bus.', transcript: 'After breakfast, I go to school by bus.', hint: "Transport" },
        { id: 'a2l3', audioText: 'I have lunch at the school canteen.', transcript: 'I have lunch at the school canteen.', hint: "Ovqatlanish" },
        { id: 'a2l4', audioText: 'In the evening, I do my homework.', transcript: 'In the evening, I do my homework.', hint: "Kechqurun" },
        { id: 'a2l5', audioText: 'I go to bed at ten o\'clock.', transcript: 'I go to bed at ten o\'clock.', hint: "Uxlash" },
      ],
    },
    {
      title: "Shopping — Xaridlar",
      items: [
        { id: 'a2l6', audioText: 'How much does this shirt cost?', transcript: 'How much does this shirt cost?', hint: "Narx so'rash" },
        { id: 'a2l7', audioText: 'Can I try this on, please?', transcript: 'Can I try this on, please?', hint: "Kiyib ko'rish" },
        { id: 'a2l8', audioText: 'I would like to buy these shoes.', transcript: 'I would like to buy these shoes.', hint: "Xarid" },
        { id: 'a2l9', audioText: 'Do you have this in a different color?', transcript: 'Do you have this in a different color?', hint: "Rang" },
        { id: 'a2l10', audioText: 'I will pay by credit card.', transcript: 'I will pay by credit card.', hint: "To'lov" },
      ],
    },
  ],
  b1: [
    {
      title: "Travel — Sayohat",
      items: [
        { id: 'b1l1', audioText: 'I have been to three different countries this year.', transcript: 'I have been to three different countries this year.', hint: "Present Perfect" },
        { id: 'b1l2', audioText: 'We should book the hotel in advance.', transcript: 'We should book the hotel in advance.', hint: "Maslahat" },
        { id: 'b1l3', audioText: 'The flight was delayed because of bad weather.', transcript: 'The flight was delayed because of bad weather.', hint: "Sabab" },
        { id: 'b1l4', audioText: 'If I had more money, I would travel around the world.', transcript: 'If I had more money, I would travel around the world.', hint: "Conditional" },
        { id: 'b1l5', audioText: 'She suggested that we visit the local museum.', transcript: 'She suggested that we visit the local museum.', hint: "Taklif" },
      ],
    },
    {
      title: "Work — Ish",
      items: [
        { id: 'b1l6', audioText: 'I have been working here for three years.', transcript: 'I have been working here for three years.', hint: "Present Perfect Continuous" },
        { id: 'b1l7', audioText: 'The meeting was cancelled due to unforeseen circumstances.', transcript: 'The meeting was cancelled due to unforeseen circumstances.', hint: "Rasmiy" },
        { id: 'b1l8', audioText: 'Could you please send me the report by Friday?', transcript: 'Could you please send me the report by Friday?', hint: "Iltimos" },
        { id: 'b1l9', audioText: 'We need to discuss the project deadline.', transcript: 'We need to discuss the project deadline.', hint: "Muhokama" },
        { id: 'b1l10', audioText: 'He was promoted to senior manager last month.', transcript: 'He was promoted to senior manager last month.', hint: "Lavozim" },
      ],
    },
  ],
  b2: [
    {
      title: "Environment — Atrof-muhit",
      items: [
        { id: 'b2l1', audioText: 'Climate change is one of the most pressing issues of our time.', transcript: 'Climate change is one of the most pressing issues of our time.', hint: "Global muammo" },
        { id: 'b2l2', audioText: 'Renewable energy sources are becoming increasingly affordable.', transcript: 'Renewable energy sources are becoming increasingly affordable.', hint: "Energiya" },
        { id: 'b2l3', audioText: 'Deforestation has led to the loss of biodiversity in many regions.', transcript: 'Deforestation has led to the loss of biodiversity in many regions.', hint: "Ekologiya" },
        { id: 'b2l4', audioText: 'Governments should implement stricter regulations on carbon emissions.', transcript: 'Governments should implement stricter regulations on carbon emissions.', hint: "Siyosat" },
        { id: 'b2l5', audioText: 'Sustainable development requires balancing economic growth with environmental protection.', transcript: 'Sustainable development requires balancing economic growth with environmental protection.', hint: "Muvozanat" },
      ],
    },
  ],
  c1: [
    {
      title: "Academic English — Akademik ingliz tili",
      items: [
        { id: 'c1l1', audioText: 'The research findings suggest a significant correlation between exercise and cognitive function.', transcript: 'The research findings suggest a significant correlation between exercise and cognitive function.', hint: "Tadqiqot" },
        { id: 'c1l2', audioText: 'It could be argued that technological advancements have fundamentally altered social interactions.', transcript: 'It could be argued that technological advancements have fundamentally altered social interactions.', hint: "Texnologiya" },
        { id: 'c1l3', audioText: 'Notwithstanding the challenges, the committee unanimously approved the proposal.', transcript: 'Notwithstanding the challenges, the committee unanimously approved the proposal.', hint: "Rasmiy" },
        { id: 'c1l4', audioText: 'Had the participants been informed earlier, the outcome might have been different.', transcript: 'Had the participants been informed earlier, the outcome might have been different.', hint: "Inversiya" },
        { id: 'c1l5', audioText: 'The implications of this study extend far beyond the scope of the original hypothesis.', transcript: 'The implications of this study extend far beyond the scope of the original hypothesis.', hint: "Xulosa" },
      ],
    },
  ],
};

const LEVELS = [
  { id: 'a1', name: 'A1', label: "Boshlang'ich" },
  { id: 'a2', name: 'A2', label: 'Elementar' },
  { id: 'b1', name: 'B1', label: "O'rta" },
  { id: 'b2', name: 'B2', label: "Yuqori o'rta" },
  { id: 'c1', name: 'C1', label: "Ilg'or" },
];

export default function ListeningHub() {
  const [selectedLevel, setSelectedLevel] = useState('a1');
  const [selectedSet, setSelectedSet] = useState(0);
  const [practicing, setPracticing] = useState(false);

  const levelData = LISTENING_DATA[selectedLevel] || [];
  const currentSet = levelData[selectedSet];

  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Headphones className="h-6 w-6 text-info" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Listening Practice</h1>
        </div>
        <p className="text-muted-foreground">Eshitib yozish mashqlari — A1 dan C1 gacha</p>
      </motion.div>

      {/* Level tabs */}
      <div className="flex gap-2 mt-8 mb-6 overflow-x-auto pb-1">
        {LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => { setSelectedLevel(level.id); setSelectedSet(0); setPracticing(false); }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
              selectedLevel === level.id
                ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                : 'border border-border bg-card text-foreground hover:shadow-card'
            }`}
          >
            {level.name} — {level.label}
          </button>
        ))}
      </div>

      {!practicing ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {levelData.map((set, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-card transition-all duration-200 cursor-pointer"
              onClick={() => { setSelectedSet(i); setPracticing(true); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">{set.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{set.items.length} ta mashq</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                  <Headphones className="h-5 w-5 text-info" />
                </div>
              </div>
            </div>
          ))}
          {levelData.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">Bu daraja uchun mashqlar tez orada qo'shiladi</p>
            </div>
          )}
        </motion.div>
      ) : currentSet ? (
        <div>
          <button
            onClick={() => setPracticing(false)}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            ← Orqaga
          </button>
          <ListeningPractice items={currentSet.items} lessonTitle={currentSet.title} />
        </div>
      ) : null}
    </div>
  );
}
