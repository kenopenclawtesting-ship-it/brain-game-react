// Scoring system from SOURCE.md

// Points per game: [correct, incorrect]
export const GAME_POINTS = {
  ShapeOrder: { correct: 18, incorrect: -12 },      // Game 0
  MatchCard: { correct: 26, incorrect: -18 },       // Game 1
  Calculate: { correct: 27, incorrect: -18 },       // Game 2
  MissingSign: { correct: 20, incorrect: -12 },     // Game 3
  CubeCounter: { correct: 49, incorrect: -33 },     // Game 4
  WeightGame: { correct: 24, incorrect: -16 },      // Game 5
  MeteorSequence: { correct: 11, incorrect: -11 },  // Game 6
  JigsawMatch: { correct: 19, incorrect: -13 },     // Game 7
  MathCombination: { correct: 44, incorrect: -29 }, // Game 8
  SequenceMatch: { correct: 40, incorrect: -26 },   // Game 9
  MemorySequence: { correct: 13, incorrect: -8 },   // Game 10
  CarPath: { correct: 26, incorrect: -17 },         // Game 11
};

// Game categories
export const CATEGORIES = {
  ANALYSE: 0,
  CALCULATE: 1,
  MEMORY: 2,
  IDENTIFY: 3,
};

// Game to category mapping
export const GAME_CATEGORIES = {
  ShapeOrder: CATEGORIES.MEMORY,
  MatchCard: CATEGORIES.MEMORY,
  Calculate: CATEGORIES.CALCULATE,
  MissingSign: CATEGORIES.CALCULATE,
  CubeCounter: CATEGORIES.ANALYSE,
  WeightGame: CATEGORIES.ANALYSE,
  MeteorSequence: CATEGORIES.IDENTIFY,
  JigsawMatch: CATEGORIES.IDENTIFY,
  MathCombination: CATEGORIES.CALCULATE,
  SequenceMatch: CATEGORIES.IDENTIFY,
  MemorySequence: CATEGORIES.MEMORY,
  CarPath: CATEGORIES.ANALYSE,
};

// Category names
export const CATEGORY_NAMES = ['Analyse', 'Calculate', 'Memory', 'Identify'];

// Calculate score for correct/incorrect answers
export function calculateScore(gameName, isCorrect) {
  const points = GAME_POINTS[gameName];
  if (!points) return 0;
  return isCorrect ? points.correct : points.incorrect;
}

// Add score (never below 0)
export function addScore(currentScore, points) {
  return Math.max(currentScore + points, 0);
}

// Calculate combined score from category scores
export function calculateTotalScore(categoryScores) {
  return categoryScores.reduce((sum, score) => sum + score, 0);
}

// Game selection for full test (one game per category)
export const CATEGORY_GAMES = {
  [CATEGORIES.ANALYSE]: ['CubeCounter', 'WeightGame', 'CarPath'],
  [CATEGORIES.CALCULATE]: ['Calculate', 'MissingSign', 'MathCombination'],
  [CATEGORIES.MEMORY]: ['ShapeOrder', 'MatchCard', 'MemorySequence'],
  [CATEGORIES.IDENTIFY]: ['MeteorSequence', 'JigsawMatch', 'SequenceMatch'],
};

// Select random games for full test (one per category)
export function selectGamesForFullTest() {
  return Object.values(CATEGORY_GAMES).map(games => 
    games[Math.floor(Math.random() * games.length)]
  );
}
