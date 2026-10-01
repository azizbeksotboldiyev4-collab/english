export interface TenseInfo {
  id: string;
  name: string;
  nameUz: string;
  formula: string;
  example: string;
  exampleUz: string;
  emoji: string;
  color: string;
}

export interface TenseQuestion {
  id: number;
  tenseId: string;
  type: 'identify' | 'fill' | 'correct';
  sentence: string;
  sentenceUz?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const tenses: TenseInfo[] = [
  {
    id: 'present-simple',
    name: 'Present Simple',
    nameUz: 'Oddiy hozirgi zamon',
    formula: 'S + V1 / V1+s/es',
    example: 'I play football every day.',
    exampleUz: 'Men har kuni futbol o\'ynayman.',
    emoji: '⏰',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'present-continuous',
    name: 'Present Continuous',
    nameUz: 'Davomli hozirgi zamon',
    formula: 'S + am/is/are + V-ing',
    example: 'She is reading a book now.',
    exampleUz: 'U hozir kitob o\'qiyapti.',
    emoji: '🔄',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'past-simple',
    name: 'Past Simple',
    nameUz: 'Oddiy o\'tgan zamon',
    formula: 'S + V2 / V+ed',
    example: 'I visited my grandma yesterday.',
    exampleUz: 'Men kecha buvimni ziyorat qildim.',
    emoji: '⏪',
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'past-continuous',
    name: 'Past Continuous',
    nameUz: 'Davomli o\'tgan zamon',
    formula: 'S + was/were + V-ing',
    example: 'They were playing when I came.',
    exampleUz: 'Men kelganimda ular o\'ynayotgan edilar.',
    emoji: '⏳',
    color: 'from-purple-500 to-violet-500',
  },
  {
    id: 'present-perfect',
    name: 'Present Perfect',
    nameUz: 'Tugallangan hozirgi zamon',
    formula: 'S + have/has + V3',
    example: 'I have finished my homework.',
    exampleUz: 'Men uy vazifamni tugatdim.',
    emoji: '✅',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'future-simple',
    name: 'Future Simple',
    nameUz: 'Oddiy kelasi zamon',
    formula: 'S + will + V1',
    example: 'I will travel to London next year.',
    exampleUz: 'Men kelasi yili Londonga sayohat qilaman.',
    emoji: '🚀',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'future-continuous',
    name: 'Future Continuous',
    nameUz: 'Davomli kelasi zamon',
    formula: 'S + will be + V-ing',
    example: 'I will be studying at 8 PM.',
    exampleUz: 'Kechki 8 da men o\'qiyotgan bo\'laman.',
    emoji: '🔮',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'past-perfect',
    name: 'Past Perfect',
    nameUz: 'Tugallangan o\'tgan zamon',
    formula: 'S + had + V3',
    example: 'She had left before I arrived.',
    exampleUz: 'Men yetib kelishimdan oldin u ketgan edi.',
    emoji: '⏮️',
    color: 'from-red-500 to-orange-500',
  },
];

export const tensesQuestions: TenseQuestion[] = [
  // Present Simple
  { id: 1, tenseId: 'present-simple', type: 'identify', sentence: 'She goes to school every morning.', options: ['Present Simple', 'Present Continuous', 'Past Simple', 'Future Simple'], correctAnswer: 'Present Simple', explanation: '"goes" — oddiy hozirgi zamon, har kuni takrorlanadigan ish.' },
  { id: 2, tenseId: 'present-simple', type: 'fill', sentence: 'He ___ (play) tennis on Sundays.', options: ['plays', 'is playing', 'played', 'will play'], correctAnswer: 'plays', explanation: '"On Sundays" — muntazam ish, Present Simple ishlatiladi: plays.' },
  { id: 3, tenseId: 'present-simple', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['She don\'t like coffee.', 'She doesn\'t likes coffee.', 'She doesn\'t like coffee.', 'She not like coffee.'], correctAnswer: 'She doesn\'t like coffee.', explanation: '3-shaxs birlik uchun "doesn\'t + V1" ishlatiladi.' },
  { id: 4, tenseId: 'present-simple', type: 'identify', sentence: 'Water boils at 100 degrees.', options: ['Present Simple', 'Present Continuous', 'Present Perfect', 'Past Simple'], correctAnswer: 'Present Simple', explanation: 'Ilmiy haqiqatlar uchun Present Simple ishlatiladi.' },
  { id: 5, tenseId: 'present-simple', type: 'fill', sentence: 'They ___ (not/watch) TV in the morning.', options: ['don\'t watch', 'doesn\'t watch', 'aren\'t watching', 'didn\'t watch'], correctAnswer: 'don\'t watch', explanation: '"They" uchun "don\'t + V1" ishlatiladi.' },

  // Present Continuous
  { id: 6, tenseId: 'present-continuous', type: 'identify', sentence: 'I am writing a letter right now.', options: ['Present Simple', 'Present Continuous', 'Past Continuous', 'Present Perfect'], correctAnswer: 'Present Continuous', explanation: '"am writing" + "right now" — hozir davom etayotgan ish.' },
  { id: 7, tenseId: 'present-continuous', type: 'fill', sentence: 'Look! The children ___ (run) in the park.', options: ['run', 'are running', 'runs', 'were running'], correctAnswer: 'are running', explanation: '"Look!" — hozir ko\'rinayotgan ish, Present Continuous.' },
  { id: 8, tenseId: 'present-continuous', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['She is cook dinner.', 'She is cooking dinner.', 'She cooking dinner.', 'She are cooking dinner.'], correctAnswer: 'She is cooking dinner.', explanation: 'Present Continuous: S + am/is/are + V-ing.' },
  { id: 9, tenseId: 'present-continuous', type: 'fill', sentence: 'My brother ___ (study) English at the moment.', options: ['studies', 'is studying', 'studied', 'study'], correctAnswer: 'is studying', explanation: '"At the moment" — hozir, Present Continuous ishlatiladi.' },

  // Past Simple
  { id: 10, tenseId: 'past-simple', type: 'identify', sentence: 'We visited Paris last summer.', options: ['Present Perfect', 'Past Simple', 'Past Continuous', 'Present Simple'], correctAnswer: 'Past Simple', explanation: '"last summer" — aniq o\'tgan vaqt, Past Simple.' },
  { id: 11, tenseId: 'past-simple', type: 'fill', sentence: 'She ___ (buy) a new phone yesterday.', options: ['buys', 'bought', 'has bought', 'is buying'], correctAnswer: 'bought', explanation: '"Yesterday" — aniq o\'tgan vaqt, "buy" ning V2 shakli "bought".' },
  { id: 12, tenseId: 'past-simple', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['Did he went to school?', 'Did he go to school?', 'Does he went to school?', 'He did go to school?'], correctAnswer: 'Did he go to school?', explanation: 'Past Simple savolda: Did + S + V1.' },
  { id: 13, tenseId: 'past-simple', type: 'fill', sentence: 'I ___ (not/see) that movie.', options: ['didn\'t see', 'don\'t see', 'haven\'t seen', 'wasn\'t seeing'], correctAnswer: 'didn\'t see', explanation: 'Past Simple inkorida: didn\'t + V1.' },

  // Past Continuous
  { id: 14, tenseId: 'past-continuous', type: 'identify', sentence: 'I was sleeping when the phone rang.', options: ['Past Simple', 'Past Continuous', 'Present Continuous', 'Past Perfect'], correctAnswer: 'Past Continuous', explanation: '"was sleeping" — o\'tgan zamonda davom etayotgan ish.' },
  { id: 15, tenseId: 'past-continuous', type: 'fill', sentence: 'They ___ (watch) a movie at 9 PM last night.', options: ['watched', 'were watching', 'are watching', 'watch'], correctAnswer: 'were watching', explanation: 'O\'tgan zamondagi aniq paytda davom etayotgan ish.' },
  { id: 16, tenseId: 'past-continuous', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['She were reading a book.', 'She was reading a book.', 'She was read a book.', 'She is reading a book yesterday.'], correctAnswer: 'She was reading a book.', explanation: '"She" uchun "was + V-ing" ishlatiladi.' },

  // Present Perfect
  { id: 17, tenseId: 'present-perfect', type: 'identify', sentence: 'I have never been to Japan.', options: ['Past Simple', 'Present Simple', 'Present Perfect', 'Future Simple'], correctAnswer: 'Present Perfect', explanation: '"have never been" — tajriba ifodalash uchun Present Perfect.' },
  { id: 18, tenseId: 'present-perfect', type: 'fill', sentence: 'She ___ (already/finish) her work.', options: ['already finished', 'has already finished', 'is already finishing', 'already finishes'], correctAnswer: 'has already finished', explanation: '"Already" — Present Perfect bilan ishlatiladi.' },
  { id: 19, tenseId: 'present-perfect', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['I have went to London.', 'I have gone to London.', 'I has gone to London.', 'I have go to London.'], correctAnswer: 'I have gone to London.', explanation: '"go" ning V3 shakli "gone": have + gone.' },
  { id: 20, tenseId: 'present-perfect', type: 'fill', sentence: 'We ___ (live) here since 2010.', options: ['lived', 'have lived', 'are living', 'live'], correctAnswer: 'have lived', explanation: '"Since" — Present Perfect bilan ishlatiladi.' },

  // Future Simple
  { id: 21, tenseId: 'future-simple', type: 'identify', sentence: 'I will call you tomorrow.', options: ['Present Simple', 'Future Simple', 'Present Continuous', 'Future Continuous'], correctAnswer: 'Future Simple', explanation: '"will call" — oddiy kelasi zamon.' },
  { id: 22, tenseId: 'future-simple', type: 'fill', sentence: 'They ___ (come) to the party next week.', options: ['come', 'came', 'will come', 'are coming'], correctAnswer: 'will come', explanation: '"Next week" — kelasi zamon, will + V1.' },
  { id: 23, tenseId: 'future-simple', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['She will goes home.', 'She will go home.', 'She will going home.', 'She wills go home.'], correctAnswer: 'She will go home.', explanation: 'Future Simple: will + V1 (asosiy shakl).' },

  // Future Continuous
  { id: 24, tenseId: 'future-continuous', type: 'identify', sentence: 'This time tomorrow, I will be flying to New York.', options: ['Future Simple', 'Future Continuous', 'Present Continuous', 'Past Continuous'], correctAnswer: 'Future Continuous', explanation: '"will be flying" — kelasi zamonda davom etadigan ish.' },
  { id: 25, tenseId: 'future-continuous', type: 'fill', sentence: 'At 10 AM tomorrow, she ___ (work) at the office.', options: ['works', 'will work', 'will be working', 'is working'], correctAnswer: 'will be working', explanation: 'Kelasi zamondagi aniq paytda davom etadigan ish.' },

  // Past Perfect
  { id: 26, tenseId: 'past-perfect', type: 'identify', sentence: 'I had already eaten when she arrived.', options: ['Past Simple', 'Past Perfect', 'Present Perfect', 'Past Continuous'], correctAnswer: 'Past Perfect', explanation: '"had eaten" — boshqa o\'tgan ishdan oldin bo\'lgan ish.' },
  { id: 27, tenseId: 'past-perfect', type: 'fill', sentence: 'By the time we got there, the movie ___ (start).', options: ['started', 'has started', 'had started', 'was starting'], correctAnswer: 'had started', explanation: '"By the time" — Past Perfect bilan ishlatiladi.' },
  { id: 28, tenseId: 'past-perfect', type: 'correct', sentence: 'Qaysi gap to\'g\'ri?', options: ['She had went home before I called.', 'She had gone home before I called.', 'She has gone home before I called.', 'She had go home before I called.'], correctAnswer: 'She had gone home before I called.', explanation: 'Past Perfect: had + V3. "go" → "gone".' },
];
