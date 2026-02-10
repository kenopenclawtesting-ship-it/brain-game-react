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

const PinwheelIcon = () => (
  <svg width="90" height="90" viewBox="0 0 90 90">
    <circle cx="45" cy="25" r="14" fill="#E53935"/>
    <circle cx="63" cy="38" r="14" fill="#1E88E5"/>
    <circle cx="56" cy="60" r="14" fill="#FDD835"/>
    <circle cx="34" cy="60" r="14" fill="#43A047"/>
    <circle cx="27" cy="38" r="14" fill="#8E24AA"/>
    <circle cx="45" cy="45" r="10" fill="#FF7043"/>
  </svg>
);

const StarburstIcon = () => (
  <svg width="90" height="90" viewBox="0 0 90 90">
    <polygon points="45,5 52,30 78,15 58,35 85,45 58,55 78,75 52,60 45,85 38,60 12,75 32,55 5,45 32,35 12,15 38,30"
      fill="#FF9800"/>
    <text x="45" y="48" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">PRO</text>
  </svg>
);

const DumbbellIcon = () => (
  <svg width="90" height="90" viewBox="0 0 90 90">
    <rect x="10" y="32" width="16" height="26" rx="4" fill="#1565C0"/>
    <rect x="64" y="32" width="16" height="26" rx="4" fill="#1565C0"/>
    <rect x="22" y="38" width="46" height="14" rx="3" fill="#42A5F5"/>
    <rect x="4" y="36" width="12" height="18" rx="3" fill="#0D47A1"/>
    <rect x="74" y="36" width="12" height="18" rx="3" fill="#0D47A1"/>
  </svg>
);

const modeButtonStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
  textDecoration: 'none',
};

const labelStyle = {
  fontFamily: "'Luckiest Guy', cursive", fontSize: '16px', color: '#fff',
  textShadow: '2px 2px 0 #333, -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333',
  marginTop: 6, textAlign: 'center',
};

function GameModeSelect({ onClassic, onPractice, onBack }) {
  const handleClick = (handler) => () => {
    playSound('clickSound');
    handler();
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
          position: 'absolute', width: 200, height: 150, top: 20, left: 40,
          background: 'radial-gradient(ellipse, rgba(120,130,140,0.5) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', width: 250, height: 180, bottom: 60, right: 30,
          background: 'radial-gradient(ellipse, rgba(100,110,120,0.4) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 120, top: 150, left: 200,
          background: 'radial-gradient(ellipse, rgba(130,140,150,0.35) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>
      <BackButton onClick={handleClick(onBack)} />

      <div style={{ position: 'absolute', left: 30, top: 60, zIndex: 1 }}>
        <motion.div style={modeButtonStyle} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          onClick={handleClick(onClassic)}>
          <PinwheelIcon />
          <div style={labelStyle}>CLASSIC GAME</div>
        </motion.div>
      </div>

      <div style={{ position: 'absolute', left: 180, top: 140, zIndex: 1 }}>
        <motion.div style={modeButtonStyle} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          onClick={handleClick(onClassic)}>
          <StarburstIcon />
          <div style={labelStyle}>PRO GAME</div>
        </motion.div>
      </div>

      <div style={{ position: 'absolute', left: 50, top: 250, zIndex: 1 }}>
        <motion.div style={modeButtonStyle} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          onClick={handleClick(onPractice)}>
          <DumbbellIcon />
          <div style={labelStyle}>PRACTICE</div>
        </motion.div>
      </div>

      <div style={{ position: 'absolute', right: 10, bottom: 40, transform: 'scale(0.7)', transformOrigin: 'bottom right', zIndex: 1 }}>
        <Character message="Let's play Who Has The Biggest Brain! Start by choosing your game mode" />
      </div>
    </motion.div>
  );
}

export default GameModeSelect;
