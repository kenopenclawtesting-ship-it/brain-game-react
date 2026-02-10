import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

/* Inline SVG icons to avoid emoji rendering issues */
const InviteIcon = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
    <circle cx="16" cy="16" r="8" fill="#FFD54F"/>
    <ellipse cx="16" cy="36" rx="12" ry="8" fill="#FFD54F"/>
    <circle cx="32" cy="16" r="8" fill="#FFAB40"/>
    <ellipse cx="32" cy="36" rx="12" ry="8" fill="#FFAB40"/>
    <path d="M6 10 Q4 6 6 2" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M42 10 Q44 6 42 2" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>
);

const TrophyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
    <path d="M14 8h20v16c0 6-4 10-10 10s-10-4-10-10V8z" fill="#FFD700"/>
    <path d="M14 12H8c0 6 3 10 6 12" fill="#FFC107"/>
    <path d="M34 12h6c0 6-3 10-6 12" fill="#FFC107"/>
    <rect x="20" y="32" width="8" height="6" fill="#B8860B"/>
    <rect x="16" y="38" width="16" height="4" rx="2" fill="#DAA520"/>
    <circle cx="24" cy="18" r="4" fill="#FFF176" opacity="0.7"/>
  </svg>
);

const ProfileIcon = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="4" width="32" height="40" rx="4" fill="#E8E8E8"/>
    <rect x="8" y="4" width="32" height="12" rx="4" fill="#5C6BC0"/>
    <rect x="14" y="20" width="20" height="3" rx="1.5" fill="#999"/>
    <rect x="14" y="26" width="16" height="3" rx="1.5" fill="#999"/>
    <rect x="14" y="32" width="20" height="3" rx="1.5" fill="#999"/>
    <rect x="14" y="38" width="12" height="3" rx="1.5" fill="#999"/>
  </svg>
);

const BoxingGlovesIcon = ({ size = 60 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <ellipse cx="20" cy="28" rx="16" ry="18" fill="#E53935"/>
    <ellipse cx="44" cy="28" rx="16" ry="18" fill="#C62828"/>
    <rect x="14" y="42" width="12" height="10" rx="3" fill="#B71C1C"/>
    <rect x="38" y="42" width="12" height="10" rx="3" fill="#8E1515"/>
    <ellipse cx="20" cy="24" rx="8" ry="5" fill="#EF5350" opacity="0.6"/>
    <ellipse cx="44" cy="24" rx="8" ry="5" fill="#E53935" opacity="0.6"/>
  </svg>
);

/* Category circle icons for PLAY button */
const GearIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
    <path d="M16 10a6 6 0 100 12 6 6 0 000-12zm0 9a3 3 0 110-6 3 3 0 010 6z"/>
    <path d="M27 14h-2.1a9 9 0 00-1-2.4l1.5-1.5-2.8-2.8-1.5 1.5A9 9 0 0018 7.1V5h-4v2.1a9 9 0 00-2.4 1l-1.5-1.5-2.8 2.8 1.5 1.5A9 9 0 007.1 14H5v4h2.1a9 9 0 001 2.4l-1.5 1.5 2.8 2.8 1.5-1.5a9 9 0 002.4 1V27h4v-2.1a9 9 0 002.4-1l1.5 1.5 2.8-2.8-1.5-1.5a9 9 0 001-2.4H27v-4z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
    <path d="M16 8C8 8 2 16 2 16s6 8 14 8 14-8 14-8-6-8-14-8zm0 13a5 5 0 110-10 5 5 0 010 10z"/>
    <circle cx="16" cy="16" r="2.5"/>
  </svg>
);

