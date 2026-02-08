import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// CarPath - Predict where the car ends up after following a path with turns
const COLORS = ['#ff5252', '#448aff', '#69f0ae', '#ffd740', '#b388ff', '#ff80ab', '#00bcd4', '#ff9800'];

function CarPath({ onAnswer, totalCorrect }) {
  const [paths, setPaths] = useState([]);
  const [carStart, setCarStart] = useState(0);
  const [correctEnd, setCorrectEnd] = useState(0);
  const [numEnds, setNumEnds] = useState(3);

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.min(Math.floor(totalCorrect / 2), 10);
    const ends = Math.min(3 + Math.floor(difficulty / 3), 6);
    const numCross = Math.min(2 + difficulty, 8);
    
    setNumEnds(ends);
    
    // Generate crossing paths
    const newPaths = [];
    const positions = Array.from({ length: ends }, (_, i) => i);
    
    // Shuffle to create crossings
    let currentPositions = [...positions];
    for (let i = 0; i < numCross; i++) {
      const idx1 = Math.floor(Math.random() * (ends - 1));
      const idx2 = idx1 + 1;
      // Swap
      [currentPositions[idx1], currentPositions[idx2]] = [currentPositions[idx2], currentPositions[idx1]];
      newPaths.push({ from: idx1, to: idx2, level: i });
    }
    
    // Pick random start
    const start = Math.floor(Math.random() * ends);
    setCarStart(start);
    
    // Trace path to find end
    let pos = start;
    for (const path of newPaths) {
      if (path.from === pos) pos = path.to;
      else if (path.to === pos) pos = path.from;
    }
    setCorrectEnd(pos);
    setPaths(newPaths);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleAnswer = (endIdx) => {
    onAnswer(endIdx === correctEnd);
    generatePuzzle();
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
      <div style={{
        fontSize: '20px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '15px',
        fontFamily: 'Baveuse, cursive',
      }}>
        Where does the car 🚗 end up?
      </div>

      {/* Path visualization */}
      <svg width="350" height="200" style={{ marginBottom: '20px' }}>
        {/* Start positions */}
        {Array.from({ length: numEnds }).map((_, i) => (
          <g key={`start-${i}`}>
            <circle
              cx={50 + i * (250 / (numEnds - 1 || 1))}
              cy={30}
              r={15}
              fill={i === carStart ? '#ffd700' : '#4a5568'}
              stroke="#fff"
              strokeWidth="2"
            />
            {i === carStart && <text x={50 + i * (250 / (numEnds - 1 || 1))} y={35} textAnchor="middle" fontSize="16">🚗</text>}
          </g>
        ))}
        
        {/* Paths - vertical lines with crossings */}
        {Array.from({ length: numEnds }).map((_, i) => (
          <line
            key={`line-${i}`}
            x1={50 + i * (250 / (numEnds - 1 || 1))}
            y1={45}
            x2={50 + i * (250 / (numEnds - 1 || 1))}
            y2={155}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="4"
            opacity={0.6}
          />
        ))}
        
        {/* Crossings */}
        {paths.map((path, idx) => {
          const y = 60 + (idx * 80 / Math.max(paths.length, 1));
          const x1 = 50 + path.from * (250 / (numEnds - 1 || 1));
          const x2 = 50 + path.to * (250 / (numEnds - 1 || 1));
          return (
            <line
              key={`cross-${idx}`}
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke="#fff"
              strokeWidth="3"
            />
          );
        })}
        
        {/* End positions */}
        {Array.from({ length: numEnds }).map((_, i) => (
          <circle
            key={`end-${i}`}
            cx={50 + i * (250 / (numEnds - 1 || 1))}
            cy={170}
            r={12}
            fill={COLORS[i % COLORS.length]}
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
      </svg>

      {/* Answer buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {Array.from({ length: numEnds }).map((_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAnswer(i)}
            style={{
              width: '60px',
              height: '60px',
              fontSize: '24px',
              background: COLORS[i % COLORS.length],
              border: '3px solid white',
              borderRadius: '50%',
              cursor: 'pointer',
              color: 'white',
              fontFamily: 'Baveuse, cursive',
            }}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default CarPath;
