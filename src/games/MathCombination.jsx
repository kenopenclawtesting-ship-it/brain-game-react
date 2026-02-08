import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// MathCombination - Select numbers that sum to target
function MathCombination({ onAnswer, totalCorrect }) {
  const [target, setTarget] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [solution, setSolution] = useState([]);

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.min(Math.floor(totalCorrect / 2), 8);
    const numCount = Math.min(4 + Math.floor(difficulty / 2), 7);
    const maxNum = Math.min(10 + difficulty * 3, 30);
    
    // Generate solution first
    const solutionSize = Math.min(2 + Math.floor(difficulty / 3), 4);
    const solutionNums = [];
    let sum = 0;
    
    for (let i = 0; i < solutionSize; i++) {
      const num = Math.floor(Math.random() * maxNum) + 1;
      solutionNums.push(num);
      sum += num;
    }
    
    // Add decoy numbers
    const allNums = [...solutionNums];
    while (allNums.length < numCount) {
      const num = Math.floor(Math.random() * maxNum) + 1;
      if (!allNums.includes(num)) {
        allNums.push(num);
      }
    }
    
    // Shuffle
    const shuffled = allNums.sort(() => Math.random() - 0.5);
    
    setTarget(sum);
    setNumbers(shuffled);
    setSolution(solutionNums);
    setSelected([]);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const toggleNumber = (index) => {
    const newSelected = selected.includes(index)
      ? selected.filter(i => i !== index)
      : [...selected, index];
    setSelected(newSelected);
  };

  const handleSubmit = () => {
    const selectedNums = selected.map(i => numbers[i]).sort((a, b) => a - b);
    const solutionSorted = [...solution].sort((a, b) => a - b);
    
    const selectedSum = selectedNums.reduce((a, b) => a + b, 0);
    const isCorrect = selectedSum === target;
    
    onAnswer(isCorrect);
    generatePuzzle();
  };

  const currentSum = selected.reduce((sum, i) => sum + numbers[i], 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
    }}>
      {/* Target */}
      <div style={{
        fontSize: '22px',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '10px',
        fontFamily: 'Baveuse, cursive',
      }}>
        Select numbers that sum to:
      </div>
      
      <motion.div
        key={target}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        style={{
          fontSize: '56px',
          fontFamily: 'Baveuse, cursive',
          color: '#ffd700',
          marginBottom: '20px',
        }}
      >
        {target}
      </motion.div>

      {/* Current sum */}
      <div style={{
        fontSize: '24px',
        fontFamily: 'Baveuse, cursive',
        color: currentSum === target ? '#00c853' : 'rgba(255,255,255,0.7)',
        marginBottom: '20px',
      }}>
        Current: {currentSum} {currentSum === target && '✓'}
      </div>

      {/* Number options */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '25px',
        maxWidth: '400px',
      }}>
        {numbers.map((num, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleNumber(index)}
            style={{
              width: '65px',
              height: '65px',
              fontSize: '28px',
              fontFamily: 'Baveuse, cursive',
              background: selected.includes(index)
                ? 'linear-gradient(180deg, #00c853, #00a843)'
                : 'linear-gradient(180deg, #4a5568, #2d3748)',
              border: selected.includes(index) ? '3px solid #fff' : '3px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {num}
          </motion.button>
        ))}
      </div>

      {/* Submit button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSubmit}
        disabled={selected.length === 0}
        style={{
          padding: '15px 40px',
          fontSize: '22px',
          fontFamily: 'Baveuse, cursive',
          background: selected.length > 0 
            ? 'linear-gradient(180deg, #ffd700, #ff9500)'
            : 'linear-gradient(180deg, #666, #444)',
          border: 'none',
          borderRadius: '25px',
          color: selected.length > 0 ? '#1a1a2e' : '#999',
          cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Submit ✓
      </motion.button>
    </div>
  );
}

export default MathCombination;
