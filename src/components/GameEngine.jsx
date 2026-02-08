import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, stopSound } from '../utils/sounds';
import { calculateScore, GAME_CATEGORIES } from '../utils/scoring';

// Import all games
import Calculate from '../games/Calculate';
import CarPath from '../games/CarPath';
import CubeCounter from '../games/CubeCounter';
import JigsawMatch from '../games/JigsawMatch';
import MatchCard from '../games/MatchCard';
import MathCombination from '../games/MathCombination';
import MemorySequence from '../games/MemorySequence';
import MeteorSequence from '../games/MeteorSequence';
import MissingSign from '../games/MissingSign';
import SequenceMatch from '../games/SequenceMatch';
import ShapeOrder from '../games/ShapeOrder';
import WeightGame from '../games/WeightGame';

const GAME_COMPONENTS = {
  Calculate,
  CarPath,
  CubeCounter,
  JigsawMatch,
  MatchCard,
  MathCombination,
  MemorySequence,
  MeteorSequence,
  MissingSign,
  SequenceMatch,
  ShapeOrder,
  WeightGame,
};

const TOTAL_GAME_TIME = 60000; // 60 seconds

function GameEngine({ gameName, gameIndex, totalGames, onGameComplete, practiceMode }) {
  const [phase, setPhase] = useState('countdown'); // countdown, playing, timeup
  const [countdown, setCountdown] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_GAME_TIME);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  
  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

  // Countdown phase
  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
          playSound('timerSound');
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setPhase('playing');
        playSound('startSound');
        playSound('ingameMusic', true);
        lastTickRef.current = Date.now();
      }
    }
  }, [phase, countdown]);

  // Game timer
  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        
        setTimeRemaining((prev) => {
          const newTime = Math.max(prev - delta, 0);
          
          // Warning sound in last 10 seconds
          if (newTime <= 10000 && newTime > 0 && Math.ceil(newTime / 1000) !== Math.ceil(prev / 1000)) {
            playSound('timerSound');
          }
          
          if (newTime <= 0) {
            clearInterval(timerRef.current);
            setPhase('timeup');
            stopSound('ingameMusic');
            return 0;
          }
          
          return newTime;
        });
      }, 100);
      
      return () => clearInterval(timerRef.current);
    }
  }, [phase]);

  // Handle time up
  useEffect(() => {
    if (phase === 'timeup') {
      const timer = setTimeout(() => {
        onGameComplete({
          gameName,
          category: GAME_CATEGORIES[gameName],
          score,
          correct: correctCount,
          incorrect: incorrectCount,
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, gameName, score, correctCount, incorrectCount, onGameComplete]);

  // Handle answer
  const handleAnswer = useCallback((isCorrect) => {
    const points = calculateScore(gameName, isCorrect);
    
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setFeedback('correct');
      playSound('correct');
    } else {
      setIncorrectCount((c) => c + 1);
      setFeedback('wrong');
      playSound('wrong');
    }
    
    setScore((s) => Math.max(s + points, 0));
    
    // Clear feedback after animation
    setTimeout(() => setFeedback(null), 300);
  }, [gameName]);

  const GameComponent = GAME_COMPONENTS[gameName];
  const timerPercent = (timeRemaining / TOTAL_GAME_TIME) * 100;

  return (
    <div className="game-canvas" style={{ position: 'relative' }}>
      {/* Timer bar */}
      {phase === 'playing' && (
        <div className="timer-bar">
          <motion.div
            className="timer-bar-fill"
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      {/* Score display */}
      {phase === 'playing' && (
        <div className="score-display">
          {score}
        </div>
      )}

      {/* Game progress indicator */}
      {!practiceMode && phase === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontFamily: 'Baveuse, cursive',
          fontSize: '18px',
          color: 'rgba(255,255,255,0.7)',
        }}>
          Game {gameIndex + 1}/{totalGames}
        </div>
      )}

      {/* Time remaining */}
      {phase === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '20px',
          fontFamily: 'Baveuse, cursive',
          fontSize: '24px',
          color: timeRemaining <= 10000 ? '#ff1744' : 'white',
        }}>
          {Math.ceil(timeRemaining / 1000)}s
        </div>
      )}

      {/* Countdown overlay */}
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div
            className="countdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="countdown-number"
            >
              {countdown === 0 ? 'GO!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time's up overlay */}
      <AnimatePresence>
        {phase === 'timeup' && (
          <motion.div
            className="countdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                textAlign: 'center',
                color: '#ffd700',
              }}
            >
              <div style={{ fontSize: '48px', fontFamily: 'Baveuse, cursive' }}>
                Time's Up!
              </div>
              <div style={{ fontSize: '72px', fontFamily: 'Baveuse, cursive', marginTop: '20px' }}>
                {score}
              </div>
              <div style={{ fontSize: '24px', color: 'white', marginTop: '10px' }}>
                ✓ {correctCount} correct · ✗ {incorrectCount} wrong
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback indicator */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontSize: '80px',
              filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))',
            }}>
              {feedback === 'correct' ? '✓' : '✗'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game content */}
      {phase === 'playing' && GameComponent && (
        <div style={{
          width: '100%',
          height: '100%',
          paddingTop: '80px',
          paddingBottom: '20px',
        }}>
          <GameComponent
            onAnswer={handleAnswer}
            totalCorrect={correctCount}
            totalIncorrect={incorrectCount}
          />
        </div>
      )}
    </div>
  );
}

export default GameEngine;
