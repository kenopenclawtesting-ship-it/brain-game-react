import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';

/*
 * Mode Select - Option C: pre-rendered PlayMenu PNG + click zones
 * Background is the GameStage (same as main menu but without buttons)
 */
function GameModeSelect({ onClassic, onPractice, onBack }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  return (
    <motion.div
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Stage background */}
      <img src="/img/stage-bg.png" alt="" style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        objectFit: 'cover', pointerEvents: 'none', zIndex: 0,
      }} draggable={false} />

      {/* Smoky dark overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.45)', zIndex: 1,
      }} />

      {/* Mode select icons */}
      <img src="/img/mode-select.png" alt="" style={{
        position: 'absolute', top: 40, left: 80,
        width: 350, pointerEvents: 'none', zIndex: 2,
      }} draggable={false} />

      {/* Click zones */}
      {/* Classic TEST (top - pinwheel) */}
      <motion.div onClick={click(onClassic)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        style={{
          position: 'absolute', top: 40, left: 170, width: 130, height: 130,
          borderRadius: '50%', cursor: 'pointer', zIndex: 3,
        }} />

      {/* PRACTICE (bottom-left - dumbbell) */}
      <motion.div className="practice-hit" onClick={click(onPractice)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        style={{
          position: 'absolute', top: 180, left: 80, width: 160, height: 160,
          borderRadius: '50%', cursor: 'pointer', zIndex: 3,
        }} />

      {/* PRO TEST (bottom-right - starburst) */}
      <motion.div onClick={click(onClassic)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        style={{
          position: 'absolute', top: 190, left: 280, width: 150, height: 150,
          borderRadius: '50%', cursor: 'pointer', zIndex: 3,
        }} />

      {/* Back button */}
      <motion.img src="/img/btn-back.png" alt="Back"
        onClick={click(onBack)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        style={{ position: 'absolute', top: 8, left: 8, width: 55, cursor: 'pointer', zIndex: 5 }}
        draggable={false} />
    </motion.div>
  );
}

export default GameModeSelect;
