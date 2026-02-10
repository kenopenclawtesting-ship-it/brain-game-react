import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

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
        <div className="title-top">WHO HAS THE BIGGEST</div>
        <div className="title-brain">BRAIN?</div>
      </div>

      {/* Pro Player Club Banner */}
      <div className="pro-banner">★ PRO PLAYER CLUB ★</div>

      {!showPractice ? (
        /* Main Menu Buttons */
        <div className="menu-buttons">
          {/* PLAY button */}
          <motion.button
            className="menu-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(onStartFullTest)}
          >
            <div className="play-icons">
              <div className="play-icon-circle" style={{ background: '#E85B8A' }}>⚙</div>
              <div className="play-icon-circle" style={{ background: '#E8C840' }}>3</div>
              <div className="play-icon-circle" style={{ background: '#4A90D9' }}>👁</div>
              <div className="play-icon-circle" style={{ background: '#5BAA5B' }}>📋</div>
            </div>
            <div className="menu-btn-label">PLAY</div>
          </motion.button>

          {/* CHALLENGE button */}
          <motion.button
            className="menu-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(onStartFullTest)}
          >
            <div className="menu-btn-icon">🥊</div>
            <div className="menu-btn-label">CHALLENGE</div>
          </motion.button>

          {/* INVITE button */}
          <motion.button
            className="menu-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(() => {})}
          >
            <div className="menu-btn-icon">👫</div>
            <div className="menu-btn-label">INVITE</div>
          </motion.button>

          {/* TROPHIES button */}
          <motion.button
            className="menu-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(() => {})}
          >
            <div className="menu-btn-icon">🏆</div>
            <div className="menu-btn-label">TROPHIES</div>
          </motion.button>

          {/* PROFILE button */}
          <motion.button
            className="menu-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(() => {})}
          >
            <div className="menu-btn-icon">🪪</div>
            <div className="menu-btn-label">PROFILE</div>
          </motion.button>
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

      {/* Character */}
      <Character message="Welcome! Got a big BRAIN? Play Who Has The Biggest Brain? to find out!" />
    </motion.div>
  );
}

export default MainMenu;
