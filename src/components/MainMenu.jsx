import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/sounds';

function MainMenu({ onStartFullTest, onStartPractice, allGames, soundEnabled, onToggleSound }) {
  const [showPractice, setShowPractice] = useState(false);

  const handleButtonClick = (callback) => {
    playSound('buttonMenu');
    callback();
  };

  return (
    <motion.div
      className="game-canvas"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(180deg, #1a237e 0%, #0d1b2a 100%)',
      }}
    >
      {/* Title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <h1 style={{
          fontFamily: 'Baveuse, cursive',
          fontSize: '42px',
          color: '#ffd700',
          textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
          marginBottom: '10px',
        }}>
          Who Has The
        </h1>
        <h1 style={{
          fontFamily: 'Baveuse, cursive',
          fontSize: '56px',
          color: '#fff',
          textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        }}>
          BIGGEST BRAIN?
        </h1>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontSize: '60px', marginTop: '10px' }}
        >
          🧠
        </motion.div>
      </motion.div>

      {!showPractice ? (
        /* Main Menu Buttons */
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >
          <motion.button
            className="game-button primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(onStartFullTest)}
          >
            🎯 Full Brain Test
          </motion.button>
          
          <motion.button
            className="game-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(() => setShowPractice(true))}
          >
            📝 Practice Game
          </motion.button>

          <motion.button
            style={{
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontFamily: 'Baveuse, cursive',
              fontSize: '18px',
            }}
            whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(onToggleSound)}
          >
            {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
          </motion.button>
        </motion.div>
      ) : (
        /* Practice Mode Game Selection */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px',
          }}
        >
          <h2 style={{
            fontFamily: 'Baveuse, cursive',
            fontSize: '24px',
            color: '#ffd700',
            marginBottom: '15px',
          }}>
            Select a Game
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '15px',
          }}>
            {allGames.map((game) => (
              <motion.button
                key={game}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleButtonClick(() => onStartPractice(game))}
                style={{
                  padding: '12px 20px',
                  fontFamily: 'Baveuse, cursive',
                  fontSize: '14px',
                  background: 'linear-gradient(180deg, #4fc3f7, #0288d1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                {game}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick(() => setShowPractice(false))}
            style={{
              padding: '10px 30px',
              fontFamily: 'Baveuse, cursive',
              fontSize: '16px',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '20px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            ← Back
          </motion.button>
        </motion.div>
      )}

      {/* Version */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '15px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Arial, sans-serif',
      }}>
        v2.6.7-react
      </div>
    </motion.div>
  );
}

export default MainMenu;
