import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Calculate (Missing Number) - Solve arithmetic equations
// From SOURCE.md section 8.1:
//   difficulty = Math.floor(totalCorrect / 3.5)
//   Numbers range: 1 to min(10 + difficulty*3, 99)
//   Operators: +, -, ×, ÷
//   At difficulty >= 3 and odd rounds: complex equations like (3 + 2) * ? = 20
//   Points: +27 correct, -18 incorrect

function Calculate({ onAnswer, totalCorrect }) {
  const [equation, setEquation] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const feedbackTimer = useRef(null);

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

      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      if (op1 === '+') {
        innerResult = a + b;
      } else {
        if (a < b) [a, b] = [b, a];
        innerResult = a - b;
        if (innerResult === 0) { a += 1; innerResult = a - b; }
      }

      switch (op2) {
        case '+':
          c = Math.floor(Math.random() * 20) + 1;
          finalResult = innerResult + c;
          break;
        case '-':
          c = Math.floor(Math.random() * Math.max(innerResult - 1, 1)) + 1;
          finalResult = innerResult - c;
          break;
        case '×':
          c = Math.floor(Math.random() * 10) + 1;
          finalResult = innerResult * c;
          break;
        case '÷':
          c = Math.floor(Math.random() * 9) + 2;
          finalResult = innerResult;
          innerResult = c * finalResult;
          // Recalculate a, b
          if (op1 === '+') {
            a = Math.floor(innerResult / 2);
            b = innerResult - a;
          } else {
            b = Math.floor(Math.random() * 10) + 1;
            a = innerResult + b;
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
      });
    } else {
      // Simple equation: a op b = answer, one value missing
      const op = operators[Math.floor(Math.random() * 4)];
      let a, b, answer;

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

      const missingPos = Math.floor(Math.random() * 3);
      const missingValue = missingPos === 0 ? a : missingPos === 1 ? b : answer;

      setEquation({
        isComplex: false,
        a, b, op, answer, missingPos, missingValue,
      });
    }

    setUserInput('');
    setFeedback(null);
  }, [totalCorrect]);

  useEffect(() => {
    generateEquation();
  }, [generateEquation]);

  useEffect(() => {
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, []);

  const handleSubmit = useCallback(() => {
    if (!equation || userInput === '') return;
    const isCorrect = parseInt(userInput, 10) === equation.missingValue;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => {
      onAnswer(isCorrect);
      generateEquation();
    }, 350);
  }, [equation, userInput, onAnswer, generateEquation]);

  const handleNumpad = useCallback((key) => {
    if (key === 'C') {
      setUserInput('');
    } else if (key === 'OK') {
      handleSubmit();
    } else if (userInput.length < 4) {
      setUserInput(prev => prev + key);
    }
  }, [handleSubmit, userInput.length]);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      if (e.key >= '0' && e.key <= '9') handleNumpad(e.key);
      else if (e.key === 'Enter') handleNumpad('OK');
      else if (e.key === 'Backspace' || e.key === 'Delete') handleNumpad('C');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNumpad]);

  if (!equation) return null;

  // Build equation string parts
  const renderEquationParts = () => {
    if (equation.isComplex) {
      return [
        { text: '(', isMissing: false },
        { text: String(equation.a), isMissing: false },
        { text: ` ${equation.op1} `, isMissing: false },
        { text: String(equation.b), isMissing: false },
        { text: ') ', isMissing: false },
        { text: equation.op2, isMissing: false },
        { text: ' ', isMissing: false },
        { text: '?', isMissing: true },
        { text: ' = ', isMissing: false },
        { text: String(equation.finalResult), isMissing: false },
      ];
    }

    const { a, b, op, answer, missingPos } = equation;
    return [
      { text: missingPos === 0 ? '?' : String(a), isMissing: missingPos === 0 },
      { text: ` ${op} `, isMissing: false },
      { text: missingPos === 1 ? '?' : String(b), isMissing: missingPos === 1 },
      { text: ' = ', isMissing: false },
      { text: missingPos === 2 ? '?' : String(answer), isMissing: missingPos === 2 },
    ];
  };

  const parts = renderEquationParts();

  // Numpad layout: 7-8-9 / 4-5-6 / 1-2-3 / 0
  const numpadRows = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0'],
  ];

  return (
    <div style={styles.container}>
      {/* Background decorative shapes */}
      <div style={styles.bgShape1} />
      <div style={styles.bgShape2} />

      {/* Equation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={JSON.stringify(equation)}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={styles.equationRow}
        >
          {parts.map((p, i) => (
            <span key={i} style={p.isMissing ? styles.missingText : styles.equationText}>
              {p.text}
            </span>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Input display */}
      <div style={{
        ...styles.inputBox,
        borderColor: feedback === 'correct' ? '#4caf50' : feedback === 'wrong' ? '#f44336' : '#1565c0',
        background: feedback === 'correct' ? 'rgba(76,175,80,0.15)' : feedback === 'wrong' ? 'rgba(244,67,54,0.15)' : 'rgba(255,255,255,0.95)',
      }}>
        <span style={styles.inputText}>
          {userInput || ''}
        </span>
        {!userInput && <span style={styles.inputCursor}>_</span>}
      </div>

      {/* Numpad + C + OK */}
      <div style={styles.numpadContainer}>
        <div style={styles.numpadGrid}>
          {numpadRows.map((row, ri) => (
            <div key={ri} style={{
              ...styles.numpadRow,
              justifyContent: row.length === 1 ? 'center' : 'center',
            }}>
              {row.map((num) => (
                <motion.button
                  key={num}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNumpad(num)}
                  style={styles.numButton}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(66,133,244,0.6), inset 0 1px 0 rgba(255,255,255,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
                  }}
                >
                  {num}
                </motion.button>
              ))}
            </div>
          ))}
        </div>

        {/* C and OK buttons on the right side */}
        <div style={styles.sideButtons}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNumpad('C')}
            style={styles.clearButton}
          >
            C
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNumpad('OK')}
            style={styles.okButton}
          >
            OK
          </motion.button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  // Faint decorative background shapes (like original)
  bgShape1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    width: 120,
    height: 120,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    transform: 'rotate(15deg)',
    pointerEvents: 'none',
  },
  bgShape2: {
    position: 'absolute',
    bottom: '8%',
    right: '8%',
    width: 100,
    height: 100,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  equationRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  equationText: {
    fontSize: 48,
    fontFamily: "'Luckiest Guy', cursive",
    color: '#2A2A2A',
    letterSpacing: 2,
    textShadow: '1px 2px 3px rgba(0,0,0,0.12)',
  },
  missingText: {
    fontSize: 52,
    fontFamily: "'Luckiest Guy', cursive",
    color: '#1565c0',
    letterSpacing: 2,
    textShadow: '0 2px 8px rgba(21,101,192,0.3)',
    background: 'rgba(21,101,192,0.08)',
    borderRadius: 8,
    padding: '0 8px',
  },
  inputBox: {
    minWidth: 120,
    minHeight: 52,
    borderRadius: 12,
    border: '3px solid #1565c0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    padding: '4px 16px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  inputText: {
    fontSize: 40,
    fontFamily: "'Luckiest Guy', cursive",
    color: '#1a237e',
    letterSpacing: 3,
  },
  inputCursor: {
    fontSize: 40,
    fontFamily: "'Luckiest Guy', cursive",
    color: '#90a4ae',
    animation: 'blink 1s step-end infinite',
  },
  numpadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  numpadGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  numpadRow: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
  },
  // Glossy red/crimson 3D beveled buttons with blue border (matching original sprites)
  numButton: {
    width: 64,
    height: 58,
    borderRadius: 10,
    border: '2.5px solid #3a6ea5',
    background: 'linear-gradient(180deg, #b22830 0%, #8b1a1a 40%, #6d1515 100%)',
    color: '#fff',
    fontSize: 28,
    fontFamily: "'Luckiest Guy', cursive",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    transition: 'box-shadow 0.15s',
    outline: 'none',
    position: 'relative',
    userSelect: 'none',
  },
  sideButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginLeft: 4,
  },
  clearButton: {
    width: 64,
    height: 80,
    borderRadius: 10,
    border: '2.5px solid #3a6ea5',
    background: 'linear-gradient(180deg, #e67e22 0%, #d35400 50%, #a04000 100%)',
    color: '#fff',
    fontSize: 26,
    fontFamily: "'Luckiest Guy', cursive",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    outline: 'none',
    userSelect: 'none',
  },
  okButton: {
    width: 64,
    height: 80,
    borderRadius: 10,
    border: '2.5px solid #3a6ea5',
    background: 'linear-gradient(180deg, #27ae60 0%, #1e8449 50%, #145a32 100%)',
    color: '#fff',
    fontSize: 22,
    fontFamily: "'Luckiest Guy', cursive",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    outline: 'none',
    userSelect: 'none',
  },
};

export default Calculate;
