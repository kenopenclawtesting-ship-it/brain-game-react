import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// CubeCounter - Count 3D cubes in isometric view
function CubeCounter({ onAnswer, totalCorrect }) {
  const [grid, setGrid] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userInput, setUserInput] = useState('');

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 1.5);
    const baseWidth = Math.min(2 + Math.floor(difficulty / 4), 5);
    const baseDepth = Math.min(2 + Math.floor(difficulty / 4), 5);
    const maxHeight = Math.min(3 + Math.floor(difficulty / 6), 5);
    
    // Generate random heights for each position
    const newGrid = [];
    let totalCubes = 0;
    
    for (let z = 0; z < baseDepth; z++) {
      const row = [];
      for (let x = 0; x < baseWidth; x++) {
        const height = Math.floor(Math.random() * maxHeight) + 1;
        row.push(height);
        totalCubes += height;
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
    setCorrectAnswer(totalCubes);
    setUserInput('');
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleSubmit = () => {
    if (userInput === '') return;
    const isCorrect = parseInt(userInput, 10) === correctAnswer;
    onAnswer(isCorrect);
    generatePuzzle();
  };

  const handleNumpad = (num) => {
    if (num === 'C') {
      setUserInput('');
    } else if (num === '⏎') {
      handleSubmit();
    } else if (userInput.length < 3) {
      setUserInput(userInput + num);
    }
  };

  // Render isometric cubes
  const renderCubes = () => {
    const cubes = [];
    const cubeSize = 25;
    const offsetX = 200;
    const offsetY = 80;
    
    grid.forEach((row, z) => {
      row.forEach((height, x) => {
        for (let y = 0; y < height; y++) {
          // Isometric transformation
          const isoX = (x - z) * cubeSize * 0.866 + offsetX;
          const isoY = (x + z) * cubeSize * 0.5 - y * cubeSize + offsetY;
          
          const color1 = (x + z + y) % 2 === 0 ? '#4fc3f7' : '#29b6f6';
          const color2 = (x + z + y) % 2 === 0 ? '#0288d1' : '#0277bd';
          const color3 = (x + z + y) % 2 === 0 ? '#01579b' : '#014a7a';
          
          cubes.push(
            <g key={`${x}-${y}-${z}`} transform={`translate(${isoX}, ${isoY})`}>
              {/* Top face */}
              <polygon
                points={`0,-${cubeSize * 0.5} ${cubeSize * 0.866},0 0,${cubeSize * 0.5} -${cubeSize * 0.866},0`}
                fill={color1}
                stroke="#fff"
                strokeWidth="1"
              />
              {/* Left face */}
              <polygon
                points={`-${cubeSize * 0.866},0 0,${cubeSize * 0.5} 0,${cubeSize * 1.5} -${cubeSize * 0.866},${cubeSize}`}
                fill={color2}
                stroke="#fff"
                strokeWidth="1"
              />
              {/* Right face */}
              <polygon
                points={`${cubeSize * 0.866},0 0,${cubeSize * 0.5} 0,${cubeSize * 1.5} ${cubeSize * 0.866},${cubeSize}`}
                fill={color3}
                stroke="#fff"
                strokeWidth="1"
              />
            </g>
          );
        }
      });
    });
    
    return cubes;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      padding: '10px',
    }}>
      {/* Isometric view */}
      <motion.svg
        key={correctAnswer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        width="400"
        height="180"
        style={{ marginBottom: '10px' }}
      >
        {renderCubes()}
      </motion.svg>

      {/* Question */}
      <div style={{
        fontSize: '20px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '10px',
        fontFamily: 'Baveuse, cursive',
      }}>
        How many cubes? 🧊
      </div>

      {/* User input */}
      <div style={{
        fontSize: '36px',
        fontFamily: 'Baveuse, cursive',
        color: '#ffd700',
        marginBottom: '10px',
        minWidth: '80px',
        textAlign: 'center',
        borderBottom: '3px solid #ffd700',
        padding: '5px',
      }}>
        {userInput || '_'}
      </div>

      {/* Numpad */}
      <div className="numpad" style={{ maxWidth: '240px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⏎'].map((num) => (
          <motion.button
            key={num}
            className="numpad-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumpad(num.toString())}
            style={{
              padding: '10px',
              fontSize: '22px',
              background: num === '⏎' 
                ? 'linear-gradient(180deg, #00c853, #00a843)'
                : num === 'C'
                ? 'linear-gradient(180deg, #ff5252, #d32f2f)'
                : undefined,
            }}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default CubeCounter;
