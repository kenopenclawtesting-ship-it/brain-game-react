import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getBrainTypeInfo, calculateBrainWeight, getProgressToNextType } from '../utils/brainTypes';
import { CATEGORY_NAMES } from '../utils/scoring';
import { playSound } from '../utils/sounds';

function SummaryScreen({ categoryScores, totalScore, gameResults, onPlayAgain, onReturnToMenu }) {
  const [displayedScore, setDisplayedScore] = useState(0);
  const [showBrain, setShowBrain] = useState(false);
  
  const brainInfo = getBrainTypeInfo(totalScore);
  const brainWeight = calculateBrainWeight(totalScore);
  const progressToNext = getProgressToNextType(totalScore);

  // Animate score counting up
  useEffect(() => {
    if (displayedScore < totalScore) {
      const increment = Math.ceil(totalScore / 50);
      const timer = setTimeout(() => {
        const newScore = Math.min(displayedScore + increment, totalScore);
        setDisplayedScore(newScore);
        if (newScore < totalScore) {
          playSound('scoreCountSound');
        } else {
          playSound('scoreCountEndSound');
          setShowBrain(true);
        }
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [displayedScore, totalScore]);

  return (
    <motion.div
      className="game-canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px',
        background: 'linear-gradient(180deg, #1a237e 0%, #4a148c 100%)',
        overflowY: 'auto',
      }}
    >
      {/* Title */}
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          fontFamily: 'Baveuse, cursive',
          fontSize: '32px',
          color: '#ffd700',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          marginBottom: '20px',
        }}
      >
        Your Results
      </motion.h1>

      {/* Total Score */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: '64px',
          fontFamily: 'Baveuse, cursive',
          color: 'white',
          textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        }}
      >
        {displayedScore}
      </motion.div>

      {/* Brain Type Reveal */}
      {showBrain && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          style={{
            textAlign: 'center',
            marginTop: '15px',
            marginBottom: '15px',
          }}
        >
          <div style={{ fontSize: '60px' }}>{brainInfo.emoji}</div>
          <div style={{
            fontFamily: 'Baveuse, cursive',
            fontSize: '28px',
            color: '#ffd700',
            marginTop: '5px',
          }}>
            {brainInfo.name}
          </div>
          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '5px',
            maxWidth: '300px',
          }}>
            {brainInfo.description}
          </div>
          <div style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '10px',
          }}>
            Brain Weight: {brainWeight}g
          </div>
          
          {/* Progress bar to next level */}
          {progressToNext < 100 && (
            <div style={{ marginTop: '10px', width: '200px' }}>
              <div style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '5px',
              }}>
                Progress to next level
              </div>
              <div style={{
                height: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #00c853, #ffd700)',
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Category Breakdown */}
      {showBrain && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginTop: '10px',
            marginBottom: '20px',
          }}
        >
          {categoryScores.map((score, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '10px 15px',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{
                fontFamily: 'Baveuse, cursive',
                fontSize: '14px',
                color: 'rgba(255,255,255,0.7)',
              }}>
                {CATEGORY_NAMES[index]}
              </div>
              <div style={{
                fontFamily: 'Baveuse, cursive',
                fontSize: '24px',
                color: '#ffd700',
              }}>
                {score}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Buttons */}
      {showBrain && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            display: 'flex',
            gap: '15px',
            marginTop: 'auto',
          }}
        >
          <motion.button
            className="game-button primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            style={{ fontSize: '18px', padding: '12px 25px' }}
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            className="game-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReturnToMenu}
            style={{ fontSize: '18px', padding: '12px 25px' }}
          >
            🏠 Menu
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default SummaryScreen;
