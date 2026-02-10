import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import MainMenu from './components/MainMenu';
import GameEngine from './components/GameEngine';
import SummaryScreen from './components/SummaryScreen';
import GameStage from './components/GameStage';
import GameModeSelect from './components/GameModeSelect';
import PracticeSelect from './components/PracticeSelect';
import { initSounds, playSound, stopSound, stopAllSounds } from './utils/sounds';
import { selectGamesForFullTest, CATEGORY_NAMES } from './utils/scoring';

// Game states matching original
const GameState = {
  SPLASH: 'splash',
  MAIN_MENU: 'main_menu',
  MODE_SELECT: 'mode_select',
  PRACTICE_SELECT: 'practice_select',
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

function useResponsiveScale(width = 640, height = 480) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      // On mobile portrait: fill width. On desktop/landscape: fit both dimensions.
      const wScale = window.innerWidth / width;
      const hScale = window.innerHeight / height;
      // Use width scale on portrait phones (when width is the constraint)
      // but don't let it overflow vertically either
      const s = Math.min(wScale, hScale);
      setScale(s);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [width, height]);
  return scale;
}

function App() {
  const scale = useResponsiveScale();
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
    <div className="game-scaler" style={{ width: `${640 * scale}px`, height: `${480 * scale}px` }}>
      <div className="game-container" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      {/* GameStage wraps menu/select screens only */}
      {(gameState === GameState.MAIN_MENU || gameState === GameState.MODE_SELECT || gameState === GameState.PRACTICE_SELECT) && (
        <GameStage>
          <AnimatePresence mode="wait">
            {gameState === GameState.MAIN_MENU && (
              <MainMenu
                key="menu"
                onStartFullTest={() => setGameState(GameState.MODE_SELECT)}
                onStartPractice={handleStartPractice}
                allGames={ALL_GAMES}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
              />
            )}

            {gameState === GameState.MODE_SELECT && (
              <GameModeSelect
                key="mode-select"
                onClassic={handleStartFullTest}
                onPractice={() => setGameState(GameState.PRACTICE_SELECT)}
                onBack={() => setGameState(GameState.MAIN_MENU)}
              />
            )}

            {gameState === GameState.PRACTICE_SELECT && (
              <PracticeSelect
                key="practice-select"
                onSelectGame={handleStartPractice}
                onBack={() => setGameState(GameState.MODE_SELECT)}
              />
            )}
          </AnimatePresence>
        </GameStage>
      )}

      {/* Gameplay and summary render WITHOUT GameStage — full 640x480 */}
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
    </div>
    </div>
  );
}

export default App;
