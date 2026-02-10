import React, { useState, useEffect, useCallback, useRef } from 'react';

// SequenceMatch (Hex Path) - Match sequences on a hexagon grid
// Full 37 difficulty levels from original ActionScript

const DIFFICULTY_LEVEL_PARAMS = [
  { numRows:3, numColumes:2, numSequences:1, sequenceLength:2 },
  { numRows:3, numColumes:3, numSequences:1, sequenceLength:2 },
  { numRows:3, numColumes:3, numSequences:1, sequenceLength:3 },
  { numRows:3, numColumes:3, numSequences:1, sequenceLength:3 },
  { numRows:3, numColumes:4, numSequences:1, sequenceLength:3 },
  { numRows:3, numColumes:4, numSequences:1, sequenceLength:3 },
  { numRows:5, numColumes:4, numSequences:1, sequenceLength:3 },
  { numRows:5, numColumes:4, numSequences:1, sequenceLength:3 },
  { numRows:5, numColumes:4, numSequences:1, sequenceLength:4 },
  { numRows:5, numColumes:4, numSequences:1, sequenceLength:4 },
  { numRows:5, numColumes:5, numSequences:2, sequenceLength:3 },
  { numRows:5, numColumes:5, numSequences:2, sequenceLength:3 },
  { numRows:5, numColumes:6, numSequences:2, sequenceLength:3 },
  { numRows:5, numColumes:6, numSequences:2, sequenceLength:3 },
  { numRows:5, numColumes:6, numSequences:2, sequenceLength:4 },
  { numRows:5, numColumes:6, numSequences:2, sequenceLength:4 },
  { numRows:5, numColumes:7, numSequences:2, sequenceLength:4 },
  { numRows:5, numColumes:7, numSequences:2, sequenceLength:4 },
  { numRows:5, numColumes:7, numSequences:2, sequenceLength:5 },
  { numRows:5, numColumes:7, numSequences:2, sequenceLength:5 },
  { numRows:5, numColumes:7, numSequences:3, sequenceLength:4 },
  { numRows:7, numColumes:7, numSequences:3, sequenceLength:4 },
  { numRows:7, numColumes:7, numSequences:3, sequenceLength:4 },
  { numRows:7, numColumes:8, numSequences:3, sequenceLength:4 },
  { numRows:7, numColumes:8, numSequences:3, sequenceLength:5 },
  { numRows:7, numColumes:8, numSequences:3, sequenceLength:5 },
  { numRows:7, numColumes:9, numSequences:3, sequenceLength:5 },
  { numRows:7, numColumes:9, numSequences:3, sequenceLength:5 },
  { numRows:7, numColumes:10, numSequences:3, sequenceLength:5 },
  { numRows:7, numColumes:10, numSequences:3, sequenceLength:5 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:5 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:5 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:5 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:6 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:6 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:6 },
  { numRows:7, numColumes:10, numSequences:4, sequenceLength:6 },
];

// 10 hex colors matching HexagonPieces frames (pink, green, yellow, blue, orange, purple, gray, cream, dark gray, teal)
const HEX_COLORS = [
  { bg: '#F2929B', border: '#D87A82', icon: '🍎' },   // 0 pink/red
  { bg: '#C4D64A', border: '#A3B23E', icon: '🌿' },   // 1 lime green
  { bg: '#FFF59D', border: '#E0D68A', icon: '🧀' },   // 2 light yellow
  { bg: '#90CAF9', border: '#6FA8D6', icon: '☕' },    // 3 light blue
  { bg: '#FFB74D', border: '#E09A3A', icon: '🍊' },   // 4 orange
  { bg: '#CE93D8', border: '#B07ABF', icon: '🧁' },   // 5 purple/lavender
  { bg: '#B0BEC5', border: '#8FA0A8', icon: '🫖' },   // 6 gray
  { bg: '#FFE0B2', border: '#E0C49A', icon: '🍞' },   // 7 cream
  { bg: '#78909C', border: '#5D7380', icon: '🍬' },   // 8 dark gray
  { bg: '#80CBC4', border: '#5FAFa7', icon: '🥦' },   // 9 teal
];

// Shape group sets (6 groups like original SHAPE_GROUP_INDICES = [0,1,2,3,4,6])
const SHAPE_GROUPS = [
  ['🍎','🍊','🧀','🫖','🍬','🥦','🧁','🍞','🌿','☕'],
  ['⭐','💎','🔔','🎈','🎀','🌸','🍄','🎯','🏀','⚽'],
  ['🐱','🐶','🐸','🐰','🐻','🐼','🐨','🦊','🐷','🐵'],
  ['👟','👜','🎩','👓','⌚','💍','🧤','🧣','👑','🎒'],
  ['🌺','🌻','🌹','🌷','🌼','🌸','💐','🪻','🌾','🍀'],
  ['🎸','🎺','🥁','🎹','🎻','🪗','🎷','🪈','🎵','🎶'],
];

