import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import MainMenu from './components/MainMenu';
import GameEngine from './components/GameEngine';
import SummaryScreen from './components/SummaryScreen';
import GameStage from './components/GameStage';
import { initSounds, playSound, stopSound, stopAllSounds } from './utils/sounds';
import { selectGamesForFullTest, CATEGORY_NAMES } from './utils/scoring';

// Game states matching original
const GameState = {
  SPLASH: 'splash',
  MAIN_MENU: 'main_menu',
  GAME_SELECTION: 'game_selection',
  TUTORIAL: 'tutorial',
  PLAYING: 'playing',
  RESULTS: 'results',
  SUMMARY: 'summary',
};

// All available games
const ALL_GAMES = [
  'Calculate',
  'CarPath', 
  'CubeCounter',
  'JigsawMatch',
  'MatchCard',
  'MathCombination',
  'MemorySequence',
  'MeteorSequence',
  'MissingSign',
  'SequenceMatch',
  'ShapeOrder',
  'WeightGame',
];

function App() {
  const [gameState, setGameState] = useState(GameState.MAIN_MENU);
  const [selectedGames, setSelectedGames] = useState([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [categoryScores, setCategoryScores] = useState([0, 0, 0, 0]);
  const [gameResults, setGameResults] = useState([]);
  const [practiceMode, setPracticeMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize sounds on mount
  useEffect(() => {
    initSounds();
  }, []);

  // Handle starting a full test
  const handleStartFullTest = useCallback(() => {
    const games = selectGamesForFullTest();
    setSelectedGames(games);
    setCurrentGameIndex(0);
    setCategoryScores([0, 0, 0, 0]);
    setGameResults([]);
    setPracticeMode(false);
    setGameState(GameState.PLAYING);
    stopSound('themeMusic');
    playSound('startSound');
  }, []);

  // Handle starting practice mode
  const handleStartPractice = useCallback((gameName) => {
    setSelectedGames([gameName]);
    setCurrentGameIndex(0);
    setCategoryScores([0, 0, 0, 0]);
    setGameResults([]);
    setPracticeMode(true);
    setGameState(GameState.PLAYING);
    stopSound('themeMusic');
    playSound('startSound');
  }, []);

  // Handle game completion
  const handleGameComplete = useCallback((result) => {
    const newResults = [...gameResults, result];
    setGameResults(newResults);

    // Update category score
    const newCategoryScores = [...categoryScores];
    newCategoryScores[result.category] += result.score;
    setCategoryScores(newCategoryScores);

    // Check if more games to play
    if (currentGameIndex < selectedGames.length - 1) {
      setCurrentGameIndex(currentGameIndex + 1);
    } else {
      // All games complete - show summary
      setGameState(GameState.SUMMARY);
      playSound('crowdCheerSound');
      playSound('applauseSound');
    }
  }, [gameResults, categoryScores, currentGameIndex, selectedGames]);

  // Handle returning to menu
  const handleReturnToMenu = useCallback(() => {
    stopAllSounds();
    setGameState(GameState.MAIN_MENU);
    playSound('themeMusic', true);
  }, []);

  // Start theme music on menu
  useEffect(() => {
    if (gameState === GameState.MAIN_MENU) {
      playSound('themeMusic', true);
    }
  }, [gameState]);

  const currentGame = selectedGames[currentGameIndex];
  const totalScore = categoryScores.reduce((a, b) => a + b, 0);

  return (
    <div className="game-container">
      <GameStage>
        <AnimatePresence mode="wait">
          {gameState === GameState.MAIN_MENU && (
            <MainMenu
              key="menu"
              onStartFullTest={handleStartFullTest}
              onStartPractice={handleStartPractice}
              allGames={ALL_GAMES}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          )}

          {gameState === GameState.PLAYING && currentGame && (
            <GameEngine
              key={`game-${currentGameIndex}`}
              gameName={currentGame}
              gameIndex={currentGameIndex}
              totalGames={selectedGames.length}
              onGameComplete={handleGameComplete}
              practiceMode={practiceMode}
            />
          )}

          {gameState === GameState.SUMMARY && (
            <SummaryScreen
              key="summary"
              categoryScores={categoryScores}
              totalScore={totalScore}
              gameResults={gameResults}
              onPlayAgain={handleStartFullTest}
              onReturnToMenu={handleReturnToMenu}
            />
          )}
        </AnimatePresence>
      </GameStage>
    </div>
  );
}

export default App;
