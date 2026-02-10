import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

const BackButton = ({ onClick }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    style={{
      position: 'absolute', top: 12, left: 12, width: 44, height: 44,
      borderRadius: '50%', background: 'linear-gradient(135deg, #42A5F5, #1E88E5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
      border: '2px solid #fff', zIndex: 10,
    }}
  >
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  </motion.div>
);

const GAMES = [
  { name: 'WeightGame', sprite: 'sprites/DefineSprite_208_brain_game_fla.IconWeight_83/1.png' },
  { name: 'CubeCounter', sprite: 'sprites/DefineSprite_203_brain_game_fla.IconCubes_77/1.png' },
  { name: 'CarPath', sprite: 'sprites/DefineSprite_246_brain_game_fla.IconCarPath_74/1.png' },
  { name: 'Calculate', sprite: 'sprites/DefineSprite_230_brain_game_fla.IconSum_75/1.png' },
  { name: 'MissingSign', sprite: 'sprites/DefineSprite_197_brain_game_fla.IconSign_79/1.png' },
  { name: 'ShapeOrder', sprite: 'sprites/DefineSprite_181_brain_game_fla.IconShape_78/1.png' },
  { name: 'MatchCard', sprite: 'sprites/DefineSprite_186_brain_game_fla.IconCards_81/1.png' },
  { name: 'MathCombination', sprite: 'sprites/DefineSprite_192_brain_game_fla.IconPattern_82/1.png' },
  { name: 'MeteorSequence', sprite: 'sprites/DefineSprite_214_brain_game_fla.IconMeteor_84/1.png' },
  { name: 'MemorySequence', sprite: 'sprites/DefineSprite_241_brain_game_fla.IconMemSeq_72/1.png' },
  { name: 'JigsawMatch', sprite: 'sprites/DefineSprite_219_brain_game_fla.IconPuzzle_80/1.png' },
  { name: 'SequenceMatch', sprite: 'sprites/DefineSprite_235_brain_game_fla.IconSequenceMatch_76/1.png' },
];

function PracticeSelect({ onSelectGame, onBack }) {
  const handleClick = (gameName) => () => {
    playSound('clickSound');
    onSelectGame(gameName);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ width: 640, height: 480, position: 'relative' }}
    >
      {/* Smoky/foggy overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, borderRadius: 10,
        background: 'rgba(60, 65, 70, 0.75)',
        backdropFilter: 'blur(1px)',
      }}>
        <div style={{
          position: 'absolute', width: 220, height: 160, top: 30, right: 50,
          background: 'radial-gradient(ellipse, rgba(120,130,140,0.5) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 140, bottom: 80, left: 40,
          background: 'radial-gradient(ellipse, rgba(100,110,120,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', width: 160, height: 120, top: 180, left: 250,
          background: 'radial-gradient(ellipse, rgba(130,140,150,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>
      <BackButton onClick={() => { playSound('clickSound'); onBack(); }} />

      <div style={{
        position: 'absolute', left: 40, top: 15, zIndex: 1,
        display: 'grid', gridTemplateColumns: 'repeat(3, 88px)', gap: '4px 10px',
      }}>
        {GAMES.map((game) => (
          <motion.div
            key={game.name}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleClick(game.name)}
            style={{ cursor: 'pointer', width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={`/${game.sprite}`}
              alt={game.name}
              style={{ width: 80, height: 80, objectFit: 'contain', pointerEvents: 'none' }}
              draggable={false}
            />
          </motion.div>
        ))}
      </div>

      <div style={{ position: 'absolute', right: 10, bottom: 40, transform: 'scale(0.65)', transformOrigin: 'bottom right', zIndex: 1 }}>
        <Character message="Choose the minigame you would like to practice" />
      </div>
    </motion.div>
  );
}

export default PracticeSelect;
