import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

function GameModeSelect({ onClassic, onPractice, onBack }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  return (
    <motion.div
      className="mode-select"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/* Smoky overlay */}
      <div className="smoky-overlay" />

      {/* Back button - actual sprite */}
      <motion.img
        src="/sprites/DefineSprite_1184_ButtonBack/1.png"
        alt="Back"
        className="back-btn-sprite"
        onClick={click(onBack)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        draggable={false}
      />

      {/* PlayMenu sprite as background for mode icons */}
      <div className="mode-icons-area">
        <img
          src="/sprites/DefineSprite_1285_PlayMenu/1.png"
          alt=""
          className="mode-icons-sprite"
          draggable={false}
        />
        {/* Clickable hit zones */}
        <motion.div
          className="mode-hit classic-hit"
          onClick={click(onClassic)}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
        />
        <motion.div
          className="mode-hit practice-hit"
          onClick={click(onPractice)}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
        />
        <motion.div
          className="mode-hit pro-hit"
          onClick={click(onClassic)}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
        />
      </div>

      {/* Character */}
      <div style={{ position: 'absolute', right: 5, bottom: 10, transform: 'scale(0.55)', transformOrigin: 'bottom right', zIndex: 2 }}>
        <Character message="Choose your game mode!" />
      </div>
    </motion.div>
  );
}

export default GameModeSelect;
