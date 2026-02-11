import React from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';

/*
 * Main Menu - Option C approach
 * Static Flash frame as background + positioned clickable overlays
 * stage-bg.png = FrameGameShow frame 241 rendered at 640x480
 * Button PNGs = Flash SVG sprites rendered to PNG
 */
function MainMenu({ onStartFullTest, onStartPractice, allGames, soundEnabled, onToggleSound }) {
  const click = (fn) => () => { playSound('buttonMenu'); fn(); };

  return (
    <motion.div
      className="main-menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Static Flash stage background - pixel-perfect */}
      <img src="/img/stage-bg.png" alt="" className="mm-bg" draggable={false} />

      {/* PLAY button */}
      <motion.div className="mm-btn mm-play" onClick={click(onStartFullTest)}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
        <img src="/img/btn-play.png" alt="Play" draggable={false} />
      </motion.div>

      {/* CHALLENGE button - boxing gloves SVG */}
      <motion.div className="mm-btn mm-challenge" onClick={click(onStartFullTest)}
        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
        <svg width="100" height="65" viewBox="0 0 100 65" fill="none">
          <ellipse cx="28" cy="24" rx="22" ry="24" fill="#1565C0"/>
          <ellipse cx="28" cy="18" rx="10" ry="6" fill="#42A5F5" opacity="0.3"/>
          <rect x="18" y="44" width="20" height="12" rx="4" fill="#0D47A1"/>
          <ellipse cx="72" cy="24" rx="22" ry="24" fill="#E53935"/>
          <ellipse cx="72" cy="18" rx="10" ry="6" fill="#EF5350" opacity="0.3"/>
          <rect x="62" y="44" width="20" height="12" rx="4" fill="#B71C1C"/>
        </svg>
        <div className="mm-label">CHALLENGE</div>
      </motion.div>

      {/* Bottom row: INVITE, TROPHIES, PROFILE */}
      <motion.div className="mm-btn mm-invite" onClick={click(() => {})}
        whileHover={{ scale: 1.08 }}>
        <img src="/img/btn-invite.png" alt="Invite" draggable={false} />
      </motion.div>

      <motion.div className="mm-btn mm-trophies" onClick={click(() => {})}
        whileHover={{ scale: 1.08 }}>
        <img src="/img/btn-trophies.png" alt="Trophies" draggable={false} />
      </motion.div>

      <motion.div className="mm-btn mm-profile" onClick={click(() => {})}
        whileHover={{ scale: 1.08 }}>
        <img src="/img/btn-profile.png" alt="Profile" draggable={false} />
      </motion.div>

      {/* Top-right control icons (globe, eye, speaker) */}
      <div className="mm-controls">
        <div className="mm-ctrl">
          <img src="/svg/icon-globe.svg" alt="" style={{width:22,height:22,filter:'invert(1)'}} />
          <span style={{fontSize:6,color:'#aaa',marginTop:1}}>ENGLISH</span>
        </div>
        <div className="mm-ctrl">
          <img src="/svg/icon-eye.svg" alt="" style={{width:22,height:22,filter:'invert(1)'}} />
        </div>
        <div className="mm-ctrl" onClick={click(onToggleSound)} style={{cursor:'pointer'}}>
          <img src="/svg/icon-speaker.svg" alt="" style={{width:22,height:22,filter:'invert(1)',opacity:soundEnabled?1:0.4}} />
        </div>
      </div>
    </motion.div>
  );
}

export default MainMenu;
