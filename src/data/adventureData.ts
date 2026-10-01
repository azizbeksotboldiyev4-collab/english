export type TaskKind = 'grammar' | 'vocabulary' | 'listening' | 'pronunciation' | 'quiz';

export interface AdvTask {
  id: TaskKind;
  label: string;
  emoji: string;
  xp: number;
  questions: { q: string; options: string[]; answer: number }[];
}

export interface AdvLevel {
  id: string;
  name: string;
  boss: string;
  bossEmoji: string;
  requiredXp: number;
  gradient: string;
  tasks: AdvTask[];
  bossQuestions: { q: string; options: string[]; answer: number }[];
}

const T = (id: TaskKind, label: string, emoji: string, xp: number, questions: AdvTask['questions']): AdvTask =>
  ({ id, label, emoji, xp, questions });

export const ADVENTURE_LEVELS: AdvLevel[] = [
  {
    id: 'a1', name: 'A1 — Boshlang\u2018ich oroli', boss: 'Beginner Guardian', bossEmoji: '🛡️',
    requiredXp: 0, gradient: 'from-emerald-400 to-teal-500',
    tasks: [
      T('grammar', 'Grammar', '📚', 20, [
        { q: 'I ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 0 },
        { q: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
        { q: 'They ___ my friends.', options: ['am', 'is', 'are', 'be'], answer: 2 },
      ]),
      T('vocabulary', 'Vocabulary', '🔤', 20, [
        { q: '"Kitob" inglizchada?', options: ['Book', 'Bag', 'Bird', 'Bread'], answer: 0 },
        { q: '"Suv" inglizchada?', options: ['Milk', 'Water', 'Juice', 'Tea'], answer: 1 },
        { q: '"Mushuk" inglizchada?', options: ['Dog', 'Cow', 'Cat', 'Fox'], answer: 2 },
      ]),
      T('listening', 'Listening', '🎧', 20, [
        { q: 'Tinglang va tanlang: "Good morning" nima degani?', options: ['Xayrli tun', 'Xayrli tong', 'Salomat bo\u2018ling', 'Rahmat'], answer: 1 },
        { q: '"Thank you" javobi?', options: ['You are welcome', 'Good night', 'See you', 'Sorry'], answer: 0 },
      ]),
      T('pronunciation', 'Pronunciation', '🎤', 20, [
        { q: '"Cat" so\u2018zi qanday o\u2018qiladi?', options: ['/keɪt/', '/kæt/', '/kɑːt/', '/sæt/'], answer: 1 },
        { q: '"Book" so\u2018zi qanday o\u2018qiladi?', options: ['/buːk/', '/bʊk/', '/bɔːk/', '/bʌk/'], answer: 1 },
      ]),
      T('quiz', 'Quiz', '📝', 30, [
        { q: 'Choose the correct: "He ___ tea."', options: ['drink', 'drinks', 'drinking', 'drank'], answer: 1 },
        { q: 'Plural of "child"?', options: ['childs', 'childes', 'children', 'child'], answer: 2 },
        { q: '"Men maktabga boraman" = ?', options: ['I go to school', 'I went school', 'I going school', 'I goes school'], answer: 0 },
      ]),
    ],
    bossQuestions: [
      { q: 'I ___ from Uzbekistan.', options: ['am', 'is', 'are', 'be'], answer: 0 },
      { q: 'Choose the article: ___ apple', options: ['a', 'an', 'the', '-'], answer: 1 },
      { q: '"Non" inglizchada?', options: ['Bread', 'Meat', 'Rice', 'Salt'], answer: 0 },
      { q: 'She ___ not like coffee.', options: ['do', 'does', 'is', 'are'], answer: 1 },
      { q: 'Translate: "Bu mening kitobim."', options: ['This is my book', 'This my book', 'It my book', 'That my book'], answer: 0 },
    ],
  },
  {
    id: 'a2', name: 'A2 — Grammar hududi', boss: 'Grammar Guardian', bossEmoji: '📐',
    requiredXp: 100, gradient: 'from-sky-400 to-blue-500',
    tasks: [
      T('grammar', 'Grammar', '📚', 25, [
        { q: 'Yesterday I ___ to the park.', options: ['go', 'goes', 'went', 'gone'], answer: 2 },
        { q: 'She has ___ finished.', options: ['yet', 'already', 'still', 'ever'], answer: 1 },
        { q: 'We ___ playing football now.', options: ['is', 'are', 'am', 'be'], answer: 1 },
      ]),
      T('vocabulary', 'Vocabulary', '🔤', 25, [
        { q: '"Sayohat" inglizchada?', options: ['Travel', 'Trouble', 'Trade', 'Track'], answer: 0 },
        { q: 'Opposite of "cheap"?', options: ['low', 'expensive', 'small', 'quick'], answer: 1 },
      ]),
      T('listening', 'Listening', '🎧', 25, [
        { q: '"Could you repeat that?" nima degani?', options: ['Takrorlay olasizmi?', 'Ketaylikmi?', 'Qanchadan?', 'Kim u?'], answer: 0 },
      ]),
      T('pronunciation', 'Pronunciation', '🎤', 25, [
        { q: '"Comfortable" nechta bo\u2018g\u2018in?', options: ['2', '3', '4', '5'], answer: 1 },
      ]),
      T('quiz', 'Quiz', '📝', 35, [
        { q: 'There ___ many people here.', options: ['is', 'are', 'was', 'be'], answer: 1 },
        { q: 'Comparative of "good"?', options: ['gooder', 'more good', 'better', 'best'], answer: 2 },
      ]),
    ],
    bossQuestions: [
      { q: 'He ___ TV when I called.', options: ['watch', 'watched', 'was watching', 'watches'], answer: 2 },
      { q: 'Choose: "I have lived here ___ 2010."', options: ['for', 'since', 'from', 'at'], answer: 1 },
      { q: '"Do\u2018kon" inglizchada?', options: ['Shop', 'Ship', 'Sheep', 'Shape'], answer: 0 },
      { q: 'Superlative of "big"?', options: ['bigger', 'biggest', 'most big', 'big'], answer: 1 },
      { q: 'Translate: "U ertaga keladi."', options: ['He came tomorrow', 'He will come tomorrow', 'He come tomorrow', 'He coming tomorrow'], answer: 1 },
    ],
  },
  {
    id: 'b1', name: 'B1 — Lug\u2018at vodiysi', boss: 'Vocabulary Master', bossEmoji: '📖',
    requiredXp: 300, gradient: 'from-violet-400 to-purple-600',
    tasks: [
      T('grammar', 'Grammar', '📚', 30, [
        { q: 'If it rains, we ___ at home.', options: ['stay', 'will stay', 'stayed', 'staying'], answer: 1 },
        { q: 'The book ___ by Dickens.', options: ['wrote', 'written', 'was written', 'is write'], answer: 2 },
      ]),
      T('vocabulary', 'Vocabulary', '🔤', 30, [
        { q: '"Achieve" ma\u2018nosi?', options: ['erishmoq', 'yo\u2018qotmoq', 'unutmoq', 'so\u2018ramoq'], answer: 0 },
        { q: 'Synonym of "important"?', options: ['tiny', 'significant', 'silly', 'rare'], answer: 1 },
      ]),
      T('listening', 'Listening', '🎧', 30, [
        { q: '"I\u2019m looking forward to it" = ?', options: ['Sabrsizlik bilan kutyapman', 'Men qarayapman', 'Men oldinda', 'Menga yoqmadi'], answer: 0 },
      ]),
      T('pronunciation', 'Pronunciation', '🎤', 30, [
        { q: '"Determine" urg\u2018usi qayerda?', options: ['1-bo\u2018g\u2018in', '2-bo\u2018g\u2018in', '3-bo\u2018g\u2018in', 'Yo\u2018q'], answer: 1 },
      ]),
      T('quiz', 'Quiz', '📝', 40, [
        { q: 'He suggested ___ a break.', options: ['take', 'taking', 'to take', 'took'], answer: 1 },
        { q: 'Reading: "She rarely eats out." — She...', options: ['often eats out', 'never cooks', 'seldom eats out', 'always eats out'], answer: 2 },
      ]),
    ],
    bossQuestions: [
      { q: 'I wish I ___ more time.', options: ['have', 'had', 'has', 'having'], answer: 1 },
      { q: '"Reluctant" ma\u2018nosi?', options: ['istamaydigan', 'quvnoq', 'tez', 'kuchli'], answer: 0 },
      { q: 'Choose: "He is used to ___ early."', options: ['wake', 'waking', 'woke', 'wakes'], answer: 1 },
      { q: 'Phrasal verb: "give up" = ?', options: ['taslim bo\u2018lmoq', 'ko\u2018tarmoq', 'bermoq', 'yig\u2018moq'], answer: 0 },
      { q: 'Passive: "They build houses." →', options: ['Houses build', 'Houses are built', 'Houses were build', 'Houses building'], answer: 1 },
    ],
  },
  {
    id: 'b2', name: 'B2 — Chaqiruv cho\u2018qqisi', boss: 'English Challenger', bossEmoji: '⚔️',
    requiredXp: 600, gradient: 'from-amber-400 to-orange-500',
    tasks: [
      T('grammar', 'Grammar', '📚', 35, [
        { q: 'Had I known, I ___ come.', options: ['will', 'would have', 'would', 'had'], answer: 1 },
        { q: 'Not only ___ late, but he also forgot.', options: ['he was', 'was he', 'he is', 'is he'], answer: 1 },
      ]),
      T('vocabulary', 'Vocabulary', '🔤', 35, [
        { q: '"Inevitable" ma\u2018nosi?', options: ['muqarrar', 'noaniq', 'oson', 'kamdan-kam'], answer: 0 },
      ]),
      T('listening', 'Listening', '🎧', 35, [
        { q: '"It slipped my mind" = ?', options: ['Esimdan chiqdi', 'Sirpandim', 'Fikrim o\u2018zgardi', 'Charchadim'], answer: 0 },
      ]),
      T('pronunciation', 'Pronunciation', '🎤', 35, [
        { q: '"Thorough" oxirgi tovushi?', options: ['/f/', '/ə/', '/g/', '/ʊ/'], answer: 1 },
      ]),
      T('quiz', 'Quiz', '📝', 45, [
        { q: 'By 2030, AI ___ many jobs.', options: ['will change', 'will have changed', 'changes', 'changed'], answer: 1 },
      ]),
    ],
    bossQuestions: [
      { q: 'Despite ___ hard, he failed.', options: ['study', 'studying', 'studied', 'to study'], answer: 1 },
      { q: '"Meticulous" = ?', options: ['sinchkov', 'shoshqaloq', 'dangasa', 'baland'], answer: 0 },
      { q: 'Choose: "Rarely ___ such talent."', options: ['we see', 'do we see', 'we do see', 'seeing we'], answer: 1 },
      { q: 'Idiom: "hit the books" = ?', options: ['qattiq o\u2018qimoq', 'kitob otmoq', 'dam olmoq', 'sotmoq'], answer: 0 },
      { q: '"The report, ___ was late, got rejected."', options: ['which', 'who', 'what', 'whose'], answer: 0 },
    ],
  },
  {
    id: 'c1', name: 'C1 — Yuqori qal\u2018a', boss: 'Advanced Guardian', bossEmoji: '🏯',
    requiredXp: 1000, gradient: 'from-rose-400 to-red-500',
    tasks: [
      T('grammar', 'Grammar', '📚', 40, [
        { q: 'Were it not for you, I ___ failed.', options: ['would have', 'will have', 'had', 'have'], answer: 0 },
      ]),
      T('vocabulary', 'Vocabulary', '🔤', 40, [
        { q: '"Ubiquitous" = ?', options: ['hamma joyda mavjud', 'noyob', 'zaif', 'sokin'], answer: 0 },
      ]),
      T('listening', 'Listening', '🎧', 40, [
        { q: '"Beat around the bush" = ?', options: ['gapni aylantirmoq', 'urmoq', 'yugurmoq', 'yashirinmoq'], answer: 0 },
      ]),
      T('pronunciation', 'Pronunciation', '🎤', 40, [
        { q: '"Entrepreneur" urg\u2018usi?', options: ['1-bo\u2018g\u2018in', '2-bo\u2018g\u2018in', 'oxirgi bo\u2018g\u2018in', 'yo\u2018q'], answer: 2 },
      ]),
      T('quiz', 'Quiz', '📝', 50, [
        { q: 'Choose the most formal:', options: ['get', 'obtain', 'grab', 'pick up'], answer: 1 },
      ]),
    ],
    bossQuestions: [
      { q: 'Scarcely ___ arrived when it started.', options: ['he had', 'had he', 'he has', 'has he'], answer: 1 },
      { q: '"Pragmatic" = ?', options: ['amaliy', 'xayolparast', 'qattiq', 'sekin'], answer: 0 },
      { q: 'Best synonym for "mitigate":', options: ['worsen', 'alleviate', 'ignore', 'expand'], answer: 1 },
      { q: '"Notwithstanding" = ?', options: ['shunga qaramay', 'chunki', 'agar', 'shuning uchun'], answer: 0 },
      { q: 'Choose correct: "The data ___ conclusive."', options: ['is', 'are', 'be', 'been'], answer: 1 },
    ],
  },
  {
    id: 'c2', name: 'C2 — Ustalar orolı', boss: 'English Master', bossEmoji: '👑',
    requiredXp: 1500, gradient: 'from-fuchsia-500 to-purple-700',
    tasks: [
      T('grammar', 'Grammar', '📚', 50, [
        { q: 'Choose the flawless sentence:', options: ['Neither of them were there.', 'Neither of them was there.', 'Neither of them are there.', 'Neither them was there.'], answer: 1 },
      ]),
      T('vocabulary', 'Vocabulary', '🔤', 50, [
        { q: '"Perfunctory" = ?', options: ['yuzaki bajarilgan', 'mukammal', 'shoshilinch', 'qimmat'], answer: 0 },
      ]),
      T('listening', 'Listening', '🎧', 50, [
        { q: '"To take something with a grain of salt" = ?', options: ['shubha bilan qabul qilmoq', 'tuz qo\u2018shmoq', 'yoqtirmoq', 'tez qilmoq'], answer: 0 },
      ]),
      T('pronunciation', 'Pronunciation', '🎤', 50, [
        { q: '"Colonel" qanday o\u2018qiladi?', options: ['/ˈkɜːnl/', '/ˈkɒlənel/', '/kəˈloʊnəl/', '/ˈkɔːlnel/'], answer: 0 },
      ]),
      T('quiz', 'Quiz', '📝', 60, [
        { q: 'Which is a subjunctive form?', options: ['I suggest he goes.', 'I suggest he go.', 'I suggest he going.', 'I suggest he gone.'], answer: 1 },
      ]),
    ],
    bossQuestions: [
      { q: '"Ephemeral" = ?', options: ['qisqa muddatli', 'abadiy', 'og\u2018ir', 'qimmat'], answer: 0 },
      { q: 'Choose correct inversion:', options: ['Only then I realized.', 'Only then did I realize.', 'Only then realized I.', 'Only then I did realize.'], answer: 1 },
      { q: '"Quintessential" = ?', options: ['eng tipik', 'noyob', 'yolg\u2018on', 'zaif'], answer: 0 },
      { q: 'Best register for academic writing:', options: ['a lot of', 'loads of', 'numerous', 'tons of'], answer: 2 },
      { q: '"Had it not been for her, we ___ lost."', options: ['would be', 'would have been', 'will be', 'had been'], answer: 1 },
    ],
  },
];

export const PRONUNCIATION_PHRASES: string[] = [
  'Beautiful',
  'I would like to improve my English.',
  'Education is the key to success.',
  'Thank you very much for your help.',
  'Could you please repeat that slowly?',
  'Practice makes perfect.',
  'I am learning English every single day.',
  'The weather is wonderful today.',
  'Communication is an essential skill.',
  'She sells seashells by the seashore.',
  'Technology changes our lives quickly.',
  'I have been studying for three hours.',
];
