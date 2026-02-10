import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Shape sets from extracted assets — each maps to a DefineSprite folder
// NORMAL_GROUP_INDICES = [0,1,2,3,4,6], EASTER/DIFFICULT = 5
const SHAPE_SETS = [
  { folder: 'DefineSprite_896_Shapes0', count: 6 },   // animals (flamingo, etc)
  { folder: 'DefineSprite_930_Shapes1', count: 8 },   // food (cupcake, etc)
  { folder: 'DefineSprite_947_Shapes2', count: 10 },  // accessories (shoe, etc)
  { folder: 'DefineSprite_964_Shapes3', count: 9 },   // mixed
  { folder: 'DefineSprite_981_Shapes4', count: 8 },   // mixed
  { folder: 'DefineSprite_46_Shapes5', count: 7 },    // easter eggs (difficult - similar looking)
  { folder: 'DefineSprite_1001_Shapes6', count: 8 },  // food (croissant, etc)
];

const NORMAL_GROUP_INDICES = [0, 1, 2, 3, 4, 6];
const DIFFICULT_GROUP_INDEX = 5; // Easter eggs — similar looking, harder to distinguish

// 15 difficulty levels (from SOURCE.md 8.12)
const DIFFICULTY_LEVELS = [
  { numIcons: 3, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.2 },
  { numIcons: 3, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 1.4 },
  { numIcons: 4, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.4 },
  { numIcons: 4, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 1.6 },
  { numIcons: 5, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.6 },
  { numIcons: 5, difficultShapes: true,  extraChoosePanels: 2, speedMultiplier: 1.8 },
  { numIcons: 6, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 1.8 },
  { numIcons: 6, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 2.0 },
  { numIcons: 6, difficultShapes: true,  extraChoosePanels: 2, speedMultiplier: 2.0 },
  { numIcons: 7, difficultShapes: false, extraChoosePanels: 1, speedMultiplier: 2.0 },
  { numIcons: 7, difficultShapes: true,  extraChoosePanels: 2, speedMultiplier: 2.0 },
  { numIcons: 7, difficultShapes: true,  extraChoosePanels: 2, speedMultiplier: 2.2 },
  { numIcons: 8, difficultShapes: false, extraChoosePanels: 2, speedMultiplier: 2.0 },
  { numIcons: 8, difficultShapes: true,  extraChoosePanels: 2, speedMultiplier: 2.2 },
  { numIcons: 8, difficultShapes: true,  extraChoosePanels: 2, speedMultiplier: 2.4 },
];

// Get shape image path
function shapeImg(folder, index) {
  return `/sprites/${folder}/${index}.png`;
}

// Pick a random shape set and return shape identifiers
function pickShapeSet(difficultShapes) {
  if (difficultShapes) {
    const set = SHAPE_SETS[DIFFICULT_GROUP_INDEX];
    return Array.from({ length: set.count }, (_, i) => ({
      id: `${DIFFICULT_GROUP_INDEX}-${i + 1}`,
      src: shapeImg(set.folder, i + 1),
    }));
  }
  const groupIdx = NORMAL_GROUP_INDICES[Math.floor(Math.random() * NORMAL_GROUP_INDICES.length)];
  const set = SHAPE_SETS[groupIdx];
  return Array.from({ length: set.count }, (_, i) => ({
    id: `${groupIdx}-${i + 1}`,
    src: shapeImg(set.folder, i + 1),
  }));
}

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ShapeBox component — marquee-lit frame around a shape
function ShapeBox({ src, active, onClick, size = 80, highlighted = false, dimmed = false }) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.08 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      style={{
        width: size + 20,
        height: size + 20,
        backgroundImage: active !== false
          ? 'url(/sprites/DefineSprite_777_ShapeBox/1.png)'
          : 'url(/sprites/DefineSprite_783_ShapeBoxOff/1.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        opacity: dimmed ? 0.4 : 1,
        filter: highlighted ? 'drop-shadow(0 0 8px #ffd700)' : 'none',
        transition: 'filter 0.2s, opacity 0.2s',
      }}
    >
      {src && (
        <img
          src={src}
          alt=""
          style={{
            width: size * 0.65,
            height: size * 0.65,
            objectFit: 'contain',
            pointerEvents: 'none',
            imageRendering: 'auto',
          }}
        />
      )}
    </motion.div>
  );
}

