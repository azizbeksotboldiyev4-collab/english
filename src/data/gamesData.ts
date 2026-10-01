export interface GameWord {
  en: string;
  uz: string;
  emoji?: string;
}

export const GAME_CATEGORIES: Record<string, GameWord[]> = {
  animals: [
    { en: 'cat', uz: 'mushuk', emoji: '🐱' },
    { en: 'dog', uz: 'it', emoji: '🐶' },
    { en: 'lion', uz: 'sher', emoji: '🦁' },
    { en: 'tiger', uz: 'yo\'lbars', emoji: '🐯' },
    { en: 'bear', uz: 'ayiq', emoji: '🐻' },
    { en: 'wolf', uz: 'bo\'ri', emoji: '🐺' },
    { en: 'fox', uz: 'tulki', emoji: '🦊' },
    { en: 'horse', uz: 'ot', emoji: '🐴' },
    { en: 'cow', uz: 'sigir', emoji: '🐮' },
    { en: 'sheep', uz: 'qo\'y', emoji: '🐑' },
    { en: 'bird', uz: 'qush', emoji: '🐦' },
    { en: 'fish', uz: 'baliq', emoji: '🐟' },
  ],
  food: [
    { en: 'bread', uz: 'non', emoji: '🍞' },
    { en: 'water', uz: 'suv', emoji: '💧' },
    { en: 'milk', uz: 'sut', emoji: '🥛' },
    { en: 'apple', uz: 'olma', emoji: '🍎' },
    { en: 'grape', uz: 'uzum', emoji: '🍇' },
    { en: 'meat', uz: 'go\'sht', emoji: '🥩' },
    { en: 'rice', uz: 'guruch', emoji: '🍚' },
    { en: 'salt', uz: 'tuz', emoji: '🧂' },
    { en: 'sugar', uz: 'shakar', emoji: '🍬' },
    { en: 'egg', uz: 'tuxum', emoji: '🥚' },
    { en: 'tea', uz: 'choy', emoji: '🍵' },
    { en: 'soup', uz: 'sho\'rva', emoji: '🍲' },
  ],
  travel: [
    { en: 'car', uz: 'mashina', emoji: '🚗' },
    { en: 'bus', uz: 'avtobus', emoji: '🚌' },
    { en: 'train', uz: 'poyezd', emoji: '🚂' },
    { en: 'plane', uz: 'samolyot', emoji: '✈️' },
    { en: 'ship', uz: 'kema', emoji: '🚢' },
    { en: 'road', uz: 'yo\'l', emoji: '🛣️' },
    { en: 'city', uz: 'shahar', emoji: '🏙️' },
    { en: 'map', uz: 'xarita', emoji: '🗺️' },
    { en: 'hotel', uz: 'mehmonxona', emoji: '🏨' },
    { en: 'ticket', uz: 'chipta', emoji: '🎫' },
    { en: 'beach', uz: 'plyaj', emoji: '🏖️' },
    { en: 'bag', uz: 'sumka', emoji: '🎒' },
  ],
  jobs: [
    { en: 'doctor', uz: 'shifokor', emoji: '👨‍⚕️' },
    { en: 'teacher', uz: 'o\'qituvchi', emoji: '👩‍🏫' },
    { en: 'driver', uz: 'haydovchi', emoji: '🚕' },
    { en: 'cook', uz: 'oshpaz', emoji: '👨‍🍳' },
    { en: 'artist', uz: 'rassom', emoji: '🎨' },
    { en: 'writer', uz: 'yozuvchi', emoji: '✍️' },
    { en: 'farmer', uz: 'dehqon', emoji: '👨‍🌾' },
    { en: 'pilot', uz: 'uchuvchi', emoji: '👨‍✈️' },
    { en: 'nurse', uz: 'hamshira', emoji: '👩‍⚕️' },
    { en: 'engineer', uz: 'muhandis', emoji: '👷' },
    { en: 'lawyer', uz: 'yurist', emoji: '⚖️' },
    { en: 'singer', uz: 'qo\'shiqchi', emoji: '🎤' },
  ],
  sports: [
    { en: 'ball', uz: 'to\'p', emoji: '⚽' },
    { en: 'run', uz: 'yugurish', emoji: '🏃' },
    { en: 'swim', uz: 'suzish', emoji: '🏊' },
    { en: 'jump', uz: 'sakrash', emoji: '🤸' },
    { en: 'game', uz: 'o\'yin', emoji: '🎮' },
    { en: 'team', uz: 'jamoa', emoji: '👥' },
    { en: 'win', uz: 'yutuq', emoji: '🏆' },
    { en: 'goal', uz: 'gol', emoji: '🥅' },
    { en: 'coach', uz: 'murabbiy', emoji: '🧑‍🏫' },
    { en: 'match', uz: 'o\'yin', emoji: '🏟️' },
    { en: 'race', uz: 'poyga', emoji: '🏁' },
    { en: 'medal', uz: 'medal', emoji: '🏅' },
  ],
  technology: [
    { en: 'phone', uz: 'telefon', emoji: '📱' },
    { en: 'laptop', uz: 'noutbuk', emoji: '💻' },
    { en: 'screen', uz: 'ekran', emoji: '🖥️' },
    { en: 'mouse', uz: 'sichqoncha', emoji: '🖱️' },
    { en: 'code', uz: 'kod', emoji: '💾' },
    { en: 'app', uz: 'ilova', emoji: '📲' },
    { en: 'email', uz: 'xat', emoji: '📧' },
    { en: 'video', uz: 'video', emoji: '📹' },
    { en: 'robot', uz: 'robot', emoji: '🤖' },
    { en: 'chip', uz: 'chip', emoji: '🔌' },
    { en: 'game', uz: 'o\'yin', emoji: '🎮' },
    { en: 'wifi', uz: 'wifi', emoji: '📶' },
  ],
  business: [
    { en: 'money', uz: 'pul', emoji: '💰' },
    { en: 'bank', uz: 'bank', emoji: '🏦' },
    { en: 'sell', uz: 'sotish', emoji: '🛒' },
    { en: 'buy', uz: 'sotib olish', emoji: '🛍️' },
    { en: 'price', uz: 'narx', emoji: '🏷️' },
    { en: 'boss', uz: 'boshliq', emoji: '👔' },
    { en: 'office', uz: 'ofis', emoji: '🏢' },
    { en: 'plan', uz: 'reja', emoji: '📋' },
    { en: 'deal', uz: 'shartnoma', emoji: '🤝' },
    { en: 'trade', uz: 'savdo', emoji: '📈' },
    { en: 'client', uz: 'mijoz', emoji: '🧑‍💼' },
    { en: 'brand', uz: 'brend', emoji: '™️' },
  ],
};

export const CATEGORY_META: { id: keyof typeof GAME_CATEGORIES; label: string; emoji: string; gradient: string }[] = [
  { id: 'animals', label: 'Hayvonlar', emoji: '🐾', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'food', label: 'Ovqat', emoji: '🍽️', gradient: 'from-amber-500 to-orange-500' },
  { id: 'travel', label: 'Sayohat', emoji: '✈️', gradient: 'from-sky-500 to-blue-600' },
  { id: 'jobs', label: 'Kasblar', emoji: '💼', gradient: 'from-violet-500 to-purple-600' },
  { id: 'sports', label: 'Sport', emoji: '⚽', gradient: 'from-rose-500 to-red-500' },
  { id: 'technology', label: 'Texnologiya', emoji: '💻', gradient: 'from-cyan-500 to-indigo-500' },
  { id: 'business', label: 'Biznes', emoji: '📈', gradient: 'from-yellow-500 to-amber-600' },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}