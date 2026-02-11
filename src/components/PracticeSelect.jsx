import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';

// Game order matches the Flash practice grid (3×4)
const GAMES = [
  'WeightGame', 'CubeCounter', 'CarPath',
  'Calculate', 'MissingSign', 'MathCombination',
  'MatchCard', 'MemorySequence', 'MeteorSequence',
  'ShapeOrder', 'JigsawMatch', 'SequenceMatch',
];

/*
 * Practice Select - Option C: pre-rendered Flash practice grid as background
 * with invisible click zones over each game icon
 */
function PracticeSelect({ onSelectGame, onBack }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  // Grid dimensions matching the Flash practice-grid.png
  // The image is 340px wide, positioned in the stage
  const gridLeft = 35;
  const gridTop = 22;
  const cellW = 108;
  const cellH = 96;
  const cols = 3;

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

      {/* Smoky overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0,0,0,0.4)', zIndex: 1,
      }} />

      {/* Practice grid - pre-rendered Flash icons */}
      <img src="/img/practice-grid.png" alt="" style={{
        position: 'absolute', top: gridTop, left: gridLeft,
        width: 340, pointerEvents: 'none', zIndex: 2,
      }} draggable={false} />

      {/* Click zones over each icon */}
      {GAMES.map((game, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <motion.div
            key={game}
            className="practice-icon"
            onClick={click(() => onSelectGame(game))}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.92 }}
            style={{
              position: 'absolute',
              left: gridLeft + col * (340 / cols) + 8,
              top: gridTop + row * (380 / 4) + 5,
              width: 95,
              height: 85,
              borderRadius: '50%',
              cursor: 'pointer',
              zIndex: 3,
            }}
          />
        );
      })}

      {/* Back button */}
      <motion.img src="/img/btn-back.png" alt="Back"
        onClick={click(onBack)}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        style={{ position: 'absolute', top: 8, left: 8, width: 55, cursor: 'pointer', zIndex: 5 }}
        draggable={false} />
    </motion.div>
  );
}

export default PracticeSelect;
