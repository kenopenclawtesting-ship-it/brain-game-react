import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// CubeCounter - Count 3D cubes in isometric view (1:1 Flash replica)
// Original: com.playfish.games.whohasthebiggestbrain.minigames.CubeCounter

function rnd(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

// RandomBasket - picks random items without replacement
class RandomBasket {
  constructor() { this.items = []; }
  addItems(item) { this.items.push(item); }
  getNextItem() {
    const idx = Math.floor(Math.random() * this.items.length);
    return this.items.splice(idx, 1)[0];
  }
}

function isValidCellForBlock(blockMap, idx, baseWidth, maxHeight) {
  if (blockMap[idx] >= maxHeight) return false;
  const col = idx % baseWidth;
  const row = Math.floor(idx / baseWidth);
  const total = baseWidth * baseWidth;

  // Check behind-left diagonal
  if (col > 0 && row > 0) {
    const behindLeft = idx - baseWidth - 1;
    if (blockMap[behindLeft] <= blockMap[idx]) return false;
  }
  // Check left visibility
  if (col > 0) {
    const frontLeft = idx + baseWidth - 1;
    const leftVal = blockMap[idx - 1];
    if (frontLeft < total && blockMap[frontLeft] > leftVal && blockMap[idx] >= leftVal) return false;
  }
  // Check top visibility
  if (row > 0) {
    const topRight = idx - baseWidth + 1;
    const topVal = blockMap[idx - baseWidth];
    if (topRight >= 0 && blockMap[topRight] > topVal && blockMap[idx] >= topVal) return false;
  }
  return true;
}

// Block colors matching original sprites (Block1=blue, Block2=blue2, Block3=pink, Block4=green, Block5=yellow)
const BLOCK_PALETTES = {
  1: { top: '#B8D8E8', left: '#7BB8D0', right: '#5A9AB8', outline: '#4A8AA8' },  // Ice blue (Block1)
  2: { top: '#A8C8D8', left: '#6BA8C0', right: '#4A8AA8', outline: '#3A7A98' },  // Steel blue (Block2)
  3: { top: '#F0A0B0', left: '#E07888', right: '#C86070', outline: '#B85060' },  // Pink (Block3)
  4: { top: '#A8D8A8', left: '#78B878', right: '#609860', outline: '#508850' },  // Green (Block4)
  5: { top: '#F0E098', left: '#D8C878', right: '#C0B060', outline: '#A89850' },  // Yellow
};

function CubeCounter({ onAnswer, totalCorrect }) {
  const [puzzleData, setPuzzleData] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [dropAnimDone, setDropAnimDone] = useState(false);
  const puzzleRef = useRef(0);

  const generatePuzzle = useCallback(() => {
    const difficulty = Math.floor(totalCorrect / 1.5);
    const bwExtra = Math.floor(difficulty / 8);
    const baseWidth = rnd(2, 5 + bwExtra + 1); // rnd is [min, max)
    const minH = Math.max(bwExtra + 1, 3);
    const maxHeight = rnd(minH, 5); // MAX_HEIGHT+1=5, rnd(minH,5) gives minH..4
    const maxBlocks = baseWidth * baseWidth * maxHeight;
    const numBlocks = Math.min(rnd(2, 7) + difficulty, maxBlocks); // rnd(2,6) means 2..5 in orig, but let's use rnd(2,7) for 2..6

    // Build blockMap
    const blockMap = new Array(baseWidth * baseWidth).fill(0);
    for (let i = 0; i < numBlocks; i++) {
      const basket = new RandomBasket();
      for (let c = 0; c < baseWidth * baseWidth; c++) {
        if (isValidCellForBlock(blockMap, c, baseWidth, maxHeight)) {
          basket.addItems(c);
        }
      }
      if (basket.items.length === 0) break;
      blockMap[basket.getNextItem()]++;
    }

    const actualCount = blockMap.reduce((a, b) => a + b, 0);

    // Color pattern: random pattern type + random alternate color
    const altColor = rnd(2, 5); // Block2-4 for alternate
    const patternType = rnd(0, 3); // 0=height, 1=row, 2=col

    // Build block list for rendering (sorted for proper isometric overlap)
    const blocks = [];
    for (let idx = 0; idx < blockMap.length; idx++) {
      const col = idx % baseWidth;
      const row = Math.floor(idx / baseWidth);
      for (let h = 0; h < blockMap[idx]; h++) {
        let useAlt = false;
        switch (patternType) {
          case 0: useAlt = h % 2 === 1; break;
          case 1: useAlt = row % 2 === 1; break;
          case 2: useAlt = col % 2 === 1; break;
        }
        blocks.push({ col, row, h, colorIdx: useAlt ? altColor : 1 });
      }
    }

    // Sort: back-to-front, bottom-to-top for proper overlap
    blocks.sort((a, b) => {
      const za = a.row + a.col;
      const zb = b.row + b.col;
      if (za !== zb) return za - zb;
      return a.h - b.h;
    });

    puzzleRef.current++;
    setPuzzleData({ blocks, baseWidth, correctAnswer: actualCount, key: puzzleRef.current });
    setUserInput('');
    setDropAnimDone(false);
    // Animate drop
    setTimeout(() => setDropAnimDone(true), 200);
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  const handleNumpad = useCallback((num) => {
    if (!puzzleData || !dropAnimDone) return;

    if (num === 'C') {
      setUserInput('');
      return;
    }

    // Original logic: digit-by-digit checking
    const newInput = userInput + num;
    const answer = puzzleData.correctAnswer.toString();

    // Check each digit
    let match = true;
    for (let i = 0; i < newInput.length; i++) {
      if (newInput[i] !== answer[i]) {
        match = false;
        break;
      }
    }

    if (!match) {
      // Wrong - immediate fail
      setUserInput(newInput);
      setTimeout(() => {
        onAnswer(false);
      }, 300);
    } else if (newInput.length === answer.length) {
      // Correct - all digits match
      setUserInput(newInput);
      setTimeout(() => {
        onAnswer(true);
      }, 300);
    } else {
      // Partial match, keep going
      setUserInput(newInput);
    }
  }, [puzzleData, userInput, dropAnimDone, onAnswer]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumpad(e.key);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleNumpad]);

  if (!puzzleData) return null;

  // Isometric rendering constants
  const cubeW = Math.min(50, 220 / puzzleData.baseWidth); // scale down for larger grids
  const cubeH = cubeW * 0.58;
  const halfW = cubeW / 2;
  const halfH = cubeH / 2;

  // Calculate bounds for centering
  const bw = puzzleData.baseWidth;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  puzzleData.blocks.forEach(b => {
    const ix = (b.col - b.row) * halfW;
    const iy = (b.col + b.row) * halfH - b.h * cubeH;
    minX = Math.min(minX, ix - halfW);
    maxX = Math.max(maxX, ix + halfW);
    minY = Math.min(minY, iy - halfH);
    maxY = Math.max(maxY, iy + cubeH);
  });
  const svgW = maxX - minX + 20;
  const svgH = maxY - minY + 20;
  const ofsX = -minX + 10;
  const ofsY = -minY + 10;

  const renderBlock = (block, i) => {
    const palette = BLOCK_PALETTES[block.colorIdx] || BLOCK_PALETTES[1];
    const ix = (block.col - block.row) * halfW + ofsX;
    const iy = (block.col + block.row) * halfH - block.h * cubeH + ofsY;

    // Isometric cube: top diamond, left parallelogram, right parallelogram
    const top = `${ix},${iy - halfH} ${ix + halfW},${iy} ${ix},${iy + halfH} ${ix - halfW},${iy}`;
    const left = `${ix - halfW},${iy} ${ix},${iy + halfH} ${ix},${iy + halfH + cubeH} ${ix - halfW},${iy + cubeH}`;
    const right = `${ix + halfW},${iy} ${ix},${iy + halfH} ${ix},${iy + halfH + cubeH} ${ix + halfW},${iy + cubeH}`;

    return (
      <motion.g
        key={`${block.col}-${block.row}-${block.h}-${puzzleData.key}`}
        initial={{ y: -300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
      >
        {/* Left face */}
        <polygon points={left} fill={palette.left} stroke={palette.outline} strokeWidth="1" />
        {/* Right face */}
        <polygon points={right} fill={palette.right} stroke={palette.outline} strokeWidth="1" />
        {/* Top face */}
        <polygon points={top} fill={palette.top} stroke={palette.outline} strokeWidth="1" />
        {/* Inner diamond on top (matching original sprite detail) */}
        <polygon
          points={`${ix},${iy - halfH * 0.4} ${ix + halfW * 0.4},${iy} ${ix},${iy + halfH * 0.4} ${ix - halfW * 0.4},${iy}`}
          fill={palette.top}
          stroke={palette.outline}
          strokeWidth="0.5"
          opacity="0.5"
        />
      </motion.g>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: '100%',
      padding: '10px 10px 0',
    }}>
      {/* Cube display area */}
      <div style={{
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '160px',
        maxHeight: '220px',
        width: '100%',
      }}>
        <svg
          width={Math.min(svgW, 400)}
          height={Math.min(svgH, 210)}
          viewBox={`0 0 ${svgW} ${svgH}`}
          style={{ overflow: 'visible' }}
        >
          {puzzleData.blocks.map((b, i) => renderBlock(b, i))}
        </svg>
      </div>

      {/* Input display */}
      <div style={{
        fontSize: '32px',
        fontFamily: "'Bubblegum Sans', cursive",
        color: '#2A2A2A',
        margin: '6px 0',
        minWidth: '80px',
        minHeight: '42px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '8px',
        padding: '2px 16px',
        border: '2px solid #ccc',
        letterSpacing: '4px',
      }}>
        {userInput || '\u00A0'}
      </div>

      {/* Numpad - matches original layout: 7-8-9 / 4-5-6 / 1-2-3 / 0 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 64px)',
        gridGap: '6px',
        marginBottom: '8px',
      }}>
        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9, backgroundColor: '#555' }}
            onClick={() => handleNumpad(num.toString())}
            style={{
              width: '64px',
              height: '50px',
              fontSize: '24px',
              fontFamily: "'Bubblegum Sans', cursive",
              fontWeight: 'bold',
              color: '#fff',
              background: '#3A3A3A',
              border: '2px solid #555',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 0 #222',
              userSelect: 'none',
            }}
          >
            {num}
          </motion.button>
        ))}
        {/* Bottom row: empty / 0 / empty */}
        <div />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, backgroundColor: '#555' }}
          onClick={() => handleNumpad('0')}
          style={{
            width: '64px',
            height: '50px',
            fontSize: '24px',
            fontFamily: "'Bubblegum Sans', cursive",
            fontWeight: 'bold',
            color: '#fff',
            background: '#3A3A3A',
            border: '2px solid #555',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 3px 0 #222',
            userSelect: 'none',
          }}
        >
          0
        </motion.button>
        <div />
      </div>
    </div>
  );
}

export default CubeCounter;