function MainMenu({ onStartFullTest, onStartPractice, allGames, soundEnabled, onToggleSound }) {
  const [showPractice, setShowPractice] = useState(false);

  const handleButtonClick = (callback) => {
    playSound('buttonMenu');
    callback();
  };

  return (
    <motion.div
      className="main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Title */}
      <div className="menu-title">
        <div className="title-top" style={{ fontSize: '17px', letterSpacing: '2px' }}>WHO HAS THE BIGGEST</div>
        <div className="title-brain">BRAIN?</div>
      </div>

      {/* Pro Player Club Banner */}
      <div className="pro-banner">★ PRO PLAYER CLUB ★</div>

      {!showPractice ? (
        /* Main Menu Buttons - left-aligned to leave room for character */
        <div className="menu-buttons">
          {/* Top row: PLAY + CHALLENGE */}
          <div className="menu-buttons-top">
            <motion.button
              className="menu-btn play-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick(onStartFullTest)}
            >
              <div className="play-icons" style={{ gap: '-4px', marginBottom: '6px' }}>
                <div className="play-icon-circle" style={{ background: '#E85B8A', width: '52px', height: '52px', fontSize: '22px', marginRight: '-8px', zIndex: 4 }}>
                  <GearIcon />
                </div>
                <div className="play-icon-circle" style={{ background: '#E8C840', width: '52px', height: '52px', fontSize: '22px', marginRight: '-8px', zIndex: 3 }}>
                  <span style={{ fontWeight: 'bold', color: 'white', fontSize: '18px' }}>123</span>
                </div>
                <div className="play-icon-circle" style={{ background: '#4A90D9', width: '52px', height: '52px', fontSize: '22px', marginRight: '-8px', zIndex: 2 }}>
                  <EyeIcon />
                </div>
                <div className="play-icon-circle" style={{ background: '#5BAA5B', width: '52px', height: '52px', fontSize: '22px', zIndex: 1 }}>
                  <BoxingGlovesIcon size={28} />
                </div>
              </div>
              <div className="menu-btn-label">PLAY</div>
            </motion.button>

            <motion.button
              className="menu-btn challenge-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick(onStartFullTest)}
            >
              <div className="menu-btn-icon" style={{ width: '90px', height: '80px' }}>
                <BoxingGlovesIcon size={70} />
              </div>
              <div className="menu-btn-label">CHALLENGE</div>
            </motion.button>
          </div>

          {/* Bottom row: INVITE + TROPHIES + PROFILE */}
          <div className="menu-buttons-bottom">
            <motion.button
              className="menu-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick(() => {})}
            >
              <div className="menu-btn-icon">
                <InviteIcon />
              </div>
              <div className="menu-btn-label">INVITE</div>
            </motion.button>

            <motion.button
              className="menu-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick(() => {})}
            >
              <div className="menu-btn-icon">
                <TrophyIcon />
              </div>
              <div className="menu-btn-label">TROPHIES</div>
            </motion.button>

            <motion.button
              className="menu-btn"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick(() => {})}
            >
              <div className="menu-btn-icon">
                <ProfileIcon />
              </div>
              <div className="menu-btn-label">PROFILE</div>
            </motion.button>
          </div>
        </div>
      ) : (
        /* Practice Mode Selection */
        <div className="practice-overlay">
          <h2>Select a Game</h2>
          <div className="practice-grid">
            {allGames.map((game) => (
              <button
                key={game}
                className="practice-game-btn"
                onClick={() => handleButtonClick(() => onStartPractice(game))}
              >
                {game}
              </button>
            ))}
          </div>
          <button
            className="back-btn"
            onClick={() => handleButtonClick(() => setShowPractice(false))}
          >
            ← Back
          </button>
        </div>
      )}

      {/* Sound toggle */}
      <motion.button
        style={{
          position: 'absolute',
          bottom: 30,
          left: 15,
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          fontSize: '20px',
          zIndex: 5,
        }}
        whileHover={{ scale: 1.1 }}
        onClick={() => handleButtonClick(onToggleSound)}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </motion.button>

      {/* Practice button (small, bottom) */}
      {!showPractice && (
        <motion.button
          style={{
            position: 'absolute',
            bottom: 30,
            left: 50,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: "'Bubblegum Sans', sans-serif",
            padding: '4px 12px',
            borderRadius: '10px',
            zIndex: 5,
          }}
          whileHover={{ scale: 1.05 }}
          onClick={() => handleButtonClick(() => setShowPractice(true))}
        >
          Practice
        </motion.button>
      )}

      {/* Character - large, right 1/3 of stage, sitting on platform */}
      <div className="menu-character-area">
        <Character message="Welcome! Got a big BRAIN? Play Who Has The Biggest Brain? to find out!" />
      </div>
    </motion.div>
  );
}

export default MainMenu;
