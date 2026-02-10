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

const GAME_INSTRUCTIONS = {
  WeightGame: 'Select the HEAVIEST ITEM on the scales. TAP the item to answer.',
  Calculate: 'Solve the math problem as fast as you can!',
  CarPath: 'Find the correct path for the car.',
  CubeCounter: 'Count all the cubes in the structure.',
  JigsawMatch: 'Find the matching jigsaw piece.',
  MatchCard: 'Match the pairs of cards.',
  MathCombination: 'Find the numbers that add up to the target.',
  MemorySequence: 'Remember and repeat the sequence.',
  MeteorSequence: 'Tap the meteors in order.',
  MissingSign: 'Find the missing math sign.',
  SequenceMatch: 'Complete the sequence pattern.',
  ShapeOrder: 'Put the shapes in the correct order.',
};

const TOTAL_GAME_TIME = 60000; // 60 seconds

/* ─── OG-style red circle timer with pie-chart depletion ─── */
function PieTimer({ timeRemaining, totalTime }) {
  const seconds = Math.ceil(timeRemaining / 1000);
  const fraction = timeRemaining / totalTime; // 1 → 0
  // Conic gradient: red portion shrinks clockwise as time depletes
  const degrees = fraction * 360;

  return (
    <div style={{
      position: 'absolute',
      top: '12px',
      left: '12px',
      zIndex: 20,
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      background: `conic-gradient(#D02020 0deg, #D02020 ${degrees}deg, #3D2020 ${degrees}deg, #3D2020 360deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      border: '3px solid #3D2020',
    }}>
      <span style={{
        fontFamily: 'Baveuse, sans-serif',
        fontSize: '22px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '0 1px 3px rgba(0,0,0,0.5)',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        {seconds}
      </span>
    </div>
  );
}

/* ─── OG-style power / exit button (top-right) ─── */
function PowerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 20,
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        border: '3px solid #D946A8',
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        padding: 0,
      }}
      title="Exit"
    >
      {/* Power icon via SVG */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D946A8" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2v8" />
        <path d="M16.24 5.76a8 8 0 1 1-8.48 0" />
      </svg>
    </button>
  );
}

function GameEngine({ gameName, gameIndex, totalGames, onGameComplete, practiceMode }) {
  const [phase, setPhase] = useState('tutorial'); // tutorial, playing, timeup
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_GAME_TIME);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

  // Game timer
  useEffect(() => {
    if (phase === 'playing') {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;

        setTimeRemaining((prev) => {
          const newTime = Math.max(prev - delta, 0);
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
    setTimeout(() => setFeedback(null), 300);
  }, [gameName]);

  const startGame = () => {
    setPhase('playing');
    playSound('startSound');
    playSound('ingameMusic', true);
  };

  const GameComponent = GAME_COMPONENTS[gameName];
  const instructions = GAME_INSTRUCTIONS[gameName] || 'Get ready!';

  return (
    <div className="game-canvas" style={{
      position: phase === 'playing' || phase === 'timeup' ? 'absolute' : 'relative',
      inset: phase === 'playing' || phase === 'timeup' ? 0 : undefined,
      zIndex: phase === 'playing' || phase === 'timeup' ? 10 : undefined,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(170deg, #FDE8E0 0%, #F5D0C0 100%)',
      overflow: 'hidden',
    }}>
      {/* Decorative background rays (OG swirl/ray pattern) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '55%',
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          background: `conic-gradient(
            from 0deg,
            rgba(255,255,255,0.12) 0deg, rgba(255,255,255,0) 25deg,
            rgba(255,255,255,0.10) 50deg, rgba(255,255,255,0) 75deg,
            rgba(255,255,255,0.12) 100deg, rgba(255,255,255,0) 130deg,
            rgba(255,255,255,0.08) 160deg, rgba(255,255,255,0) 190deg,
            rgba(255,255,255,0.12) 220deg, rgba(255,255,255,0) 250deg,
            rgba(255,255,255,0.10) 280deg, rgba(255,255,255,0) 310deg,
            rgba(255,255,255,0.12) 340deg, rgba(255,255,255,0) 360deg
          )`,
          borderRadius: '50%',
          opacity: 0.9,
        }} />
      </div>

      {/* HUD: Timer + Power button */}
      {phase === 'playing' && (
        <>
          <PieTimer timeRemaining={timeRemaining} totalTime={TOTAL_GAME_TIME} />
          <PowerButton onClick={() => {
            clearInterval(timerRef.current);
            stopSound('ingameMusic');
            onGameComplete({
              gameName,
              category: GAME_CATEGORIES[gameName],
              score,
              correct: correctCount,
              incorrect: incorrectCount,
            });
          }} />
        </>
      )}

      {/* Tutorial / Ready screen (replaces 3-2-1 countdown) */}
      <AnimatePresence>
        {phase === 'tutorial' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Power button on tutorial too */}
            <PowerButton onClick={() => {
              onGameComplete({
                gameName,
                category: GAME_CATEGORIES[gameName],
                score: 0,
                correct: 0,
                incorrect: 0,
              });
            }} />

            {/* Speech bubble + character area */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              maxWidth: '500px',
            }}>
              {/* Speech bubble */}
              <div style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '24px 28px',
                fontSize: '18px',
                color: '#1a1a1a',
                fontFamily: 'sans-serif',
                lineHeight: 1.5,
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                position: 'relative',
                maxWidth: '320px',
              }}>
                {instructions}
                <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '20px' }}>Ready?</div>
                {/* Speech bubble tail */}
                <div style={{
                  position: 'absolute',
                  bottom: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid transparent',
                  borderRight: '12px solid transparent',
                  borderTop: '14px solid #fff',
                }} />
              </div>
            </div>

            {/* Green checkmark button to start */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              style={{
                marginTop: '32px',
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(180deg, #4ade80, #22c55e)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                fontSize: '32px',
                color: '#fff',
              }}
            >
              ✓
            </motion.button>
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
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 40,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', color: '#ffd700' }}
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
              color: feedback === 'correct' ? '#22c55e' : '#ef4444',
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
          position: 'relative',
          zIndex: 1,
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
