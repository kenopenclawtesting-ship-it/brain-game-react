import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';

/*
 * Mode Select - Option C approach
 * Uses pre-rendered Flash PlayMenu sprite as the visual
 * with invisible click zones over each mode icon
 */
function GameModeSelect({ onClassic, onPractice, onBack }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  return (
    <motion.div
      style={{ width: '100%', height: '100%', position: 'relative', background: '#2A3E3F' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Mode select icons - pre-rendered Flash sprite */}
      <img
        src="/img/mode-select.png"
        alt=""
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-60%, -55%)',
          width: 380, height: 'auto',
          pointerEvents: 'none',
        }}
        draggable={false}
      />

      {/* Click zones over the 3 mode icons */}
      {/* Classic (top center - pinwheel) */}
      <motion.div
        onClick={click(onClassic)}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
        style={{
          position: 'absolute', top: 60, left: 200, width: 150, height: 150,
          borderRadius: '50%', cursor: 'pointer', zIndex: 5,
        }}
      />

      {/* Practice (bottom left - dumbbell) */}
      <motion.div
        className="practice-hit"
        onClick={click(onPractice)}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
        style={{
          position: 'absolute', top: 210, left: 60, width: 170, height: 170,
          borderRadius: '50%', cursor: 'pointer', zIndex: 5,
        }}
      />

      {/* Pro (bottom right - starburst) */}
      <motion.div
        onClick={click(onClassic)}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
        style={{
          position: 'absolute', top: 220, left: 280, width: 160, height: 160,
          borderRadius: '50%', cursor: 'pointer', zIndex: 5,
        }}
      />

      {/* Back button */}
      <motion.img
        src="/img/btn-back.png"
        alt="Back"
        onClick={click(onBack)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'absolute', top: 10, left: 10, width: 50,
          cursor: 'pointer', zIndex: 5,
        }}
        draggable={false}
      />
    </motion.div>
  );
}

export default GameModeSelect;
