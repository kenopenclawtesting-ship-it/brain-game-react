import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// CarPath - Track cars through intersecting paths to find their destination
// 28 difficulty levels matching original ActionScript

const DIFFICULTY_LEVELS = [
  { numCars:1, numPath:2, numCrossPath:2, maxCrossPathWidth:2, pathSegments:2 },
  { numCars:1, numPath:3, numCrossPath:2, maxCrossPathWidth:1, pathSegments:2 },
  { numCars:1, numPath:3, numCrossPath:3, maxCrossPathWidth:2, pathSegments:2 },
  { numCars:1, numPath:4, numCrossPath:3, maxCrossPathWidth:1, pathSegments:2 },
  { numCars:1, numPath:4, numCrossPath:4, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:1, numPath:5, numCrossPath:4, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:1, numPath:5, numCrossPath:5, maxCrossPathWidth:3, pathSegments:3 },
  { numCars:2, numPath:4, numCrossPath:3, maxCrossPathWidth:2, pathSegments:2 },
  { numCars:2, numPath:4, numCrossPath:4, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:2, numPath:5, numCrossPath:4, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:2, numPath:5, numCrossPath:5, maxCrossPathWidth:3, pathSegments:3 },
  { numCars:2, numPath:6, numCrossPath:5, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:2, numPath:6, numCrossPath:6, maxCrossPathWidth:3, pathSegments:3 },
  { numCars:2, numPath:6, numCrossPath:8, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:3, numPath:5, numCrossPath:5, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:3, numPath:5, numCrossPath:6, maxCrossPathWidth:3, pathSegments:3 },
  { numCars:3, numPath:6, numCrossPath:6, maxCrossPathWidth:2, pathSegments:3 },
  { numCars:3, numPath:6, numCrossPath:8, maxCrossPathWidth:3, pathSegments:3 },
  { numCars:3, numPath:7, numCrossPath:8, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:3, numPath:7, numCrossPath:10, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:3, numPath:8, numCrossPath:10, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:4, numPath:6, numCrossPath:8, maxCrossPathWidth:3, pathSegments:3 },
  { numCars:4, numPath:6, numCrossPath:10, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:4, numPath:7, numCrossPath:10, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:4, numPath:7, numCrossPath:12, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:4, numPath:8, numCrossPath:12, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:4, numPath:8, numCrossPath:14, maxCrossPathWidth:3, pathSegments:4 },
  { numCars:4, numPath:8, numCrossPath:16, maxCrossPathWidth:3, pathSegments:4 },
];

const CAR_COLORS = ['#D42B2B', '#2B7BD4', '#2BB84D', '#D4A12B'];

