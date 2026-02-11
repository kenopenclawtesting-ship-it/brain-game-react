import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';
import Character from './Character';

/* Label style matching OG: bold cartoon font, dark outline, pink/magenta fill */
const Label = ({ children, size = 28, color = '#E83E8C' }) => (
  <div style={{
    fontFamily: "'Luckiest Guy', cursive",
    fontSize: `${size}px`,
    color,
    textShadow: `
      2px 2px 0 #4A1530,
      3px 3px 0 #3A0F25,
      4px 4px 2px rgba(0,0,0,0.4),
      -1.5px -1.5px 0 #4A1530,
      1.5px -1.5px 0 #4A1530,
      -1.5px 1.5px 0 #4A1530`,
    WebkitTextStroke: '1.5px #4A1530',
    letterSpacing: '1px',
    textAlign: 'center',
    lineHeight: 1,
  }}>{children}</div>
);

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

      {/* Top-right controls - 3 buttons */}
      <div className="mm-controls">
        <div className="mm-ctrl-btn">
          <svg width="26" height="26" viewBox="0 0 28 28">
            <circle cx="14" cy="14" r="12" fill="#4CAF50" stroke="#2E7D32" strokeWidth="1.5"/>
            <ellipse cx="14" cy="14" rx="5.5" ry="12" stroke="#2E7D32" strokeWidth="1" fill="none"/>
            <line x1="2" y1="14" x2="26" y2="14" stroke="#2E7D32" strokeWidth="1"/>
            <path d="M4 8 Q14 6 24 8" stroke="#2E7D32" strokeWidth="0.8" fill="none"/>
            <path d="M4 20 Q14 22 24 20" stroke="#2E7D32" strokeWidth="0.8" fill="none"/>
          </svg>
          <span className="mm-ctrl-label">ENGLISH</span>
        </div>
        <div className="mm-ctrl-btn">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="white">
            <path d="M14 6C6 6 2 14 2 14s4 8 12 8 12-8 12-8-4-8-12-8zm0 13a5 5 0 110-10 5 5 0 010 10z"/>
            <circle cx="14" cy="14" r="2.5" fill="#222"/>
          </svg>
        </div>
        <motion.div className="mm-ctrl-btn" onClick={click(onToggleSound)} whileHover={{ scale: 1.1 }} style={{ cursor: 'pointer' }}>
          {soundEnabled ? (
            <svg width="26" height="26" viewBox="0 0 28 28" fill="white">
              <path d="M4 10v8h5l6 6V4L9 10H4zm16 4a5.5 5.5 0 00-3-4.9v9.8a5.5 5.5 0 003-4.9z"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 28 28" fill="white">
              <path d="M19 14a5 5 0 00-3-4.6v2.3l2.8 2.8c.1-.2.2-.3.2-.5zM4.5 3L3 4.5 8.5 10H4v8h5l6 6v-7.5l5 5c-.8.6-1.7 1.1-2.6 1.4v2.5a11 11 0 004.3-2.2L23.5 25 25 23.5l-12-12L4.5 3zM15 4l-2.5 2.5L15 9V4z"/>
            </svg>
          )}
        </motion.div>
      </div>

      {/* Main content area */}
      <div className="mm-content">
        {/* Top row: PLAY + CHALLENGE */}
        <div className="mm-top-row">
          <motion.div
            className="mm-btn"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={click(onStartFullTest)}
          >
            {/* Play icons - crop to just the circles, hide embedded PLAY text */}
            <div style={{ width: 120, height: 68, overflow: 'hidden' }}>
              <img
                src="/sprites/DefineSprite_325_brain_game_fla.ButtonPlay_514/1.png"
                alt=""
                style={{ width: 140, height: 'auto', marginTop: -5, marginLeft: -10, pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
            <Label size={36} color="#E83E8C">PLAY</Label>
          </motion.div>

          <motion.div
            className="mm-btn"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={click(onStartFullTest)}
          >
            {/* Boxing gloves */}
            <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
              <ellipse cx="30" cy="28" rx="22" ry="24" fill="#E53935"/>
              <ellipse cx="70" cy="28" rx="22" ry="24" fill="#1565C0"/>
              <rect x="20" y="48" width="20" height="12" rx="4" fill="#B71C1C"/>
              <rect x="60" y="48" width="20" height="12" rx="4" fill="#0D47A1"/>
              <ellipse cx="30" cy="23" rx="11" ry="6" fill="#EF5350" opacity="0.4"/>
              <ellipse cx="70" cy="23" rx="11" ry="6" fill="#42A5F5" opacity="0.4"/>
              <circle cx="28" cy="20" r="3" fill="white" opacity="0.3"/>
              <circle cx="68" cy="20" r="3" fill="white" opacity="0.3"/>
            </svg>
            <Label size={26} color="#E83E8C">CHALLENGE</Label>
          </motion.div>
        </div>

        {/* Bottom row: INVITE + TROPHIES + PROFILE */}
        <div className="mm-bottom-row">
          <motion.div className="mm-btn mm-small" whileHover={{ scale: 1.08 }} onClick={click(() => {})}>
            <div style={{ width: 80, height: 50, overflow: 'hidden' }}>
              <img
                src="/sprites/DefineSprite_334_brain_game_fla.ButtonInvite_517/1.png"
                alt=""
                style={{ width: 100, height: 'auto', marginTop: -3, marginLeft: -10, pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
            <Label size={20}>INVITE</Label>
          </motion.div>

          <motion.div className="mm-btn mm-small" whileHover={{ scale: 1.08 }} onClick={click(() => {})}>
            <div style={{ width: 70, height: 50, overflow: 'hidden' }}>
              <img
                src="/sprites/DefineSprite_330_ButtonAchivements/1.png"
                alt=""
                style={{ width: 90, height: 'auto', marginTop: -3, marginLeft: -10, pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
            <Label size={20}>TROPHIES</Label>
          </motion.div>

          <motion.div className="mm-btn mm-small" whileHover={{ scale: 1.08 }} onClick={click(() => {})}>
            <div style={{ width: 70, height: 42, overflow: 'hidden' }}>
              <img
                src="/sprites/DefineSprite_338/1.png"
                alt=""
                style={{ width: 85, height: 'auto', marginTop: -2, marginLeft: -8, pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
            <Label size={20}>PROFILE</Label>
          </motion.div>
        </div>
      </div>

      {/* Speech bubble - positioned separately from character */}
      <div className="mm-speech">
        <div className="speech-bubble" style={{ marginTop: 0, maxWidth: 145, fontSize: '13px' }}>
          Welcome! Got a big BRAIN? Play Who Has The Biggest Brain? to find out!
        </div>
      </div>

      {/* Character - large, bottom-right */}
      <div className="mm-character">
        <Character />
      </div>
    </motion.div>
  );
}

export default MainMenu;
