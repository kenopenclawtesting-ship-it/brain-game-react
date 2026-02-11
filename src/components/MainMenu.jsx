import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

function MainMenu({ onStartFullTest, onStartPractice, allGames, soundEnabled, onToggleSound }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  return (
    <motion.div
      className="main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Title */}
      <div className="mm-title-area">
        <div className="mm-title-small">WHO HAS THE BIGGEST</div>
        <div className="mm-title-big">
          <span className="mm-brain">BRAIN</span>
          <span className="mm-question">?</span>
        </div>
        <div className="mm-pro-banner">
          <span className="mm-star">★</span> PRO PLAYER CLUB <span className="mm-star">★</span>
        </div>
      </div>

      {/* Top-right controls */}
      <div className="mm-controls">
        <div className="mm-ctrl-btn">
          <svg width="28" height="28" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
            <ellipse cx="14" cy="14" rx="5.5" ry="12" stroke="#2E7D32" strokeWidth="1" fill="none"/>
            <line x1="2" y1="14" x2="26" y2="14" stroke="#2E7D32" strokeWidth="1"/>
            <path d="M4 8 Q14 6 24 8" stroke="#2E7D32" strokeWidth="0.8" fill="none"/>
            <path d="M4 20 Q14 22 24 20" stroke="#2E7D32" strokeWidth="0.8" fill="none"/>
          </svg>
          <span className="mm-ctrl-label">ENGLISH</span>
        </div>
        <div className="mm-ctrl-btn">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="white">
            <path d="M14 6C6 6 2 14 2 14s4 8 12 8 12-8 12-8-4-8-12-8zm0 13a5 5 0 110-10 5 5 0 010 10z"/>
            <circle cx="14" cy="14" r="2.5" fill="#222"/>
          </svg>
        </div>
        <motion.div className="mm-ctrl-btn" onClick={click(onToggleSound)} whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer' }}>
          {soundEnabled ? (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="white">
              <path d="M4 10v8h5l6 6V4L9 10H4zm16 4a5.5 5.5 0 00-3-4.9v9.8a5.5 5.5 0 003-4.9zM17 2.2v2.5C20.5 5.7 23 9 23 14s-2.5 8.3-6 9.3v2.5c4.8-1.1 8.4-5.4 8.4-11.8S21.8 3.3 17 2.2z"/>
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="white">
              <path d="M19 14a5 5 0 00-3-4.6v2.3l2.8 2.8c.1-.2.2-.3.2-.5zm3 0c0 1.1-.2 2.2-.6 3.2l1.8 1.8c.8-1.5 1.2-3.2 1.2-5 0-5.4-3.6-10-8.4-11.2v2.5C18.5 6.3 22 9.5 22 14zM4.5 3L3 4.5 8.5 10H4v8h5l6 6v-7.5l5 5c-.8.6-1.7 1.1-2.6 1.4v2.5a11 11 0 004.3-2.2L23.5 25 25 23.5l-12-12L4.5 3zM15 4l-2.5 2.5L15 9V4z"/>
            </svg>
          )}
        </motion.div>
      </div>

      {/* Button layout area */}
      <div className="mm-buttons">
        {/* Top row: PLAY + CHALLENGE */}
        <div className="mm-top-row">
          <motion.div
            className="mm-btn mm-play"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={click(onStartFullTest)}
          >
            <img
              src="/sprites/DefineSprite_325_brain_game_fla.ButtonPlay_514/1.png"
              alt="Play"
              style={{ width: 155, height: 'auto', pointerEvents: 'none' }}
              draggable={false}
            />
          </motion.div>

          <motion.div
            className="mm-btn mm-challenge"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={click(onStartFullTest)}
          >
            <svg width="80" height="65" viewBox="0 0 80 65" fill="none">
              <ellipse cx="24" cy="26" rx="18" ry="20" fill="#E53935"/>
              <ellipse cx="56" cy="26" rx="18" ry="20" fill="#1565C0"/>
              <rect x="16" y="42" width="16" height="10" rx="4" fill="#B71C1C"/>
              <rect x="48" y="42" width="16" height="10" rx="4" fill="#0D47A1"/>
              <ellipse cx="24" cy="22" rx="9" ry="5" fill="#EF5350" opacity="0.5"/>
              <ellipse cx="56" cy="22" rx="9" ry="5" fill="#42A5F5" opacity="0.5"/>
              <circle cx="24" cy="20" r="2" fill="white" opacity="0.4"/>
              <circle cx="56" cy="20" r="2" fill="white" opacity="0.4"/>
            </svg>
            <div className="mm-label">CHALLENGE</div>
          </motion.div>
        </div>

        {/* Bottom row: INVITE + TROPHIES + PROFILE */}
        <div className="mm-bottom-row">
          <motion.div className="mm-btn mm-small" whileHover={{ scale: 1.08 }} onClick={click(() => {})}>
            <img
              src="/sprites/DefineSprite_334_brain_game_fla.ButtonInvite_517/1.png"
              alt="Invite"
              style={{ width: 110, height: 'auto', pointerEvents: 'none' }}
              draggable={false}
            />
          </motion.div>

          <motion.div className="mm-btn mm-small" whileHover={{ scale: 1.08 }} onClick={click(() => {})}>
            <img
              src="/sprites/DefineSprite_330_ButtonAchivements/1.png"
              alt="Trophies"
              style={{ width: 110, height: 'auto', pointerEvents: 'none' }}
              draggable={false}
            />
          </motion.div>

          <motion.div className="mm-btn mm-small" whileHover={{ scale: 1.08 }} onClick={click(() => {})}>
            <img
              src="/sprites/DefineSprite_338/1.png"
              alt="Profile"
              style={{ width: 100, height: 'auto', pointerEvents: 'none' }}
              draggable={false}
            />
          </motion.div>
        </div>
      </div>

      {/* Character */}
      <div className="mm-character">
        <Character message="Welcome! Got a big BRAIN? Play Who Has The Biggest Brain? to find out!" />
      </div>
    </motion.div>
  );
}

export default MainMenu;