function ShapeOrder({ onAnswer, totalCorrect }) {
  const [phase, setPhase] = useState('init'); // init, showing, pause, input, feedback
  const [sequence, setSequence] = useState([]); // array of shape objects {id, src}
  const [userSequence, setUserSequence] = useState([]);
  const [currentShowIndex, setCurrentShowIndex] = useState(-1);
  const [options, setOptions] = useState([]);
  const [difficulty, setDifficulty] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [shapeSetInfo, setShapeSetInfo] = useState(null); // current set folder for bg
  const timerRef = useRef(null);

  const generateRound = useCallback(() => {
    const level = DIFFICULTY_LEVELS[Math.min(difficulty, DIFFICULTY_LEVELS.length - 1)];
    const shapes = pickShapeSet(level.difficultShapes);

    // Generate random sequence of numIcons from the set
    const seq = [];
    for (let i = 0; i < level.numIcons; i++) {
      seq.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }

    // Build options: unique shapes in sequence + extra decoys
    const usedIds = new Set(seq.map(s => s.id));
    const uniqueInSeq = seq.filter((s, i) => seq.findIndex(x => x.id === s.id) === i);
    const decoys = shapes.filter(s => !usedIds.has(s.id));
    const numDecoys = Math.min(level.extraChoosePanels, decoys.length);
    const selectedDecoys = shuffle(decoys).slice(0, numDecoys);

    const allOptions = shuffle([...uniqueInSeq, ...selectedDecoys]);

    setSequence(seq);
    setOptions(allOptions);
    setUserSequence([]);
    setCurrentShowIndex(-1);
    setFeedback(null);
    setShapeSetInfo(shapes);
    setPhase('showing');
  }, [difficulty]);

  // Initial generation
  useEffect(() => {
    generateRound();
  }, [generateRound]);

  // Show sequence animation
  useEffect(() => {
    if (phase !== 'showing') return;

    const level = DIFFICULTY_LEVELS[Math.min(difficulty, DIFFICULTY_LEVELS.length - 1)];
    const delay = 900 / level.speedMultiplier;

    if (currentShowIndex < sequence.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentShowIndex(i => i + 1);
      }, currentShowIndex === -1 ? 400 : delay);
    } else if (currentShowIndex >= sequence.length - 1 && sequence.length > 0) {
      // Pause after last shape shown, then switch to input
      timerRef.current = setTimeout(() => {
        setPhase('input');
      }, delay);
    }

    return () => clearTimeout(timerRef.current);
  }, [phase, currentShowIndex, sequence.length, difficulty]);

  const handleOptionClick = (shape) => {
    if (phase !== 'input') return;

    const expectedIndex = userSequence.length;
    const newUserSequence = [...userSequence, shape];
    setUserSequence(newUserSequence);

    if (shape.id !== sequence[expectedIndex].id) {
      // Wrong!
      setFeedback('wrong');
      setPhase('feedback');
      onAnswer(false);
      setTimeout(() => {
        generateRound();
      }, 800);
      return;
    }

    // Check if complete
    if (newUserSequence.length === sequence.length) {
      // Correct!
      setFeedback('correct');
      setPhase('feedback');
      onAnswer(true);
      setDifficulty(d => d + 1);
      setTimeout(() => {
        generateRound();
      }, 800);
    }
  };

  const level = DIFFICULTY_LEVELS[Math.min(difficulty, DIFFICULTY_LEVELS.length - 1)];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '20px',
      position: 'relative',
    }}>
      {/* Background — shape scene */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/sprites/DefineSprite_620_ShapeScene/1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        pointerEvents: 'none',
      }} />

      {/* Sequence display area — shows shapes one at a time during 'showing' phase */}
      <div style={{
        minHeight: '120px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        position: 'relative',
        zIndex: 1,
      }}>
        {phase === 'showing' ? (
          <AnimatePresence mode="wait">
            {currentShowIndex >= 0 && currentShowIndex < sequence.length && (
              <motion.div
                key={currentShowIndex}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ShapeBox
                  src={sequence[currentShowIndex].src}
                  active={true}
                  size={90}
                />
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          /* Input phase — show sequence slots (filled/empty) */
          <div style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {sequence.map((shape, index) => {
              const filled = index < userSequence.length;
              const isCurrent = index === userSequence.length && phase === 'input';
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ShapeBox
                    src={filled ? userSequence[index].src : null}
                    active={filled}
                    size={sequence.length > 6 ? 55 : 65}
                    highlighted={isCurrent}
                    dimmed={!filled && !isCurrent}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Counter showing position during showing phase */}
      {phase === 'showing' && currentShowIndex >= 0 && (
        <div style={{
          fontSize: '14px',
          color: '#8B6F5E',
          fontFamily: "'Bubblegum Sans', cursive",
          marginBottom: '10px',
          zIndex: 1,
        }}>
          {currentShowIndex + 1} / {sequence.length}
        </div>
      )}

      {/* Instruction text */}
      <div style={{
        fontSize: '20px',
        color: '#5D4037',
        fontFamily: "'Bubblegum Sans', cursive",
        marginBottom: '16px',
        zIndex: 1,
        textShadow: '0 1px 2px rgba(255,255,255,0.5)',
      }}>
        {phase === 'showing' ? 'Watch carefully...' :
         phase === 'input' ? 'Repeat the sequence!' :
         feedback === 'correct' ? '✓ Correct!' : '✗ Wrong!'}
      </div>

      {/* Feedback flash */}
      {phase === 'feedback' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: feedback === 'correct'
              ? 'rgba(76, 175, 80, 0.15)'
              : 'rgba(244, 67, 54, 0.15)',
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: '12px',
          }}
        />
      )}

      {/* Option panels for input */}
      {(phase === 'input' || phase === 'feedback') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '500px',
            zIndex: 1,
          }}
        >
          {options.map((shape, index) => (
            <motion.div
              key={shape.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.06 }}
            >
              <ShapeBox
                src={shape.src}
                active={true}
                size={options.length > 6 ? 65 : 75}
                onClick={phase === 'input' ? () => handleOptionClick(shape) : undefined}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default ShapeOrder;
