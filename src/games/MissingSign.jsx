import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// MissingSign - Find the missing operator (+, -, ×, ÷)
// From SOURCE.md §8.3: Format "3 ? 2 = 5" → answer is "+"
// Points: +20 correct, -12 incorrect
// Difficulty increases equation complexity (mirroring Calculate's pattern)

const OPERATORS = ['+', '-', '×', '÷'];

// Operator button colors matching the original Flash game sprites
const OP_STYLES = {
  '+': { bg: '#E05050', border: '#C03030', icon: '/sprites/DefineSprite_1021_SignCard/1.png' },
  '-': { bg: '#50A8E0', border: '#3080C0', icon: '/sprites/DefineSprite_1021_SignCard/2.png' },
  '×': { bg: '#E8B830', border: '#C89818', icon: '/sprites/DefineSprite_1021_SignCard/3.png' },
  '÷': { bg: '#50B850', border: '#309830', icon: '/sprites/DefineSprite_1021_SignCard/4.png' },
};

function MissingSign({ onAnswer, totalCorrect }) {
  const [equation, setEquation] = useState(null);
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const feedbackTimer = useRef(null);

  const generateEquation = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 3.5);
    const maxNum = Math.min(10 + difficulty * 3, 99);

    const op = OPERATORS[Math.floor(Math.random() * 4)];
    let a, b, result;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        result = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 2;
        b = Math.floor(Math.random() * (a - 1)) + 1;
        result = a - b;
        break;
      case '×':
        a = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
        b = Math.floor(Math.random() * Math.min(12, maxNum)) + 1;
        result = a * b;
        break;
      case '÷':
        b = Math.floor(Math.random() * 12) + 1;
        result = Math.floor(Math.random() * 12) + 1;
        a = b * result;
        break;
      default:
        a = 1; b = 1; result = 2;
    }

    setEquation({ a, b, op, result });
    setFeedback(null);
  }, [totalCorrect]);

  useEffect(() => {
    generateEquation();
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, [generateEquation]);

  const handleAnswer = (selectedOp) => {
    if (!equation || feedback) return;
    const isCorrect = selectedOp === equation.op;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    onAnswer(isCorrect);

    feedbackTimer.current = setTimeout(() => {
      generateEquation();
    }, 400);
  };

  if (!equation) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      gap: '10px',
    }}>
      {/* Equation display - matches tutorial: "22 [?] 8 =30" */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${equation.a}-${equation.op}-${equation.b}`}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          {/* Number A */}
          <span style={{
            fontSize: '64px',
            fontFamily: "'Luckiest Guy', 'Baveuse', cursive",
            color: '#2A2A2A',
            lineHeight: 1,
          }}>{equation.a}</span>

          {/* Missing sign card - white rounded square with dark border like tutorial */}
          <div style={{
            width: '72px',
            height: '72px',
            background: '#FAFAFA',
            border: '4px solid #555',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            position: 'relative',
          }}>
            {/* Question mark sign card sprite */}
            <img
              src="/sprites/DefineSprite_1021_SignCard/5.png"
              alt="?"
              style={{ width: '52px', height: '52px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span style={{
              display: 'none',
              fontSize: '44px',
              fontFamily: "'Luckiest Guy', cursive",
              color: '#E8B830',
              alignItems: 'center',
              justifyContent: 'center',
            }}>?</span>
          </div>

          {/* Number B */}
          <span style={{
            fontSize: '64px',
            fontFamily: "'Luckiest Guy', 'Baveuse', cursive",
            color: '#2A2A2A',
            lineHeight: 1,
          }}>{equation.b}</span>

          {/* Equals */}
          <span style={{
            fontSize: '56px',
            fontFamily: "'Luckiest Guy', 'Baveuse', cursive",
            color: '#2A2A2A',
            lineHeight: 1,
          }}>=</span>

          {/* Result */}
          <span style={{
            fontSize: '64px',
            fontFamily: "'Luckiest Guy', 'Baveuse', cursive",
            color: '#2A2A2A',
            lineHeight: 1,
          }}>{equation.result}</span>
        </motion.div>
      </AnimatePresence>

      {/* Operator buttons bar - dark background like tutorial */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: '#2A2A2A',
        borderRadius: '16px',
        padding: '12px 16px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
      }}>
        {OPERATORS.map((op) => {
          const style = OP_STYLES[op];
          const isSelected = feedback && equation.op === op;
          return (
            <motion.button
              key={op}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleAnswer(op)}
              style={{
                width: '80px',
                height: '80px',
                background: style.bg,
                border: `3px solid ${style.border}`,
                borderRadius: '14px',
                cursor: feedback ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                boxShadow: isSelected
                  ? '0 0 20px rgba(255,255,255,0.6)'
                  : '0 3px 8px rgba(0,0,0,0.3)',
                opacity: feedback && !isSelected ? 0.5 : 1,
                transition: 'opacity 0.2s, box-shadow 0.2s',
              }}
            >
              <img
                src={style.icon}
                alt={op}
                style={{ width: '54px', height: '54px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <span style={{
                display: 'none',
                fontSize: '40px',
                fontFamily: "'Luckiest Guy', cursive",
                color: 'white',
                alignItems: 'center',
                justifyContent: 'center',
              }}>{op}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default MissingSign;
