import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// Calculate (Missing Number) - Solve arithmetic equations
function Calculate({ onAnswer, totalCorrect }) {
  const [equation, setEquation] = useState(null);
  const [userInput, setUserInput] = useState('');

  const generateEquation = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 3.5);
    const maxNum = Math.min(10 + difficulty * 3, 99);
    
    const operators = ['+', '-', '×', '÷'];
    const op = operators[Math.floor(Math.random() * 4)];
    
    let a, b, answer, missingPos;
    
    // Generate valid equation based on operator
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        break;
      case '-':
        answer = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * Math.min(answer, maxNum)) + 1;
        a = answer + b;
        break;
      case '×':
        a = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
        b = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
        answer = a * b;
        break;
      case '÷':
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        break;
      default:
        a = 1; b = 1; answer = 2;
    }
    
    // Decide which position is missing (0=a, 1=b, 2=answer)
    missingPos = Math.floor(Math.random() * 3);
    
    const missingValue = missingPos === 0 ? a : missingPos === 1 ? b : answer;
    
    setEquation({ a, b, op, answer, missingPos, missingValue });
    setUserInput('');
  }, [totalCorrect]);

  useEffect(() => {
    generateEquation();
  }, [generateEquation]);

  const handleSubmit = () => {
    if (!equation || userInput === '') return;
    
    const isCorrect = parseInt(userInput, 10) === equation.missingValue;
    onAnswer(isCorrect);
    generateEquation();
  };

  const handleNumpad = (num) => {
    if (num === 'C') {
      setUserInput('');
    } else if (num === '⏎') {
      handleSubmit();
    } else if (userInput.length < 4) {
      setUserInput(userInput + num);
    }
  };

  if (!equation) return null;

  const displayA = equation.missingPos === 0 ? '?' : equation.a;
  const displayB = equation.missingPos === 1 ? '?' : equation.b;
  const displayAnswer = equation.missingPos === 2 ? '?' : equation.answer;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
    }}>
      {/* Equation display */}
      <motion.div
        key={`${equation.a}-${equation.b}-${equation.op}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontSize: '48px',
          fontFamily: 'Baveuse, cursive',
          color: 'white',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <span style={{ color: equation.missingPos === 0 ? '#ffd700' : 'white' }}>{displayA}</span>
        <span style={{ color: '#4fc3f7' }}>{equation.op}</span>
        <span style={{ color: equation.missingPos === 1 ? '#ffd700' : 'white' }}>{displayB}</span>
        <span>=</span>
        <span style={{ color: equation.missingPos === 2 ? '#ffd700' : 'white' }}>{displayAnswer}</span>
      </motion.div>

      {/* User input display */}
      <div style={{
        fontSize: '42px',
        fontFamily: 'Baveuse, cursive',
        color: '#ffd700',
        marginBottom: '20px',
        minHeight: '50px',
        minWidth: '120px',
        textAlign: 'center',
        borderBottom: '3px solid #ffd700',
        padding: '5px 10px',
      }}>
        {userInput || '_'}
      </div>

      {/* Numpad */}
      <div className="numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⏎'].map((num) => (
          <motion.button
            key={num}
            className="numpad-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumpad(num.toString())}
            style={{
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

export default Calculate;
