import React, { useState, useEffect, useCallback, useRef } from 'react';

// Layout data: sprite name, image dimensions, and switch positions (px coords)
const LAYOUTS = [
  { sprite: 'DefineSprite_1076_SwitchLayout0', w: 338, h: 342, switches: [[169,63],[63,171],[274,171],[168,278]] },
  { sprite: 'DefineSprite_1067_SwitchLayout1', w: 595, h: 177, switches: [[179,63],[415,63],[63,113],[295,113],[531,113]] },
  { sprite: 'DefineSprite_1072_SwitchLayout2', w: 399, h: 373, switches: [[199,63],[63,186],[199,186],[335,186],[199,309]] },
  { sprite: 'DefineSprite_1075_SwitchLayout3', w: 345, h: 358, switches: [[174,63],[63,123],[281,123],[63,240],[281,240],[174,294]] },
  { sprite: 'DefineSprite_1073_SwitchLayout4', w: 394, h: 397, switches: [[63,63],[197,63],[331,63],[197,198],[63,333],[197,334],[331,334]] },
  { sprite: 'DefineSprite_1074_SwitchLayout5', w: 574, h: 397, switches: [[153,63],[420,63],[287,121],[63,198],[510,198],[286,276],[153,334],[420,334]] },
  { sprite: 'DefineSprite_1071_SwitchLayout6', w: 399, h: 373, switches: [[63,63],[199,63],[335,63],[63,186],[199,186],[335,186],[63,309],[199,309],[335,309]] },
  { sprite: 'DefineSprite_1070_SwitchLayout7', w: 577, h: 373, switches: [[151,63],[287,63],[423,63],[63,186],[214,186],[362,186],[513,186],[151,309],[287,309],[428,309]] },
  { sprite: 'DefineSprite_1069_SwitchLayout8', w: 508, h: 388, switches: [[63,63],[191,63],[317,63],[445,63],[63,194],[259,195],[445,195],[63,324],[191,324],[317,324],[445,324]] },
  { sprite: 'DefineSprite_1068_SwitchLayout9', w: 535, h: 373, switches: [[63,63],[199,63],[335,63],[471,63],[63,186],[199,186],[335,186],[471,186],[63,309],[199,309],[335,309],[471,309]] },
];

// Switch types: sprite name, dimensions, frame count
const SWITCH_TYPES = [
  { sprite: 'DefineSprite_1062_Switch0', w: 113, h: 144, frames: 25 },
  { sprite: 'DefineSprite_1301_Switch1', w: 112, h: 96, frames: 25 },
  { sprite: 'DefineSprite_1048_Switch2', w: 154, h: 99, frames: 25 },
  { sprite: 'DefineSprite_1053_Switch3', w: 88, h: 151, frames: 25 },
  { sprite: 'DefineSprite_1056_Switch4', w: 103, h: 89, frames: 25 },
];

// Container size (green/red circle)
const CONTAINER_SIZE = 127;

