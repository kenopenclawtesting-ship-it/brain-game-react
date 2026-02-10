import React, { useState, useEffect, useCallback, useRef } from 'react';

// JigsawMatch - Match jigsaw pieces to their outlines
// Original: Show a picture with missing pieces, player clicks the correct piece from options below
// Pieces are actual picture fragments masked by jigsaw piece shapes
// Points: +19 correct, -13 incorrect

// 5 pictures from JigsawPics (DefineSprite_545)
const JIGSAW_PICS = [
  '/sprites/DefineSprite_545_JigsawPics/1.png',
  '/sprites/DefineSprite_545_JigsawPics/2.png',
  '/sprites/DefineSprite_545_JigsawPics/3.png',
  '/sprites/DefineSprite_545_JigsawPics/4.png',
  '/sprites/DefineSprite_545_JigsawPics/5.png',
];

// 15 piece mask shapes from JigsawPieces (DefineSprite_586)
const PIECE_MASKS = Array.from({ length: 15 }, (_, i) =>
  `/sprites/DefineSprite_586_JigsawPieces/${i + 1}.png`
);

// Background scene
const SCENE_BG = '/sprites/DefineSprite_624_JigsawScene/1.png';

// Jigsaw piece side definitions from ActionScript (tab=1, blank=-1, flat=0)
// [top, right, bottom, left]
const JIGSAW_PIECE_SIDE = [
  [0,1,1,0],    // 0
  [0,-1,-1,0],  // 1
  [0,-1,1,0],   // 2
  [1,1,1,0],    // 3
  [-1,-1,-1,0], // 4
  [-1,1,-1,0],  // 5
  [1,-1,1,0],   // 6
  [1,-1,-1,0],  // 7
  [1,1,-1,0],   // 8
  [1,1,1,1],    // 9
  [1,-1,1,1],   // 10
  [1,-1,-1,1],  // 11
  [-1,-1,-1,1], // 12
  [-1,1,-1,1],  // 13
  [-1,-1,-1,-1],// 14
];

const PIECE_W = 60;
const PIECE_H = 60;
const PIC_W = 350; // picture display width
const PIC_H = 250; // picture display height

// Helper: get side map after rotation
function getJigsawPieceSideMap(pieceType, rotation) {
  const sides = JIGSAW_PIECE_SIDE[pieceType];
  const mapped = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    mapped[(i + rotation) % 4] = sides[i];
  }
  return mapped;
}

// Check if piece fits at cell given existing neighbors
function getFittingRotation(pieceType, cellIndex, numCols, numRows, pieces, pieceSides) {
  const row = Math.floor(cellIndex / numCols);
  const col = cellIndex % numCols;
  const constraints = [null, null, null, null]; // top, right, bottom, left

  // Top neighbor
  const topIdx = cellIndex - numCols;
  if (row === 0) constraints[0] = 0;
  else if (pieces[topIdx] != null) constraints[0] = -pieceSides[topIdx][2];

  // Bottom neighbor
  const botIdx = cellIndex + numCols;
  if (row === numRows - 1) constraints[2] = 0;
  else if (pieces[botIdx] != null) constraints[2] = -pieceSides[botIdx][0];

  // Left neighbor
  if (col === 0) constraints[3] = 0;
  else if (pieces[cellIndex - 1] != null) constraints[3] = -pieceSides[cellIndex - 1][1];

  // Right neighbor
  if (col === numCols - 1) constraints[1] = 0;
  else if (pieces[cellIndex + 1] != null) constraints[1] = -pieceSides[cellIndex + 1][3];

  const validRotations = [];
  for (let r = 0; r < 4; r++) {
    const sideMap = getJigsawPieceSideMap(pieceType, r);
    let fits = true;
    for (let s = 0; s < 4; s++) {
      if (constraints[s] !== null && constraints[s] !== sideMap[s]) { fits = false; break; }
      if (constraints[s] === null && sideMap[s] === 0) { fits = false; break; }
    }
    if (fits) validRotations.push(r);
  }

  if (validRotations.length > 0) {
    return validRotations[Math.floor(Math.random() * validRotations.length)];
  }
  return -1;
}

// Shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function JigsawMatch({ onAnswer, totalCorrect }) {
  const [puzzle, setPuzzle] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const canvasRefs = useRef({});
  const boardCanvasRef = useRef(null);
  const numGamesRef = useRef(0);
  const lockedRef = useRef(false);

  const generatePuzzle = useCallback(() => {
    lockedRef.current = false;
    setFeedback(null);

    const numCorrect = Math.max(1, 1 + Math.floor(totalCorrect / 4));
    const numDecoys = Math.min(2 + Math.floor(totalCorrect / 8), 3);

    // Pick picture (cycle through)
    const picIndex = (numGamesRef.current / 4 | 0) % JIGSAW_PICS.length;
    numGamesRef.current++;

    // Grid size based on picture
    const numCols = Math.floor(PIC_W / PIECE_W);
    const numRows = Math.floor(PIC_H / PIECE_H);
    const totalCells = numCols * numRows;

    // Place pieces on the grid
    const pieces = new Array(totalCells).fill(null);
    const pieceSides = new Array(totalCells).fill(null);
    const cellPool = shuffle(Array.from({ length: totalCells }, (_, i) => i));
    const typePool = shuffle(Array.from({ length: JIGSAW_PIECE_SIDE.length }, (_, i) => i));

    let cellPoolIdx = 0;
    let typePoolIdx = 0;

    const correctPieces = [];
    const allOptions = [];

    // Place correct pieces
    for (let i = 0; i < numCorrect && cellPoolIdx < cellPool.length && typePoolIdx < typePool.length;) {
      const cellIdx = cellPool[cellPoolIdx];
      let foundType = -1;
      let foundRot = -1;

      // Try types starting from typePoolIdx
      for (let t = typePoolIdx; t < typePool.length; t++) {
        const rot = getFittingRotation(typePool[t], cellIdx, numCols, numRows, pieces, pieceSides);
        if (rot !== -1) {
          foundType = t;
          foundRot = rot;
          break;
        }
      }

      if (foundType === -1) {
        cellPoolIdx++;
        continue;
      }

      const type = typePool[foundType];
      typePool.splice(foundType, 1);
      cellPoolIdx++;

      const sideMap = getJigsawPieceSideMap(type, foundRot);
      pieces[cellIdx] = { type, rotation: foundRot };
      pieceSides[cellIdx] = sideMap;

      const displayRotation = rnd(0, 360);
      const pieceData = {
        id: `correct-${i}`,
        type,
        rotation: foundRot,
        cellIndex: cellIdx,
        col: cellIdx % numCols,
        row: Math.floor(cellIdx / numCols),
        isCorrect: true,
        displayRotation,
      };
      correctPieces.push(pieceData);
      allOptions.push(pieceData);
      i++;
    }

    // Place decoy pieces
    for (let i = 0; i < numDecoys && typePoolIdx < typePool.length;) {
      const cellIdx = cellPool[cellPoolIdx % cellPool.length];
      cellPoolIdx++;
      let foundType = -1;
      let foundRot = -1;

      for (let t = 0; t < typePool.length; t++) {
        // Decoys just need a valid type, any rotation
        foundType = t;
        foundRot = rnd(0, 4);
        break;
      }

      if (foundType === -1) break;

      const type = typePool[foundType];
      typePool.splice(foundType, 1);

      const displayRotation = rnd(0, 360);
      const decoyCell = rnd(0, totalCells);
      const pieceData = {
        id: `decoy-${i}`,
        type,
        rotation: foundRot,
        cellIndex: decoyCell,
        col: decoyCell % numCols,
        row: Math.floor(decoyCell / numCols),
        isCorrect: false,
        displayRotation,
      };
      allOptions.push(pieceData);
      i++;
    }

    // Shuffle options
    const shuffledOptions = shuffle(allOptions);

    setPuzzle({
      picIndex,
      picSrc: JIGSAW_PICS[picIndex],
      numCols,
      numRows,
      correctPieces,
      options: shuffledOptions,
      remainingCorrect: correctPieces.map(p => p.id),
    });
  }, [totalCorrect]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Draw the board with holes when puzzle changes
  useEffect(() => {
    if (!puzzle || !boardCanvasRef.current) return;

    const canvas = boardCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = PIC_W;
      canvas.height = PIC_H;
      ctx.drawImage(img, 0, 0, PIC_W, PIC_H);

      // Cut out holes for correct pieces
      puzzle.correctPieces.forEach(piece => {
        const maskImg = new Image();
        maskImg.crossOrigin = 'anonymous';
        maskImg.onload = () => {
          const x = piece.col * PIECE_W;
          const y = piece.row * PIECE_H;

          // Draw black hole where piece was
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.translate(x + PIECE_W / 2, y + PIECE_H / 2);
          ctx.rotate((piece.rotation * 90 * Math.PI) / 180);
          ctx.drawImage(maskImg, -PIECE_W / 2, -PIECE_H / 2, PIECE_W, PIECE_H);
          ctx.restore();

          // Draw dark outline of the hole
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, PIC_W, PIC_H);
          ctx.restore();
        };
        maskImg.src = PIECE_MASKS[piece.type];
      });
    };
    img.src = puzzle.picSrc;
  }, [puzzle]);

  // Draw individual piece option canvases
  useEffect(() => {
    if (!puzzle) return;

    puzzle.options.forEach(piece => {
      const canvas = canvasRefs.current[piece.id];
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const picImg = new Image();
      picImg.crossOrigin = 'anonymous';
      picImg.onload = () => {
        const maskImg = new Image();
        maskImg.crossOrigin = 'anonymous';
        maskImg.onload = () => {
          canvas.width = PIECE_W + 20;
          canvas.height = PIECE_H + 20;

          const cx = canvas.width / 2;
          const cy = canvas.height / 2;

          // Draw piece mask first
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((piece.rotation * 90 * Math.PI) / 180);
          ctx.drawImage(maskImg, -PIECE_W / 2, -PIECE_H / 2, PIECE_W, PIECE_H);
          ctx.restore();

          // Use source-in to clip the picture to the mask shape
          ctx.globalCompositeOperation = 'source-in';
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((piece.rotation * 90 * Math.PI) / 180);
          // Draw picture offset so correct portion shows
          const srcX = piece.col * PIECE_W;
          const srcY = piece.row * PIECE_H;
          ctx.drawImage(picImg, -srcX - PIECE_W / 2, -srcY - PIECE_H / 2, PIC_W, PIC_H);
          ctx.restore();

          // Add subtle border
          ctx.globalCompositeOperation = 'source-over';
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((piece.rotation * 90 * Math.PI) / 180);
          ctx.globalAlpha = 0.3;
          ctx.drawImage(maskImg, -PIECE_W / 2, -PIECE_H / 2, PIECE_W, PIECE_H);
          ctx.globalAlpha = 1;
          ctx.restore();
        };
        maskImg.src = PIECE_MASKS[piece.type];
      };
      picImg.src = puzzle.picSrc;
    });
  }, [puzzle]);

  const handlePieceClick = useCallback((piece) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    if (piece.isCorrect && puzzle.remainingCorrect.includes(piece.id)) {
      const newRemaining = puzzle.remainingCorrect.filter(id => id !== piece.id);
      setFeedback('correct');

      if (newRemaining.length === 0) {
        // All correct pieces found - round complete
        setTimeout(() => {
          onAnswer(true);
          generatePuzzle();
        }, 600);
      } else {
        // More pieces to find
        setPuzzle(prev => ({
          ...prev,
          remainingCorrect: newRemaining,
          options: prev.options.filter(o => o.id !== piece.id),
        }));
        setTimeout(() => {
          onAnswer(true);
          lockedRef.current = false;
          setFeedback(null);
        }, 400);
      }
    } else {
      // Wrong piece
      setFeedback('wrong');
      setTimeout(() => {
        onAnswer(false);
        generatePuzzle();
      }, 600);
    }
  }, [puzzle, onAnswer, generatePuzzle]);

  if (!puzzle) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '10px',
      backgroundImage: `url(${SCENE_BG})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      {/* Picture board with holes */}
      <div style={{
        position: 'relative',
        marginBottom: '15px',
      }}>
        {/* Shadow behind picture */}
        <div style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: PIC_W,
          height: PIC_H,
          background: '#000',
          borderRadius: '4px',
        }} />
        <canvas
          ref={boardCanvasRef}
          width={PIC_W}
          height={PIC_H}
          style={{
            position: 'relative',
            borderRadius: '4px',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        />
        {/* Feedback overlay */}
        {feedback && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: feedback === 'correct'
              ? 'rgba(76, 175, 80, 0.3)'
              : 'rgba(244, 67, 54, 0.3)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            pointerEvents: 'none',
          }}>
            {feedback === 'correct' ? '✓' : '✗'}
          </div>
        )}
      </div>

      {/* Piece options */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        maxWidth: '100%',
      }}>
        {puzzle.options.map((piece) => {
          const scale = puzzle.options.length > 5 ? 0.8 : 1;
          return (
            <div
              key={piece.id}
              onClick={() => handlePieceClick(piece)}
              style={{
                cursor: 'pointer',
                transform: `rotate(${piece.displayRotation}deg) scale(${scale})`,
                transition: 'transform 0.15s',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
                padding: '4px',
              }}
              onMouseEnter={(e) => {
                if (!lockedRef.current) {
                  e.currentTarget.style.transform = `rotate(${piece.displayRotation}deg) scale(${scale * 1.15})`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotate(${piece.displayRotation}deg) scale(${scale})`;
              }}
            >
              <canvas
                ref={el => { canvasRefs.current[piece.id] = el; }}
                width={PIECE_W + 20}
                height={PIECE_H + 20}
                style={{
                  display: 'block',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default JigsawMatch;