function CarPath({ onAnswer, totalCorrect }) {
  const [puzzle, setPuzzle] = useState(null);
  const [phase, setPhase] = useState('animating'); // animating, answering
  const [animStep, setAnimStep] = useState(0);
  const [selectedCar, setSelectedCar] = useState(0);
  const [answers, setAnswers] = useState({});
  const animRef = useRef(null);

  const getDifficulty = useCallback(() => {
    const level = Math.min(totalCorrect, DIFFICULTY_LEVELS.length - 1);
    return DIFFICULTY_LEVELS[level];
  }, [totalCorrect]);

  const generatePuzzle = useCallback(() => {
    const diff = getDifficulty();
    const { numCars, numPath, numCrossPath, maxCrossPathWidth } = diff;

    // Generate cross paths (horizontal connections between vertical lanes)
    const crossPaths = [];
    for (let i = 0; i < numCrossPath; i++) {
      const width = Math.min(1 + Math.floor(Math.random() * maxCrossPathWidth), numPath - 1);
      const startLane = Math.floor(Math.random() * (numPath - width));
      crossPaths.push({ startLane, endLane: startLane + width, row: i });
    }

    // Pick car starting lanes (unique)
    const availableLanes = Array.from({ length: numPath }, (_, i) => i);
    const carStarts = [];
    for (let i = 0; i < numCars; i++) {
      const idx = Math.floor(Math.random() * availableLanes.length);
      carStarts.push(availableLanes[idx]);
      availableLanes.splice(idx, 1);
    }

    // Trace each car through cross paths to find destinations
    const carEnds = carStarts.map(start => {
      let pos = start;
      for (const cp of crossPaths) {
        if (pos === cp.startLane) pos = cp.endLane;
        else if (pos === cp.endLane) pos = cp.startLane;
      }
      return pos;
    });

    setPuzzle({ numPath, numCars, crossPaths, carStarts, carEnds });
    setPhase('animating');
    setAnimStep(0);
    setSelectedCar(0);
    setAnswers({});
  }, [getDifficulty]);

  useEffect(() => {
    generatePuzzle();
  }, [generatePuzzle]);

  // Animation: show cars moving through paths step by step
  useEffect(() => {
    if (!puzzle || phase !== 'animating') return;
    const totalSteps = puzzle.crossPaths.length + 2; // start + each cross + end
    if (animStep >= totalSteps) {
      // Brief pause then switch to answering
      animRef.current = setTimeout(() => setPhase('answering'), 600);
      return;
    }
    animRef.current = setTimeout(() => {
      setAnimStep(s => s + 1);
    }, 500);
    return () => clearTimeout(animRef.current);
  }, [puzzle, phase, animStep]);

  const handleAnswer = (destIdx) => {
    if (!puzzle) return;
    const newAnswers = { ...answers, [selectedCar]: destIdx };
    setAnswers(newAnswers);

    // If all cars answered
    if (Object.keys(newAnswers).length >= puzzle.numCars) {
      let allCorrect = true;
      for (let c = 0; c < puzzle.numCars; c++) {
        if (newAnswers[c] !== puzzle.carEnds[c]) {
          allCorrect = false;
          break;
        }
      }
      onAnswer(allCorrect);
      setTimeout(() => generatePuzzle(), 100);
    } else {
      // Move to next unanswered car
      for (let c = 0; c < puzzle.numCars; c++) {
        if (newAnswers[c] === undefined) {
          setSelectedCar(c);
          break;
        }
      }
    }
  };

  if (!puzzle) return null;

  const { numPath, numCars, crossPaths, carStarts, carEnds } = puzzle;

  // Layout constants for isometric-style grid
  const gridW = 460;
  const gridH = 340;
  const marginX = 50;
  const marginTop = 40;
  const marginBottom = 50;
  const laneSpacing = numPath > 1 ? (gridW - marginX * 2) / (numPath - 1) : 0;
  const rowCount = crossPaths.length;
  const rowSpacing = rowCount > 0 ? (gridH - marginTop - marginBottom) / (rowCount + 1) : gridH / 2;

  // Calculate car positions at each step during animation
  const getCarPositions = (step) => {
    return carStarts.map(start => {
      let pos = start;
      const appliedCross = Math.min(step, crossPaths.length);
      for (let i = 0; i < appliedCross; i++) {
        const cp = crossPaths[i];
        if (pos === cp.startLane) pos = cp.endLane;
        else if (pos === cp.endLane) pos = cp.startLane;
      }
      return pos;
    });
  };

  const currentPositions = getCarPositions(phase === 'animating' ? animStep : crossPaths.length);

  // Isometric transform - slight skew for 3D feel
  const isoX = (lane) => marginX + lane * laneSpacing;
  const isoY = (row) => marginTop + (row + 1) * rowSpacing;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '10px 10px 0',
      userSelect: 'none',
    }}>
      {/* Instruction */}
      {phase === 'answering' && numCars > 1 && (
        <div style={{
          fontSize: '15px',
          color: '#5a3e36',
          marginBottom: '6px',
          fontFamily: "'Bubblegum Sans', cursive",
        }}>
          Where does the <span style={{ color: CAR_COLORS[selectedCar], fontWeight: 'bold' }}>
            {['red', 'blue', 'green', 'yellow'][selectedCar]}
          </span> car end up?
        </div>
      )}

      {/* Road grid */}
      <div style={{
        position: 'relative',
        width: gridW,
        height: gridH,
        transform: 'perspective(800px) rotateX(15deg)',
        transformOrigin: 'center bottom',
      }}>
        <svg width={gridW} height={gridH} style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Shadow/ground */}
          <defs>
            <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a8a8a" />
              <stop offset="100%" stopColor="#6a6a6a" />
            </linearGradient>
            <filter id="roadShadow">
              <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#00000033" />
            </filter>
          </defs>

          {/* Vertical lane roads */}
          {Array.from({ length: numPath }).map((_, lane) => {
            const x = isoX(lane);
            return (
              <rect
                key={`lane-${lane}`}
                x={x - 12}
                y={10}
                width={24}
                height={gridH - 20}
                rx={4}
                fill="url(#roadGrad)"
                filter="url(#roadShadow)"
              />
            );
          })}

          {/* Horizontal cross-path roads */}
          {crossPaths.map((cp, idx) => {
            const y = isoY(idx);
            const x1 = isoX(cp.startLane);
            const x2 = isoX(cp.endLane);
            return (
              <rect
                key={`cross-${idx}`}
                x={Math.min(x1, x2) - 12}
                y={y - 12}
                width={Math.abs(x2 - x1) + 24}
                height={24}
                rx={4}
                fill="url(#roadGrad)"
                filter="url(#roadShadow)"
              />
            );
          })}

          {/* Lane markings (dashed center lines) */}
          {Array.from({ length: numPath }).map((_, lane) => {
            const x = isoX(lane);
            return (
              <line
                key={`mark-${lane}`}
                x1={x} y1={15} x2={x} y2={gridH - 15}
                stroke="#aaa"
                strokeWidth="1.5"
                strokeDasharray="6,8"
                opacity={0.5}
              />
            );
          })}

          {/* Cross-path direction arrows */}
          {crossPaths.map((cp, idx) => {
            const y = isoY(idx);
            const x1 = isoX(cp.startLane);
            const x2 = isoX(cp.endLane);
            const midX = (x1 + x2) / 2;
            // Small arrows showing the swap
            return (
              <g key={`arrows-${idx}`} opacity={0.35}>
                <line x1={x1 + 14} y1={y - 4} x2={x2 - 14} y2={y - 4} stroke="#fff" strokeWidth="1.5" />
                <line x1={x2 - 14} y1={y + 4} x2={x1 + 14} y2={y + 4} stroke="#fff" strokeWidth="1.5" />
                {/* Arrow heads */}
                <polygon points={`${x2 - 14},${y - 7} ${x2 - 14},${y - 1} ${x2 - 8},${y - 4}`} fill="#fff" />
                <polygon points={`${x1 + 14},${y + 1} ${x1 + 14},${y + 7} ${x1 + 8},${y + 4}`} fill="#fff" />
              </g>
            );
          })}
        </svg>

        {/* Cars */}
        {currentPositions.map((lane, carIdx) => {
          // Determine car Y position based on animation step
          let carY;
          if (phase === 'animating') {
            if (animStep === 0) {
              carY = 6; // start at top
            } else if (animStep > crossPaths.length) {
              carY = gridH - 30; // at bottom
            } else {
              carY = isoY(animStep - 1) - 12;
            }
          } else {
            carY = gridH - 30;
          }

          const carX = isoX(lane);
          return (
            <motion.div
              key={`car-${carIdx}`}
              animate={{ left: carX - 14, top: carY }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <img
                src="/sprites/DefineSprite_20_Car/1.png"
                alt="car"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: carIdx === 0 ? 'none' :
                    carIdx === 1 ? 'hue-rotate(200deg) saturate(1.2)' :
                    carIdx === 2 ? 'hue-rotate(100deg) saturate(1.2)' :
                    'hue-rotate(40deg) saturate(1.5)',
                }}
              />
              {/* Car label for multi-car */}
              {numCars > 1 && (
                <div style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: CAR_COLORS[carIdx],
                  color: '#fff',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: '10px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #fff',
                  fontFamily: "'Bubblegum Sans', cursive",
                }}>
                  {carIdx + 1}
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Destination numbers at bottom of each lane */}
        {Array.from({ length: numPath }).map((_, lane) => {
          const x = isoX(lane);
          return (
            <div
              key={`dest-${lane}`}
              style={{
                position: 'absolute',
                left: x - 14,
                bottom: -6,
                width: 28,
                height: 28,
                background: '#4FC3F7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '16px',
                fontFamily: "'Bubblegum Sans', cursive",
                border: '2.5px solid #fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                zIndex: 5,
              }}
            >
              {lane + 1}
            </div>
          );
        })}
      </div>

      {/* Answer buttons */}
      {phase === 'answering' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '14px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {Array.from({ length: numPath }).map((_, lane) => {
            const alreadyUsed = Object.values(answers).includes(lane);
            return (
              <motion.button
                key={lane}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => !alreadyUsed && handleAnswer(lane)}
                style={{
                  width: 52,
                  height: 52,
                  fontSize: '22px',
                  fontWeight: 'bold',
                  background: alreadyUsed ? '#bbb' : '#4FC3F7',
                  border: '3px solid #fff',
                  borderRadius: '50%',
                  cursor: alreadyUsed ? 'default' : 'pointer',
                  color: '#fff',
                  fontFamily: "'Bubblegum Sans', cursive",
                  boxShadow: alreadyUsed ? 'none' : '0 3px 10px rgba(79,195,247,0.4)',
                  opacity: alreadyUsed ? 0.5 : 1,
                  transition: 'background 0.2s',
                }}
              >
                {lane + 1}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Waiting indicator during animation */}
      {phase === 'animating' && (
        <div style={{
          marginTop: '14px',
          fontSize: '15px',
          color: '#5a3e36',
          fontFamily: "'Bubblegum Sans', cursive",
          opacity: 0.7,
        }}>
          Watch the car{numCars > 1 ? 's' : ''}…
        </div>
      )}
    </div>
  );
}

export default CarPath;
