import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

// OG layout: 3 columns × 4 rows, grouped by category
// Row 1 (Analyse - pink): Weight, Cubes, CarPath
// Row 2 (Calculate - yellow): Calculate, MissingSign, MathCombination
// Row 3 (Identify - green): MatchCard, MemorySequence, MeteorSequence
// Row 4 (Memorize - blue): ShapeOrder, JigsawMatch, SequenceMatch
const GAMES = [
  { name: 'WeightGame', sprite: 'sprites/DefineSprite_208_brain_game_fla.IconWeight_83/1.png' },
  { name: 'CubeCounter', sprite: 'sprites/DefineSprite_203_brain_game_fla.IconCubes_77/1.png' },
  { name: 'CarPath', sprite: 'sprites/DefineSprite_246_brain_game_fla.IconCarPath_74/1.png' },
  { name: 'Calculate', sprite: 'sprites/DefineSprite_230_brain_game_fla.IconSum_75/1.png' },
  { name: 'MissingSign', sprite: 'sprites/DefineSprite_197_brain_game_fla.IconSign_79/1.png' },
  { name: 'MathCombination', sprite: 'sprites/DefineSprite_192_brain_game_fla.IconPattern_82/1.png' },
  { name: 'MatchCard', sprite: 'sprites/DefineSprite_186_brain_game_fla.IconCards_81/1.png' },
  { name: 'MemorySequence', sprite: 'sprites/DefineSprite_241_brain_game_fla.IconMemSeq_72/1.png' },
  { name: 'MeteorSequence', sprite: 'sprites/DefineSprite_214_brain_game_fla.IconMeteor_84/1.png' },
  { name: 'ShapeOrder', sprite: 'sprites/DefineSprite_181_brain_game_fla.IconShape_78/1.png' },
  { name: 'JigsawMatch', sprite: 'sprites/DefineSprite_219_brain_game_fla.IconPuzzle_80/1.png' },
  { name: 'SequenceMatch', sprite: 'sprites/DefineSprite_235_brain_game_fla.IconSequenceMatch_76/1.png' },
];

function PracticeSelect({ onSelectGame, onBack }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  return (
    <motion.div
      className="practice-select"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {/* Smoky overlay */}
      <div className="smoky-overlay" />

      {/* Back button */}
      <motion.img
        src="/sprites/DefineSprite_1184_ButtonBack/1.png"
        alt="Back"
        className="back-btn-sprite"
        onClick={click(onBack)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        draggable={false}
      />

      {/* 4x3 grid of game icons */}
      <div className="practice-grid">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.name}
            className="practice-icon"
            onClick={click(() => onSelectGame(game.name))}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
          >
            <img
              src={`/${game.sprite}`}
              alt={game.name}
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
            />
          </motion.div>
        ))}
      </div>

      {/* Character */}
      <div style={{ position: 'absolute', right: 5, bottom: 10, transform: 'scale(0.55)', transformOrigin: 'bottom right', zIndex: 2 }}>
        <Character message="Choose the minigame you would like to practice" />
      </div>
    </motion.div>
  );
}

export default PracticeSelect;
