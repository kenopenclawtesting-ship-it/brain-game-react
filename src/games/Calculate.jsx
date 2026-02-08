import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

// Calculate (Missing Number) - Solve arithmetic equations
// From SOURCE.md: difficulty = Math.floor(totalCorrect / 3.5)
// At difficulty >= 3 and odd rounds: complex equations like (3 + 2) * ? = 20
function Calculate({ onAnswer, totalCorrect }) {
  const [equation, setEquation] = useState(null);
  const [userInput, setUserInput] = useState('');

  const generateEquation = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 3.5);
    const maxNum = Math.min(10 + difficulty * 3, 99);
    const useComplex = difficulty >= 3 && totalCorrect % 2 === 1;
    
    const operators = ['+', '-', '×', '÷'];
    
    if (useComplex) {
      // Complex equation: (a op1 b) op2 ? = result
      const op1 = operators[Math.floor(Math.random() * 2)]; // + or -
      const op2 = operators[Math.floor(Math.random() * 4)];
      
      let a, b, innerResult, c, finalResult;
      
      // Generate inner operation
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      innerResult = op1 === '+' ? a + b : Math.max(a, b) - Math.min(a, b);
      if (op1 === '-') {
        [a, b] = a >= b ? [a, b] : [b, a];
        innerResult = a - b;
      }
      
      // Generate outer operation with missing value
      switch (op2) {
        case '+':
          c = Math.floor(Math.random() * 20) + 1;
          finalResult = innerResult + c;
          break;
        case '-':
          c = Math.floor(Math.random() * innerResult) + 1;
          finalResult = innerResult - c;
          break;
        case '×':
          c = Math.floor(Math.random() * 10) + 1;
          finalResult = innerResult * c;
          break;
        case '÷':
          c = Math.floor(Math.random() * 10) + 1;
          finalResult = innerResult; // innerResult / c = finalResult, so innerResult = c * finalResult
          innerResult = c * finalResult;
          // Recalculate a,b for valid inner operation
          if (op1 === '+') {
            a = Math.floor(innerResult / 2);
            b = innerResult - a;
          } else {
            a = innerResult + Math.floor(Math.random() * 10) + 1;
            b = a - innerResult;
          }
          break;
        default:
          c = 1; finalResult = innerResult;
      }
      
      setEquation({
        isComplex: true,
        a, b, op1, op2,
        missingValue: c,
        finalResult,
        display: `(${a} ${op1} ${b}) ${op2} ? = ${finalResult}`
      });
    } else {
      // Simple equation
      const op = operators[Math.floor(Math.random() * 4)];
      let a, b, answer, missingPos;
      
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
      
      missingPos = Math.floor(Math.random() * 3);
      const missingValue = missingPos === 0 ? a : missingPos === 1 ? b : answer;
      
      setEquation({
        isComplex: false,
        a, b, op, answer, missingPos, missingValue
      });
    }
    
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

  // Render equation display
  const renderEquation = () => {
    if (equation.isComplex) {
      return (
        <span style={{ color: 'white' }}>
          {equation.display.replace('?', '')}
          <span style={{ color: '#ffd700' }}>?</span>
          {equation.display.includes('?') ? '' : ''}
        </span>
      );
    }
    
    const displayA = equation.missingPos === 0 ? '?' : equation.a;
    const displayB = equation.missingPos === 1 ? '?' : equation.b;
    const displayAnswer = equation.missingPos === 2 ? '?' : equation.answer;
    
    return (
      <>
        <span style={{ color: equation.missingPos === 0 ? '#ffd700' : 'white' }}>{displayA}</span>
        <span style={{ color: '#4fc3f7', margin: '0 10px' }}>{equation.op}</span>
        <span style={{ color: equation.missingPos === 1 ? '#ffd700' : 'white' }}>{displayB}</span>
        <span style={{ margin: '0 10px' }}>=</span>
        <span style={{ color: equation.missingPos === 2 ? '#ffd700' : 'white' }}>{displayAnswer}</span>
      </>
    );
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
      {/* Equation display */}
      <motion.div
        key={JSON.stringify(equation)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontSize: equation.isComplex ? '36px' : '48px',
          fontFamily: 'Baveuse, cursive',
          color: 'white',
          marginBottom: '30px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {equation.isComplex ? (
          <span>
            ({equation.a} {equation.op1} {equation.b}) {equation.op2}{' '}
            <span style={{ color: '#ffd700' }}>?</span> = {equation.finalResult}
          </span>
        ) : renderEquation()}
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
