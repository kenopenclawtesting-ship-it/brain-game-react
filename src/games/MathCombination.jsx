import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// MathCombination (Math Combo) - Build an equation that equals the target
// From SOURCE.md section 8.8:
//   Generate equation via CalculateElement tree, show result
//   Player fills in blank number/sign slots from selection cards
//   Extra decoy numbers and signs added based on difficulty
//   Points: +44 correct, -29 incorrect
//   At level >= 6 (odd rounds): equations with sub-expressions e.g. (3 + 5) x 2

const SIGN_PLUS = 0;
const SIGN_MINUS = 1;
const SIGN_MULTIPLY = 2;
const SIGN_DIVIDE = 3;
const NUM_SIGNS = 4;
const SIGN_STRING = ['+', '−', '×', '÷'];
const SIGN_COLORS = ['#E03030', '#38B6FF', '#F5A623', '#4CAF50'];
const EQUATION_SPLIT_START_LEVEL = 6;
const MAX_EXTRA_NUMBERS = 8;

// Sprite paths
const SYMBOL_CARD_SPRITE = '/sprites/DefineSprite_1015_SymbolCard';
const SIGN_CARD_SPRITE = '/sprites/DefineSprite_1021_SignCard';

function rnd(min, max) {
  if (min > max) { const t = min; min = max; max = t; }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// CalculateElement tree - mirrors ActionScript exactly
class CalculateElement {
  constructor(number = 0) {
    this.number = number;
    this.isRoot = true;
    this.sign = 0;
    this.element1 = null;
    this.element2 = null;
  }

  getResult() {
    if (this.isRoot) return this.number;
    const a = this.element1.getResult();
    const b = this.element2.getResult();
    switch (this.sign) {
      case SIGN_PLUS: return a + b;
      case SIGN_MINUS: return a - b;
      case SIGN_MULTIPLY: return a * b;
      case SIGN_DIVIDE: return Math.floor(a / b);
      default: return 0;
    }
  }

  setSign(s) {
    this.sign = s;
    this.isRoot = false;
    let a, b;
    const n = this.number;
    switch (s) {
      case SIGN_PLUS:
        a = rnd(Math.floor(n / 2), Math.floor(n * 3 / 4));
        b = n - a;
        break;
      case SIGN_MINUS:
        b = rnd(Math.floor(n / 4), Math.floor(n / 2));
        a = n + b;
        break;
      case SIGN_MULTIPLY: {
        const sq = Math.ceil(Math.sqrt(Math.max(1, n)));
        a = rnd(Math.ceil(sq / 2), Math.ceil(sq + sq / 2));
        b = a === 0 ? rnd(1, Math.max(1, n)) : Math.floor(n / a);
        break;
      }
      case SIGN_DIVIDE:
        b = Math.max(2, rnd(Math.ceil(n / 8), Math.ceil(n / 4)));
        a = b * n;
        break;
    }
    this.number = 0;
    this.element1 = new CalculateElement(a);
    this.element2 = new CalculateElement(b);
  }

  getSymbols() {
    const arr = [];
    this._getSymbolsInto(arr, false);
    return arr;
  }

  _getSymbolsInto(arr, nested) {
    if (this.isRoot) {
      arr.push({ type: 'number', value: '' + this.number });
    } else {
      if (nested) arr.push({ type: 'paren', value: '(' });
      this.element1._getSymbolsInto(arr, true);
      arr.push({ type: 'sign', value: SIGN_STRING[this.sign], signIndex: this.sign });
      this.element2._getSymbolsInto(arr, true);
      if (nested) arr.push({ type: 'paren', value: ')' });
    }
  }

  getNumberElements() {
    const arr = [];
    this._getNumberElementsInto(arr);
    return arr;
  }

  _getNumberElementsInto(arr) {
    if (this.isRoot) {
      arr.push(this);
    } else {
      this.element1._getNumberElementsInto(arr);
      this.element2._getNumberElementsInto(arr);
    }
  }

  getSignElements() {
    const arr = [];
    this._getSignElementsInto(arr);
    return arr;
  }

  _getSignElementsInto(arr) {
    if (!this.isRoot) {
      if (this.element1.isRoot && this.element2.isRoot) {
        arr.push(this);
      } else {
        this.element1._getSignElementsInto(arr);
        arr.push(this);
        this.element2._getSignElementsInto(arr);
      }
    }
  }

  isIdentical(other) {
    if (this.isRoot) return other.isRoot && other.number === this.number;
    return !other.isRoot && this.element1.isIdentical(other.element1) && this.element2.isIdentical(other.element2);
  }

  getString() {
    if (this.isRoot) return '' + this.number;
    return this.element1.getString() + ' ' + SIGN_STRING[this.sign] + ' ' + this.element2.getString();
  }
}

function getEquation(level, useSplit, history) {
  let eq, valid;
  do {
    let signType = rnd(0, NUM_SIGNS - 1);
    let adjLevel = level;
    if (signType === SIGN_DIVIDE) {
      adjLevel = Math.floor(adjLevel / 2);
    } else if (signType === SIGN_MULTIPLY) {
      adjLevel += 2;
    }
    const maxN = Math.min(10 + 3 * adjLevel, 99);
    const minN = Math.max(1, maxN - 10);
    const num = rnd(minN, maxN);
    eq = new CalculateElement(num);
    eq.setSign(signType);
    if (useSplit) {
      if (eq.sign === SIGN_DIVIDE) {
        eq.element1.setSign(rnd(0, NUM_SIGNS - 3)); // +, -
      } else {
        eq.element1.setSign(rnd(0, NUM_SIGNS - 2)); // +, -, x
      }
    }
    valid = true;
    if (history) {
      for (const h of history) {
        if (eq.isIdentical(h)) { valid = false; break; }
      }
    }
    // Also validate result is reasonable
    const result = eq.getResult();
    if (result < 0 || result > 999) valid = false;
  } while (!valid);
  return eq;
}

function MathCombination({ onAnswer, totalCorrect }) {
  const [puzzle, setPuzzle] = useState(null);
  const [answerSlots, setAnswerSlots] = useState([]); // filled values for answer slots
  const [feedback, setFeedback] = useState(null);
  const feedbackTimer = useRef(null);
  const historyRef = useRef([]);

  const generatePuzzle = useCallback(() => {
    let level = totalCorrect;
    const useSplit = level >= EQUATION_SPLIT_START_LEVEL && level % 2 === 1;
    if (useSplit) level -= EQUATION_SPLIT_START_LEVEL;

    const eq = getEquation(level, useSplit, historyRef.current);
    historyRef.current.push(eq);
    const answer = eq.getResult();
    const symbols = eq.getSymbols();
    const numberElements = eq.getNumberElements();
    const signElements = eq.getSignElements();

    // Build answer panel (slots to fill) and selection cards
    const slots = []; // { type: 'number'|'sign'|'paren', value, filled: false, filledValue, filledFrom }
    const selectionNumbers = [];
    const selectionSigns = [];

    symbols.forEach((sym) => {
      if (sym.type === 'paren') {
        slots.push({ type: 'paren', value: sym.value, filled: true });
      } else if (sym.type === 'sign') {
        slots.push({ type: 'sign', value: sym.value, signIndex: sym.signIndex, filled: false, filledFrom: null });
        selectionSigns.push({ value: sym.value, signIndex: sym.signIndex, id: 'sel-sign-' + selectionSigns.length, used: false });
      } else {
        slots.push({ type: 'number', value: sym.value, filled: false, filledFrom: null });
        selectionNumbers.push({ value: sym.value, id: 'sel-num-' + selectionNumbers.length, used: false });
      }
    });

    // Calculate extra decoys
    let extraSigns = 0, extraNumbers = 0;
    if (!useSplit) {
      extraSigns = Math.min(Math.floor(level / 5), 3);
      extraNumbers = 1 + Math.floor(level / 2.5) - extraSigns;
    } else {
      const adjLevel = level - EQUATION_SPLIT_START_LEVEL;
      extraSigns = Math.min(Math.floor(adjLevel / 5), 6);
      extraNumbers = Math.floor(adjLevel / 3) - extraSigns;
      // Check if all signs are same type
      const allSame = selectionSigns.every(s => s.signIndex === selectionSigns[0]?.signIndex);
      if (allSame) extraNumbers++;
    }
    extraNumbers = Math.min(Math.max(0, extraNumbers), MAX_EXTRA_NUMBERS);
    extraSigns = Math.max(0, extraSigns);

    // Add extra sign decoys
    const signCounts = [0, 0, 0, 0];
    selectionSigns.forEach(s => signCounts[s.signIndex]++);
    for (let i = 0; i < extraSigns; i++) {
      const candidates = [];
      for (let si = 0; si < NUM_SIGNS; si++) {
        if (signCounts[si] < slots.filter(s => s.type === 'sign').length) {
          candidates.push(si);
        }
      }
      if (candidates.length === 0) break;
      const pick = candidates[rnd(0, candidates.length - 1)];
      selectionSigns.push({ value: SIGN_STRING[pick], signIndex: pick, id: 'sel-sign-' + selectionSigns.length, used: false });
      signCounts[pick]++;
    }

    // Add extra number decoys
    for (let i = 0; i < extraNumbers; i++) {
      const decoyVal = '' + rnd(0, Math.floor(10 + totalCorrect * 1.5));
      selectionNumbers.push({ value: decoyVal, id: 'sel-num-' + selectionNumbers.length, used: false });
    }

    // Shuffle selections together
    const allSelections = [...selectionSigns, ...selectionNumbers];
    for (let i = allSelections.length - 1; i > 0; i--) {
      const j = rnd(0, i);
      [allSelections[i], allSelections[j]] = [allSelections[j], allSelections[i]];
    }
    // Assign random rotations
    allSelections.forEach(s => {
      s.rotation = s.signIndex !== undefined ? 0 : rnd(-15, 15);
    });

    setPuzzle({ answer, slots, selections: allSelections, numberElements, signElements, equation: eq });
    setAnswerSlots(slots.map(() => null));
    setFeedback(null);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
    return () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); };
  }, [generatePuzzle]);

  const handleSelectCard = (selIndex) => {
    if (feedback) return;
    const sel = puzzle.selections[selIndex];
    if (sel.used) return;

    // Find first empty matching slot
    const slotType = sel.signIndex !== undefined ? 'sign' : 'number';
    const slotIdx = puzzle.slots.findIndex((s, i) => s.type === slotType && !s.filled && answerSlots[i] === null);
    if (slotIdx === -1) return;

    const newSlots = [...answerSlots];
    newSlots[slotIdx] = { selIndex, value: sel.value, signIndex: sel.signIndex };

    const newSelections = puzzle.selections.map((s, i) => i === selIndex ? { ...s, used: true } : s);
    setPuzzle(p => ({ ...p, selections: newSelections }));
    setAnswerSlots(newSlots);

    // Check if all slots filled
    const allFilled = puzzle.slots.every((s, i) => s.type === 'paren' || s.filled || newSlots[i] !== null);
    if (allFilled) {
      // Evaluate: replace elements and compute
      const numElements = [...puzzle.numberElements];
      const signElements = [...puzzle.signElements];
      let numIdx = 0, signIdx = 0;
      const filledNumbers = [];
      const filledSigns = [];
      puzzle.slots.forEach((s, i) => {
        if (s.type === 'number') {
          filledNumbers.push(newSlots[i] ? parseInt(newSlots[i].value) : parseInt(s.value));
        } else if (s.type === 'sign') {
          filledSigns.push(newSlots[i] ? newSlots[i].signIndex : s.signIndex);
        }
      });

      // Clone equation and replace values
      numIdx = 0;
      numElements.forEach((el, i) => {
        if (i < filledNumbers.length) el.number = filledNumbers[i];
      });
      signIdx = 0;
      signElements.forEach((el, i) => {
        if (i < filledSigns.length) el.sign = filledSigns[i];
      });

      const result = puzzle.equation.getResult();
      const isCorrect = result === puzzle.answer;

      setFeedback(isCorrect ? 'correct' : 'wrong');
      feedbackTimer.current = setTimeout(() => {
        onAnswer(isCorrect);
      }, 600);
    }
  };

  const handleUnselectSlot = (slotIdx) => {
    if (feedback) return;
    const filled = answerSlots[slotIdx];
    if (!filled) return;

    const newSlots = [...answerSlots];
    newSlots[slotIdx] = null;
    setAnswerSlots(newSlots);

    const newSelections = puzzle.selections.map((s, i) => i === filled.selIndex ? { ...s, used: false } : s);
    setPuzzle(p => ({ ...p, selections: newSelections }));
  };

  if (!puzzle) return null;

  // Layout constants
  const CARD_SIZE = 52;
  const SIGN_SIZE = 48;
  const GAP = 8;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: '100%',
      paddingTop: '10px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background scene sprite */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${SYMBOL_CARD_SPRITE}/1.png)`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        opacity: 0,
      }} />

      {/* Target result number */}
      <motion.div
        key={puzzle.answer}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          fontSize: '64px',
          fontFamily: "'Luckiest Guy', cursive",
          color: '#2A2A2A',
          lineHeight: 1,
          textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
        }}
      >
        {puzzle.answer}
      </motion.div>

      {/* Equals sign */}
      <div style={{
        fontSize: '36px',
        fontFamily: "'Luckiest Guy', cursive",
        color: '#2A2A2A',
        lineHeight: 1,
        marginBottom: '12px',
      }}>
        =
      </div>

      {/* Answer slots row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${GAP}px`,
        marginBottom: '20px',
        minHeight: '60px',
        flexWrap: 'wrap',
      }}>
        {puzzle.slots.map((slot, idx) => {
          if (slot.type === 'paren') {
            return (
              <div key={`slot-${idx}`} style={{
                fontSize: '32px',
                fontFamily: "'Luckiest Guy', cursive",
                color: '#2A2A2A',
                width: '20px',
                textAlign: 'center',
              }}>
                {slot.value}
              </div>
            );
          }

          const filled = answerSlots[idx];
          const isSign = slot.type === 'sign';

          return (
            <motion.div
              key={`slot-${idx}`}
              whileHover={filled ? { scale: 1.1 } : {}}
              whileTap={filled ? { scale: 0.95 } : {}}
              onClick={() => handleUnselectSlot(idx)}
              style={{
                width: isSign ? `${SIGN_SIZE}px` : `${CARD_SIZE}px`,
                height: isSign ? `${SIGN_SIZE}px` : `${CARD_SIZE}px`,
                borderRadius: isSign ? '50%' : '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: filled ? 'pointer' : 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Use sprite images for slot backgrounds */}
              {filled ? (
                isSign ? (
                  // Filled sign - show colored sign card
                  <>
                    <img
                      src={`${SIGN_CARD_SPRITE}/${filled.signIndex + 1}.png`}
                      alt=""
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </>
                ) : (
                  // Filled number - show symbol card with number
                  <>
                    <img
                      src={`${SYMBOL_CARD_SPRITE}/1.png`}
                      alt=""
                      style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    <span style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: '22px',
                      fontFamily: "'Luckiest Guy', cursive",
                      color: '#2A2A2A',
                      fontWeight: 'bold',
                    }}>
                      {filled.value}
                    </span>
                  </>
                )
              ) : (
                // Empty slot - show ? placeholder
                isSign ? (
                  <img
                    src={`${SIGN_CARD_SPRITE}/5.png`}
                    alt="?"
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <img
                    src={`${SYMBOL_CARD_SPRITE}/2.png`}
                    alt="?"
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Divider line */}
      <div style={{
        width: '80%',
        height: '2px',
        background: 'rgba(0,0,0,0.1)',
        marginBottom: '16px',
        borderRadius: '1px',
      }} />

      {/* Selection cards grid */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        maxWidth: '500px',
        padding: '0 20px',
      }}>
        {puzzle.selections.map((sel, idx) => {
          const isSign = sel.signIndex !== undefined;
          return (
            <motion.div
              key={sel.id}
              initial={{ scale: 0, rotate: sel.rotation || 0 }}
              animate={{
                scale: sel.used ? 0.6 : 1,
                opacity: sel.used ? 0.3 : 1,
                rotate: sel.rotation || 0,
              }}
              whileHover={!sel.used ? { scale: 1.15 } : {}}
              whileTap={!sel.used ? { scale: 0.9 } : {}}
              onClick={() => handleSelectCard(idx)}
              style={{
                width: isSign ? `${SIGN_SIZE + 6}px` : `${CARD_SIZE + 10}px`,
                height: isSign ? `${SIGN_SIZE + 6}px` : `${CARD_SIZE + 10}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: sel.used ? 'default' : 'pointer',
                position: 'relative',
                pointerEvents: sel.used ? 'none' : 'auto',
              }}
            >
              {isSign ? (
                <img
                  src={`${SIGN_CARD_SPRITE}/${sel.signIndex + 1}.png`}
                  alt={sel.value}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <img
                    src={`${SYMBOL_CARD_SPRITE}/1.png`}
                    alt=""
                    style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <span style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '22px',
                    fontFamily: "'Luckiest Guy', cursive",
                    color: '#2A2A2A',
                    fontWeight: 'bold',
                  }}>
                    {sel.value}
                  </span>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '72px',
              zIndex: 10,
            }}
          >
            {feedback === 'correct' ? '✓' : '✗'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MathCombination;