// Preload images
const preloadedImages = new Set();
function preloadImage(src) {
  if (preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const img = new Image();
  img.src = src;
}

function MemorySequence({ onAnswer, totalCorrect }) {
  const [phase, setPhase] = useState('init'); // init, showing, waiting, input
  const [layoutIdx, setLayoutIdx] = useState(0);
  const [switchType, setSwitchType] = useState(0);
  const [sequence, setSequence] = useState([]);
  const [showIndex, setShowIndex] = useState(0);
  const [inputIndex, setInputIndex] = useState(0);
  const [litSwitch, setLitSwitch] = useState(null); // index of currently lit switch
  const [clickable, setClickable] = useState(false);
  const [clickedSwitch, setClickedSwitch] = useState(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const setupRound = useCallback(() => {
    const tc = totalCorrect;

    // Pick layout based on difficulty
    const minLayout = Math.min(Math.floor(tc / 2), 8);
    const maxLayout = Math.min(2 + Math.floor(tc / 2), 10);
    const li = Math.floor(Math.random() * (maxLayout - minLayout)) + minLayout;
    const layout = LAYOUTS[li];

    // Pick random switch type
    const st = Math.floor(Math.random() * 5);

    // Preload switch frames
    const switchInfo = SWITCH_TYPES[st];
    for (let f = 1; f <= switchInfo.frames; f++) {
      preloadImage(`/sprites/${switchInfo.sprite}/${f}.png`);
    }

    const numSwitches = layout.switches.length;
    const seqLength = 3 + Math.floor((tc + 1) / 3);

    // Generate sequence (no triple repeats)
    const seq = [];
    let repeatCount = 0;
    for (let i = 0; i < seqLength; i++) {
      let next;
      do {
        next = Math.floor(Math.random() * numSwitches);
        if (i > 0 && next === seq[i - 1]) {
          repeatCount++;
        } else {
          repeatCount = 0;
        }
      } while (repeatCount >= 2);
      seq.push(next);
    }

    setLayoutIdx(li);
    setSwitchType(st);
    setSequence(seq);
    setShowIndex(0);
    setInputIndex(0);
    setLitSwitch(null);
    setClickedSwitch(null);
    setClickable(false);
    setPhase('showing');
  }, [totalCorrect]);

  // Initialize on mount / totalCorrect change
  useEffect(() => {
    setupRound();
  }, [setupRound]);

  // Sequence playback
  useEffect(() => {
    if (phase !== 'showing' || sequence.length === 0) return;

    const delay = Math.max(500 - totalCorrect * 15, 300);

    if (showIndex < sequence.length) {
      // Light up switch
      setLitSwitch(sequence[showIndex]);

      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setLitSwitch(null);
        timerRef.current = setTimeout(() => {
          if (!mountedRef.current) return;
          setShowIndex(i => i + 1);
        }, 150);
      }, delay);
    } else {
      // Done showing, wait a beat then enable input
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setPhase('input');
        setClickable(true);
        setLitSwitch(null);
      }, delay);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, showIndex, sequence, totalCorrect]);

  const handleSwitchClick = useCallback((index) => {
    if (!clickable || phase !== 'input') return;

    setClickable(false);
    setLitSwitch(index);
    setClickedSwitch(index);

    // Check answer
    if (index === sequence[inputIndex]) {
      // Correct
      const nextInput = inputIndex + 1;
      if (nextInput >= sequence.length) {
        // Complete!
        setTimeout(() => {
          if (!mountedRef.current) return;
          onAnswer(true);
          setLitSwitch(null);
          setClickedSwitch(null);
        }, 400);
      } else {
        setInputIndex(nextInput);
        setTimeout(() => {
          if (!mountedRef.current) return;
          setLitSwitch(null);
          setClickedSwitch(null);
          setClickable(true);
        }, 300);
      }
    } else {
      // Wrong
      setTimeout(() => {
        if (!mountedRef.current) return;
        onAnswer(false);
        setLitSwitch(null);
        setClickedSwitch(null);
      }, 400);
    }
  }, [clickable, phase, sequence, inputIndex, onAnswer]);

  const layout = LAYOUTS[layoutIdx];
  const switchInfo = SWITCH_TYPES[switchType];

  // Scale layout to fit in game area (max ~500x380)
  const maxW = 520;
  const maxH = 370;
  const scale = Math.min(maxW / layout.w, maxH / layout.h, 1);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '10px',
      userSelect: 'none',
    }}>
      {/* Status text */}
      <div style={{
        fontSize: '20px',
        color: '#4A3728',
        marginBottom: '8px',
        fontFamily: "'Bubblegum Sans', cursive",
        textShadow: '0 1px 2px rgba(255,255,255,0.5)',
      }}>
        {phase === 'showing' ? 'Watch carefully...' : phase === 'input' ? 'Your turn!' : ''}
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '12px',
        minHeight: '16px',
      }}>
        {sequence.map((_, i) => (
          <div
            key={i}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: '2px solid rgba(74,55,40,0.3)',
              background:
                phase === 'input' && i < inputIndex ? '#4CAF50' :
                phase === 'showing' && i < showIndex ? '#FFA726' :
                phase === 'showing' && i === showIndex && litSwitch !== null ? '#FFD54F' :
                'rgba(255,255,255,0.4)',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>

      {/* Game board */}
      <div style={{
        position: 'relative',
        width: layout.w * scale,
        height: layout.h * scale,
      }}>
        {/* Layout background (green circles) */}
        <img
          src={`/sprites/${layout.sprite}/1.png`}
          alt=""
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: layout.w * scale,
            height: layout.h * scale,
            pointerEvents: 'none',
          }}
        />

        {/* Red circle overlay for lit switches */}
        {layout.switches.map((pos, idx) => {
          const isLit = litSwitch === idx;
          const isActive = phase === 'input';
          const cx = pos[0] * scale;
          const cy = pos[1] * scale;
          const r = (CONTAINER_SIZE / 2) * scale;

          return (
            <React.Fragment key={idx}>
              {/* Red/active circle overlay */}
              {(isLit || isActive) && (
                <div
                  style={{
                    position: 'absolute',
                    left: cx - r,
                    top: cy - r,
                    width: r * 2,
                    height: r * 2,
                    borderRadius: '50%',
                    border: `${Math.max(8 * scale, 4)}px solid ${isLit ? '#E53935' : '#43A047'}`,
                    background: isLit ? 'rgba(229,57,53,0.15)' : 'transparent',
                    transition: isLit ? 'none' : 'border-color 0.2s',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
              )}

              {/* Switch sprite */}
              <div
                onClick={() => handleSwitchClick(idx)}
                style={{
                  position: 'absolute',
                  left: cx - (switchInfo.w * scale * 0.45),
                  top: cy - (switchInfo.h * scale * 0.45),
                  width: switchInfo.w * scale * 0.9,
                  height: switchInfo.h * scale * 0.9,
                  cursor: phase === 'input' && clickable ? 'pointer' : 'default',
                  zIndex: isLit ? 5 : 2,
                  transform: isLit ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.15s ease-out',
                  filter: isLit ? 'brightness(1.3) saturate(1.4)' : 'none',
                }}
              >
                <img
                  src={`/sprites/${switchInfo.sprite}/1.png`}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default MemorySequence;
