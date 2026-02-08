import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// JigsawMatch - Match jigsaw pieces to their outlines
const SHAPES = [
  { id: 0, path: 'M10,10 L50,10 L50,30 L70,30 L70,50 L50,50 L50,70 L10,70 Z', name: 'L-shape' },
  { id: 1, path: 'M20,10 L60,10 L60,70 L20,70 Z', name: 'Rectangle' },
  { id: 2, path: 'M40,10 L70,40 L40,70 L10,40 Z', name: 'Diamond' },
  { id: 3, path: 'M10,50 L40,10 L70,50 L40,70 Z', name: 'Arrow' },
  { id: 4, path: 'M10,10 L70,10 L70,40 L40,40 L40,70 L10,70 Z', name: 'Step' },
  { id: 5, path: 'M40,10 L70,30 L60,70 L20,70 L10,30 Z', name: 'Pentagon' },
];

const COLORS = ['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#b388ff', '#ff80ab'];

function JigsawMatch({ onAnswer, totalCorrect }) {
  const [targetShape, setTargetShape] = useState(null);
  const [options, setOptions] = useState([]);

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.min(Math.floor(totalCorrect / 2), 4);
    const numOptions = Math.min(3 + difficulty, 6);
    
    // Pick random target
    const targetIdx = Math.floor(Math.random() * SHAPES.length);
    const target = SHAPES[targetIdx];
    
    // Create options including the correct one
    const otherShapes = SHAPES.filter((_, i) => i !== targetIdx);
    const shuffledOthers = otherShapes.sort(() => Math.random() - 0.5).slice(0, numOptions - 1);
    const allOptions = [target, ...shuffledOthers].sort(() => Math.random() - 0.5);
    
    setTargetShape({ ...target, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    setOptions(allOptions.map((s, i) => ({ ...s, color: COLORS[i % COLORS.length] })));
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleSelect = (shapeId) => {
    onAnswer(shapeId === targetShape.id);
    generatePuzzle();
  };

  if (!targetShape) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
    }}>
      <div style={{
        fontSize: '20px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '20px',
        fontFamily: 'Baveuse, cursive',
      }}>
        Find the matching piece! 🧩
      </div>

      {/* Target shape (outline only) */}
      <motion.div
        key={targetShape.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          marginBottom: '30px',
          padding: '15px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '15px',
          border: '3px dashed #ffd700',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 80 80">
          <path
            d={targetShape.path}
            fill="none"
            stroke="#ffd700"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
        </svg>
      </motion.div>

      {/* Options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(options.length, 3)}, 1fr)`,
        gap: '15px',
      }}>
        {options.map((shape, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(shape.id)}
            style={{
              padding: '10px',
              background: 'linear-gradient(180deg, #4a5568, #2d3748)',
              border: '3px solid rgba(255,255,255,0.2)',
              borderRadius: '15px',
              cursor: 'pointer',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80">
              <path
                d={shape.path}
                fill={shape.color}
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default JigsawMatch;
