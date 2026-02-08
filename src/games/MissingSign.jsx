import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// MissingSign - Find the missing operator (+, -, ×, ÷)
function MissingSign({ onAnswer, totalCorrect }) {
  const [equation, setEquation] = useState(null);

  const generateEquation = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 3);
    const maxNum = Math.min(10 + difficulty * 2, 50);
    
    const operators = ['+', '-', '×', '÷'];
    const op = operators[Math.floor(Math.random() * 4)];
    
    let a, b, answer;
    
    switch (op) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 5;
        b = Math.floor(Math.random() * Math.min(a - 1, maxNum)) + 1;
        answer = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
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
    
    setEquation({ a, b, op, answer });
  }, [totalCorrect]);

  useEffect(() => {
    generateEquation();
  }, [generateEquation]);

  const handleAnswer = (selectedOp) => {
    if (!equation) return;
    const isCorrect = selectedOp === equation.op;
    onAnswer(isCorrect);
    generateEquation();
  };

  if (!equation) return null;

  const operators = ['+', '-', '×', '÷'];

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
        key={`${equation.a}-${equation.b}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontSize: '52px',
          fontFamily: 'Baveuse, cursive',
          color: 'white',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <span>{equation.a}</span>
        <span style={{
          color: '#ffd700',
          fontSize: '60px',
          minWidth: '60px',
          textAlign: 'center',
          border: '3px dashed #ffd700',
          borderRadius: '10px',
          padding: '5px 10px',
        }}>?</span>
        <span>{equation.b}</span>
        <span>=</span>
        <span>{equation.answer}</span>
      </motion.div>

      {/* Operator buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
      }}>
        {operators.map((op) => (
          <motion.button
            key={op}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAnswer(op)}
            style={{
              width: '80px',
              height: '80px',
              fontSize: '40px',
              fontFamily: 'Baveuse, cursive',
              background: 'linear-gradient(180deg, #4fc3f7, #0288d1)',
              border: 'none',
              borderRadius: '15px',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 195, 247, 0.4)',
            }}
          >
            {op}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default MissingSign;
