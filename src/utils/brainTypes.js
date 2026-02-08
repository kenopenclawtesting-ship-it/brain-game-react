// Brain Weight/Size Calculation - 32 Tiers from SOURCE.md

// Score ranges for each brain type
export const BRAIN_TYPE_SCORE_RANGE = [
  0,    100,  300,  500,  700,  900,   // 0-5
  1000, 1100, 1200, 1300, 1400, 1500,  // 6-11
  1600, 1700, 1800, 1900, 2000, 2100,  // 12-17
  2300, 2500, 2700, 2900, 3100, 3300,  // 18-23
  3500, 3700, 3900, 4100, 4300, 4500,  // 24-29
  4700, 4900                            // 30-31
];

// Brain type names (32 levels)
export const BRAIN_TYPE_NAMES = [
  'AMOEBA',
  'EARTHWORM',
  'SNAIL',
  'RAT',
  'CAT',
  'DOG',
  'GOAT',
  'CHIMP',
  'GORILLA',
  'MISSING LINK',
  'NEANDERTHAL',
  'AVERAGE JOE',
  'GEEK',
  'NERD',
  'SCHOLAR',
  'SCIENTIST',
  'GENIUS',
  'SPACE ACE',
  'CYBORG',
  'ALIEN',
  'SQUIDLIAN',
  'BITBOT',
  'SPACEBOT',
  'CALCUBOT',
  'ENCEPHALOBOT',
  'BRAINBOT',
  'NEUROBOT',
  'COMPUTRON',
  'XENOS',
  'NEURONIAN',
  'AEONIAN',
  'GALAXIAN',
];

// Brain type descriptions
export const BRAIN_TYPE_DESCRIPTIONS = [
  "I'm sure there's something good to say about AMOEBAS...",
  "Good for garden soil, not big thinkers",
  "Kind of cute, tiny brains",
  "Clever animals",
  "Nine lives, so-so brains",
  "Who wouldn't want to be a dog!",
  "Mountain skippers",
  "Understands basic symbols",
  "Largest primates, highly intelligent",
  "Early man, relatively evolved",
  "Geniuses of their time, controlled fire",
  "Not amazing, not shabby",
  "Shows promise!",
  "Will rule the universe!",
  "Congratulations on a job well done!",
  "Something to be proud of",
  "Biggest brain in humans today",
  "Ahead of your time",
  "Man-machine combination",
  "Welcome to Earth, visitor!",
  "Mighty brain master",
  "You're a machine!",
  "RX-711 SPACEBOT",
  "I always knew it!",
  "Ask for autographs later",
  "All that computing power!",
  "One of the few in the universe",
  "Computational elite",
  "Level few achieve",
  "Monstrous brain",
  "Awe-inspiring brain capacity",
  "Brain Master of the Universe",
];

// Brain type emojis for visual representation
export const BRAIN_TYPE_EMOJIS = [
  '🦠', // Amoeba
  '🪱', // Earthworm
  '🐌', // Snail
  '🐀', // Rat
  '🐱', // Cat
  '🐕', // Dog
  '🐐', // Goat
  '🐵', // Chimp
  '🦍', // Gorilla
  '🧔', // Missing Link
  '🗿', // Neanderthal
  '🙂', // Average Joe
  '🤓', // Geek
  '🧐', // Nerd
  '🎓', // Scholar
  '👨‍🔬', // Scientist
  '🧠', // Genius
  '🚀', // Space Ace
  '🤖', // Cyborg
  '👽', // Alien
  '🦑', // Squidlian
  '💾', // Bitbot
  '🛸', // Spacebot
  '🔢', // Calcubot
  '🧬', // Encephalobot
  '🤯', // Brainbot
  '⚡', // Neurobot
  '💻', // Computron
  '✨', // Xenos
  '🌟', // Neuronian
  '♾️', // Aeonian
  '🌌', // Galaxian
];

// Get brain type from score (0-31)
export function getBrainType(score) {
  for (let i = 0; i < BRAIN_TYPE_SCORE_RANGE.length - 1; i++) {
    if (score >= BRAIN_TYPE_SCORE_RANGE[i] && score < BRAIN_TYPE_SCORE_RANGE[i + 1]) {
      return i;
    }
  }
  return BRAIN_TYPE_SCORE_RANGE.length - 1; // Max tier
}

// Get brain type info object
export function getBrainTypeInfo(score) {
  const typeIndex = getBrainType(score);
  return {
    index: typeIndex,
    name: BRAIN_TYPE_NAMES[typeIndex],
    description: BRAIN_TYPE_DESCRIPTIONS[typeIndex],
    emoji: BRAIN_TYPE_EMOJIS[typeIndex],
    minScore: BRAIN_TYPE_SCORE_RANGE[typeIndex],
    maxScore: BRAIN_TYPE_SCORE_RANGE[typeIndex + 1] || Infinity,
  };
}

// Calculate brain weight (visual representation)
export function calculateBrainWeight(score) {
  // Normalize to a "weight" in grams (for display purposes)
  // Human brain averages ~1400g, max ~2000g
  const minWeight = 10;
  const maxWeight = 2000;
  const maxScore = 5000;
  
  const normalizedScore = Math.min(score, maxScore) / maxScore;
  return Math.round(minWeight + (maxWeight - minWeight) * normalizedScore);
}

// Get progress to next brain type
export function getProgressToNextType(score) {
  const currentType = getBrainType(score);
  if (currentType >= BRAIN_TYPE_SCORE_RANGE.length - 1) {
    return 100; // Max level
  }
  
  const currentMin = BRAIN_TYPE_SCORE_RANGE[currentType];
  const nextMin = BRAIN_TYPE_SCORE_RANGE[currentType + 1];
  const progress = ((score - currentMin) / (nextMin - currentMin)) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
}
