import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ShapeOrder - Remember and reproduce shape sequence
const EASY_SHAPES = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
const HARD_SHAPES = ['🍣', '🍱', '🍙', '🍘', '🍥', '🍡']; // Sushi set (harder to distinguish)

const DIFFICULTY_LEVELS = [
  { numIcons: 3, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.2 },
  { numIcons: 3, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 1.4 },
  { numIcons: 4, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.4 },
  { numIcons: 4, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 1.6 },
  { numIcons: 5, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.6 },
  { numIcons: 5, difficultShapes: true, extraChoosePanels: 2, speedMultiplier: 1.8 },
  { numIcons: 6, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.8 },
  { numIcons: 6, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 2.0 },
  { numIcons: 7, difficultShapes: true, extraChoosePanels: 2, speedMultiplier: 2.0 },
  { numIcons: 8, difficultShapes: true, extraChoosePanels: 2, speedMultiplier: 2.2 },
];

function ShapeOrder({ onAnswer, totalCorrect }) {
  const [phase, setPhase] = useState('showing'); // showing, input
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [currentShowIndex, setCurrentShowIndex] = useState(0);
  const [options, setOptions] = useState([]);
  const [difficulty, setDifficulty] = useState(0);

  const generateSequence = useCallback(() => {
    const level = DIFFICULTY_LEVELS[Math.min(difficulty, DIFFICULTY_LEVELS.length - 1)];
    const shapes = level.difficultShapes ? HARD_SHAPES : EASY_SHAPES;
    
    // Generate random sequence
    const seq = [];
    for (let i = 0; i < level.numIcons; i++) {
      seq.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }
    
    // Generate options (sequence items + extra decoys)
    const uniqueInSeq = [...new Set(seq)];
    const decoys = shapes.filter(s => !uniqueInSeq.includes(s));
    const numDecoys = Math.min(level.extraChoosePanels, decoys.length);
    const selectedDecoys = decoys.sort(() => Math.random() - 0.5).slice(0, numDecoys);
    
    const allOptions = [...uniqueInSeq, ...selectedDecoys].sort(() => Math.random() - 0.5);
    
    setSequence(seq);
    setOptions(allOptions);
    setUserSequence([]);
    setCurrentShowIndex(0);
    setPhase('showing');
  }, [difficulty]);

  useEffect(() => {
    generateSequence();
  }, [generateSequence]);

  // Show sequence animation
  useEffect(() => {
    if (phase === 'showing' && currentShowIndex < sequence.length) {
      const level = DIFFICULTY_LEVELS[Math.min(difficulty, DIFFICULTY_LEVELS.length - 1)];
      const delay = 800 / level.speedMultiplier;
      
      const timer = setTimeout(() => {
        setCurrentShowIndex(i => i + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (phase === 'showing' && currentShowIndex >= sequence.length && sequence.length > 0) {
      setTimeout(() => setPhase('input'), 500);
    }
  }, [phase, currentShowIndex, sequence.length, difficulty]);

  const handleOptionClick = (shape) => {
    const newUserSequence = [...userSequence, shape];
    setUserSequence(newUserSequence);
    
    // Check if correct so far
    if (shape !== sequence[userSequence.length]) {
      // Wrong!
      onAnswer(false);
      generateSequence();
      return;
    }
    
    // Check if complete
    if (newUserSequence.length === sequence.length) {
      // Correct!
      onAnswer(true);
      setDifficulty(d => d + 1);
      setTimeout(generateSequence, 500);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
    }}>
      {/* Sequence display area */}
      <div style={{
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '30px',
      }}>
        {phase === 'showing' ? (
          <AnimatePresence mode="wait">
            {currentShowIndex < sequence.length && (
              <motion.div
                key={currentShowIndex}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{ fontSize: '80px' }}
              >
                {sequence[currentShowIndex]}
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {sequence.map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '10px',
                  background: userSequence[index] 
                    ? 'rgba(0, 200, 83, 0.3)'
                    : 'rgba(255,255,255,0.1)',
                  border: index === userSequence.length 
                    ? '3px solid #ffd700'
                    : '2px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                }}
              >
                {userSequence[index] || ''}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        fontSize: '18px',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: '20px',
        fontFamily: 'Baveuse, cursive',
      }}>
        {phase === 'showing' ? 'Watch the sequence...' : 'Repeat the sequence!'}
      </div>

      {/* Options */}
      {phase === 'input' && (
        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '350px',
        }}>
          {options.map((shape, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleOptionClick(shape)}
              style={{
                width: '70px',
                height: '70px',
                fontSize: '40px',
                background: 'linear-gradient(180deg, #4a5568, #2d3748)',
                border: '3px solid rgba(255,255,255,0.2)',
                borderRadius: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {shape}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShapeOrder;