const HEX_WIDTH = 58;
const HEX_HEIGHT = 52;
const HEX_Y_OFFSET = 42;

function SequenceMatch({ onAnswer, totalCorrect }) {
  const [hexagons, setHexagons] = useState([]);
  const [grid2d, setGrid2d] = useState([]);
  const [finalSequences, setFinalSequences] = useState([]);
  const [curSequence, setCurSequence] = useState([]);
  const [completedSeqs, setCompletedSeqs] = useState([]);
  const [shapeGroup, setShapeGroup] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const puzzleRef = useRef(0);
  const isDragging = useRef(false);

  const generatePuzzle = useCallback(() => {
    const level = Math.min(totalCorrect, DIFFICULTY_LEVEL_PARAMS.length - 1);
    const params = DIFFICULTY_LEVEL_PARAMS[level];
    const { numRows, numColumes, numSequences, sequenceLength } = params;

    const midRow = Math.floor(numRows / 2);
    const baseCols = numColumes - midRow;

    // Build diamond hex grid (like original)
    const newGrid2d = [];
    const newHexagons = [];
    let id = 0;

    for (let r = 0; r < numRows; r++) {
      newGrid2d[r] = [];
      let rowOffset, startCol;
      if (r <= midRow) {
        rowOffset = r;
        startCol = 0;
      } else {
        rowOffset = numRows - 1 - r;
        startCol = r - midRow;
      }
      const totalCols = startCol + baseCols + rowOffset;

      for (let c = 0; c < totalCols; c++) {
        if (c < startCol) {
          newGrid2d[r][c] = null;
        } else {
          const shapeIndex = Math.floor(Math.random() * 10);
          const hex = {
            id: id++,
            row: r,
            col: c,
            shapeIndex,
            x: c * HEX_WIDTH + (r <= midRow ? -r * HEX_WIDTH / 2 : -(numRows - 1 - r) * HEX_WIDTH / 2),
            y: r * HEX_Y_OFFSET,
          };
          newGrid2d[r][c] = hex;
          newHexagons.push(hex);
        }
      }
    }

    // Pick shape group
    const groupIdx = Math.floor(Math.random() * SHAPE_GROUPS.length);
    setShapeGroup(groupIdx);

    // Generate sequences (adjacent paths through the grid)
    const newSequences = [];
    for (let s = 0; s < numSequences; s++) {
      let seq = [];
      let attempts = 0;
      while (seq.length < sequenceLength && attempts < 200) {
        if (seq.length === 0) {
          seq.push(newHexagons[Math.floor(Math.random() * newHexagons.length)]);
        } else {
          const last = seq[seq.length - 1];
          const adj = getAdjacentHexagons(last, newGrid2d, seq);
          if (adj.length === 0) {
            // Restart this sequence
            seq = [];
            attempts++;
          } else {
            seq.push(adj[Math.floor(Math.random() * adj.length)]);
          }
        }
      }
      if (seq.length === sequenceLength) {
        newSequences.push(seq);
      }
    }

    setHexagons(newHexagons);
    setGrid2d(newGrid2d);
    setFinalSequences(newSequences);
    setCurSequence([]);
    setCompletedSeqs([]);
    setFadeIn(0);
    puzzleRef.current++;
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Fade in effect
  useEffect(() => {
    if (fadeIn < 1) {
      const t = setTimeout(() => setFadeIn(f => Math.min(1, f + 0.15)), 30);
      return () => clearTimeout(t);
    }
  }, [fadeIn]);

  function getAdjacentHexagons(hex, g, exclude) {
    const adj = [];
    const r = hex.row;
    const c = hex.col;
    // Top-left: row-1, col-1
    if (r > 0 && g[r-1] && g[r-1][c-1]) adj.push(g[r-1][c-1]);
    // Top-right: row-1, col
    if (r > 0 && g[r-1] && g[r-1][c]) adj.push(g[r-1][c]);
    // Left: row, col-1
    if (g[r] && g[r][c-1]) adj.push(g[r][c-1]);
    // Right: row, col+1
    if (g[r] && g[r][c+1]) adj.push(g[r][c+1]);
    // Bottom-left: row+1, col
    if (r < g.length-1 && g[r+1] && g[r+1][c]) adj.push(g[r+1][c]);
    // Bottom-right: row+1, col+1
    if (r < g.length-1 && g[r+1] && g[r+1][c+1]) adj.push(g[r+1][c+1]);
    return adj.filter(h => h && !exclude.find(e => e.id === h.id));
  }

  function isAdjacent(a, b) {
    const adjList = getAdjacentHexagons(a, grid2d, []);
    return adjList.some(h => h.id === b.id);
  }

  function handleHexClick(hex) {
    if (finalSequences.length === 0) return;

    const cur = [...curSequence];

    // Click last selected -> deselect it
    if (cur.length > 0 && hex.id === cur[cur.length - 1].id) {
      cur.pop();
      setCurSequence(cur);
      return;
    }

    // Click first in sequence (with 2+ selected) -> reset
    if (cur.length > 1 && hex.id === cur[0].id) {
      setCurSequence([]);
      return;
    }

    // Click second-to-last -> backtrack
    if (cur.length >= 2 && hex.id === cur[cur.length - 2].id) {
      cur.pop();
      setCurSequence(cur);
      return;
    }

    // Not in sequence and adjacent -> add
    if (!cur.find(h => h.id === hex.id)) {
      if (cur.length === 0) {
        setCurSequence([hex]);
        checkMatch([hex]);
        return;
      }
      if (isAdjacent(cur[cur.length - 1], hex)) {
        const newCur = [...cur, hex];
        setCurSequence(newCur);
        checkMatch(newCur);
        return;
      }
      // Not adjacent -> restart from this hex
      setCurSequence([hex]);
      return;
    }
  }

  function checkMatch(currentSeq) {
    // Check if current sequence length matches any remaining sequence length
    let lengthMatches = false;
    for (const seq of finalSequences) {
      if (seq.length === currentSeq.length) {
        lengthMatches = true;
        break;
      }
    }
    if (!lengthMatches) return;

    // Check each remaining sequence for match (forward or backward by shapeIndex)
    for (let i = 0; i < finalSequences.length; i++) {
      if (completedSeqs.includes(i)) continue;
      const seq = finalSequences[i];
      if (seq.length !== currentSeq.length) continue;

      // Forward match
      let fwd = true;
      for (let j = 0; j < currentSeq.length; j++) {
        if (currentSeq[j].shapeIndex !== seq[j].shapeIndex) { fwd = false; break; }
      }
      // Backward match
      let bwd = true;
      if (!fwd) {
        for (let j = 0; j < currentSeq.length; j++) {
          if (currentSeq[currentSeq.length - 1 - j].shapeIndex !== seq[j].shapeIndex) { bwd = false; break; }
        }
      }

      if (fwd || bwd) {
        // Correct match!
        const newCompleted = [...completedSeqs, i];
        setCompletedSeqs(newCompleted);
        setCurSequence([]);

        if (newCompleted.length >= finalSequences.length) {
          // All sequences matched
          onAnswer(true);
          setTimeout(generatePuzzle, 500);
        } else {
          onAnswer(true);
        }
        return;
      }
    }

    // Length matched but no sequence matched -> incorrect
    onAnswer(false);
    setCurSequence([]);
  }

  // Calculate grid bounds for centering
  const allX = hexagons.map(h => h.x);
  const allY = hexagons.map(h => h.y);
  const minX = Math.min(...allX, 0);
  const maxX = Math.max(...allX, 0);
  const minY = Math.min(...allY, 0);
  const maxY = Math.max(...allY, 0);
  const gridW = maxX - minX + HEX_WIDTH;
  const gridH = maxY - minY + HEX_HEIGHT;

  // Sequence panel height
  const seqRows = Math.ceil(finalSequences.length / 2);
  const seqPanelH = seqRows * (HEX_HEIGHT + 10) + 10;

  // Available space and scaling
  const availH = 430;
  const gridAreaH = availH - seqPanelH - 15;
  const scaleGrid = Math.min(1, Math.min(700 / gridW, gridAreaH / gridH));
  const scaleSeq = Math.min(1, 700 / (finalSequences.length <= 2 ? finalSequences.reduce((w, s) => w + s.length * 52 + 30, 0) : 700));

  const isSelected = (hex) => curSequence.some(h => h.id === hex.id);

  // Draw connection lines between selected hexagons
  function renderLines() {
    if (curSequence.length < 2) return null;
    const lines = [];
    for (let i = 1; i < curSequence.length; i++) {
      const a = curSequence[i - 1];
      const b = curSequence[i];
      const ax = (a.x - minX) * scaleGrid + HEX_WIDTH * scaleGrid / 2;
      const ay = (a.y - minY) * scaleGrid + HEX_HEIGHT * scaleGrid / 2;
      const bx = (b.x - minX) * scaleGrid + HEX_WIDTH * scaleGrid / 2;
      const by = (b.y - minY) * scaleGrid + HEX_HEIGHT * scaleGrid / 2;
      // Arrow line
      const angle = Math.atan2(by - ay, bx - ax);
      const len = Math.sqrt((bx-ax)**2 + (by-ay)**2);
      lines.push(
        <div key={`line-${i}`} style={{
          position: 'absolute',
          left: ax, top: ay,
          width: len, height: 4,
          background: 'rgba(255,60,60,0.8)',
          borderRadius: 2,
          transform: `rotate(${angle}rad)`,
          transformOrigin: '0 50%',
          zIndex: 50,
          pointerEvents: 'none',
        }}>
          {/* Arrow head */}
          <div style={{
            position: 'absolute',
            right: -4, top: -6,
            width: 0, height: 0,
            borderLeft: '10px solid rgba(255,60,60,0.9)',
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
          }}/>
        </div>
      );
    }
    return lines;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '10px 20px',
      opacity: fadeIn,
      transition: 'opacity 0.2s',
      userSelect: 'none',
    }}>
      {/* Background scene - ice blue hexagon */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/sprites/DefineSprite_1040_SequenceMatchScene/1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.3,
        pointerEvents: 'none',
      }}/>

      {/* Hex grid */}
      <div style={{
        position: 'relative',
        width: gridW * scaleGrid,
        height: gridH * scaleGrid,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        {renderLines()}
        {hexagons.map(hex => {
          const sel = isSelected(hex);
          const col = HEX_COLORS[hex.shapeIndex];
          const icon = SHAPE_GROUPS[shapeGroup][hex.shapeIndex];
          const hx = (hex.x - minX) * scaleGrid;
          const hy = (hex.y - minY) * scaleGrid;
          const size = HEX_WIDTH * scaleGrid;
          const hSize = HEX_HEIGHT * scaleGrid;

          return (
            <div
              key={hex.id}
              onClick={() => handleHexClick(hex)}
              style={{
                position: 'absolute',
                left: hx,
                top: hy,
                width: size,
                height: hSize,
                cursor: 'pointer',
                zIndex: sel ? 10 : 1,
                transition: 'transform 0.1s, filter 0.1s',
                transform: sel ? 'scale(1.08)' : 'scale(1)',
                filter: sel ? 'drop-shadow(0 0 8px rgba(112,134,156,1))' : 'none',
              }}
            >
              {/* Hexagon shape via clip-path */}
              <div style={{
                width: '100%',
                height: '100%',
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                background: sel
                  ? `linear-gradient(135deg, ${col.border}, ${col.border})`
                  : `linear-gradient(135deg, ${col.bg}, ${col.border})`,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: Math.max(16, size * 0.42),
                position: 'relative',
              }}>
                {/* White inner highlight */}
                <div style={{
                  position: 'absolute',
                  inset: '3px',
                  clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                  background: sel
                    ? `linear-gradient(180deg, ${col.border}dd, ${col.border})`
                    : `linear-gradient(180deg, ${col.bg}, ${col.border}88)`,
                  pointerEvents: 'none',
                }}/>
                <span style={{
                  position: 'relative',
                  zIndex: 2,
                  lineHeight: 1,
                  filter: sel ? 'brightness(1.3)' : 'none',
                }}>{icon}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sequence panels at bottom */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px 24px',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        flexShrink: 0,
        maxWidth: '100%',
      }}>
        {finalSequences.map((seq, si) => {
          const done = completedSeqs.includes(si);
          return (
            <div key={si} style={{
              display: 'flex',
              gap: 2,
              opacity: done ? 0.2 : 1,
              transition: 'opacity 0.5s',
              alignItems: 'center',
            }}>
              {seq.map((hex, hi) => {
                const col = HEX_COLORS[hex.shapeIndex];
                const icon = SHAPE_GROUPS[shapeGroup][hex.shapeIndex];
                const pieceSize = Math.min(48, 48 * scaleSeq);
                return (
                  <React.Fragment key={hi}>
                    <div style={{
                      width: pieceSize,
                      height: pieceSize * 0.88,
                      clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                      background: `linear-gradient(135deg, ${col.bg}, ${col.border})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: pieceSize * 0.45,
                    }}>
                      {icon}
                    </div>
                    {hi < seq.length - 1 && (
                      <span style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 10,
                      }}>▸</span>
                    )}
                  </React.Fragment>
                );
              })}
              {done && <span style={{ color: '#69f0ae', fontSize: 20, marginLeft: 4 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SequenceMatch;
